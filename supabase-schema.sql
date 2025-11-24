-- MindFix Supabase Schema
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- TABELA DE USUÁRIOS (vinculada ao auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_lifetime BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'inactive',
  payment_verified BOOLEAN DEFAULT FALSE,
  access_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service role pode fazer tudo (para webhooks)
CREATE POLICY "Service role can do everything" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABELA DE SESSÕES DE FOCO
-- ============================================

CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pomodoro', 'hyperfocus', 'deepflow', 'meditation', 'breathing')),
  duration INTEGER NOT NULL, -- minutos
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ============================================
-- TABELA DE PROGRESSO DO USUÁRIO
-- ============================================

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0, -- minutos
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONFIGURAÇÃO DA CONTA VITALÍCIA
-- ============================================

-- Inserir/atualizar conta vitalícia (execute manualmente após criar usuário no auth)
-- Substitua 'USER_ID_DO_SALVADOR' pelo ID real do usuário salvador.programs@gmail.com
/*
INSERT INTO users (id, email, name, is_lifetime, subscription_status, payment_verified, access_expires_at)
VALUES (
  'USER_ID_DO_SALVADOR',
  'salvador.programs@gmail.com',
  'Salvador',
  TRUE,
  'lifetime',
  TRUE,
  '2999-12-31T23:59:59Z'
) ON CONFLICT (id) DO UPDATE SET
  is_lifetime = TRUE,
  subscription_status = 'lifetime',
  payment_verified = TRUE,
  access_expires_at = '2999-12-31T23:59:59Z',
  updated_at = NOW();
*/
