# Deployment Guide

This guide provides instructions for deploying the GrowStack application to various environments.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher
- Docker and Docker Compose (for containerized deployment)
- AWS CLI (for AWS deployment)
- kubectl (for Kubernetes deployment)

## Environment Setup

1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables with your production values:
   - Database credentials
   - Redis configuration
   - JWT secrets
   - Email/SMS provider credentials
   - Other service-specific settings

## Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t growstack:latest .
   ```

2. Run the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Run database migrations:
   ```bash
   docker-compose -f docker-compose.prod.yml exec app npm run migrate
   ```

4. Run database seeders (optional):
   ```bash
   docker-compose -f docker-compose.prod.yml exec app npm run seed
   ```

## AWS Deployment

### EC2 Deployment

1. Launch an EC2 instance:
   - AMI: Amazon Linux 2
   - Instance type: t2.micro (minimum)
   - Security group: Allow ports 22, 80, 443

2. Install dependencies:
   ```bash
   sudo yum update -y
   sudo yum install -y docker git nodejs npm
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. Clone and deploy:
   ```bash
   git clone https://github.com/yourusername/growstack.git
   cd growstack
   docker-compose -f docker-compose.prod.yml up -d
   ```

### ECS Deployment

1. Create an ECS cluster:
   ```bash
   aws ecs create-cluster --cluster-name growstack
   ```

2. Create a task definition:
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

3. Create a service:
   ```bash
   aws ecs create-service --cluster growstack --service-name growstack-service --task-definition growstack:1 --desired-count 1
   ```

## Kubernetes Deployment

1. Create a namespace:
   ```bash
   kubectl create namespace growstack
   ```

2. Apply configurations:
   ```bash
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secrets.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

3. Verify deployment:
   ```bash
   kubectl get pods -n growstack
   kubectl get services -n growstack
   ```

## Database Setup

1. Create production database:
   ```sql
   CREATE DATABASE growstack_prod;
   ```

2. Run migrations:
   ```bash
   npm run migrate
   ```

3. Set up database backups:
   ```bash
   # Add to crontab
   0 0 * * * pg_dump -U postgres growstack_prod > /backups/growstack_$(date +\%Y\%m\%d).sql
   ```

## Monitoring Setup

1. Install monitoring tools:
   ```bash
   # Prometheus
   docker run -d -p 9090:9090 prom/prometheus

   # Grafana
   docker run -d -p 3000:3000 grafana/grafana
   ```

2. Configure monitoring:
   - Set up Prometheus targets
   - Create Grafana dashboards
   - Configure alerts

3. Set up logging:
   ```bash
   # ELK Stack
   docker-compose -f elk-stack.yml up -d
   ```

## Security Considerations

1. SSL/TLS Setup:
   ```bash
   # Using Let's Encrypt
   certbot --nginx -d yourdomain.com
   ```

2. Security headers:
   ```nginx
   # nginx.conf
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-XSS-Protection "1; mode=block";
   add_header X-Content-Type-Options "nosniff";
   ```

3. Rate limiting:
   ```nginx
   # nginx.conf
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
   ```

## Backup and Recovery

1. Database backups:
   ```bash
   # Automated backup script
   #!/bin/bash
   BACKUP_DIR="/backups"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   pg_dump -U postgres growstack_prod > "$BACKUP_DIR/growstack_$TIMESTAMP.sql"
   ```

2. File backups:
   ```bash
   # Backup important files
   tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz /path/to/important/files
   ```

3. Recovery procedure:
   ```bash
   # Database recovery
   psql -U postgres growstack_prod < backup.sql

   # File recovery
   tar -xzf backup.tar.gz -C /restore/path
   ```

## Scaling

1. Horizontal scaling:
   ```bash
   # Kubernetes
   kubectl scale deployment growstack --replicas=3

   # Docker Swarm
   docker service scale growstack=3
   ```

2. Load balancing:
   ```nginx
   # nginx.conf
   upstream growstack {
       server 10.0.0.1:3000;
       server 10.0.0.2:3000;
       server 10.0.0.3:3000;
   }
   ```

## Maintenance

1. Regular updates:
   ```bash
   # Update dependencies
   npm update

   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

2. Health checks:
   ```bash
   # Add to monitoring
   curl -f http://localhost:3000/health || exit 1
   ```

3. Log rotation:
   ```bash
   # logrotate.conf
   /var/log/growstack/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
   }
   ``` 