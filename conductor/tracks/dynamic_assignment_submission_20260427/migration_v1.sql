-- 1. Update assignments table
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- 2. Update hasil_penilaian table
ALTER TABLE public.hasil_penilaian 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Update Constraints (CRITICAL for versioning)
ALTER TABLE public.hasil_penilaian DROP CONSTRAINT IF EXISTS hasil_penilaian_user_id_assignment_id_key;
ALTER TABLE public.hasil_penilaian ADD CONSTRAINT hasil_penilaian_user_id_assignment_id_version_key UNIQUE (user_id, assignment_id, version);
