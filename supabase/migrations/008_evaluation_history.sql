-- Create evaluation_history table for tracking all evaluation attempts (for analytics)

-- Create evaluation type enum
CREATE TYPE evaluation_type AS ENUM ('tamil_sentence', 'english_translation', 'admin_reply_translation');

-- Create evaluation_history table
CREATE TABLE evaluation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  evaluation_type evaluation_type NOT NULL,
  evaluation_result JSONB NOT NULL,
  learner_input TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for faster lookups
CREATE INDEX idx_evaluation_history_conversation ON evaluation_history(conversation_id);
CREATE INDEX idx_evaluation_history_type ON evaluation_history(evaluation_type);
CREATE INDEX idx_evaluation_history_created ON evaluation_history(created_at);
CREATE INDEX idx_evaluation_history_rating ON evaluation_history ((evaluation_result->>'rating'));

-- Enable RLS
ALTER TABLE evaluation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own evaluation history
CREATE POLICY "Users can view own evaluation history" ON evaluation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = evaluation_history.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Policy: Admins can view all evaluation history
CREATE POLICY "Admins can view all evaluation history" ON evaluation_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policy: System can insert evaluation history (via service role)
-- Note: Insertions will be done through server actions with service role

-- Add comment for documentation
COMMENT ON TABLE evaluation_history IS 'Tracks all LLM evaluation attempts for analytics and debugging';
