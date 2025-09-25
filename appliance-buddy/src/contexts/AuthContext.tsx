import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updatePasswordWithToken: (newPassword: string, accessToken: string, refreshToken?: string) => Promise<void>;
  verifyResetToken: (accessToken: string, refreshToken?: string) => Promise<{ user: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount and handle URL hash fragments
  useEffect(() => {
    const handleAuthRedirect = () => {
      // Check for auth tokens in URL hash (from Supabase redirect)
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenType = params.get('token_type');
        const expiresIn = params.get('expires_in');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        const supabaseRedirectType = params.get('type');
        const isPasswordRecoveryFlow = supabaseRedirectType === 'recovery' || window.location.pathname.includes('/reset-password');
        
        // Handle authentication errors
        if (error) {
          console.error('Authentication error:', error, errorDescription);
          // Clear the hash from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
        
        // IMPORTANT: Do NOT consume hash on password recovery route
        // Let the PasswordResetPage handle tokens from Supabase (type=recovery)
        if (isPasswordRecoveryFlow) {
          return; // leave hash intact for the reset page to process
        }

        if (accessToken && tokenType === 'bearer') {
          // Clear the hash from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Store the token
          try {
            localStorage.setItem('auth_token', accessToken);
            if (refreshToken) {
              localStorage.setItem('auth_refresh_token', refreshToken);
            }
            setToken(accessToken);
            
            // Fetch user info from backend
            fetchUserInfo(accessToken);
            return;
          } catch (error) {
            console.error('Error storing auth tokens:', error);
          }
        }
      }
      
      // Check for existing stored session
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
        // Clear corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    };

    const fetchUserInfo = async (token: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        } else {
          console.error('Failed to fetch user info');
          // Clear invalid token
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    handleAuthRedirect();
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      if (data.user && data.session) {
        setUser(data.user);
        setToken(data.session.access_token);
        
        // Store in localStorage with error handling
        try {
          localStorage.setItem('auth_token', data.session.access_token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (storageError) {
          console.error('Error storing auth data:', storageError);
          // Continue without storing if localStorage fails
        }
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      // For signup, we might not get a session immediately if email confirmation is required
      if (data.user) {
        // Don't set user state immediately for signup - let them sign in after email confirmation
        console.log('User created successfully. Please check your email for confirmation.');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_refresh_token');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset request failed');
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password update failed');
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const updatePasswordWithToken = async (newPassword: string, accessToken: string, refreshToken?: string) => {
    try {
      // Use backend API for password reset with token
      const response = await fetch(`${API_BASE_URL}/auth/update-password-with-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newPassword,
          access_token: accessToken,
          refresh_token: refreshToken
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password update failed');
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Password update with token error:', error);
      throw error;
    }
  };

  const verifyResetToken = async (accessToken: string, refreshToken?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          access_token: accessToken, 
          refresh_token: refreshToken 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid reset token');
      }

      const data = await response.json();
      return { user: data.user };
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
    resetPassword,
    updatePassword,
    updatePasswordWithToken,
    verifyResetToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};