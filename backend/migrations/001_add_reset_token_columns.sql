-- Add reset token fields to users table (adjust table/column names for your schema)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP NULL;
