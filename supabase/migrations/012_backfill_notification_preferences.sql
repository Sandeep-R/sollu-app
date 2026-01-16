-- Backfill notification preferences for existing users
-- This ensures all users have a preferences row

INSERT INTO public.notification_preferences (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.notification_preferences
)
ON CONFLICT (user_id) DO NOTHING;
