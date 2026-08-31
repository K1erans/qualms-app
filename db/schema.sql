-- Qualms Postgres schema (SQL snapshot).
-- Source of truth: apps/web/src/lib/server/schema.ts
-- Apply with: npm run db:schema


DROP TABLE IF EXISTS
  run_steps,
  test_runs,
  flows,
  repositories,
  organisation_members,
  organisations,
  users
CASCADE;

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  workos_user_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organisations (
  organisation_id BIGSERIAL PRIMARY KEY,
  workos_organization_id VARCHAR(255) UNIQUE,
  organisation_name VARCHAR(255) NOT NULL,
  personal_owner_user_id BIGINT UNIQUE REFERENCES users (user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE organisation_members (
  organisation_member_id BIGSERIAL PRIMARY KEY,
  organisation_id BIGINT NOT NULL REFERENCES organisations (organisation_id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  workos_membership_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, user_id)
);

CREATE TABLE repositories (
  repository_id BIGSERIAL PRIMARY KEY,
  organisation_id BIGINT NOT NULL REFERENCES organisations (organisation_id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, repo_url)
);

CREATE TABLE flows (
  flow_id BIGSERIAL PRIMARY KEY,
  repository_id BIGINT NOT NULL REFERENCES repositories (repository_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_runs (
  test_run_id BIGSERIAL PRIMARY KEY,
  flow_id BIGINT NOT NULL REFERENCES flows (flow_id) ON DELETE CASCADE,
  commit_sha VARCHAR(64),
  branch VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE run_steps (
  run_step_id BIGSERIAL PRIMARY KEY,
  test_run_id BIGINT NOT NULL REFERENCES test_runs (test_run_id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  UNIQUE (test_run_id, sequence_number)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_organisation_members_organisation_id ON organisation_members (organisation_id);
CREATE INDEX idx_organisation_members_user_id ON organisation_members (user_id);
CREATE INDEX idx_repositories_organisation_id ON repositories (organisation_id);
CREATE INDEX idx_flows_repository_id ON flows (repository_id);
CREATE INDEX idx_test_runs_flow_id ON test_runs (flow_id);
CREATE INDEX idx_run_steps_test_run_id ON run_steps (test_run_id);
