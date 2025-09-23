# Docker Deployment Guide

This guide explains how to deploy the Home Appliance Tracker application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd homeappliances
   ```

2. **Set up environment variables**:
   ```bash
   cp docker.env.template .env
   # Edit .env with your actual values
   ```

3. **Build and start the services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## Environment Variables

Update the `.env` file with your actual values:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@db.vejihuzhsoixppcyghdw.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://vejihuzhsoixppcyghdw.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=3600

# Application URLs
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
```

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# Start only specific service
docker-compose up backend
docker-compose up frontend
```

### Stop and Cleanup
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all containers, networks, and images
docker-compose down --rmi all --volumes --remove-orphans
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Check backend health
curl http://localhost:3001/health

# Check frontend health
curl http://localhost:8080
```

## Service Details

### Backend Service
- **Port**: 3001
- **Health Check**: `/health`
- **API Base**: `/api`
- **Environment**: Production
- **Logs**: Available in `./backend/logs`

### Frontend Service
- **Port**: 8080 (mapped to nginx port 80)
- **Static Files**: Served by nginx
- **API Proxy**: `/api/*` requests proxied to backend
- **SPA Routing**: Handled by nginx fallback

## Production Deployment

### Using Docker Compose

1. **Set production environment variables**:
   ```bash
   export NODE_ENV=production
   export FRONTEND_URL=https://yourdomain.com
   export BACKEND_URL=https://api.yourdomain.com
   ```

2. **Deploy with production settings**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Using Docker Swarm

1. **Initialize swarm**:
   ```bash
   docker swarm init
   ```

2. **Deploy stack**:
   ```bash
   docker stack deploy -c docker-compose.yml appliance-tracker
   ```

### Using Kubernetes

1. **Generate Kubernetes manifests**:
   ```bash
   docker-compose convert > k8s-manifests.yaml
   ```

2. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f k8s-manifests.yaml
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check if ports are in use
   lsof -i :3001
   lsof -i :8080
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Environment variables not loading**:
   ```bash
   # Verify .env file exists and has correct values
   cat .env
   
   # Check if variables are loaded in container
   docker-compose exec backend env | grep SUPABASE
   ```

3. **Build failures**:
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   
   # Check build logs
   docker-compose build backend
   ```

4. **Database connection issues**:
   ```bash
   # Test database connection
   docker-compose exec backend node -e "
   const { supabase } = require('./dist/config/database.js');
   supabase.from('users').select('count').then(console.log);
   "
   ```

### Logs and Debugging

```bash
# View detailed logs
docker-compose logs --tail=100 -f

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Check container resources
docker stats
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Secrets Management**: Use Docker secrets or external secret management
3. **Network Security**: Use Docker networks to isolate services
4. **Image Security**: Regularly update base images and scan for vulnerabilities

## Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /` (nginx health check)

### Metrics
- Container resource usage: `docker stats`
- Application logs: `docker-compose logs`
- Health status: `docker-compose ps`

## Backup and Recovery

### Database Backup
```bash
# Backup Supabase database (if using external database)
pg_dump $DATABASE_URL > backup.sql
```

### Application Backup
```bash
# Backup application data
docker-compose exec backend tar -czf /app/backup.tar.gz /app/logs
docker cp $(docker-compose ps -q backend):/app/backup.tar.gz ./backup.tar.gz
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up --scale backend=3

# Scale frontend service
docker-compose up --scale frontend=2
```

### Load Balancing
For production, consider using a reverse proxy like Traefik or nginx for load balancing.

## Support

For issues and questions:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Test individual services
4. Check Docker and Docker Compose versions
