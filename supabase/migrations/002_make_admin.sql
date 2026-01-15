-- Run this AFTER sandeepr94@gmail.com has signed up
-- This will make them an admin

UPDATE user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'sandeepr94@gmail.com'
);

-- If the user doesn't have a role entry yet, insert one
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'sandeepr94@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
