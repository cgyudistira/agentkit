---
description: Comprehensive code review guidelines for quality assurance
---

# Code Review Workflow

## Preparation Phase

### 1. Understand the Context
Before reviewing code:
- Read the ticket/issue description
- Understand the acceptance criteria
- Review any related design documents
- Check if there are breaking changes

### 2. Check PR Metadata
Verify the PR includes:
- [ ] Clear, descriptive title
- [ ] Link to related issue/ticket
- [ ] Description of changes
- [ ] Screenshots for UI changes
- [ ] Migration notes if applicable

---

## Automated Checks

### 3. Verify CI Pipeline
// turbo
```bash
# Ensure all checks pass locally
npm run lint
npm run type-check
npm test
```

**All automated checks must pass before manual review:**
- [ ] Linting (ESLint/Prettier)
- [ ] Type checking (TypeScript)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security scans
- [ ] Build succeeds

### 4. Check Code Coverage
```bash
npm test -- --coverage
```

**Requirements:**
- New code should have tests
- Coverage should not decrease
- Critical paths must have 100% coverage

---

## Code Quality Review

### 5. Architecture & Design
**Questions to ask:**
- Does this follow existing patterns in the codebase?
- Is the solution over-engineered or too simple?
- Are there better approaches?
- Does it introduce technical debt?

**Red Flags:**
- ❌ God classes (doing too much)
- ❌ Deep nesting (>3 levels)
- ❌ Circular dependencies
- ❌ Violation of SOLID principles

### 6. Readability & Maintainability
**Check for:**
- Clear, descriptive variable/function names
- Appropriate use of comments (why, not what)
- Consistent code style
- Small, focused functions (<20 lines ideal)
- Proper file organization

**Example of good naming:**
```javascript
// Bad
const d = new Date();
const u = getU();

// Good
const currentDate = new Date();
const currentUser = getCurrentUser();
```

### 7. Error Handling
**Verify:**
- All async operations have error handling
- Errors are logged appropriately
- User-facing errors are friendly
- Errors don't leak sensitive information

```javascript
// Bad
try {
  await riskyOperation();
} catch (e) {
  // Silent failure
}

// Good
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new UserFriendlyError('Something went wrong. Please try again.');
}
```

### 8. Security Review
**Check for:**
- [ ] Input validation on all user inputs
- [ ] Proper authentication/authorization checks
- [ ] No hardcoded secrets or credentials
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection where needed

```javascript
// Bad - SQL injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`;

// Good - Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

---

## Performance Review

### 9. Database Operations
**Watch for:**
- N+1 query problems
- Missing indexes on queried columns
- Large data fetches without pagination
- Unnecessary database calls

```javascript
// Bad - N+1 problem
const users = await User.findAll();
for (const user of users) {
  const orders = await Order.findByUserId(user.id); // N queries
}

// Good - Single query with join
const users = await User.findAll({
  include: [{ model: Order }]
});
```

### 10. Algorithm Efficiency
**Consider:**
- Time complexity (Big O)
- Space complexity
- Unnecessary loops or iterations
- Caching opportunities

### 11. Memory Management
**Check for:**
- Memory leaks (listeners not removed)
- Large objects held in memory
- Proper cleanup in useEffect/componentWillUnmount

---

## Testing Review

### 12. Test Quality
**Verify:**
- Tests are meaningful (not just for coverage)
- Tests are independent (no order dependency)
- Tests are deterministic (no flaky tests)
- Edge cases are covered
- Negative cases are tested

```javascript
// Good test example
describe('calculateDiscount', () => {
  it('should apply 10% discount for orders over $100', () => {
    expect(calculateDiscount(150)).toBe(15);
  });

  it('should not apply discount for orders under $100', () => {
    expect(calculateDiscount(50)).toBe(0);
  });

  it('should handle zero amount', () => {
    expect(calculateDiscount(0)).toBe(0);
  });

  it('should throw error for negative amounts', () => {
    expect(() => calculateDiscount(-10)).toThrow('Invalid amount');
  });
});
```

### 13. Test Coverage Gaps
Ensure tests cover:
- [ ] Happy path
- [ ] Error cases
- [ ] Boundary conditions
- [ ] Null/undefined inputs
- [ ] Concurrent access (if applicable)

---

## Documentation Review

### 14. Code Documentation
**Check for:**
- JSDoc/TSDoc for public APIs
- README updates for new features
- API documentation updates
- Inline comments for complex logic

### 15. Changelog
If applicable:
- [ ] CHANGELOG.md updated
- [ ] Version bump if needed
- [ ] Migration guide for breaking changes

---

## Providing Feedback

### 16. Effective Comments
**Good feedback is:**
- Specific and actionable
- Constructive, not critical
- Explains the "why"
- Offers alternatives

**Comment prefixes:**
- `[nit]` - Minor suggestion, not blocking
- `[question]` - Seeking clarification
- `[suggestion]` - Optional improvement
- `[must-fix]` - Blocking issue

**Example:**
```
[suggestion] Consider extracting this into a reusable hook since we have similar logic in UserProfile component.

[must-fix] This SQL query is vulnerable to injection. Please use parameterized queries instead.
```

### 17. Approval Criteria
**Approve when:**
- All automated checks pass
- No security vulnerabilities
- Code is maintainable
- Tests are adequate
- Documentation is updated

**Request changes when:**
- Security issues exist
- Breaking changes without migration
- Missing critical tests
- Major design concerns

---

## Post-Review Checklist

- [ ] All comments addressed or discussed
- [ ] Final CI pipeline passes
- [ ] Changes tested locally if complex
- [ ] Squash commits if needed for clean history
- [ ] Delete branch after merge
