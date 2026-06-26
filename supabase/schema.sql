-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (syncs with auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now())
);

-- Enable Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Pengguna dapat melihat profil mereka sendiri" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat memperbarui profil mereka sendiri" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger Function: Auto-insert profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Media Items Table
CREATE TABLE public.media_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('game', 'anime', 'movie', 'tv', 'book', 'comic', 'lifestyle')),
    status TEXT NOT NULL CHECK (status IN ('playing', 'backlog', 'completed')),
    progress TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS for media_items
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Create policies for media_items
CREATE POLICY "Pengguna dapat melihat data media mereka sendiri"
ON public.media_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat membuat data media mereka sendiri"
ON public.media_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat memperbarui data media mereka sendiri"
ON public.media_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Pengguna dapat menghapus data media mereka sendiri"
ON public.media_items FOR DELETE
USING (auth.uid() = user_id);
