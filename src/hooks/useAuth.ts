import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  // Fetch the current user when the hook is initialized
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setAuth({
          user: response.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAuth({
          user: null,
          loading: false,
          error: null, // Don't show error for unauthenticated users
        });
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.post('/api/auth/login', credentials);
      setAuth({
        user: response.data,
        loading: false,
        error: null,
      });
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
  const register = async (credentials: RegisterCredentials) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await axios.post('/api/auth/register', credentials);
      setAuth({
        user: response.data,
        loading: false,
        error: null,
      });
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

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    login,
    register,
    logout,
  };
}
