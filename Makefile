# Makefile for Home Appliance Tracker Docker Deployment

.PHONY: help build up down logs clean restart status health

# Default target
help: ## Show this help message
	@echo "Home Appliance Tracker - Docker Commands"
	@echo "========================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

up-build: ## Build and start all services
	docker-compose up -d --build

down: ## Stop all services
	docker-compose down

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

restart: ## Restart all services
	docker-compose restart

restart-backend: ## Restart backend service
	docker-compose restart backend

restart-frontend: ## Restart frontend service
	docker-compose restart frontend

status: ## Show status of all services
	docker-compose ps

health: ## Check health of all services
	@echo "Checking backend health..."
	@curl -f http://localhost:3001/health || echo "Backend health check failed"
	@echo "Checking frontend health..."
	@curl -f http://localhost:8080 || echo "Frontend health check failed"

clean: ## Remove all containers, networks, and images
	docker-compose down --rmi all --volumes --remove-orphans

clean-volumes: ## Remove all volumes
	docker-compose down -v

shell-backend: ## Access backend container shell
	docker-compose exec backend sh

shell-frontend: ## Access frontend container shell
	docker-compose exec frontend sh

prod-up: ## Start services in production mode
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-down: ## Stop production services
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Development commands
dev: ## Start development environment
	docker-compose up --build

dev-logs: ## Show development logs
	docker-compose logs -f

# Utility commands
env-check: ## Check environment variables
	@echo "Checking environment variables..."
	@test -f .env && echo ".env file exists" || echo "WARNING: .env file not found"
	@echo "Copy docker.env.template to .env and update with your values"

setup: env-check ## Initial setup
	@echo "Setting up Docker environment..."
	@test -f .env || (echo "Creating .env from template..." && cp docker.env.template .env)
	@echo "Please edit .env file with your actual values"
	@echo "Then run: make up-build"

# Database commands
db-backup: ## Backup database
	@echo "Backing up database..."
	@docker-compose exec backend node -e "console.log('Database backup not implemented for Supabase')"

# Monitoring commands
stats: ## Show container resource usage
	docker stats

top: ## Show running processes in containers
	docker-compose top
