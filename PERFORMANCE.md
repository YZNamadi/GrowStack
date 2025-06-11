# Performance Optimization Guide

This guide outlines performance optimization strategies for the GrowStack application.

## Application Performance

### 1. Caching Strategy

```typescript
// src/middleware/cache.ts
import Redis from 'ioredis';
import { promisify } from 'util';

const redis = new Redis(process.env.REDIS_URL);
const getAsync = promisify(redis.get).bind(redis);
const setAsync = promisify(redis.set).bind(redis);

export const cache = (duration: number) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cachedResponse = await getAsync(key);

    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      setAsync(key, JSON.stringify(body), 'EX', duration);
      res.sendResponse(body);
    };

    next();
  };
};
```

### 2. Database Optimization

```typescript
// src/config/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});

export default sequelize;
```

### 3. Query Optimization

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

## Infrastructure Optimization

### 1. Load Balancing

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

### 2. Compression

```typescript
// src/app.ts
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));
```

### 3. Static File Serving

```typescript
// src/app.ts
import express from 'express';
import path from 'path';

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
```

## Monitoring and Profiling

### 1. Performance Monitoring

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

### 2. Memory Profiling

```typescript
// src/utils/profiler.ts
import v8Profiler from 'v8-profiler-next';
import fs from 'fs';

export const startProfiling = (duration: number) => {
  v8Profiler.startProfiling('CPU Profile');
  setTimeout(() => {
    const profile = v8Profiler.stopProfiling();
    profile.export((error, result) => {
      fs.writeFileSync(`profile-${Date.now()}.cpuprofile`, result);
      profile.delete();
    });
  }, duration);
};
```

## Optimization Techniques

### 1. Connection Pooling

```typescript
// src/config/database.ts
const pool = new Pool({
  max: 20,
  min: 4,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
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

### 3. Lazy Loading

```typescript
// src/models/user.ts
export class User extends Model {
  static async getReferrals() {
    return this.hasMany(Referral, {
      foreignKey: 'userId',
      as: 'referrals'
    });
  }
}
```

## Performance Testing

### 1. Load Testing

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

### 2. Memory Leak Testing

```typescript
// tests/memory/leak.test.ts
import { heapStats } from 'v8';

const initialStats = heapStats();

// Run your test
await runTest();

const finalStats = heapStats();
console.log('Memory Usage:', {
  initial: initialStats,
  final: finalStats,
  difference: {
    total: finalStats.total_heap_size - initialStats.total_heap_size,
    used: finalStats.used_heap_size - initialStats.used_heap_size
  }
});
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