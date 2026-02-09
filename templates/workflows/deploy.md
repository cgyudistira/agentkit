---
description: Complete deployment workflow for production releases
---

# Deployment Workflow

## Pre-Deployment Checklist

### 1. Code Quality Verification
// turbo
```bash
npm run lint
npm run type-check
```

Ensure zero linting errors and type errors before proceeding.

### 2. Run Full Test Suite
// turbo
```bash
npm test -- --coverage --watchAll=false
```

**Requirements:**
- All tests must pass (100% green)
- Code coverage must meet minimum threshold (typically 80%+)
- No skipped tests without documented reason

### 3. Security Audit
// turbo
```bash
npm audit --audit-level=high
```

**Action Items:**
- Fix all high and critical vulnerabilities
- Document any accepted medium vulnerabilities with justification
- Update dependencies if security patches are available

### 4. Environment Configuration Verification

Check that all environment variables are properly configured:
```bash
# Compare .env.example with production config
diff .env.example .env.production
```

**Critical Variables to Verify:**
- Database connection strings
- API keys and secrets (ensure production values)
- Feature flags
- Logging levels (should be 'warn' or 'error' in production)

---

## Build Process

### 5. Create Production Build
// turbo
```bash
npm run build
```

**Verify Build Output:**
- Check bundle sizes are within acceptable limits
- Verify source maps are generated (for error tracking)
- Confirm static assets are properly hashed

### 6. Build Verification
```bash
# Test the production build locally
npm run preview
# or
npm run start:prod
```

Navigate through critical user paths:
- [ ] Login/Authentication flow
- [ ] Main dashboard loads correctly
- [ ] API calls return expected data
- [ ] No console errors

---

## Database Preparation

### 7. Backup Production Database
```bash
# Example for PostgreSQL
pg_dump -h production-host -U username -d database > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Always backup before deploying migrations!**

### 8. Run Migrations (if applicable)
```bash
npm run migrate:production
```

Verify migration success:
- Check migration table for new entries
- Validate schema changes are applied correctly

---

## Deployment Execution

### 9. Deploy to Staging First
```bash
npm run deploy:staging
```

Perform smoke tests on staging:
- [ ] Application starts without errors
- [ ] Database connections work
- [ ] External API integrations function
- [ ] Authentication works

### 10. Deploy to Production
```bash
npm run deploy:production
```

Monitor deployment progress and watch for:
- Container startup logs
- Health check endpoints
- Error tracking dashboard (Sentry, etc.)

---

## Post-Deployment Verification

### 11. Health Check
```bash
curl -I https://your-production-url.com/health
# Should return HTTP 200
```

### 12. Smoke Tests
- [ ] Landing page loads under 3 seconds
- [ ] User can log in
- [ ] Core features function correctly
- [ ] API responses are within expected latency

### 13. Monitor Metrics (First 30 minutes)
- Error rates (should match pre-deployment baseline)
- Response times
- CPU/Memory usage
- Database query performance

---

## Rollback Procedure

If issues are detected:

### Immediate Rollback
```bash
# Revert to previous deployment
npm run rollback
# or
git revert HEAD && npm run deploy:production
```

### Database Rollback (if migrations failed)
```bash
npm run migrate:rollback
# Restore from backup if needed
psql -h production-host -U username -d database < backup_file.sql
```

---

## Communication Checklist

- [ ] Notify team in #deployments Slack channel
- [ ] Update status page if applicable
- [ ] Send release notes to stakeholders
- [ ] Document any issues encountered for retrospective
