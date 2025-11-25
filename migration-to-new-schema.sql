-- ============================================
-- MIGRAÇÃO PARA O NOVO SCHEMA COMPLETO
-- Execute APENAS se quiser migrar para o schema mais avançado
-- ============================================

-- 1. CRIAR NOVAS TABELAS (focus_sessions e user_progress)

-- ============================================
-- TABELA DE SESSÕES DE FOCO
-- ============================================

create table if not exists focus_sessions (
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

-- ============================================
-- TABELA DE PROGRESSO DO USUÁRIO
-- ============================================

create table if not exists user_progress (
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

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

create index if not exists idx_focus_sessions_user_id on focus_sessions(user_id);
create index if not exists idx_focus_sessions_started_at on focus_sessions(started_at);
create index if not exists idx_user_progress_user_id on user_progress(user_id);

-- ============================================
-- TRIGGER PARA user_progress
-- ============================================

create trigger update_user_progress_updated_at
before update on user_progress
for each row
execute procedure update_updated_at_column();

-- ============================================
-- MIGRAR DADOS EXISTENTES (OPCIONAL)
-- Se você tem dados em localStorage que quer migrar
-- ============================================

-- Exemplo: criar progresso inicial para usuários existentes
-- INSERT INTO user_progress (user_id, total_points, total_sessions, total_focus_time)
-- SELECT id, 0, 0, 0 FROM users WHERE is_lifetime = true;
-- (descomente e ajuste conforme necessário)

-- ============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Políticas RLS para focus_sessions
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus sessions" ON focus_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions" ON focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions" ON focus_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on focus_sessions" ON focus_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on user_progress" ON user_progress
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para users (se não existirem)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Política para usuários atualizarem apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything" ON users;
CREATE POLICY "Service role can do everything" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ATUALIZAR USUÁRIO VITALÍCIO NO NOVO SCHEMA
-- ============================================

UPDATE users
SET
  is_lifetime = true,
  payment_verified = true
WHERE email = 'salvador.programs@gmail.com';
