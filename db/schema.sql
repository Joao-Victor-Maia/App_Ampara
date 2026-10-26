CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  company TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  document_number TEXT
);

CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  insurer TEXT NOT NULL,
  coverage TEXT NOT NULL,
  premium NUMERIC(12, 2) DEFAULT 0 CHECK (premium >= 0),
  start_date DATE,
  end_date DATE,
  notes TEXT NOT NULL DEFAULT '',
  pdf_pathname TEXT,
  pdf_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clients_owner_full_name_idx ON clients (owner_id, full_name);
CREATE INDEX IF NOT EXISTS policies_owner_end_date_idx ON policies (owner_id, end_date);
CREATE INDEX IF NOT EXISTS policies_client_id_idx ON policies (client_id);