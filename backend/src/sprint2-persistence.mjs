const TABLES = Object.freeze({
  planType: 'em_plan_type', plan: 'em_plan', planVersion: 'em_plan_version', incidentType: 'em_incident_type',
  incidentUpdate: 'em_incident_update', person: 'em_person_ref', group: 'em_emergency_group', position: 'em_position_snapshot',
  materialSite: 'em_material_site', materialLedger: 'em_stock_ledger', inventoryPlan: 'em_inventory_plan',
  drillPlan: 'em_drill_plan', drillExecution: 'em_drill_execution', evaluationTemplate: 'em_evaluation_template',
  dutySchedule: 'em_duty_schedule', checkPoint: 'em_check_point', attendanceRecord: 'em_attendance_record',
  attendanceAlert: 'em_attendance_alert', knowledgeItem: 'em_knowledge_item', verificationConfig: 'em_verification_config',
  externalAlert: 'em_external_alert', videoReference: 'em_video_reference', controlCommand: 'em_control_command',
  externalCall: 'em_external_call_log', situationProjection: 'em_situation_projection'
});

export function createSprint2Persistence(database) {
  if (!database) return {};
  return Object.freeze({
    kinds: Object.freeze(Object.keys(TABLES)),
    async save(kind, record) {
      const table = TABLES[kind];
      if (!table) throw new Error(`unsupported sprint2 record kind: ${kind}`);
      if (kind === 'planVersion') {
        await database.query(
          `INSERT INTO em_plan_version (id, status, version_label, published_at, payload, updated_at)
           VALUES ($1,$2,$3,$4,$5::jsonb,now())
           ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, published_at=EXCLUDED.published_at,
             payload=EXCLUDED.payload, updated_at=now()`,
          [record.id, record.status, record.versionLabel ?? record.id, record.publishedAt ?? null, JSON.stringify(record)]
        );
        return record;
      }
      await database.query(
        `INSERT INTO ${table} (id, payload, updated_at) VALUES ($1,$2::jsonb,now())
         ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, updated_at=now()`,
        [record.id, JSON.stringify(record)]
      );
      return record;
    },
    async list(kind) {
      const table = TABLES[kind];
      if (!table) throw new Error(`unsupported sprint2 record kind: ${kind}`);
      if (kind === 'planVersion') {
        const result = await database.query('SELECT payload FROM em_plan_version WHERE payload IS NOT NULL ORDER BY updated_at DESC, id', []);
        return result.rows.map((row) => row.payload);
      }
      const result = await database.query(`SELECT payload FROM ${table} ORDER BY updated_at DESC, id`, []);
      return result.rows.map((row) => row.payload);
    }
  });
}
