CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id         SERIAL PRIMARY KEY,
  level      VARCHAR(10)  NOT NULL,
  event      VARCHAR(100) NOT NULL,
  user_id    INTEGER,
  message    TEXT,
  meta       JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, email, password_hash) VALUES
  ('alice', 'alice@lab.local', '$2y$10$3QbQEm2bMoXKksYt59VVa.ggKTR2FpgIuQNAkQeuMwC2jSC.85V82'),
  ('bob', 'bob@lab.local', '$2y$10$VXe88PY8eWZ8A2OLG8n4ueTqr2WCH6CEzAP0ZlK8DwV2D0RnT0BrG'),
  ('admin', 'admin@lab.local', '$2y$10$ExkheytKaEZF5o43HYC4m.itKIbBfqNRmGD2G9mQ9H2Uw8WGBZLQ2')
ON CONFLICT DO NOTHING;
