-- Create notification type enum
CREATE TYPE notification_type AS ENUM ('action_triggered', 'scheduled');

-- Create notification_log table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  delivered BOOLEAN DEFAULT false NOT NULL,
  clicked BOOLEAN DEFAULT false NOT NULL,
  error TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON public.notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON public.notification_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_conversation_id ON public.notification_log(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON public.notification_log(notification_type);

-- Enable RLS
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification logs
CREATE POLICY "Users can view their own notification logs"
  ON public.notification_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can insert notification logs
CREATE POLICY "Service role can insert notification logs"
  ON public.notification_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can update notification logs (for delivered/clicked status)
CREATE POLICY "Service role can update notification logs"
  ON public.notification_log
  FOR UPDATE
  TO service_role
  USING (true);

-- Policy: Admins can view all notification logs (for analytics)
CREATE POLICY "Admins can view all notification logs"
  ON public.notification_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Function to clean up old notification logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notification_log
  WHERE sent_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a scheduled job to clean up old logs
-- This can be configured in Supabase dashboard or via pg_cron
COMMENT ON FUNCTION cleanup_old_notification_logs IS 'Deletes notification logs older than 90 days. Can be scheduled via pg_cron.';
