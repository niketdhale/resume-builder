-- Create resume data tables with RLS policies
-- All tables scoped to user_id = auth.uid()

-- ─── Resumes ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  page_size TEXT NOT NULL DEFAULT 'A4',
  variant_of UUID REFERENCES resumes(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'English',
  settings JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Sections ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'generic',
  col TEXT NOT NULL DEFAULT 'full',
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  is_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  shared_across_views BOOLEAN NOT NULL DEFAULT FALSE,
  view_ids UUID[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_sections_user_id ON sections(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_resume_id ON sections(resume_id);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sections" ON sections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sections" ON sections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sections" ON sections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sections" ON sections
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Entries ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_section_id ON entries(section_id);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries" ON entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON entries
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Jobs ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  salary TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'applied',
  priority TEXT NOT NULL DEFAULT 'medium',
  applied_date DATE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  attachments JSONB NOT NULL DEFAULT '[]',
  custom_fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Custom Columns ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_columns (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text',
  order_index INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_custom_columns_user_id ON custom_columns(user_id);

ALTER TABLE custom_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own custom columns" ON custom_columns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom columns" ON custom_columns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom columns" ON custom_columns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom columns" ON custom_columns
  FOR DELETE USING (auth.uid() = user_id);
