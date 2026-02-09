---
description: Safe database migration workflow for production systems
---

# Database Migration Workflow

## Pre-Migration Planning

### 1. Understand the Change
Before writing any migration:
- **What data is affected?**
- **Is this reversible?**
- **What's the rollback plan?**
- **How long will it take?**

**Migration Types:**
| Type | Risk | Downtime |
|------|------|----------|
| Add column (nullable) | Low | None |
| Add column (non-null) | Medium | Possible |
| Drop column | High | None |
| Rename column | High | Possible |
| Add index | Medium | Possible |
| Modify data | High | Varies |

### 2. Assess Impact
```sql
-- Check table size
SELECT COUNT(*) FROM affected_table;

-- Estimate impact time
SELECT pg_size_pretty(pg_relation_size('table_name'));

-- Check for locks
SELECT * FROM pg_locks WHERE relation = 'table_name'::regclass;
```

### 3. Plan for Zero-Downtime (if required)
For production systems, use expand/contract pattern:
1. **Expand:** Add new structures, keep old working
2. **Migrate:** Background data migration
3. **Contract:** Remove old structures after verification

---

## Creating the Migration

### 4. Generate Migration File
```bash
# Create timestamped migration
npm run migration:create -- --name=add_user_preferences

# Or using specific tools
npx prisma migrate dev --name add_user_preferences
npx sequelize migration:generate --name add_user_preferences
```

### 5. Write the Migration
**Always include both UP and DOWN migrations!**

```javascript
// Example: Sequelize migration
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new column
    await queryInterface.addColumn('users', 'preferences', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });
    
    // Add index for performance
    await queryInterface.addIndex('users', ['preferences'], {
      name: 'idx_users_preferences',
      using: 'gin'
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    // Reverse in opposite order
    await queryInterface.removeIndex('users', 'idx_users_preferences');
    await queryInterface.removeColumn('users', 'preferences');
  }
};
```

### 6. Best Practices for Migration Code

**DO:**
```sql
-- Add nullable column first
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- Add index concurrently (for large tables)
CREATE INDEX CONCURRENTLY idx_users_pref ON users(preferences);

-- Use transactions for safety
BEGIN;
  ALTER TABLE ...;
  UPDATE ...;
COMMIT;
```

**DON'T:**
```sql
-- Don't add NOT NULL without default on existing table with data
ALTER TABLE users ADD COLUMN required_field VARCHAR(255) NOT NULL;

-- Don't drop columns immediately
ALTER TABLE users DROP COLUMN old_data;  -- Data loss!

-- Don't run long operations without CONCURRENTLY
CREATE INDEX idx_large_table ON large_table(column);  -- Locks table!
```

---

## Testing the Migration

### 7. Test Locally First
```bash
# Fresh database
npm run db:reset
npm run migrate

# Verify schema
npm run db:schema:dump
```

### 8. Test with Production-like Data
```bash
# Restore anonymized production backup locally
pg_restore -d local_db anonymized_backup.dump

# Run migration on realistic data
npm run migrate

# Verify performance
time npm run migrate
```

### 9. Test Rollback
```bash
# Apply migration
npm run migrate

# Verify it can be rolled back
npm run migrate:rollback

# Re-apply to confirm
npm run migrate
```

---

## Pre-Production Deployment

### 10. Backup Production Database
```bash
# Create full backup before any migration
pg_dump -h production-host -U user -d database -F custom \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Verify backup is valid
pg_restore --list backup_*.dump | head -20
```

### 11. Test on Staging
```bash
# Deploy to staging first
npm run migrate:staging

# Run full application test suite
npm run test:e2e:staging

# Verify application works correctly
```

### 12. Plan Maintenance Window (if needed)
For high-risk migrations:
- Schedule during low-traffic period
- Notify users in advance
- Prepare status page update
- Have team on standby

---

## Production Deployment

### 13. Check Production Readiness
- [ ] Migration tested on staging
- [ ] Backup completed and verified
- [ ] Rollback tested and working
- [ ] Team notified
- [ ] Monitoring dashboards open

### 14. Run Migration
```bash
# Enable maintenance mode (if needed)
npm run maintenance:on

# Run migration with logging
npm run migrate:production 2>&1 | tee migration_$(date +%Y%m%d).log

# Verify migration success
npm run migrate:status
```

### 15. Immediate Verification
```sql
-- Verify new structures exist
\d+ table_name

-- Check data integrity
SELECT COUNT(*) FROM affected_table WHERE new_column IS NULL;

-- Verify constraints
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'affected_table';
```

### 16. Application Verification
```bash
# Disable maintenance mode
npm run maintenance:off

# Run health checks
curl -I https://production-url/health

# Verify critical paths
npm run smoke-test:production
```

---

## Post-Migration Monitoring

### 17. Monitor for 30 Minutes
Watch for:
- [ ] Error rates (should match baseline)
- [ ] Response times (no degradation)
- [ ] Database CPU/memory
- [ ] Query performance
- [ ] Application logs

### 18. Query Performance Check
```sql
-- Check for slow queries after migration
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
WHERE query LIKE '%affected_table%'
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Rollback Procedure

### If Issues Detected:

#### 19. Immediate Rollback
```bash
# Enable maintenance mode
npm run maintenance:on

# Rollback migration
npm run migrate:rollback

# Verify rollback
npm run migrate:status

# Restart application
pm2 restart all

# Disable maintenance mode
npm run maintenance:off
```

#### 20. If Code Depends on Migration
```bash
# Deploy previous application version
git checkout previous-tag
npm run deploy:production

# Then run migration rollback
npm run migrate:rollback
```

#### 21. If Rollback Fails (Worst Case)
```bash
# Restore from backup
pg_restore -h production-host -U user -d database \
  -c backup_file.dump

# Verify restoration
psql -h production-host -U user -d database \
  -c "SELECT COUNT(*) FROM critical_table;"
```

---

## Data Migration Tips

### Large Table Migrations
```sql
-- Migrate in batches to avoid locks
DO $$
DECLARE
  batch_size INT := 10000;
  affected INT;
BEGIN
  LOOP
    UPDATE large_table 
    SET new_column = compute_value(old_column)
    WHERE id IN (
      SELECT id FROM large_table 
      WHERE new_column IS NULL 
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS affected = ROW_COUNT;
    COMMIT;
    
    -- Progress logging
    RAISE NOTICE 'Migrated % rows', affected;
    
    EXIT WHEN affected < batch_size;
    
    -- Pause to reduce load
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

### Zero-Downtime Column Rename
```sql
-- 1. Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- 2. Deploy code that writes to both columns
-- 3. Backfill data
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- 4. Deploy code that reads from new column
-- 5. Drop old column
ALTER TABLE users DROP COLUMN name;
```

---

## Migration Checklist

### Before Migration
- [ ] Migration code reviewed
- [ ] Tested on local/staging
- [ ] Rollback tested
- [ ] Production backup taken
- [ ] Team notified
- [ ] Monitoring ready

### After Migration
- [ ] Schema verified
- [ ] Application working
- [ ] No performance degradation
- [ ] Logs reviewed
- [ ] Documentation updated
