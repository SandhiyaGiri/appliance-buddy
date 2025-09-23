# Railway Deployment Guide

This guide explains how to deploy the Home Appliance Tracker application to Railway.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository with your code
- Supabase project with database and auth configured

## Deployment Options

### Option 1: Deploy as Separate Services (Recommended)

Deploy the backend and frontend as separate Railway services for better scalability and management.

### Option 2: Deploy as Monorepo

Deploy both services from a single repository with Railway's monorepo support.

## Option 1: Separate Services Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Create separate repositories** (optional but recommended):
   - `homeappliances-backend` - for backend code
   - `homeappliances-frontend` - for frontend code

### Step 2: Deploy Backend

1. **Go to Railway Dashboard**:
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Select Backend Repository**:
   - Choose your backend repository
   - Railway will auto-detect it's a Node.js project

3. **Configure Backend Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.railway.app
   DATABASE_URL=your-supabase-database-url
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=3600
   ```

4. **Deploy**:
   - Railway will automatically build and deploy
   - Note the generated domain (e.g., `backend-production-xxxx.up.railway.app`)

### Step 3: Deploy Frontend

1. **Create New Service**:
   - In the same Railway project, click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose your frontend repository

2. **Configure Frontend Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-domain.railway.app/api
   ```

3. **Deploy**:
   - Railway will build and deploy the frontend
   - Note the generated domain (e.g., `frontend-production-xxxx.up.railway.app`)

### Step 4: Update Backend Configuration

1. **Update Backend Environment Variables**:
   - Go to your backend service settings
   - Update `FRONTEND_URL` to your frontend Railway domain
   - Redeploy if necessary

## Option 2: Monorepo Deployment

### Step 1: Prepare Monorepo Structure

Your current structure is already suitable for monorepo deployment:

```
homeappliances/
├── backend/
│   ├── package.json
│   ├── railway.json
│   └── src/
├── appliance-buddy/
│   ├── package.json
│   ├── railway.json
│   └── src/
└── railway.json
```

### Step 2: Deploy Backend Service

1. **Create New Project**:
   - Go to Railway Dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your main repository

2. **Configure Service**:
   - Railway will detect the `backend/` directory
   - Set the root directory to `backend/`
   - Configure environment variables (same as Option 1)

3. **Deploy Backend**:
   - Railway will build and deploy from the backend directory

### Step 3: Deploy Frontend Service

1. **Add New Service**:
   - In the same project, click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose the same repository

2. **Configure Service**:
   - Set the root directory to `appliance-buddy/`
   - Configure environment variables:
     ```
     VITE_API_URL=https://your-backend-domain.railway.app/api
     ```

3. **Deploy Frontend**:
   - Railway will build and deploy from the frontend directory

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend domain | `https://your-app.railway.app` |
| `DATABASE_URL` | Supabase database URL | `postgresql://...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `3600` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.railway.app/api` |

## Custom Domains (Optional)

1. **Add Custom Domain**:
   - Go to your service settings
   - Click "Domains"
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables**:
   - Update `FRONTEND_URL` in backend
   - Update `VITE_API_URL` in frontend if needed

## Database Setup

Since you're using Supabase:

1. **Supabase Database**:
   - Your existing Supabase database will work
   - No additional setup needed

2. **Alternative: Railway PostgreSQL** (if you want to migrate):
   - Add PostgreSQL service in Railway
   - Update `DATABASE_URL` environment variable
   - Run database migrations

## Monitoring and Logs

1. **View Logs**:
   - Go to your service dashboard
   - Click "Deployments" tab
   - View real-time logs

2. **Metrics**:
   - Railway provides built-in metrics
   - Monitor CPU, memory, and network usage

3. **Health Checks**:
   - Backend: `https://your-backend.railway.app/health`
   - Frontend: `https://your-frontend.railway.app/`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Railway dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Environment Variables**:
   - Double-check all required environment variables are set
   - Ensure no typos in variable names
   - Restart service after changing environment variables

3. **CORS Issues**:
   - Verify `FRONTEND_URL` is set correctly in backend
   - Check that frontend is calling the correct API URL

4. **Database Connection**:
   - Verify `DATABASE_URL` is correct
   - Check Supabase project is active
   - Ensure database tables exist

### Debugging Steps

1. **Check Service Logs**:
   ```bash
   # View logs in Railway dashboard
   # Or use Railway CLI
   railway logs
   ```

2. **Test Endpoints**:
   ```bash
   # Test backend health
   curl https://your-backend.railway.app/health
   
   # Test API endpoint
   curl https://your-backend.railway.app/api/appliances
   ```

3. **Verify Environment Variables**:
   - Go to service settings
   - Check all variables are set correctly

## Railway CLI (Optional)

Install Railway CLI for easier management:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up

# View logs
railway logs

# Open service
railway open
```

## Cost Optimization

1. **Free Tier Limits**:
   - 500 hours of execution time per month
   - 1GB RAM per service
   - 1GB disk space

2. **Optimization Tips**:
   - Use Railway's sleep feature for development
   - Optimize Docker images
   - Use environment variables for configuration

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to Git
   - Use Railway's environment variable system
   - Rotate secrets regularly

2. **CORS Configuration**:
   - Set proper CORS origins
   - Use HTTPS in production

3. **Database Security**:
   - Use connection pooling
   - Enable SSL connections
   - Regular security updates

## Next Steps

1. **Set up CI/CD**:
   - Configure automatic deployments on Git push
   - Set up staging environment

2. **Monitoring**:
   - Set up error tracking (Sentry)
   - Configure uptime monitoring

3. **Backup Strategy**:
   - Regular database backups
   - Environment variable backups

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway GitHub: [github.com/railwayapp](https://github.com/railwayapp)
