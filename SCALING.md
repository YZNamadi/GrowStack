# Scaling Guide

This guide outlines the scaling strategies for the GrowStack application.

## Horizontal Scaling

### 1. Load Balancer Configuration

```nginx
# nginx.conf
upstream growstack {
    least_conn;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.growstack.com;

    location / {
        proxy_pass http://growstack;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Auto Scaling Configuration

```yaml
# aws-autoscaling.yml
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    MinSize: 2
    MaxSize: 10
    DesiredCapacity: 2
    HealthCheckType: ELB
    HealthCheckGracePeriod: 300
    VPCZoneIdentifier:
      - subnet-123456
      - subnet-789012
    TargetGroupARNs:
      - !Ref TargetGroup
    LaunchTemplate:
      LaunchTemplateId: !Ref LaunchTemplate
      Version: !GetAtt LaunchTemplate.LatestVersionNumber
```

## Database Scaling

### 1. Read Replicas

```typescript
// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  replication: {
    read: [
      { host: 'read-replica-1', port: 5432 },
      { host: 'read-replica-2', port: 5432 }
    ],
    write: { host: 'master', port: 5432 }
  },
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
```

### 2. Connection Pooling

```typescript
// src/config/database.ts
const pool = new Pool({
  max: 20,
  min: 4,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

## Caching Strategy

### 1. Redis Configuration

```typescript
// src/config/redis.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

export default redis;
```

### 2. Cache Implementation

```typescript
// src/middleware/cache.ts
import redis from '../config/redis';

export const cache = (duration: number) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cachedResponse = await redis.get(key);

    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  };
};
```

## Queue System

### 1. Bull Queue Configuration

```typescript
// src/config/queue.ts
import Bull from 'bull';

export const emailQueue = new Bull('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
  }
});

export const notificationQueue = new Bull('notification', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
  }
});
```

### 2. Queue Processing

```typescript
// src/workers/email.worker.ts
import { emailQueue } from '../config/queue';
import { sendEmail } from '../services/email.service';

emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;
  await sendEmail(to, subject, template, data);
});
```

## Monitoring and Scaling

### 1. Metrics Collection

```typescript
// src/middleware/metrics.ts
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration / 1000);
  });
  next();
};
```

### 2. Auto Scaling Rules

```yaml
# aws-autoscaling-rules.yml
ScalingPolicy:
  Type: AWS::AutoScaling::ScalingPolicy
  Properties:
    AutoScalingGroupName: !Ref AutoScalingGroup
    PolicyType: TargetTrackingScaling
    TargetTrackingConfiguration:
      PredefinedMetricSpecification:
        PredefinedMetricType: ASGAverageCPUUtilization
      TargetValue: 70.0
```

## Performance Optimization

### 1. Query Optimization

```typescript
// src/services/user.service.ts
export const getUsers = async (options) => {
  return User.findAll({
    attributes: ['id', 'email', 'firstName', 'lastName'],
    include: [{
      model: Referral,
      attributes: ['id', 'status'],
      required: false
    }],
    limit: options.limit || 10,
    offset: options.offset || 0,
    order: [['createdAt', 'DESC']]
  });
};
```

### 2. Batch Processing

```typescript
// src/services/notification.service.ts
export const sendBatchNotifications = async (notifications) => {
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < notifications.length; i += batchSize) {
    batches.push(notifications.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    await Promise.all(batch.map(notification => sendNotification(notification)));
  }
};
```

## Load Testing

### 1. Load Test Configuration

```typescript
// tests/load/load.test.ts
import autocannon from 'autocannon';

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 100,
  duration: 10,
  requests: [
    {
      method: 'GET',
      path: '/api/users'
    }
  ]
});

autocannon.track(instance, { renderProgressBar: true });
```

### 2. Performance Monitoring

```typescript
// src/middleware/performance.ts
import { performance } from 'perf_hooks';
import logger from '../utils/logger';

export const performanceMonitor = (req, res, next) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    logger.info('Request Performance', {
      method: req.method,
      path: req.path,
      duration: `${duration.toFixed(2)}ms`,
      status: res.statusCode
    });
  });

  next();
};
```

## Best Practices

1. Use appropriate indexes:
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_referrals_status ON referrals(status);
   ```

2. Implement pagination:
   ```typescript
   const getPaginatedResults = async (page = 1, limit = 10) => {
     const offset = (page - 1) * limit;
     return Model.findAndCountAll({
       limit,
       offset,
       order: [['createdAt', 'DESC']]
     });
   };
   ```

3. Use efficient data structures:
   ```typescript
   // Use Map for frequent lookups
   const userCache = new Map();

   // Use Set for unique values
   const uniqueEmails = new Set();
   ```

4. Implement proper error handling:
   ```typescript
   try {
     await processData();
   } catch (error) {
     logger.error('Processing Error', {
       error: error.message,
       stack: error.stack
     });
     // Handle error appropriately
   }
   ```

5. Use async/await properly:
   ```typescript
   const processItems = async (items) => {
     const results = await Promise.all(
       items.map(item => processItem(item))
     );
     return results;
   };
   ``` 