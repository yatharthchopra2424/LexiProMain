-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  user_type TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company_name TEXT,
  firm_name TEXT,
  bar_number TEXT,
  experience TEXT,
  specializations TEXT[],
  education TEXT,
  location TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, first_name, last_name, phone, company_name, firm_name, bar_number, experience, specializations, education, location)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'firm_name',
    new.raw_user_meta_data->>'bar_number',
    new.raw_user_meta_data->>'experience',
    (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(new.raw_user_meta_data->'specializations') AS elem),
    new.raw_user_meta_data->>'education',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
