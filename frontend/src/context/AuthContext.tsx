import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  phone?: string;
  orders_count?: number;
  date_joined?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  admin: User | null; // Backward-compatibility alias for admin dashboard & components
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  updateProfile: (data: ProfileUpdateData) => Promise<User>;
  changePassword: (current_password: string, new_password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY   = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY    = 'current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>('/auth/me/');
      setUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    } catch {
      // If fetching profile fails (token expired), clear credentials
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount, verify and hydrate the user profile
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ access: string; refresh: string; user?: User }>(
        '/auth/login/',
        { username, password },
      );
      localStorage.setItem(TOKEN_KEY, data.access);
      localStorage.setItem(REFRESH_KEY, data.refresh);

      let loggedInUser = data.user;
      if (!loggedInUser) {
        const meRes = await api.get<User>('/auth/me/', {
          headers: { Authorization: `Bearer ${data.access}` },
        });
        loggedInUser = meRes.data;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (regData: RegisterData): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await api.post<{ access?: string; refresh?: string; user: User }>(
        '/auth/register/',
        regData,
      );
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updateData: ProfileUpdateData): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await api.patch<User>('/auth/me/', updateData);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (current_password: string, new_password: string): Promise<void> => {
    await api.post('/auth/change-password/', { current_password, new_password });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('flembe_cart');
    localStorage.removeItem('flembe_cart_guest');
    localStorage.removeItem('flembe_wishlist_ids');
    localStorage.removeItem('flembe_wishlist_guest');
    setUser(null);
  }, []);

  const isAdmin = Boolean(user?.is_staff);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin: user, // Alias for legacy code
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
