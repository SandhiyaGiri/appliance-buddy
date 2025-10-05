import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, getApiUrl } from '../utils/config';

type User = {
  id: string;
  email: string;
  name?: string;
};

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'applianceBuddy.token';
const REFRESH_KEY = 'applianceBuddy.refresh';
const USER_KEY = 'applianceBuddy.user';

const parseUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || typeof candidate.email !== 'string') {
    return null;
  }

  return {
    id: candidate.id,
    email: candidate.email,
    name: typeof candidate.name === 'string' ? candidate.name : undefined,
  } satisfies User;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const persistSession = useCallback(async (nextToken: string, refreshToken?: string, nextUser?: User) => {
    setToken(nextToken);
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);

    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
    }

    if (nextUser) {
      setUser(nextUser);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    }
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }, []);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    const response = await fetch(getApiUrl('auth/me'), {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load user profile');
    }

    const payload = await response.json();
    const nextUser = parseUser(payload?.user);
    if (nextUser) {
      setUser(nextUser);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              const parsed = parseUser(JSON.parse(storedUser));
              if (parsed) {
                setUser(parsed);
              }
            } catch (error) {
              await SecureStore.deleteItemAsync(USER_KEY);
            }
          } else {
            await fetchCurrentUser(storedToken);
          }
        }
      } catch (error) {
        console.error('Failed to restore session', error);
        await clearSession();
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [clearSession, fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('auth/signin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(error || 'Login failed');
      }

      const payload = await response.json();
      const accessToken = payload?.session?.access_token as string | undefined;
      const refreshToken = payload?.session?.refresh_token as string | undefined;
      const nextUser = parseUser(payload?.user);

      if (!accessToken || !nextUser) {
        throw new Error('Invalid login response');
      }

      await persistSession(accessToken, refreshToken, nextUser);
    } catch (error) {
      console.error('Login error', error);
      if (error instanceof TypeError) {
        Alert.alert(
          'Network error',
          `Could not reach the backend at ${API_BASE_URL}. Ensure it is running and accessible from your device.`
        );
      } else {
        Alert.alert('Login failed', error instanceof Error ? error.message : 'Unexpected error');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Signup failed' }));
        throw new Error(error || 'Signup failed');
      }

      Alert.alert('Account created', 'Check your email to confirm your account before signing in.');
    } catch (error) {
      console.error('Signup error', error);
      Alert.alert('Signup failed', error instanceof Error ? error.message : 'Unexpected error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Reset request failed' }));
        throw new Error(error || 'Reset request failed');
      }

      Alert.alert('Email sent', 'Check your inbox for password reset instructions.');
    } catch (error) {
      console.error('Reset password error', error);
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Unexpected error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(getApiUrl('auth/signout'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      await clearSession();
    }
  }, [clearSession, token]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      await fetchCurrentUser(token);
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  }, [fetchCurrentUser, token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    initializing,
    loading,
    login,
    signup,
    resetPassword,
    logout,
    refreshUser,
  }), [user, token, initializing, loading, login, signup, resetPassword, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
