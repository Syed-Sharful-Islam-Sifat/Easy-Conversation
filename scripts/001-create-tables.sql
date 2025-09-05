-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create topics table for extracted topics
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  position_start INTEGER NOT NULL,
  position_end INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_conversation_id ON topics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
