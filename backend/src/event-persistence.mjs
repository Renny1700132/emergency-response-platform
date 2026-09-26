export function createEventPersistence(database) {
  if (!database) return {};
  return {
    async transaction(action) {
      if (!database.transaction) {
        throw Object.assign(new Error('database transaction support is required'), { code: 'INFRA_TRANSACTION_REQUIRED' });
      }
      return database.transaction((transactionDatabase) => action(createEventPersistence(transactionDatabase)));
    },
    async loadIncident(incidentId) {
      const result = await database.query(
        `SELECT id, incident_no AS "incidentNo", incident_type_code AS "incidentTypeCode", title, description,
                source_system AS "sourceSystem", source_generated_at AS "sourceGeneratedAt", received_at AS "receivedAt",
                recorded_at AS "recordedAt", created_by AS "createdBy", status, occurred_at AS "occurredAt",
                plan_version_id AS "planVersionId", closure, version, created_at AS "createdAt", updated_at AS "updatedAt"
           FROM em_incident WHERE id=$1`,
        [incidentId]
      );
      return result.rows[0] ? { ...result.rows[0], version: Number(result.rows[0].version), timeline: [] } : null;
    },
    async listIncidents({ page, size }) {
      const offset = (page - 1) * size;
      const [items, count] = await Promise.all([
        database.query(
          `SELECT id, incident_no AS "incidentNo", incident_type_code AS "incidentTypeCode", title, description,
                  source_system AS "sourceSystem", source_generated_at AS "sourceGeneratedAt", received_at AS "receivedAt",
                  recorded_at AS "recordedAt", created_by AS "createdBy", status, occurred_at AS "occurredAt",
                  plan_version_id AS "planVersionId", closure, version, created_at AS "createdAt", updated_at AS "updatedAt"
             FROM em_incident ORDER BY updated_at DESC, id LIMIT $1 OFFSET $2`,
          [size, offset]
        ),
        database.query('SELECT count(*)::bigint AS total FROM em_incident')
      ]);
      return { items: items.rows.map((item) => ({ ...item, version: Number(item.version) })), total: Number(count.rows[0]?.total ?? 0) };
    },
    async findRespondingIncidents(limit = 2) {
      const result = await database.query(
        `SELECT id FROM em_incident WHERE status='RESPONDING' ORDER BY updated_at DESC, id LIMIT $1`,
        [limit]
      );
      return result.rows;
    },
    async loadTask(taskId) {
      const result = await database.query(
        `SELECT id, incident_id AS "incidentId", name, assignee_ref AS "assigneeRef", deadline_at AS "deadlineAt",
                status, delivery_status AS "deliveryStatus", delivery_error AS "deliveryError", version
           FROM em_response_task WHERE id=$1`,
        [taskId]
      );
      if (!result.rows[0]) return null;
      const feedback = await database.query(
        `SELECT id, actor_id AS "actorId", content, progress_percent AS "progressPercent",
                attachment_file_ids AS "attachmentFileIds", occurred_at AS "occurredAt"
           FROM em_task_feedback WHERE task_id=$1 ORDER BY occurred_at, id`,
        [taskId]
      );
      return { ...result.rows[0], version: Number(result.rows[0].version), feedback: feedback.rows };
    },
    async listTasks({ page, size }) {
      const offset = (page - 1) * size;
      const [items, count] = await Promise.all([
        database.query(
          `SELECT id, incident_id AS "incidentId", name, assignee_ref AS "assigneeRef", deadline_at AS "deadlineAt",
                  status, delivery_status AS "deliveryStatus", delivery_error AS "deliveryError", version
             FROM em_response_task ORDER BY deadline_at, id LIMIT $1 OFFSET $2`,
          [size, offset]
        ),
        database.query('SELECT count(*)::bigint AS total FROM em_response_task')
      ]);
      return { items: items.rows.map((item) => ({ ...item, version: Number(item.version) })), total: Number(count.rows[0]?.total ?? 0) };
    },
    async loadTasksByIncident(incidentId) {
      const result = await database.query(
        `SELECT id FROM em_response_task WHERE incident_id=$1 ORDER BY id`,
        [incidentId]
      );
      return Promise.all(result.rows.map(({ id }) => this.loadTask(id)));
    },
    async loadPublishedPlan(planVersionId) {
      const version = await database.query(
        `SELECT id FROM em_plan_version WHERE id=$1 AND status='PUBLISHED'`,
        [planVersionId]
      );
      if (version.rows.length === 0) return null;
      const templates = await database.query(
        `SELECT name, assignee_ref AS "assigneeRef", deadline_minutes AS "deadlineMinutes"
           FROM em_task_template WHERE plan_version_id=$1 ORDER BY sequence_no`,
        [planVersionId]
      );
      return {
        id: planVersionId,
        templates: templates.rows.map((template) => ({
          ...template,
          deadlineAt: new Date(Date.now() + Number(template.deadlineMinutes) * 60000).toISOString()
        }))
      };
    },
    async persistIncident(incident, expectedVersion = 0) {
      if (expectedVersion === 0) {
        await database.query(
          `INSERT INTO em_incident (id, incident_no, incident_type_code, title, description, source_system, source_generated_at,
          received_at, recorded_at, created_by, status, occurred_at, plan_version_id, closure, version, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,$17)`,
          [incident.id, incident.incidentNo, incident.incidentTypeCode, incident.title, incident.description,
            incident.sourceSystem, incident.sourceGeneratedAt ?? null, incident.receivedAt, incident.recordedAt, incident.createdBy,
            incident.status, incident.occurredAt, incident.planVersionId ?? null, JSON.stringify(incident.closure ?? null),
            incident.version, incident.createdAt, incident.updatedAt]
        );
        return;
      }
      const updated = await database.query(
        `UPDATE em_incident SET status=$2, plan_version_id=$3, closure=$4::jsonb, version=$5, updated_at=$6
          WHERE id=$1 AND version=$7`,
        [incident.id, incident.status, incident.planVersionId ?? null, JSON.stringify(incident.closure ?? null),
          incident.version, incident.updatedAt, expectedVersion]
      );
      if (updated.rowCount === 0) throw Object.assign(new Error('incident resource version conflict'), { code: 'VERSION_CONFLICT' });
    },
    async persistVerification(incidentId, verification) {
      await database.query(
        `INSERT INTO em_verification_action (id, incident_id, decision, reason, actor_id, occurred_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [verification.id, incidentId, verification.decision, verification.reason, verification.actorId, verification.occurredAt]
      );
    },
    async persistTask(task, expectedVersion = 0) {
      if (expectedVersion === 0) {
        await database.query(
          `INSERT INTO em_response_task (id, incident_id, name, assignee_ref, deadline_at, status, delivery_status, delivery_error, version)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [task.id, task.incidentId, task.name, task.assigneeRef, task.deadlineAt, task.status,
            task.deliveryStatus ?? null, task.deliveryError ?? null, task.version]
        );
        return;
      }
      const updated = await database.query(
        `UPDATE em_response_task SET status=$2, delivery_status=$3, delivery_error=$4, version=$5
          WHERE id=$1 AND version=$6`,
        [task.id, task.status, task.deliveryStatus ?? null, task.deliveryError ?? null, task.version, expectedVersion]
      );
      if (updated.rowCount === 0) throw Object.assign(new Error('task resource version conflict'), { code: 'VERSION_CONFLICT' });
    },
    async persistFeedback(task, feedback) {
      await database.query(
        `INSERT INTO em_task_feedback (id, task_id, actor_id, content, progress_percent, attachment_file_ids, occurred_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
        [feedback.id, task.id, feedback.actorId, feedback.content, feedback.progressPercent ?? null,
          JSON.stringify(feedback.attachmentFileIds ?? []), feedback.occurredAt]
      );
    },
    async persistClosure(incidentId, closure) {
      await database.query(
        `INSERT INTO em_incident_closure (id, incident_id, conclusion, report_ref, actor_id, closed_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [closure.id, incidentId, closure.conclusion, closure.reportRef, closure.actorId, closure.closedAt]
      );
    },
    async persistDelivery(task, receipt) {
      await database.query(
        `INSERT INTO em_message_delivery (task_id, platform_message_id, status, error_code, simulated_evidence)
         VALUES ($1,$2,$3,$4,$5)`,
        [task.id, receipt.platformMessageId ?? null, receipt.status, receipt.errorCode ?? null, receipt.marker === 'SIMULATED_EVIDENCE']
      );
    },
    async persistOutbox(event) {
      await database.query(
        `INSERT INTO em_outbox_event (aggregate_type, aggregate_id, event_type, payload, trace_id)
         VALUES ($1,$2,$3,$4::jsonb,$5)`,
        [event.aggregateType, event.aggregateId, event.eventType, JSON.stringify(event.payload), event.traceId]
      );
    },
    async persistAudit(record) {
      await database.query(
        `INSERT INTO em_audit_log (trace_id, actor_id, action, outcome, target_type, target_id, details)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
        [record.traceId, record.actorId, record.action, record.outcome, record.targetType, record.targetId, JSON.stringify(record.details)]
      );
    }
  };
}
