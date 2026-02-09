---
description: Systematic debugging workflow for identifying and resolving issues
---

# Debugging Workflow

## Phase 1: Issue Triage

### 1. Gather Information
Before touching any code, collect:
- **Error message** (exact text, stack trace)
- **Steps to reproduce**
- **Environment** (browser, OS, Node version, etc.)
- **When did it start?** (after a deploy? specific action?)
- **Who is affected?** (all users? specific accounts?)

### 2. Check Recent Changes
// turbo
```bash
git log --oneline -20
git log --since="2 days ago" --oneline
```

**Look for:**
- Recent deployments
- Configuration changes
- Dependency updates
- Database migrations

### 3. Review Error Tracking
Check your error monitoring dashboards:
- Sentry / Bugsnag / Rollbar
- Application logs (CloudWatch, Datadog, etc.)
- Server metrics (CPU, memory, disk)

---

## Phase 2: Reproduce the Issue

### 4. Set Up Debug Environment
```bash
# Enable verbose logging
export DEBUG=*
export LOG_LEVEL=debug

# Start in development mode
npm run dev
```

### 5. Attempt Local Reproduction
```bash
# Run with Node inspector
node --inspect-brk src/index.js

# Or use npm script if available
npm run debug
```

**Open Chrome DevTools:** `chrome://inspect`

### 6. Create Minimal Reproduction
If complex, isolate the issue:
```bash
# Create a minimal test case
mkdir debug-repro && cd debug-repro
# Set up minimal environment that reproduces the bug
```

---

## Phase 3: Systematic Investigation

### 7. Binary Search Through History
If the bug was introduced recently:
```bash
# Find the commit that introduced the bug
git bisect start
git bisect bad HEAD
git bisect good <last-known-working-commit>
# Git will guide you through testing commits
```

### 8. Add Strategic Logging
```javascript
// Add detailed logging at key points
console.log('[DEBUG] Function entry:', { param1, param2 });
console.log('[DEBUG] State before operation:', JSON.stringify(state, null, 2));
console.log('[DEBUG] API response:', response.status, response.data);
```

**Key locations to instrument:**
- Function entry/exit points
- Before/after database queries
- API request/response boundaries
- State mutations

### 9. Check Dependencies
```bash
# Verify dependency versions
npm ls

# Check for known issues in dependencies
npm audit

# Compare with working environment
diff package-lock.json package-lock.json.backup
```

---

## Phase 4: Database Investigation

### 10. Query Analysis
```sql
-- Check for slow queries
EXPLAIN ANALYZE SELECT * FROM table WHERE condition;

-- Look for lock contention
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check table statistics
SELECT relname, n_live_tup, n_dead_tup 
FROM pg_stat_user_tables;
```

### 11. Data Integrity
```sql
-- Verify foreign key relationships
SELECT * FROM orders WHERE customer_id NOT IN (SELECT id FROM customers);

-- Check for null values in required fields
SELECT COUNT(*) FROM users WHERE email IS NULL;
```

---

## Phase 5: Network Debugging

### 12. API Call Analysis
```bash
# Test API endpoints directly
curl -v -X GET "https://api.example.com/endpoint" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 13. Check DNS and Connectivity
```bash
# Verify DNS resolution
nslookup api.example.com

# Test connectivity
ping api.example.com

# Check SSL certificates
openssl s_client -connect api.example.com:443 </dev/null
```

---

## Phase 6: Memory and Performance

### 14. Memory Leak Detection
```bash
# Run with memory profiling
node --expose-gc --inspect src/index.js

# Generate heap snapshot
# In Chrome DevTools: Memory > Take Heap Snapshot
```

### 15. CPU Profiling
```bash
# Generate CPU profile
node --prof src/index.js
node --prof-process isolate-*.log > profile.txt
```

---

## Phase 7: Resolution

### 16. Implement Fix
```bash
# Create a fix branch
git checkout -b fix/issue-description
```

**Best Practices:**
- Make the smallest possible change
- Add a test that would have caught this bug
- Document the root cause in commit message

### 17. Write Regression Test
```javascript
describe('Bug #123: Issue Description', () => {
  it('should handle the edge case correctly', () => {
    // Test that reproduces the original bug
    // This test should fail without the fix
  });
});
```

### 18. Verify Fix
// turbo
```bash
npm test
npm run lint
```

Test in the same environment where the bug was observed.

---

## Phase 8: Documentation

### 19. Document the Issue
Create a post-mortem including:
- **Summary:** One-line description
- **Root Cause:** What actually caused the issue
- **Impact:** Users affected, duration
- **Detection:** How was it found
- **Resolution:** What fixed it
- **Prevention:** How to prevent similar issues

### 20. Update Monitoring
- Add alerts for similar issues
- Improve logging in affected area
- Update runbooks if applicable

---

## Common Debugging Commands Reference

```bash
# View real-time logs
tail -f logs/app.log | grep ERROR

# Search logs for patterns
grep -r "error" logs/ --include="*.log"

# Check process status
ps aux | grep node

# Monitor resources
top -c
htop

# Check open files/connections
lsof -i :3000
netstat -tuln | grep 3000
```
