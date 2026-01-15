-- Add evaluation fields to conversations table for LLM evaluation system

-- Add evaluation JSONB columns
ALTER TABLE conversations
  ADD COLUMN tamil_sentence_evaluation JSONB,
  ADD COLUMN english_translation_evaluation JSONB,
  ADD COLUMN admin_reply_translation_evaluation JSONB;

-- Add evaluation attempt tracking
ALTER TABLE conversations
  ADD COLUMN evaluation_attempts INTEGER DEFAULT 0;

-- Add final approved versions
ALTER TABLE conversations
  ADD COLUMN final_tamil_sentence TEXT,
  ADD COLUMN final_english_translation TEXT;

-- Add comments for documentation
COMMENT ON COLUMN conversations.tamil_sentence_evaluation IS 'Stores LLM evaluation of Tamil sentence: { rating, feedback, suggestions, evaluated_at, llm_provider, model }';
COMMENT ON COLUMN conversations.english_translation_evaluation IS 'Stores LLM evaluation of English translation of Tamil sentence';
COMMENT ON COLUMN conversations.admin_reply_translation_evaluation IS 'Stores LLM evaluation of learner translation of admin reply';
COMMENT ON COLUMN conversations.evaluation_attempts IS 'Number of evaluation attempts made by learner';
COMMENT ON COLUMN conversations.final_tamil_sentence IS 'Final approved Tamil sentence after evaluation';
COMMENT ON COLUMN conversations.final_english_translation IS 'Final approved English translation after evaluation';

-- Create index for filtering by evaluation status
CREATE INDEX idx_conversations_evaluation ON conversations ((tamil_sentence_evaluation->>'rating'));
