CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,   -- อ้างอิง id จาก auth-db (ไม่มี FK จริง)
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'TODO',
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY, level VARCHAR(10), event VARCHAR(100),
  user_id INTEGER, message TEXT, meta JSONB, created_at TIMESTAMP DEFAULT NOW()
);