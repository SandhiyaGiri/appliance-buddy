import express, { Request, Response } from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Sign up endpoint
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        },
        emailRedirectTo: process.env.FRONTEND_URL || 'http://localhost:3000'
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create user record in our users table
    if (data.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split('@')[0]
        });

      if (dbError) {
        console.error('Error creating user record:', dbError);
        // Don't fail the request if user record creation fails
      }
    }

    return res.status(201).json({
      message: 'User created successfully. Please check your email for confirmation.',
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: name || data.user.email?.split('@')[0]
      } : null,
      emailConfirmed: data.user?.email_confirmed_at !== null
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in endpoint
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      message: 'Sign in successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0]
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out endpoint
router.post('/signout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
      }
    }

    res.json({ message: 'Sign out successful' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      session: data.session
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request endpoint
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Send password reset email via Supabase Auth -> redirect to frontend reset page
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: 'Password reset email sent successfully. Please check your email for reset instructions.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password endpoint (for authenticated users)
router.post('/update-password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Update password via Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify password reset token endpoint
router.post('/verify-reset-token', async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    return res.json({
      message: 'Reset token is valid',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password with reset token endpoint
router.post('/update-password-with-token', async (req: Request, res: Response) => {
  try {
    const { newPassword, access_token, refresh_token } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Set the session with the reset tokens
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || ''
    });

    if (sessionError) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password with token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Backend callback to translate Supabase recovery hash into query params and redirect to frontend
router.get('/recovery-callback', async (req: Request, res: Response) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    // Supabase sends tokens as hash in the URL. Here we reconstruct based on the referer if present
    // or simply redirect the client to the frontend reset page where client JS can handle hash.
    // To be safe, read possible tokens forwarded as query (in case Supabase passed them).
    const { access_token, refresh_token, type } = req.query as Record<string, string | undefined>;

    if (type === 'recovery' && access_token) {
      // Redirect with query to avoid clients stripping hash
      const redirectUrl = new URL(`${frontendUrl}/reset-password`);
      redirectUrl.searchParams.set('type', 'recovery');
      redirectUrl.searchParams.set('access_token', access_token);
      if (refresh_token) redirectUrl.searchParams.set('refresh_token', refresh_token);
      return res.redirect(302, redirectUrl.toString());
    }

    // Fallback: just redirect to reset page; the app will parse hash if present
    return res.redirect(302, `${frontendUrl}/reset-password`);
  } catch (error) {
    console.error('Recovery callback error:', error);
    return res.redirect(302, (process.env.FRONTEND_URL || 'http://localhost:8080') + '/reset-password');
  }
});

export default router;