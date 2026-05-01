#!/bin/bash
set -euo pipefail

# ProperHOA Deployment Script
# Usage: ./deploy.sh [production|staging]

ENVIRONMENT="${1:-staging}"
COMPOSE_FILE="../docker/docker-compose.yml"

echo "🚀 Deploying ProperHOA to $ENVIRONMENT..."

# Validate environment variables
echo "🔍 Validating environment variables..."
required_vars=(
  "POSTGRES_PASSWORD"
  "NEXTAUTH_SECRET"
  "REDIS_PASSWORD"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  fi
done

# Validate strong passwords
if [ "${#POSTGRES_PASSWORD}" -lt 16 ]; then
  echo "❌ POSTGRES_PASSWORD must be at least 16 characters"
  exit 1
fi

if [ "${#NEXTAUTH_SECRET}" -lt 32 ]; then
  echo "❌ NEXTAUTH_SECRET must be at least 32 characters"
  exit 1
fi

echo "✅ Environment variables validated"

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# Backup database before deployment
echo "💾 Backing up database..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec properhoa-postgres pg_dump -U properhoa properhoa > "/tmp/$BACKUP_FILE"
echo "✅ Backup saved: /tmp/$BACKUP_FILE"

# Deploy with zero-downtime (rolling update)
echo "🔄 Deploying services..."
docker-compose -f "$COMPOSE_FILE" up -d --build web

# Run migrations
echo "🗄️ Running database migrations..."
docker exec properhoa-web npx prisma migrate deploy

# Health check
echo "🏥 Running health checks..."
sleep 5
HEALTH_STATUS=$(curl -sf http://localhost:3000/api/health || echo "unhealthy")

if [ "$HEALTH_STATUS" = "unhealthy" ]; then
  echo "❌ Health check failed! Rolling back..."
  # Restore from backup
  docker exec -i properhoa-postgres psql -U properhoa properhoa < "/tmp/$BACKUP_FILE"
  docker-compose -f "$COMPOSE_FILE" down
  docker-compose -f "$COMPOSE_FILE" up -d
  exit 1
fi

echo "✅ Health check passed"

# Cleanup old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f --filter "until=168h"

echo "🎉 Deployment to $ENVIRONMENT complete!"
echo ""
echo "📊 Monitoring:"
echo "  - Grafana: http://localhost:3001"
echo "  - Prometheus: http://localhost:9090"
echo "  - Health: http://localhost:3000/api/health"
