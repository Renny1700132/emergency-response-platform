import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createExternalAdapters } from '../../backend/src/external-adapters.mjs';
import { createSprint2Persistence } from '../../backend/src/sprint2-persistence.mjs';
import { createSprint2Service } from '../../backend/src/sprint2-service.mjs';
import { loadFixtureRegistry, dispatchFixture, SIMULATED_BOUNDARIES } from '../../scripts/g4/lib/integration-simulator.mjs';
import { loadConfig } from '../../backend/src/config.mjs';
import { createServer } from '../../backend/src/server.mjs';

async function fixtureFetcher(registry, url, options = {}) {
  if (options.signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
  const match = /\/simulated\/v1\/([^/]+)\/([^/]+)$/.exec(String(url));
  const result = dispatchFixture(registry, decodeURIComponent(match[1]), decodeURIComponent(match[2]));
  return new Response(JSON.stringify(result.body), { status: result.status, headers: { 'content-type': 'application/json' } });
}

test('G4-08 adapters exercise all eight ports plus GIS/H5 and never replay access commands', async () => {
  const registry = await loadFixtureRegistry();
  const calls = [];
  const adapters = createExternalAdapters({ baseUrl: 'http://simulated', fetcher: (...args) => fixtureFetcher(registry, ...args), callLog: async (record) => calls.push(record) });
  for (const adapter of SIMULATED_BOUNDARIES) {
    const result = await adapters.invoke(adapter, 'VERIFY', { value: 1 }, {
      scenario: 'normal', traceId: `trace-${adapter}`, businessId: 'business-1',
      authorizedConfirmation: adapter === 'EXT-ACCESS' ? 'commander' : null
    });
    assert.equal(result.marker, 'SIMULATED_EVIDENCE');
    assert.equal(result.attemptNo, 1);
    for (const scenario of ['unauthorized', 'timeout', 'failure']) {
      await assert.rejects(
        () => adapters.invoke(adapter, 'VERIFY_FAILURE_PATH', { value: 1 }, {
          scenario, traceId: `trace-${adapter}-${scenario}`, businessId: 'business-1',
          authorizedConfirmation: adapter === 'EXT-ACCESS' ? 'commander' : null
        }),
        (error) => Boolean(error.code) && error.manualDegradation === true
      );
    }
  }
  await assert.rejects(
    () => adapters.invoke('EXT-ACCESS', 'OPEN', {}, { scenario: 'normal', traceId: 'trace-control' }),
    (error) => error.code === 'CONTROL_CONFIRMATION_REQUIRED'
  );
  await assert.rejects(
    () => adapters.invoke('EXT-ACCESS', 'OPEN', {}, { scenario: 'timeout', traceId: 'trace-control-timeout', authorizedConfirmation: 'commander' }),
    (error) => error.code === 'EXTERNAL_TIMEOUT' && error.attempts === 1 && error.manualDegradation
  );
  await assert.rejects(
    () => adapters.invoke('EXT-MESSAGE', 'SEND', {}, { scenario: 'timeout', traceId: 'trace-message-timeout' }),
    (error) => error.code === 'EXTERNAL_TIMEOUT' && error.attempts === 2 && error.retryExhausted
  );
  assert.equal(calls.filter((item) => item.traceId === 'trace-control-timeout').length, 1);
  assert.equal(calls.filter((item) => item.traceId === 'trace-message-timeout').length, 2);
});

test('G4-08 service closes plan, resource, inventory, drill, attendance and integration AC paths', async () => {
  const registry = await loadFixtureRegistry();
  const adapters = createExternalAdapters({ baseUrl: 'http://simulated', fetcher: (...args) => fixtureFetcher(registry, ...args) });
  let clock = new Date('2026-09-30T10:00:00Z');
  const service = createSprint2Service({ adapters, now: () => new Date(clock) });
  const actor = 'commander';
  const url = (path) => new URL(path, 'http://localhost');
  const handle = (method, path, body = {}) => service.handle({ method, path, url: url(path), body, actorId: actor, traceId: `trace-${path}` });

  const plan = (await handle('POST', '/api/v1/plans', { name: 'Museum fire response', level: 'COMPREHENSIVE', conditions: [{ zone: 'A' }], tasks: [{ name: 'Evacuate', assigneeRef: 'u1' }] })).data;
  const version = (await handle('POST', `/api/v1/plans/${plan.id}/versions`, { nodes: [{ code: 'N1', dependsOn: [] }], tasks: [{ name: 'Evacuate', assigneeRef: 'u1' }] })).data;
  assert.equal((await handle('POST', `/api/v1/plan-versions/${version.id}/publish`, {})).data.status, 'PUBLISHED');
  assert.equal((await handle('GET', `/api/v1/plans/${plan.id}`)).data.id, plan.id);
  await assert.rejects(() => handle('POST', `/api/v1/plans/${plan.id}/versions`, { nodes: [{ code: 'N1', dependsOn: ['MISSING'] }], tasks: [] }), /unknown node/);

  const site = (await handle('POST', '/api/v1/material-sites', { name: 'North depot', floor: '1F', x: 10, y: 20 })).data;
  await handle('POST', '/api/v1/material-ledgers', { siteId: site.id, itemId: 'mask', quantity: 10, version: 1 });
  const inventory = (await handle('POST', '/api/v1/inventory-plans', { siteId: site.id, items: [{ itemId: 'mask' }] })).data;
  const count = (await handle('POST', `/api/v1/inventory-plans/${inventory.id}/records`, { itemId: 'mask', countedQuantity: 8 })).data;
  assert.equal(count.difference, -2);
  assert.equal((await handle('POST', `/api/v1/inventory-plans/${inventory.id}/review`, { decision: 'APPROVED' })).data.status, 'REVIEWED');

  const drill = (await handle('POST', '/api/v1/drill-plans', { name: 'Quarter drill', ownerRef: actor, scheduledAt: '2026-10-01T10:00:00Z' })).data;
  const execution = (await handle('POST', `/api/v1/drill-plans/${drill.id}/issue`, {})).data;
  assert.equal(execution.delivery.marker, 'SIMULATED_EVIDENCE');
  assert.equal((await handle('POST', `/api/v1/drill-executions/${execution.id}/submit`, { result: 'completed' })).data.status, 'COMPLETED');
  const evaluated = (await handle('POST', `/api/v1/drill-executions/${execution.id}/evaluate`, { score: 80, improvementActions: [{ title: 'Improve route' }] })).data;
  assert.equal(evaluated.improvementActions.length, 1);

  const point = (await handle('POST', '/api/v1/check-points', { name: 'Gate A', x: 0, y: 0, floor: '1F', radiusMetres: 5, qrVersion: 'v1' })).data;
  const checkInBody = { pointId: point.id, ruleId: 'rule-1', qrVersion: 'v1', position: { x: 3, y: 4 }, validFrom: '2026-09-30T09:00:00Z', validTo: '2026-09-30T11:00:00Z', idempotencyKey: 'scan-1' };
  const first = (await handle('POST', '/api/v1/attendance/check-ins', checkInBody)).data;
  const replay = (await handle('POST', '/api/v1/attendance/check-ins', checkInBody)).data;
  assert.equal(replay.id, first.id);
  await assert.rejects(() => handle('POST', '/api/v1/attendance/check-ins', { ...checkInBody, idempotencyKey: 'scan-2', position: { x: 8, y: 0 } }), /outside the allowed radius/);
  clock = new Date('2026-09-30T12:00:00Z');
  assert.equal(await service.generateAttendanceAlert({ ruleId: 'rule-1', personId: 'missing-user', deadlineAt: '2026-09-30T11:00:00Z' }, actor, { traceId: 'trace-attendance', scenario: 'failure' }).then((item) => item.delivery.status), 'MANUAL_DEGRADATION');

  const fresh = await service.recordPosition({ personId: actor, x: 1, y: 2, sourceAt: '2026-09-30T11:59:59Z', sourceAccuracyMetres: 0.5, freshnessThresholdMs: 2000 }, actor);
  const stale = await service.recordPosition({ personId: 'u2', x: 2, y: 3, sourceAt: '2026-09-30T11:00:00Z', sourceAccuracyMetres: 1, freshnessThresholdMs: 2000 }, actor);
  assert.equal(fresh.processedAccuracyMetres, 0.5);
  assert.equal(stale.freshness, 'STALE');
  const map = (await handle('GET', '/api/v1/situation/resource-map')).data;
  assert.equal(map.positions.find((item) => item.personId === 'u2').usableForDispatch, false);

  const alert = (await handle('POST', '/integration/v1/alerts/iot', { externalAlertId: 'iot-1', type: 'SMOKE', occurredAt: '2026-09-30T11:59:00Z' })).data;
  const duplicate = (await handle('POST', '/integration/v1/alerts/iot', { externalAlertId: 'iot-1', type: 'SMOKE', occurredAt: '2026-09-30T11:59:00Z' })).data;
  assert.equal(alert.id, duplicate.id);
  assert.equal((await handle('POST', '/integration/v1/alerts/fire', { externalAlertId: 'fire-unknown' })).data.status, 'MANUAL_REVIEW');
  assert.ok((await handle('POST', '/api/v1/incidents/incident-1/videos/query', { mode: 'PLAYBACK' })).data.externalVideoId);
  assert.equal((await handle('POST', '/api/v1/incidents/incident-1/access-control-commands', { doorRef: 'door-1', action: 'REQUEST_OPEN', reason: 'evacuate', confirmationToken: 'confirmed-by-operator', scenario: 'timeout' })).data.automaticReplay, false);
  assert.equal((await handle('GET', '/api/v1/statistics/emergency')).data.drillsCompleted, 1);
  await service.publishKnowledge({ title: 'Fire response review', category: 'FIRE', keywords: ['evacuation'] }, actor);
  assert.equal((await handle('GET', '/api/v1/knowledge-items')).data.total, 1);
});

test('G4-08 persistence parameterizes values and HTTP routes enforce authorization/idempotency', async (t) => {
  const sqlCalls = [];
  const persistence = createSprint2Persistence({ async query(sql, parameters) { sqlCalls.push({ sql, parameters }); return { rows: [] }; } });
  await persistence.save('materialSite', { id: 'site-1', name: "x' OR 1=1" });
  await persistence.list('materialSite');
  assert.equal(sqlCalls.every((call) => Array.isArray(call.parameters)), true);
  assert.equal(sqlCalls[0].sql.includes("x' OR 1=1"), false);
  await assert.rejects(() => persistence.save('unknown', { id: 'x' }), /unsupported/);

  const service = createSprint2Service();
  const server = createServer({ config: loadConfig({ NODE_ENV: 'development', ALLOW_DEVELOPMENT_IDENTITY_HEADERS: 'true' }), logger: { info() {} }, sprint2Service: service });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const authorized = { 'content-type': 'application/json', 'x-actor-id': 'admin', 'x-actor-roles': 'emergency.write,emergency.read', 'x-idempotency-key': 'g408-http-1' };
  const denied = await fetch(`${base}/api/v1/plans`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(denied.status, 403);
  const created = await fetch(`${base}/api/v1/plans`, { method: 'POST', headers: authorized, body: JSON.stringify({ name: 'Plan', level: 'SITE' }) });
  assert.equal(created.status, 200);
  const replay = await fetch(`${base}/api/v1/plans`, { method: 'POST', headers: authorized, body: JSON.stringify({ name: 'Plan', level: 'SITE' }) });
  assert.equal((await replay.json()).data.id, (await created.json()).data.id);
  const listed = await fetch(`${base}/api/v1/plans`, { headers: { 'x-actor-id': 'reader', 'x-actor-roles': 'emergency.read' } });
  assert.equal(listed.status, 200);
  assert.equal((await listed.json()).data.total, 1);

  const incidentHeaders = { ...authorized, 'x-idempotency-key': 'g408-incident-search' };
  await fetch(`${base}/api/v1/incidents`, { method: 'POST', headers: incidentHeaders, body: JSON.stringify({ incidentTypeCode: 'FIRE', title: 'Gallery smoke', description: 'north gallery', occurredAt: '2026-09-30T10:00:00Z' }) });
  const filtered = await fetch(`${base}/api/v1/incidents?incidentTypeCode=FIRE&keyword=gallery&occurredFrom=2026-09-30T09:00:00Z`, { headers: { 'x-actor-id': 'reader', 'x-actor-roles': 'emergency.read' } });
  assert.equal((await filtered.json()).data.total, 1);
});

test('G4-08 migration is paired and persisted Sprint 2 records recover after service recreation', async () => {
  const up = await readFile(new URL('../../backend/migrations/003_sprint2_mvp.up.sql', import.meta.url), 'utf8');
  const down = await readFile(new URL('../../backend/migrations/003_sprint2_mvp.down.sql', import.meta.url), 'utf8');
  for (const table of ['em_plan', 'em_material_site', 'em_inventory_plan', 'em_drill_plan', 'em_attendance_record', 'em_external_alert', 'em_video_reference', 'em_control_command', 'em_external_call_log']) {
    assert.match(up, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
    assert.match(down, new RegExp(`DROP TABLE IF EXISTS ${table}`));
  }

  const durable = new Map();
  const persistence = {
    kinds: ['materialSite'],
    async save(kind, record) { durable.set(`${kind}:${record.id}`, structuredClone(record)); },
    async list(kind) { return [...durable.entries()].filter(([key]) => key.startsWith(`${kind}:`)).map(([, value]) => structuredClone(value)); }
  };
  const args = (method, path, body = {}) => ({ method, path, url: new URL(path, 'http://localhost'), body, actorId: 'admin', traceId: 'trace-recovery' });
  const first = createSprint2Service({ persistence });
  await first.handle(args('POST', '/api/v1/material-sites', { name: 'Durable site', x: 1, y: 2 }));
  const recovered = await createSprint2Service({ persistence }).handle(args('GET', '/api/v1/material-sites'));
  assert.equal(recovered.data.total, 1);
  assert.equal(recovered.data.items[0].name, 'Durable site');
});
