-- Create conversation status enum
CREATE TYPE conversation_status AS ENUM ('pending', 'replied', 'completed');

-- Create conversations table for learner-admin conversation flow
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  learner_sentence_tamil TEXT NOT NULL,
  learner_sentence_english TEXT,
  admin_reply_tamil TEXT,
  learner_translation_english TEXT,
  status conversation_status NOT NULL DEFAULT 'pending',
  word_ids_used INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_replied_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indices for faster lookups
CREATE INDEX idx_conversations_user_session ON conversations(user_id, session_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_user_status ON conversations(user_id, status);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Learners can insert their own conversations
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Learners can select their own conversations
CREATE POLICY "Users can select own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Learners can update their own conversations (for translation submission)
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can select all conversations
CREATE POLICY "Admins can select all conversations" ON conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policy: Admins can update all conversations (for replies)
CREATE POLICY "Admins can update all conversations" ON conversations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Helper function to check if user has active conversation
CREATE OR REPLACE FUNCTION has_active_conversation(p_user_id UUID, p_session_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations
    WHERE user_id = p_user_id
    AND session_id = p_session_id
    AND status IN ('pending', 'replied')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
