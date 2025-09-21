# Vercel Deployment Guide for Home Appliance Tracker

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Ensure your Supabase project is configured

## Deployment Steps

### 1. Prepare Your Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# Push to GitHub
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as default (root)
   - **Build Command**: Leave as default
   - **Output Directory**: Leave as default

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: home-appliance-tracker (or your preferred name)
# - Directory: ./
```

### 3. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

#### Frontend Variables:
```
VITE_API_URL = /api
```

#### Backend Variables:
```
NODE_ENV = production
PORT = 3001
FRONTEND_URL = https://your-app-name.vercel.app

# Supabase Configuration
SUPABASE_URL = https://vejihuzhsoixppcyghdw.supabase.co
SUPABASE_ANON_KEY = your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-supabase-service-role-key

# JWT Configuration
JWT_SECRET = your-secure-jwt-secret
JWT_EXPIRES_IN = 3600
```

### 4. Update Supabase Configuration

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel domain to **Site URL**:
   ```
   https://your-app-name.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-app-name.vercel.app
   https://your-app-name.vercel.app/**
   ```

### 5. Redeploy

After setting environment variables:
```bash
# If using CLI
vercel --prod

# Or trigger a new deployment from Vercel dashboard
```

## Project Structure for Vercel

```
homeappliances/
├── vercel.json                 # Vercel configuration
├── appliance-buddy/           # Frontend (React + Vite)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── backend/                   # Backend (Express.js)
│   ├── api/
│   │   └── index.ts          # Vercel API handler
│   └── src/
└── ENVIRONMENT_VARIABLES.md   # Environment variables reference
```

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally
   - Check Vercel build logs for specific errors

2. **API Routes Not Working**:
   - Verify `vercel.json` configuration
   - Check that `/api` routes are properly configured
   - Ensure backend API handler is correctly set up

3. **CORS Issues**:
   - Update `FRONTEND_URL` environment variable
   - Check CORS configuration in `backend/src/app.ts`

4. **Database Connection Issues**:
   - Verify Supabase environment variables
   - Check Supabase project status
   - Ensure RLS policies are configured

### Useful Commands:

```bash
# Test build locally
cd appliance-buddy && npm run build
cd ../backend && npm run build

# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## Post-Deployment

1. **Test the Application**:
   - Visit your Vercel URL
   - Test user registration and login
   - Verify API endpoints are working

2. **Monitor Performance**:
   - Check Vercel Analytics
   - Monitor API response times
   - Set up error tracking if needed

3. **Set up Custom Domain** (Optional):
   - Go to Vercel project settings
   - Add your custom domain
   - Update Supabase redirect URLs accordingly

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check Supabase dashboard for database issues