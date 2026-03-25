-- Migration: add ip and user_agent to history_activity if not exists
ALTER TABLE history_activity
  ADD COLUMN IF NOT EXISTS ip VARCHAR(60) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_agent VARCHAR(512) DEFAULT NULL;