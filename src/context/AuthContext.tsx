"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (credentials: { name: string; email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{
    user: User | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    loading: true,
    error: null,
  });
  
  const router = useRouter();

  // Fetch user data on mount
  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setAuth({
        user: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      setAuth({
        user: null,
        loading: false,
        error: null, // Don't show error for unauthenticated users
      });
      return null;
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.post('/api/auth/login', credentials);
      setAuth({
        user: response.data,
        loading: false,
        error: null,
      });
      router.push('/');
      return response.data;
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Login failed',
      }));
      throw error;
    }
  };

  // Register function
  const register = async (credentials: { name: string; email: string; password: string }) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.post('/api/auth/register', credentials);
      setAuth({
        user: response.data,
        loading: false,
        error: null,
      });
      router.push('/');
      return response.data;
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Registration failed',
      }));
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setAuth({
        user: null,
        loading: false,
        error: null,
      });
      router.push('/login');
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        error: 'Logout failed',
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
