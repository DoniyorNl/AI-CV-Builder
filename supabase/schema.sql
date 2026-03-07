-- ============================================================
-- AI CV Builder — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Supabase Auth creates the users table automatically.
-- This extends it with app-specific fields.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT,
  avatar_url    TEXT,
  is_pro        BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CVS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cvs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL DEFAULT 'Untitled CV',
  template    TEXT NOT NULL DEFAULT 'modern'
                CHECK (template IN ('modern', 'minimal', 'classic')),
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cvs_updated_at ON public.cvs;
CREATE TRIGGER cvs_updated_at
  BEFORE UPDATE ON public.cvs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- CV_SECTIONS TABLE
-- JSONB content allows each section type to have
-- its own flexible structure.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cv_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id       UUID REFERENCES public.cvs(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL
                CHECK (type IN ('personal','summary','experience','education','skills','projects')),
  content     JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cv_sections_cv_id ON public.cv_sections(cv_id);
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON public.cvs(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only read/write their own data.
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_sections ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- CVS policies
CREATE POLICY "Users can view own CVs"
  ON public.cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
  ON public.cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs"
  ON public.cvs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs"
  ON public.cvs FOR DELETE
  USING (auth.uid() = user_id);

-- CV_SECTIONS policies
CREATE POLICY "Users can view own CV sections"
  ON public.cv_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_sections.cv_id
        AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own CV sections"
  ON public.cv_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_sections.cv_id
        AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own CV sections"
  ON public.cv_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_sections.cv_id
        AND cvs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own CV sections"
  ON public.cv_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_sections.cv_id
        AND cvs.user_id = auth.uid()
    )
  );

-- ============================================================
-- SERVICE ROLE BYPASS (for API routes / webhooks)
-- The Stripe webhook uses service role key so it bypasses RLS.
-- No extra policy needed — service role always bypasses RLS.
-- ============================================================
