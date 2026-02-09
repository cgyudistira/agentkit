---
description: Safe and systematic code refactoring workflow
---

# Code Refactoring Workflow

## Pre-Refactoring Assessment

### 1. Define Refactoring Goals
Before starting, clearly define:
- **What:** Which code needs refactoring?
- **Why:** What problem does this solve?
- **Scope:** How much will be changed?
- **Risk:** What could go wrong?

**Valid Reasons to Refactor:**
- ✅ Improve code readability
- ✅ Reduce duplication (DRY)
- ✅ Improve performance
- ✅ Enable new features
- ✅ Fix security issues
- ✅ Reduce technical debt

**Invalid Reasons:**
- ❌ "It's not how I would write it"
- ❌ "Let's use this new library"
- ❌ Changing working code for no benefit

### 2. Assess Current State
```bash
# Check test coverage of code to refactor
npm test -- --coverage --collectCoverageFrom='src/path/to/file.js'

# Find code dependencies
grep -r "import.*from.*./file-to-refactor" src/
```

### 3. Ensure Test Coverage
**CRITICAL:** Never refactor code without tests!

If tests are missing:
```javascript
// Write characterization tests first
describe('LegacyModule', () => {
  it('should return expected output for known input', () => {
    // Document current behavior, even if it seems wrong
    const result = legacyFunction('input');
    expect(result).toEqual('current-output'); // Snapshot of behavior
  });
});
```

---

## Planning Phase

### 4. Create Refactoring Plan
Document your approach:

```markdown
## Refactoring Plan: UserService

### Current Problems
- 500+ line file (too large)
- Mixed responsibilities
- Duplicate validation logic

### Target State
- Split into UserService, UserValidator, UserRepository
- Each file < 150 lines
- Shared validation utilities

### Steps
1. Extract validation logic
2. Extract repository layer
3. Update imports
4. Verify all tests pass
```

### 5. Identify Safe Stopping Points
Break refactoring into steps where you can:
- Run tests and verify nothing is broken
- Make a commit
- Stop and continue later if needed

---

## Execution Phase

### 6. Create Branch and Baseline
```bash
git checkout main
git pull origin main
git checkout -b refactor/user-service-cleanup

# Run tests to establish baseline
npm test
```

### 7. Apply Small, Incremental Changes
**Golden Rule:** Make one type of change at a time

**Example: Extracting a Function**
```javascript
// Before: Inline logic
function processOrder(order) {
  // 50 lines of validation logic
  if (!order.id) throw new Error('Missing ID');
  if (!order.items || order.items.length === 0) {
    throw new Error('No items');
  }
  // ... more validation
  
  // 100 lines of processing logic
}

// Step 1: Extract validation (keep inline temporarily)
function validateOrder(order) {
  if (!order.id) throw new Error('Missing ID');
  if (!order.items || order.items.length === 0) {
    throw new Error('No items');
  }
}

function processOrder(order) {
  validateOrder(order); // Use extracted function
  // ... processing logic
}

// Step 2: Run tests, commit if passing
// Step 3: Move to separate file
// Step 4: Run tests, commit if passing
```

### 8. Run Tests After Every Change
// turbo
```bash
npm test
```

**If tests fail:**
- Stop immediately
- Revert the last change
- Understand why it failed
- Try a smaller change

### 9. Commit Frequently
```bash
git add -A
git commit -m "refactor: extract validateOrder function"
```

**Commit after each successful step!**

---

## Common Refactoring Patterns

### 10. Extract Function
```javascript
// Before
function handleSubmit() {
  const name = form.name.trim();
  const email = form.email.toLowerCase().trim();
  const phone = form.phone.replace(/\D/g, '');
  // ... use cleaned data
}

// After
function cleanFormData(form) {
  return {
    name: form.name.trim(),
    email: form.email.toLowerCase().trim(),
    phone: form.phone.replace(/\D/g, '')
  };
}

function handleSubmit() {
  const cleanedData = cleanFormData(form);
  // ... use cleaned data
}
```

### 11. Replace Conditional with Polymorphism
```javascript
// Before
function getShippingCost(type, weight) {
  if (type === 'standard') return weight * 1.5;
  if (type === 'express') return weight * 3.0;
  if (type === 'overnight') return weight * 5.0;
}

// After
const shippingStrategies = {
  standard: (weight) => weight * 1.5,
  express: (weight) => weight * 3.0,
  overnight: (weight) => weight * 5.0
};

function getShippingCost(type, weight) {
  const strategy = shippingStrategies[type];
  if (!strategy) throw new Error(`Unknown shipping type: ${type}`);
  return strategy(weight);
}
```

### 12. Remove Duplication
```javascript
// Before: Duplicate logic in multiple places
function getUserById(id) {
  const user = db.query('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

function getProductById(id) {
  const product = db.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

// After: Generic function
function getById(table, id, entityName) {
  const result = db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!result) throw new NotFoundError(`${entityName} not found`);
  return result;
}

const getUserById = (id) => getById('users', id, 'User');
const getProductById = (id) => getById('products', id, 'Product');
```

### 13. Simplify Complex Conditionals
```javascript
// Before
if (user && user.active && user.subscription && 
    user.subscription.status === 'active' &&
    user.subscription.plan !== 'free') {
  // Premium feature
}

// After
function isPremiumUser(user) {
  if (!user?.active) return false;
  if (!user.subscription) return false;
  if (user.subscription.status !== 'active') return false;
  if (user.subscription.plan === 'free') return false;
  return true;
}

if (isPremiumUser(user)) {
  // Premium feature
}
```

---

## Verification Phase

### 14. Run Full Test Suite
// turbo
```bash
npm test -- --coverage
npm run lint
npm run type-check
```

### 15. Compare Before/After Behavior
```bash
# Verify no functional changes
git diff main -- tests/  # Tests should be minimal changes
```

### 16. Performance Verification
If performance was a goal:
```bash
# Run benchmarks
npm run benchmark

# Compare with baseline
```

### 17. Manual Testing
- [ ] Key user flows still work
- [ ] No console errors
- [ ] API responses unchanged

---

## Finalization

### 18. Clean Up
```bash
# Remove any TODO comments added during refactoring
grep -r "TODO.*refactor" src/

# Remove debugging code
grep -r "console.log" src/
```

### 19. Update Documentation
- Update JSDoc/TSDoc comments
- Update README if API changed
- Update architectural documents

### 20. Create Pull Request
```markdown
## Refactoring: UserService Cleanup

### What was refactored
- Split UserService into smaller modules
- Extracted validation logic
- Removed duplicate code

### Why
- Original file was 500+ lines
- Difficult to test and maintain
- Duplicate validation in 3 places

### Changes
- UserService.js → UserService.js + UserValidator.js + UserRepository.js
- Total lines reduced from 500 to 350
- Test coverage increased from 65% to 85%

### Testing
- [x] All existing tests pass
- [x] Added new unit tests
- [x] Manual testing completed

### No functional changes
This refactoring maintains identical behavior.
```

---

## Anti-Patterns to Avoid

### Don't Do These:
- ❌ Refactoring and adding features in same PR
- ❌ Changing behavior while refactoring
- ❌ Refactoring without tests
- ❌ Big-bang refactoring (change everything at once)
- ❌ Refactoring code you don't understand
- ❌ Premature optimization
- ❌ Introducing new dependencies unnecessarily
