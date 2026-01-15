-- Create roles enum
CREATE TYPE user_role AS ENUM ('learner', 'admin');

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'learner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create words table
CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  transliteration TEXT NOT NULL,
  meaning TEXT NOT NULL,
  tamil TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only admins can read all roles
CREATE POLICY "Admins can read all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on words
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read words
CREATE POLICY "Authenticated users can read words" ON words
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete words
CREATE POLICY "Admins can insert words" ON words
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update words" ON words
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete words" ON words
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial words
INSERT INTO words (transliteration, meaning, tamil) VALUES
  ('Vanakkam', 'Hello / Greetings', 'வணக்கம்'),
  ('Nandri', 'Thank you', 'நன்றி'),
  ('Nalla irukkingala?', 'How are you?', 'நல்லா இருக்கீங்களா?');

-- Function to automatically assign 'learner' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'learner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sandeepr94@gmail.com an admin (run after they've signed up)
-- UPDATE user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sandeepr94@gmail.com');
