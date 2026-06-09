import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, type ApiUser } from '../lib/api';

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'ec_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  // On mount, restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    authApi
      .getMe(stored)
      .then(({ user }) => setState({ user, token: stored, loading: false }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const persist = (token: string, user: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setState({ user, token, loading: false });
  };

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    persist(token, user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  const setUser = useCallback((user: ApiUser) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
