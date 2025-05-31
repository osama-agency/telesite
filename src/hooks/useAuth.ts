import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'demo' | null;

export interface AuthState {
  role: UserRole;
  email: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDemo: boolean;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    role: null,
    email: null,
    isAuthenticated: false,
    isAdmin: false,
    isDemo: false,
  });

  useEffect(() => {
    // Проверяем localStorage при загрузке
    const role = localStorage.getItem('userRole') as UserRole;
    const email = localStorage.getItem('userEmail');

    if (role) {
      setAuthState({
        role,
        email,
        isAuthenticated: true,
        isAdmin: role === 'admin',
        isDemo: role === 'demo',
      });
    }
  }, []);

  const login = (role: UserRole, email: string) => {
    localStorage.setItem('userRole', role!);
    localStorage.setItem('userEmail', email);
    
    setAuthState({
      role,
      email,
      isAuthenticated: true,
      isAdmin: role === 'admin',
      isDemo: role === 'demo',
    });
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    
    setAuthState({
      role: null,
      email: null,
      isAuthenticated: false,
      isAdmin: false,
      isDemo: false,
    });
    
    navigate('/login');
  };

  const checkAuth = (): boolean => {
    const role = localStorage.getItem('userRole');
    return !!role;
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}; 