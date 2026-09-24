export function createEventPersistence(database) {
  if (!database) return {};
  return {
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
    async persistIncident(incident) {
      await database.query(
        `INSERT INTO em_incident (id, incident_no, incident_type_code, title, description, source_system, source_generated_at,
          received_at, recorded_at, created_by, status, occurred_at, plan_version_id, closure, version, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET status=$11, plan_version_id=$13, closure=$14::jsonb, version=$15, updated_at=$17`,
        [incident.id, incident.incidentNo, incident.incidentTypeCode, incident.title, incident.description,
          incident.sourceSystem, incident.sourceGeneratedAt ?? null, incident.receivedAt, incident.recordedAt, incident.createdBy,
          incident.status, incident.occurredAt, incident.planVersionId ?? null, JSON.stringify(incident.closure ?? null),
          incident.version, incident.createdAt, incident.updatedAt]
      );
    },
    async persistVerification(incidentId, verification) {
      await database.query(
        `INSERT INTO em_verification_action (id, incident_id, decision, reason, actor_id, occurred_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        [verification.id, incidentId, verification.decision, verification.reason, verification.actorId, verification.occurredAt]
      );
    },
    async persistTask(task) {
      await database.query(
        `INSERT INTO em_response_task (id, incident_id, name, assignee_ref, deadline_at, status, delivery_status, delivery_error, version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET status=$6, delivery_status=$7, delivery_error=$8, version=$9`,
        [task.id, task.incidentId, task.name, task.assigneeRef, task.deadlineAt, task.status,
          task.deliveryStatus ?? null, task.deliveryError ?? null, task.version]
      );
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
    }
  };
}
