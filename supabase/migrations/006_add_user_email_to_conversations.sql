-- Add user_email column to conversations table for easy display
ALTER TABLE conversations ADD COLUMN user_email TEXT;

-- Create index on user_id for faster lookups without session_id
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
