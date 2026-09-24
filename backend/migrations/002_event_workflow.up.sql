CREATE TABLE IF NOT EXISTS em_plan_version (
  id text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','RETIRED')),
  version_label text NOT NULL,
  published_at timestamptz
);
CREATE TABLE IF NOT EXISTS em_task_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_version_id text NOT NULL REFERENCES em_plan_version(id),
  sequence_no integer NOT NULL,
  name text NOT NULL,
  assignee_ref text NOT NULL,
  deadline_minutes integer NOT NULL CHECK (deadline_minutes > 0),
  UNIQUE(plan_version_id, sequence_no)
);
CREATE TABLE IF NOT EXISTS em_incident (
  id uuid PRIMARY KEY,
  incident_no text NOT NULL UNIQUE,
  incident_type_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  source_system text NOT NULL DEFAULT 'MANUAL',
  source_generated_at timestamptz,
  received_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL,
  created_by text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING_VERIFICATION','VERIFIED','REJECTED','RESPONDING','CLOSED')),
  occurred_at timestamptz NOT NULL,
  plan_version_id text,
  closure jsonb,
  version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS em_verification_action (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES em_incident(id),
  decision text NOT NULL CHECK (decision IN ('VERIFIED','REJECTED')),
  reason text NOT NULL,
  actor_id text NOT NULL,
  occurred_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS em_response_task (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES em_incident(id),
  name text NOT NULL,
  assignee_ref text NOT NULL,
  deadline_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','ACKNOWLEDGED','IN_PROGRESS','COMPLETED')),
  delivery_status text,
  delivery_error text,
  version bigint NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS em_task_assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES em_response_task(id),
  assignee_ref text NOT NULL,
  assigned_at timestamptz NOT NULL,
  reason text NOT NULL
);
CREATE TABLE IF NOT EXISTS em_task_feedback (
  id uuid PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES em_response_task(id),
  actor_id text NOT NULL,
  content text NOT NULL,
  progress_percent integer CHECK (progress_percent BETWEEN 0 AND 100),
  attachment_file_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  occurred_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS em_incident_closure (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL UNIQUE REFERENCES em_incident(id),
  conclusion text NOT NULL,
  report_ref text NOT NULL,
  actor_id text NOT NULL,
  closed_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS em_message_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES em_response_task(id),
  platform_message_id text,
  status text NOT NULL,
  error_code text,
  simulated_evidence boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_em_incident_status ON em_incident(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_em_response_task_incident ON em_response_task(incident_id, status);
CREATE INDEX IF NOT EXISTS idx_em_response_task_assignee ON em_response_task(assignee_ref, status, deadline_at);
