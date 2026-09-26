import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

interface AdminUser {
  username: string;
  email?: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY   = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY    = 'admin_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setAdmin(null); return; }
    // Lightweight check — just see if /admin/stats/ responds 200
    api.get('/admin/stats/').catch(() => {
      // Token invalid/expired — clear everything
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      setAdmin(null);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ access: string; refresh: string }>(
        '/auth/login/',
        { username, password },
      );
      localStorage.setItem(TOKEN_KEY, data.access);
      localStorage.setItem(REFRESH_KEY, data.refresh);

      // Verify that this user has staff/admin permissions
      try {
        await api.get('/admin/stats/', {
          headers: { Authorization: `Bearer ${data.access}` },
        });
      } catch (checkErr: any) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        if (checkErr.response?.status === 403) {
          throw new Error('Access denied: Admin privileges (staff status) are required.');
        }
        throw checkErr;
      }

      const user: AdminUser = { username };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setAdmin(user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
