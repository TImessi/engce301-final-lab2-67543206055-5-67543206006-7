CREATE TABLE IF NOT EXISTS user_profiles (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER UNIQUE NOT NULL,
  display_name  VARCHAR(100),
  bio           TEXT,
  avatar_url    VARCHAR(255),
  updated_at    TIMESTAMP DEFAULT NOW()
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

-- Seed user profiles for Alice, Bob, and Admin
INSERT INTO user_profiles (user_id, display_name, bio) VALUES
  (1, 'Alice S.', 'I am a member.'),
  (2, 'Bob M.', 'I am also a member.'),
  (3, 'Admin User', 'System Administrator')
ON CONFLICT DO NOTHING;
