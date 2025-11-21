// Sistema de autenticação local (sem backend)
// Todos os dados são salvos no localStorage do navegador

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: 'mindfix_users',
  CURRENT_USER: 'mindfix_current_user',
  SESSION: 'mindfix_session'
};

// Gerar ID único
const generateId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Obter todos os usuários cadastrados
const getUsers = (): Record<string, LocalUser & { password: string }> => {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : {};
};

// Salvar usuários
const saveUsers = (users: Record<string, LocalUser & { password: string }>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Criar conta local
export const localSignUp = async (email: string, password: string, name: string) => {
  try {
    const users = getUsers();
    
    // Verificar se email já existe
    const emailExists = Object.values(users).some(u => u.email === email);
    if (emailExists) {
      return { 
        data: null, 
        error: { message: 'Este email já está cadastrado' } 
      };
    }

    // Criar novo usuário
    const newUser: LocalUser & { password: string } = {
      id: generateId(),
      email,
      name,
      password, // Em produção, use hash (bcrypt)
      createdAt: new Date().toISOString()
    };

    users[newUser.id] = newUser;
    saveUsers(users);

    // Fazer login automático
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    localStorage.setItem(STORAGE_KEYS.SESSION, 'active');

    return { 
      data: { user: userWithoutPassword }, 
      error: null 
    };
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return { 
      data: null, 
      error: { message: 'Erro ao criar conta. Tente novamente.' } 
    };
  }
};

// Login local
export const localSignIn = async (email: string, password: string) => {
  try {
    const users = getUsers();
    
    // Buscar usuário por email
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Email não encontrado' } 
      };
    }

    // Verificar senha
    if (user.password !== password) {
      return { 
        data: null, 
        error: { message: 'Senha incorreta' } 
      };
    }

    // Criar sessão
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    localStorage.setItem(STORAGE_KEYS.SESSION, 'active');

    return { 
      data: { user: userWithoutPassword }, 
      error: null 
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { 
      data: null, 
      error: { message: 'Erro ao fazer login. Tente novamente.' } 
    };
  }
};

// Logout local
export const localSignOut = async () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return { error: null };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { error: null };
  }
};

// Obter usuário atual
export const getLocalCurrentUser = (): LocalUser | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session !== 'active') return null;

    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;

    return JSON.parse(userData);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
};

// Verificar se está logado
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return session === 'active' && !!user;
};

// Resetar senha (simulado)
export const localResetPassword = async (email: string) => {
  try {
    const users = getUsers();
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Email não encontrado' } 
      };
    }

    // Em um app real, enviaria email
    // Por enquanto, apenas simula sucesso
    return { 
      data: { message: 'Instruções enviadas para seu email' }, 
      error: null 
    };
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return { 
      data: null, 
      error: { message: 'Erro ao resetar senha. Tente novamente.' } 
    };
  }
};
