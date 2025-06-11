# Backup and Recovery Guide

This guide outlines the backup and recovery procedures for the GrowStack application.

## Database Backups

### 1. Automated Backup Script

```bash
#!/bin/bash
# backup.sh

# Configuration
BACKUP_DIR="/backups"
DB_NAME="growstack"
DB_USER="postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Create backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete
```

### 2. Backup Schedule

```bash
# /etc/cron.d/backup-schedule
0 0 * * * root /scripts/backup.sh
0 12 * * * root /scripts/backup.sh
```

### 3. Backup Verification

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1
DB_NAME="growstack"

# Create temporary database
createdb -T template0 ${DB_NAME}_verify

# Restore backup
gunzip -c $BACKUP_FILE | psql ${DB_NAME}_verify

# Verify data
psql ${DB_NAME}_verify -c "SELECT COUNT(*) FROM users;"
psql ${DB_NAME}_verify -c "SELECT COUNT(*) FROM referrals;"

# Clean up
dropdb ${DB_NAME}_verify
```

## File System Backups

### 1. Application Files

```bash
#!/bin/bash
# backup-files.sh

# Configuration
APP_DIR="/app"
BACKUP_DIR="/backups/files"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/app_${TIMESTAMP}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    $APP_DIR

# Remove old backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +30 -delete
```

### 2. Uploaded Files

```bash
#!/bin/bash
# backup-uploads.sh

# Configuration
UPLOADS_DIR="/app/uploads"
BACKUP_DIR="/backups/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz" $UPLOADS_DIR

# Remove old backups
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete
```

## Recovery Procedures

### 1. Database Recovery

```bash
#!/bin/bash
# recover-db.sh

# Configuration
BACKUP_FILE=$1
DB_NAME="growstack"
DB_USER="postgres"

# Stop application
systemctl stop growstack

# Drop existing database
dropdb $DB_NAME

# Create new database
createdb $DB_NAME

# Restore backup
gunzip -c $BACKUP_FILE | psql -U $DB_USER $DB_NAME

# Start application
systemctl start growstack
```

### 2. File System Recovery

```bash
#!/bin/bash
# recover-files.sh

# Configuration
BACKUP_FILE=$1
APP_DIR="/app"

# Stop application
systemctl stop growstack

# Restore files
tar -xzf $BACKUP_FILE -C $APP_DIR

# Fix permissions
chown -R growstack:growstack $APP_DIR

# Start application
systemctl start growstack
```

## Backup Storage

### 1. Local Storage

```bash
# /etc/fstab
/dev/sdb1 /backups ext4 defaults 0 2
```

### 2. Remote Storage

```bash
#!/bin/bash
# sync-backups.sh

# Configuration
BACKUP_DIR="/backups"
REMOTE_HOST="backup-server"
REMOTE_DIR="/remote-backups"

# Sync backups
rsync -avz --delete $BACKUP_DIR/ $REMOTE_HOST:$REMOTE_DIR/
```

## Monitoring and Alerts

### 1. Backup Monitoring

```typescript
// src/services/backup.service.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export const verifyBackup = async () => {
  try {
    const { stdout } = await execAsync('ls -l /backups');
    const backupSize = parseInt(stdout.split(' ')[4]);
    
    if (backupSize < 1000000) { // Less than 1MB
      throw new Error('Backup size too small');
    }
    
    logger.info('Backup verification successful');
  } catch (error) {
    logger.error('Backup verification failed', { error });
    // Send alert
  }
};
```

### 2. Alert Configuration

```typescript
// src/config/alerts.ts
export const backupAlerts = {
  email: {
    to: 'admin@growstack.com',
    subject: 'Backup Alert',
    template: 'backup-alert'
  },
  slack: {
    channel: '#backups',
    webhook: process.env.SLACK_WEBHOOK
  }
};
```

## Disaster Recovery Plan

### 1. Recovery Time Objectives (RTO)

- Database: 1 hour
- Application: 30 minutes
- Files: 2 hours

### 2. Recovery Point Objectives (RPO)

- Database: 12 hours
- Application: 24 hours
- Files: 24 hours

### 3. Recovery Procedures

1. Database Recovery:
   ```bash
   # Stop services
   systemctl stop growstack
   systemctl stop postgresql

   # Restore database
   ./recover-db.sh /backups/db/latest.sql.gz

   # Verify data
   ./verify-backup.sh /backups/db/latest.sql.gz

   # Start services
   systemctl start postgresql
   systemctl start growstack
   ```

2. Application Recovery:
   ```bash
   # Stop application
   systemctl stop growstack

   # Restore application files
   ./recover-files.sh /backups/files/latest.tar.gz

   # Install dependencies
   npm install

   # Start application
   systemctl start growstack
   ```

3. File Recovery:
   ```bash
   # Stop application
   systemctl stop growstack

   # Restore uploaded files
   ./recover-files.sh /backups/uploads/latest.tar.gz

   # Fix permissions
   chown -R growstack:growstack /app/uploads

   # Start application
   systemctl start growstack
   ```

## Regular Testing

### 1. Backup Testing Schedule

- Daily: Verify backup completion
- Weekly: Test database recovery
- Monthly: Full disaster recovery test

### 2. Test Procedures

```bash
#!/bin/bash
# test-recovery.sh

# Test database recovery
./recover-db.sh /backups/db/test.sql.gz

# Verify data integrity
psql growstack -c "SELECT COUNT(*) FROM users;"
psql growstack -c "SELECT COUNT(*) FROM referrals;"

# Test application recovery
./recover-files.sh /backups/files/test.tar.gz

# Verify application
curl http://localhost:3000/health
```

## Documentation

### 1. Backup Log

```typescript
// src/services/backup.service.ts
export const logBackup = async (type: string, status: string) => {
  await BackupLog.create({
    type,
    status,
    timestamp: new Date(),
    size: await getBackupSize(type)
  });
};
```

### 2. Recovery Log

```typescript
// src/services/recovery.service.ts
export const logRecovery = async (type: string, status: string) => {
  await RecoveryLog.create({
    type,
    status,
    timestamp: new Date(),
    duration: await getRecoveryDuration()
  });
};
``` 