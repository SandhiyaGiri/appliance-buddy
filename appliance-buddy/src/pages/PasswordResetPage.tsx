import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { PasswordUpdateForm } from '../components/auth/PasswordUpdateForm';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';

export const PasswordResetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyResetToken } = useAuth();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetTokens, setResetTokens] = useState<{ accessToken: string; refreshToken?: string } | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    const handleTokenVerification = async () => {
      if (processedRef.current) return;
      // Check URL hash first (Supabase redirects with tokens in hash)
      const hash = window.location.hash;
      let accessToken = '';
      let refreshToken = '';
      let type = '';

      if (hash) {
        // Parse hash fragment parameters
        const hashParams = new URLSearchParams(hash.substring(1));
        accessToken = hashParams.get('access_token') || '';
        refreshToken = hashParams.get('refresh_token') || '';
        type = hashParams.get('type') || '';
      } else {
        // Fallback to query parameters
        accessToken = searchParams.get('access_token') || '';
        refreshToken = searchParams.get('refresh_token') || '';
        type = searchParams.get('type') || '';
      }

      // Additional fallback: check if URL contains tokens in different formats
      if (!accessToken && !type) {
        // Check if the URL contains token information in other formats
        const urlParams = new URLSearchParams(window.location.search);
        accessToken = urlParams.get('access_token') || '';
        refreshToken = urlParams.get('refresh_token') || '';
        type = urlParams.get('type') || '';
        
        // Also check for tokens in the pathname (some redirects might work this way)
        if (!accessToken && window.location.pathname.includes('reset-password')) {
          // Check if there are any tokens in the URL that we can extract
          const url = window.location.href;
          const tokenMatch = url.match(/[?&#]access_token=([^&]+)/);
          const typeMatch = url.match(/[?&#]type=([^&]+)/);
          
          if (tokenMatch) accessToken = decodeURIComponent(tokenMatch[1]);
          if (typeMatch) type = decodeURIComponent(typeMatch[1]);
        }
      }

      console.log('Token verification:', { 
        accessToken: accessToken ? 'present' : 'missing', 
        type,
        hash: hash ? 'present' : 'missing',
        url: window.location.href,
        fullHash: hash,
        searchParams: Object.fromEntries(searchParams.entries()),
        pathname: window.location.pathname,
        search: window.location.search
      });

      // If it's a password reset flow
      if (type === 'recovery' && accessToken) {
        try {
          await verifyResetToken(accessToken, refreshToken || undefined);
          setIsValidToken(true);
          setResetTokens({ accessToken, refreshToken });
          // Now that we've captured tokens, clear hash for a cleaner URL
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          processedRef.current = true;
        } catch (err) {
          console.error('Token verification failed:', err);
          setError(err instanceof Error ? err.message : 'Invalid or expired reset link');
          setIsValidToken(false);
          processedRef.current = true;
        }
      } else {
        // If no token, show the reset request form
        setIsValidToken(false);
        processedRef.current = true;
      }
      setLoading(false);
    };

    handleTokenVerification();
  }, [searchParams, verifyResetToken]);

  const handlePasswordUpdateSuccess = () => {
    navigate('/auth', { replace: true });
  };

  const handleBackToLogin = () => {
    navigate('/auth', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <button
              onClick={handleBackToLogin}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug information (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug URL Info:', {
      href: window.location.href,
      hash: window.location.hash,
      search: window.location.search,
      pathname: window.location.pathname,
      origin: window.location.origin
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        {isValidToken && resetTokens ? (
          <PasswordUpdateForm 
            onSuccess={handlePasswordUpdateSuccess} 
            accessToken={resetTokens.accessToken}
            refreshToken={resetTokens.refreshToken}
          />
        ) : (
          <PasswordResetForm onBackToLogin={handleBackToLogin} />
        )}
      </div>
    </div>
  );
};
