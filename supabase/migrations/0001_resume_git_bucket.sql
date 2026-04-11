-- Migration: create 'resume-git' storage bucket for per-user git repos
-- Run once via: supabase db push  OR  the Supabase dashboard SQL editor

-- 1. Create the bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resume-git',
  'resume-git',
  false,          -- private: no public URL access
  52428800,       -- 50 MB per file (git repos are tiny; this is generous)
  ARRAY['application/json', 'application/octet-stream', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policies: each user can only read/write their own folder
--    Objects are stored at: <userId>/<key>

-- Allow users to SELECT (download) their own files
CREATE POLICY "Users can read own git repo"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resume-git'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to INSERT (upload) into their own folder
CREATE POLICY "Users can upload own git repo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resume-git'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to UPDATE their own files (upsert)
CREATE POLICY "Users can update own git repo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resume-git'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to DELETE their own files (cleanup on sign-out)
CREATE POLICY "Users can delete own git repo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resume-git'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
