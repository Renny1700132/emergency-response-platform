import { createHash, randomUUID } from 'node:crypto';

function rule(condition, message, code = 'RULE_422') {
  if (!condition) throw Object.assign(new Error(message), { code });
}
function iso(now) { return now().toISOString(); }
function page(items, url) {
  const pageNo = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const size = Math.min(200, Math.max(1, Number(url.searchParams.get('size') ?? 50)));
  const offset = (pageNo - 1) * size;
  return { items: items.slice(offset, offset + size), total: items.length, page: pageNo, size };
}
function distanceMetres(a, b) {
  const dx = Number(a.x) - Number(b.x);
  const dy = Number(a.y) - Number(b.y);
  return Math.sqrt(dx * dx + dy * dy);
}

export function createSprint2Service({ persistence = {}, adapters = null, now = () => new Date() } = {}) {
  const stores = new Map();
  const records = (kind) => {
    if (!stores.has(kind)) stores.set(kind, new Map());
    return stores.get(kind);
  };
  const save = async (kind, record) => {
    records(kind).set(record.id, structuredClone(record));
    await persistence.save?.(kind, record);
    return structuredClone(record);
  };
  const list = (kind) => [...records(kind).values()].map((item) => structuredClone(item));
  const get = (kind, id) => records(kind).get(id);
  const id = (prefix) => `${prefix}-${randomUUID()}`;
  const activePerson = (ref) => !ref || !get('person', ref) || get('person', ref).active !== false;
  let hydrationPromise;
  const ensureHydrated = async () => {
    if (!persistence.list || !persistence.kinds) return;
    hydrationPromise ??= (async () => {
      for (const kind of persistence.kinds) {
        const persisted = await persistence.list(kind);
        for (const record of persisted) records(kind).set(record.id, structuredClone(record));
      }
    })();
    await hydrationPromise;
  };

  async function external(adapter, action, payload, context) {
    rule(adapters, `${adapter} adapter unavailable`, 'EXTERNAL_UNAVAILABLE');
    return adapters.invoke(adapter, action, payload, context);
  }

  const api = {
    async invokeBoundary(adapter, action, payload, context) {
      await ensureHydrated();
      return external(adapter, action, payload, context);
    },
    async recordPosition(body, actorId) {
      await ensureHydrated();
      rule(body?.personId && Number.isFinite(Number(body?.x)) && Number.isFinite(Number(body?.y)), 'position person and coordinates are required');
      rule(Number(body.sourceAccuracyMetres) >= 0, 'source accuracy is invalid');
      const sourceAt = new Date(body.sourceAt);
      rule(!Number.isNaN(sourceAt.getTime()), 'sourceAt is invalid');
      const thresholdMs = Number(body.freshnessThresholdMs);
      rule(Number.isFinite(thresholdMs) && thresholdMs > 0, 'freshness threshold is required');
      const freshness = now().getTime() - sourceAt.getTime() <= thresholdMs ? 'FRESH' : 'STALE';
      return save('position', { id: id('position'), ...body, actorId, freshness, receivedAt: iso(now), processedAccuracyMetres: Number(body.sourceAccuracyMetres) });
    },
    async generateAttendanceAlert(body, actorId, context) {
      await ensureHydrated();
      rule(body?.ruleId && body?.personId && body?.deadlineAt, 'attendance rule, person and deadline are required');
      const valid = list('attendanceRecord').some((item) => item.actorId === body.personId && item.ruleId === body.ruleId && item.status === 'VALID');
      if (valid || now() <= new Date(body.deadlineAt)) return null;
      const alert = await save('attendanceAlert', { id: id('attendance-alert'), ...body, actorId, status: 'OPEN', createdAt: iso(now) });
      try { alert.delivery = await external('EXT-MESSAGE', 'ATTENDANCE_ALERT', alert, { ...context, businessId: alert.id }); }
      catch (error) { alert.delivery = { status: 'MANUAL_DEGRADATION', code: error.code, attempts: error.attempts }; }
      return save('attendanceAlert', alert);
    },
    async publishKnowledge(body, actorId) {
      await ensureHydrated();
      rule(body?.title && body?.category && Array.isArray(body?.keywords), 'knowledge title, category and keywords are required');
      return save('knowledgeItem', { id: id('knowledge'), ...body, actorId, status: 'PUBLISHED', publishedAt: iso(now) });
    },
    async createPlan(body, actorId) {
      rule(body?.name && body?.level, 'plan name and level are required');
      if (body.parentPlanId) rule(get('plan', body.parentPlanId), 'parent plan not found');
      for (const task of body.tasks ?? []) rule(activePerson(task.assigneeRef), 'inactive assignee cannot be dispatched');
      const plan = await save('plan', { id: id('plan'), ...body, status: 'DRAFT', version: 1, actorId, updatedAt: iso(now) });
      return plan;
    },
    async createVersion(planId, body, actorId) {
      rule(get('plan', planId), 'plan not found', 'NOT_FOUND');
      const nodes = body.nodes ?? [];
      const nodeCodes = new Set(nodes.map((node) => node.code));
      rule(nodes.every((node) => (node.dependsOn ?? []).every((code) => nodeCodes.has(code))), 'flow dependency references an unknown node');
      for (const task of body.tasks ?? []) rule(activePerson(task.assigneeRef), 'inactive assignee cannot be dispatched');
      return save('planVersion', { id: id('plan-version'), planId, ...body, status: 'DRAFT', actorId, updatedAt: iso(now) });
    },
    async publishVersion(versionId, actorId) {
      const version = get('planVersion', versionId);
      rule(version, 'plan version not found', 'NOT_FOUND');
      rule((version.tasks ?? []).length > 0, 'published plan requires task templates');
      version.status = 'PUBLISHED'; version.publishedAt = iso(now); version.actorId = actorId;
      return save('planVersion', version);
    },
    async createInventoryPlan(body, actorId) {
      rule(body?.siteId && Array.isArray(body.items) && body.items.length, 'inventory scope is required');
      const snapshots = body.items.map(({ itemId }) => {
        const ledger = list('materialLedger').find((item) => item.siteId === body.siteId && item.itemId === itemId);
        return { itemId, snapshotQuantity: Number(ledger?.quantity ?? 0), ledgerVersion: ledger?.version ?? 0 };
      });
      return save('inventoryPlan', { id: id('inventory'), ...body, snapshots, records: [], status: 'ISSUED', actorId, createdAt: iso(now) });
    },
    async submitInventory(planId, body, actorId) {
      const plan = get('inventoryPlan', planId); rule(plan, 'inventory plan not found', 'NOT_FOUND');
      rule(plan.status === 'ISSUED', 'inventory plan is not open');
      const snapshot = plan.snapshots.find((item) => item.itemId === body.itemId); rule(snapshot, 'item is outside inventory scope');
      const record = { id: id('count'), itemId: body.itemId, countedQuantity: Number(body.countedQuantity), difference: Number(body.countedQuantity) - snapshot.snapshotQuantity, actorId, submittedAt: iso(now) };
      plan.records.push(record); await save('inventoryPlan', plan); return record;
    },
    async reviewInventory(planId, body, actorId) {
      const plan = get('inventoryPlan', planId); rule(plan, 'inventory plan not found', 'NOT_FOUND');
      rule(body?.decision === 'APPROVED', 'inventory adjustment requires explicit approval');
      for (const record of plan.records) {
        const existing = list('materialLedger').find((item) => item.siteId === plan.siteId && item.itemId === record.itemId);
        await save('materialLedger', { id: existing?.id ?? id('ledger'), siteId: plan.siteId, itemId: record.itemId, quantity: record.countedQuantity, version: (existing?.version ?? 0) + 1, reviewedBy: actorId, updatedAt: iso(now) });
      }
      plan.status = 'REVIEWED'; plan.reviewedBy = actorId; plan.reviewedAt = iso(now); return save('inventoryPlan', plan);
    },
    async issueDrill(planId, body, actorId, context) {
      const plan = get('drillPlan', planId); rule(plan, 'drill plan not found', 'NOT_FOUND');
      rule(plan.ownerRef && plan.scheduledAt, 'drill owner and scheduled time are required');
      const execution = await save('drillExecution', { id: id('drill-execution'), planId, status: 'ISSUED', ownerRef: plan.ownerRef, originalPlanId: plan.originalPlanId ?? null, actorId, issuedAt: iso(now) });
      try {
        execution.delivery = await external('EXT-MESSAGE', 'DRILL_TASK_ISSUE', execution, { ...context, businessId: execution.id });
      } catch (error) {
        execution.delivery = { status: 'MANUAL_DEGRADATION', code: error.code, attempts: error.attempts };
      }
      return save('drillExecution', execution);
    },
    async checkIn(body, actorId) {
      const point = get('checkPoint', body.pointId); rule(point, 'check point not found', 'NOT_FOUND');
      rule(point.qrVersion === body.qrVersion, 'QR code version is invalid');
      const at = now();
      rule(at >= new Date(body.validFrom) && at <= new Date(body.validTo), 'check-in is outside allowed time');
      rule((body.allowedActors ?? [actorId]).includes(actorId), 'actor is outside the allowed group', 'AUTH_FORBIDDEN');
      rule(distanceMetres(point, body.position) <= Number(point.radiusMetres), 'check-in is outside the allowed radius');
      const key = body.idempotencyKey;
      rule(key, 'idempotencyKey is required');
      const prior = list('attendanceRecord').find((item) => item.idempotencyKey === key);
      if (prior) return prior;
      return save('attendanceRecord', { id: id('attendance'), pointId: point.id, ruleId: body.ruleId ?? null, actorId, idempotencyKey: key, status: 'VALID', scannedAt: iso(now) });
    },
    async ingestAlert(source, body, actorId, context) {
      rule(['iot', 'intrusion', 'fire'].includes(source), 'unsupported alert source');
      rule(body?.externalAlertId, 'externalAlertId is required');
      const prior = list('externalAlert').find((item) => item.source === source && item.externalAlertId === body.externalAlertId);
      if (prior) return prior;
      const recognizable = Boolean(body.type && body.occurredAt);
      const alert = { id: id('alert'), source, ...body, recognizable, status: recognizable ? 'ACCEPTED' : 'MANUAL_REVIEW', actorId, receivedAt: iso(now) };
      if (recognizable) {
        const adapter = source === 'iot' ? 'EXT-IOT' : source === 'intrusion' ? 'EXT-INTRUSION' : 'EXT-FIRE';
        try { alert.receipt = await external(adapter, 'ALERT_RECEIVE', body, { ...context, businessId: alert.id }); }
        catch (error) { alert.status = 'PENDING_REPLAY_OR_MANUAL'; alert.errorCode = error.code; alert.manualDegradation = true; }
      }
      return save('externalAlert', alert);
    },
    async videoQuery(incidentId, body, context) {
      const response = await external('EXT-VIDEO', body.mode === 'PLAYBACK' ? 'PLAYBACK_QUERY' : 'LIVE_QUERY', body, { ...context, businessId: incidentId });
      return save('videoReference', { id: id('video-ref'), incidentId, mode: body.mode ?? 'LIVE', externalVideoId: response.videoReference ?? response.streamId ?? response.videoId ?? null, recordingStoredHere: false, marker: response.marker, queriedAt: iso(now) });
    },
    async accessCommand(incidentId, body, actorId, context) {
      rule(body?.authorizedConfirmation === true && body?.reason, 'authorized confirmation and reason are required', 'CONTROL_CONFIRMATION_REQUIRED');
      const command = { id: id('access-command'), incidentId, targetId: body.targetId, action: body.action, reason: body.reason, confirmedBy: actorId, status: 'PENDING', createdAt: iso(now) };
      await save('controlCommand', command);
      try {
        const receipt = await external('EXT-ACCESS', 'ACCESS_CONTROL', body, { ...context, businessId: command.id, authorizedConfirmation: actorId });
        command.status = receipt.interlock === 'DENIED' ? 'INTERLOCK_DENIED' : 'ACCEPTED'; command.receipt = receipt;
      } catch (error) {
        command.status = 'MANUAL_DEGRADATION'; command.errorCode = error.code; command.automaticReplay = false;
      }
      return save('controlCommand', command);
    },
    async handle({ method, path, url, body, actorId, traceId }) {
      await ensureHydrated();
      const context = { traceId, scenario: body?.scenario ?? url.searchParams.get('scenario') ?? 'normal' };
      const collectionRoutes = {
        '/api/v1/plan-types': ['planType', 'plan-type'], '/api/v1/incident-types': ['incidentType', 'incident-type'],
        '/api/v1/material-sites': ['materialSite', 'site'], '/api/v1/material-ledgers': ['materialLedger', 'ledger'],
        '/api/v1/drill-plans': ['drillPlan', 'drill'], '/api/v1/evaluation-templates': ['evaluationTemplate', 'evaluation-template'],
        '/api/v1/duty-schedules': ['dutySchedule', 'duty'], '/api/v1/check-points': ['checkPoint', 'point'],
        '/api/v1/verification-configs': ['verificationConfig', 'verification'], '/api/v1/groups': ['group', 'group']
      };
      if (collectionRoutes[path]) {
        const [kind, prefix] = collectionRoutes[path];
        if (method === 'GET') return { status: 200, data: page(list(kind), url) };
        const required = kind === 'checkPoint' ? body?.name && Number.isFinite(Number(body?.x)) && Number.isFinite(Number(body?.y)) && Number(body?.radiusMetres) > 0 : body && Object.keys(body).length > 0;
        rule(required, `${kind} payload is invalid`);
        return { status: 200, data: await save(kind, { id: body.id ?? id(prefix), ...body, actorId, version: 1, updatedAt: iso(now) }) };
      }
      if (path === '/api/v1/plans') {
        if (method === 'GET') return { status: 200, data: page(list('plan'), url) };
        return { status: 200, data: await api.createPlan(body, actorId) };
      }
      const planDetail = /^\/api\/v1\/plans\/([^/]+)$/.exec(path);
      if (method === 'GET' && planDetail) { const item = get('plan', planDetail[1]); rule(item, 'plan not found', 'NOT_FOUND'); return { status: 200, data: item }; }
      const versionCreate = /^\/api\/v1\/plans\/([^/]+)\/versions$/.exec(path);
      if (method === 'POST' && versionCreate) return { status: 200, data: await api.createVersion(versionCreate[1], body, actorId) };
      const versionPublish = /^\/api\/v1\/plan-versions\/([^/]+)\/publish$/.exec(path);
      if (method === 'POST' && versionPublish) return { status: 200, data: await api.publishVersion(versionPublish[1], actorId) };
      const incidentUpdate = /^\/api\/v1\/incidents\/([^/]+)\/updates$/.exec(path);
      if (method === 'POST' && incidentUpdate) {
        rule(body?.content && body?.occurredAt, 'update content and occurredAt are required');
        return { status: 200, data: await save('incidentUpdate', { id: id('update'), incidentId: incidentUpdate[1], ...body, actorId, receivedAt: iso(now), late: new Date(body.occurredAt) < new Date(now().getTime() - 60000) }) };
      }
      if (path === '/api/v1/persons' && method === 'GET') return { status: 200, data: page(list('person'), url) };
      if (path === '/api/v1/positions/latest' && method === 'GET') return { status: 200, data: page(list('position'), url) };
      if (path === '/api/v1/inventory-plans' && method === 'POST') return { status: 200, data: await api.createInventoryPlan(body, actorId) };
      const inventoryRecord = /^\/api\/v1\/inventory-plans\/([^/]+)\/records$/.exec(path);
      if (method === 'POST' && inventoryRecord) return { status: 200, data: await api.submitInventory(inventoryRecord[1], body, actorId) };
      const inventoryReview = /^\/api\/v1\/inventory-plans\/([^/]+)\/review$/.exec(path);
      if (method === 'POST' && inventoryReview) return { status: 200, data: await api.reviewInventory(inventoryReview[1], body, actorId) };
      const drillIssue = /^\/api\/v1\/drill-plans\/([^/]+)\/issue$/.exec(path);
      if (method === 'POST' && drillIssue) return { status: 200, data: await api.issueDrill(drillIssue[1], body, actorId, context) };
      const drillSubmit = /^\/api\/v1\/drill-executions\/([^/]+)\/submit$/.exec(path);
      if (method === 'POST' && drillSubmit) { const item = get('drillExecution', drillSubmit[1]); rule(item, 'drill execution not found', 'NOT_FOUND'); rule(item.ownerRef === actorId && item.status !== 'COMPLETED', 'drill submission is forbidden', 'AUTH_FORBIDDEN'); Object.assign(item, { result: body.result, attachments: body.attachmentFileIds ?? [], status: 'COMPLETED', completedAt: iso(now) }); return { status: 200, data: await save('drillExecution', item) }; }
      const drillEvaluate = /^\/api\/v1\/drill-executions\/([^/]+)\/evaluate$/.exec(path);
      if (method === 'POST' && drillEvaluate) { const item = get('drillExecution', drillEvaluate[1]); rule(item?.status === 'COMPLETED', 'completed drill execution is required'); item.evaluation = { ...body, evaluator: actorId, evaluatedAt: iso(now) }; item.improvementActions = body.improvementActions ?? []; return { status: 200, data: await save('drillExecution', item) }; }
      if (path === '/api/v1/attendance/check-ins' && method === 'POST') return { status: 200, data: await api.checkIn(body, actorId) };
      if (path === '/api/v1/attendance/records' && method === 'GET') return { status: 200, data: page(list('attendanceRecord'), url) };
      if (path === '/api/v1/attendance/alerts' && method === 'GET') return { status: 200, data: page(list('attendanceAlert'), url) };
      if (path === '/api/v1/knowledge-items' && method === 'GET') return { status: 200, data: page(list('knowledgeItem').filter((item) => item.status === 'PUBLISHED'), url) };
      if (path === '/api/v1/situation/resource-map' && method === 'GET') return { status: 200, data: { sites: list('materialSite'), positions: list('position').map((item) => ({ ...item, usableForDispatch: item.freshness === 'FRESH' })) } };
      const situation = /^\/api\/v1\/situation\/incidents\/([^/]+)$/.exec(path);
      if (method === 'GET' && situation) return { status: 200, data: { incidentId: situation[1], updates: list('incidentUpdate').filter((item) => item.incidentId === situation[1]), positions: list('position'), alerts: list('externalAlert') } };
      if (path === '/api/v1/statistics/emergency' && method === 'GET') return { status: 200, data: { drillsCompleted: list('drillExecution').filter((item) => item.status === 'COMPLETED').length, attendanceValid: list('attendanceRecord').filter((item) => item.status === 'VALID').length, alerts: list('externalAlert').length, generatedAt: iso(now) } };
      const alert = /^\/integration\/v1\/alerts\/([^/]+)$/.exec(path);
      if (method === 'POST' && alert) return { status: 200, data: await api.ingestAlert(alert[1], body, actorId, context) };
      if (path === '/integration/v1/message-receipts' && method === 'POST') { rule(body?.messageId && body?.status, 'message receipt is invalid'); const receiptId = createHash('sha256').update(`${body.messageId}:${body.status}`).digest('hex'); return { status: 200, data: { id: receiptId, duplicateSafe: true, receivedAt: iso(now) } }; }
      const videos = /^\/api\/v1\/incidents\/([^/]+)\/videos\/query$/.exec(path);
      if (method === 'POST' && videos) return { status: 200, data: await api.videoQuery(videos[1], body, context) };
      const access = /^\/api\/v1\/incidents\/([^/]+)\/access-control-commands$/.exec(path);
      if (method === 'POST' && access) return { status: 200, data: await api.accessCommand(access[1], body, actorId, context) };
      return null;
    }
  };
  return Object.freeze(api);
}
