-- ============================================
-- CORREÇÃO RÁPIDA PARA PERMISSÕES SUPABASE
-- Execute este script se estiver com erro 406
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- 2. REABILITAR RLS COM POLÍTICAS CORRETAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS ANTIGAS
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

-- 4. CRIAR POLÍTICAS CORRETAS
-- Políticas para users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas para focus_sessions
CREATE POLICY "Users can view own focus sessions" ON focus_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions" ON focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions" ON focus_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on focus_sessions" ON focus_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas para user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything on user_progress" ON user_progress
  FOR ALL USING (auth.role() = 'service_role');

-- 5. VERIFICAR SE FUNCIONA
-- Execute estas queries para testar:
-- SELECT * FROM users WHERE id = auth.uid();
-- SELECT * FROM focus_sessions WHERE user_id = auth.uid() LIMIT 1;
-- SELECT * FROM user_progress WHERE user_id = auth.uid();
