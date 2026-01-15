-- Create user_word_progress table to track which words users have marked as done
CREATE TABLE user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id INTEGER REFERENCES words(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  marked_done_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id, session_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_word_progress_user_session ON user_word_progress(user_id, session_id);
CREATE INDEX idx_user_word_progress_word ON user_word_progress(word_id);

-- Enable RLS
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON user_word_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can select their own progress
CREATE POLICY "Users can select own progress" ON user_word_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can delete their own progress (for refresh/clear session)
CREATE POLICY "Users can delete own progress" ON user_word_progress
  FOR DELETE USING (auth.uid() = user_id);
