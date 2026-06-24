CREATE TABLE IF NOT EXISTS participants (
  participant_hash TEXT PRIMARY KEY,
  first_seen_date TEXT NOT NULL,
  last_seen_date TEXT NOT NULL,
  consent_analytics INTEGER NOT NULL DEFAULT 0,
  consent_training_feedback INTEGER NOT NULL DEFAULT 0,
  consent_cycle_aggregate INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS consent_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_hash TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  anonymous_analytics INTEGER NOT NULL DEFAULT 0,
  anonymous_training_feedback INTEGER NOT NULL DEFAULT 0,
  cycle_aggregate INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_hash TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_hash TEXT NOT NULL,
  submitted_date TEXT NOT NULL,
  day_type TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  completion TEXT NOT NULL,
  after_feeling TEXT NOT NULL,
  recommendation_accuracy TEXT NOT NULL,
  cycle_phase TEXT
);

CREATE TABLE IF NOT EXISTS product_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_hash TEXT NOT NULL,
  submitted_date TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  satisfaction INTEGER NOT NULL,
  text TEXT
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket TEXT NOT NULL,
  attempted_at INTEGER NOT NULL,
  success INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE TABLE IF NOT EXISTS public_rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_participants_last_seen ON participants(last_seen_date);
CREATE INDEX IF NOT EXISTS idx_consent_participant ON consent_snapshots(participant_hash);
CREATE INDEX IF NOT EXISTS idx_events_date ON analytics_events(event_date);
CREATE INDEX IF NOT EXISTS idx_training_date ON training_feedback(submitted_date);
CREATE INDEX IF NOT EXISTS idx_training_phase ON training_feedback(cycle_phase);
CREATE INDEX IF NOT EXISTS idx_product_date ON product_feedback(submitted_date);
CREATE INDEX IF NOT EXISTS idx_admin_attempts_time ON admin_login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit ON public_rate_limits(participant_hash, endpoint, created_at);
