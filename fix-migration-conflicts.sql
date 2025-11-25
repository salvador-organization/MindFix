-- ============================================
-- CORREÇÃO PARA CONFLITOS DE MIGRAÇÃO
-- Execute este script se aparecer erro de trigger já existente
-- ============================================

-- 1. REMOVER TRIGGERS EXISTENTES (se existirem)
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can do everything" ON users;
DROP POLICY IF EXISTS "Users can view own focus sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can insert own focus sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can update own focus sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Service role can do everything on focus_sessions" ON focus_sessions;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Service role can do everything on user_progress" ON user_progress;

-- 3. VERIFICAR SE AS TABELAS JÁ EXISTEM
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'focus_sessions') THEN 'EXISTS' ELSE 'NOT EXISTS' END as focus_sessions_status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN 'EXISTS' ELSE 'NOT EXISTS' END as user_progress_status;

-- 4. CRIAR TABELAS APENAS SE NÃO EXISTIREM
CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('pomodoro', 'hyperfocus', 'deepflow', 'meditation', 'breathing')),
  duration integer not null, -- minutos
  completed boolean default false,
  started_at timestamptz not null,
  completed_at timestamptz,
  points_earned integer default 0,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  total_points integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  total_sessions integer default 0,
  total_focus_time integer default 0, -- minutos
  updated_at timestamptz default now()
);

-- 5. ADICIONAR COLUNAS NA TABELA USERS (se não existirem)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS is_lifetime boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_end timestamptz;

-- 6. CRIAR ÍNDICES (se não existirem)
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- 7. CRIAR TRIGGERS (agora que não há conflitos)
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON user_progress
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 8. HABILITAR RLS
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can view own focus sessions" ON focus_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions" ON focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions" ON focus_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on focus_sessions" ON focus_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on user_progress" ON user_progress
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- 10. ATUALIZAR USUÁRIO VITALÍCIO
UPDATE users
SET
  is_lifetime = true,
  payment_verified = true
WHERE email = 'salvador.programs@gmail.com';

-- 11. VERIFICAÇÃO FINAL
SELECT
  'Migration completed successfully' as status,
  (SELECT COUNT(*) FROM users WHERE is_lifetime = true) as lifetime_users,
  (SELECT COUNT(*) FROM focus_sessions) as focus_sessions_count,
  (SELECT COUNT(*) FROM user_progress) as progress_records;
