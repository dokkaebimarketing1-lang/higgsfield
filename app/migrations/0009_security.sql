CREATE TABLE IF NOT EXISTS inquiry_completions (
  inquiry_id INTEGER PRIMARY KEY,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (inquiry_id) REFERENCES inquiries (id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO inquiry_completions (inquiry_id, completed_at)
SELECT id, created_at
FROM inquiries
WHERE status = 'done';

CREATE INDEX IF NOT EXISTS idx_inquiry_completions_completed_at
  ON inquiry_completions (completed_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON rate_limits (window_start);
