---
description: Complete workflow for implementing new features from inception to delivery
---

# New Feature Implementation Workflow

## Phase 1: Requirements Analysis

### 1. Understand the Feature Request
Before writing any code:
- Read and re-read the feature specification
- Identify acceptance criteria
- List questions and ambiguities
- Understand the "why" behind the feature

### 2. Stakeholder Alignment
- [ ] Clarify any uncertainties with product owner
- [ ] Confirm edge cases and error scenarios
- [ ] Understand priority and timeline
- [ ] Identify dependencies on other teams/features

### 3. Technical Discovery
```bash
# Search codebase for related implementations
grep -r "similar-feature" src/
```

**Research:**
- Existing patterns for similar features
- Reusable components/utilities
- Third-party libraries that might help
- API contracts (if consuming/providing)

---

## Phase 2: Planning & Design

### 4. Create Technical Design
Document (even briefly):
- **Approach:** How will you implement this?
- **Components:** What new files/functions needed?
- **Data Model:** Any database changes?
- **API Changes:** New endpoints or modifications?
- **Dependencies:** External services/libraries?

### 5. Break Down into Tasks
```markdown
## Feature: User Profile Settings

### Tasks:
- [ ] Create ProfileSettings component
- [ ] Add settings API endpoint
- [ ] Create database migration for settings table
- [ ] Write unit tests for settings logic
- [ ] Add integration tests
- [ ] Update documentation
```

### 6. Estimate Effort
Consider:
- Development time
- Testing time (manual + automated)
- Code review cycles
- Documentation
- Buffer for unknowns (typically +20-30%)

---

## Phase 3: Setup

### 7. Create Feature Branch
```bash
# Always start from latest main
git checkout main
git pull origin main

# Create feature branch with descriptive name
git checkout -b feature/TICKET-123-user-profile-settings
```

**Naming Conventions:**
- `feature/TICKET-ID-short-description`
- `feat/user-authentication`
- `feature/add-payment-processing`

### 8. Set Up Development Environment
```bash
# Install any new dependencies
npm install

# Run database migrations
npm run migrate:dev

# Verify everything works
npm test
npm run dev
```

---

## Phase 4: Implementation

### 9. Start with Tests (TDD Approach)
```javascript
// Write failing test first
describe('ProfileSettings', () => {
  it('should save user preferences', async () => {
    const settings = { theme: 'dark', notifications: true };
    const result = await saveUserSettings(userId, settings);
    expect(result.success).toBe(true);
  });

  it('should validate required fields', async () => {
    await expect(saveUserSettings(userId, {}))
      .rejects.toThrow('Theme is required');
  });
});
```

### 10. Implement Core Logic
**Best Practices:**
- Write small, focused functions
- Follow existing code patterns
- Add inline comments for complex logic
- Use meaningful variable names
- Handle all error cases

```javascript
// Good: Clear, focused function
export async function saveUserSettings(userId, settings) {
  validateSettings(settings);
  
  const existingSettings = await getSettings(userId);
  const mergedSettings = { ...existingSettings, ...settings };
  
  await db.userSettings.upsert({
    userId,
    settings: mergedSettings,
    updatedAt: new Date()
  });
  
  return { success: true, settings: mergedSettings };
}
```

### 11. Implement UI (if applicable)
- Match existing design patterns
- Ensure accessibility (ARIA labels, keyboard nav)
- Handle loading and error states
- Make it responsive

### 12. Make Regular Commits
```bash
# Commit early and often with clear messages
git add -A
git commit -m "feat(settings): add ProfileSettings component

- Create settings form with theme and notification options
- Add form validation
- Connect to settings API"
```

**Commit Message Format:**
```
type(scope): short description

- Bullet points for details
- Mention breaking changes if any

Refs: TICKET-123
```

---

## Phase 5: Testing

### 13. Run All Tests
// turbo
```bash
# Unit tests
npm test

# With coverage
npm test -- --coverage
```

### 14. Write Integration Tests
```javascript
describe('Settings API Integration', () => {
  it('should persist settings across page reload', async () => {
    await page.goto('/settings');
    await page.click('[data-testid="dark-mode-toggle"]');
    await page.click('[data-testid="save-button"]');
    
    await page.reload();
    
    const isDarkMode = await page.$eval(
      '[data-testid="dark-mode-toggle"]',
      el => el.checked
    );
    expect(isDarkMode).toBe(true);
  });
});
```

### 15. Manual Testing Checklist
- [ ] Happy path works correctly
- [ ] Error messages display properly
- [ ] Edge cases handled
- [ ] Works on different browsers
- [ ] Mobile responsive
- [ ] Accessibility verified

---

## Phase 6: Code Quality

### 16. Run Linters and Formatters
// turbo
```bash
npm run lint
npm run lint:fix
npm run format
```

### 17. Self-Review
Before requesting review:
- [ ] Remove console.logs and debug code
- [ ] Remove commented-out code
- [ ] Add necessary documentation
- [ ] Check for sensitive data exposure
- [ ] Verify error handling is complete

### 18. Check Performance
- [ ] No N+1 queries
- [ ] Large lists are paginated
- [ ] Images are optimized
- [ ] Bundle size impact is acceptable

---

## Phase 7: Pull Request

### 19. Push and Create PR
```bash
git push -u origin feature/TICKET-123-user-profile-settings
```

### 20. Write PR Description
```markdown
## Description
Implements user profile settings allowing users to customize theme 
and notification preferences.

## Type of Change
- [x] New feature

## Changes Made
- Added ProfileSettings component
- Created /api/settings endpoint
- Added user_settings table migration

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Screenshots
[Add UI screenshots if applicable]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### 21. Request Review
- Tag appropriate reviewers
- Add relevant labels
- Link to related issues/tickets

---

## Phase 8: Address Feedback

### 22. Respond to Review Comments
- Thank reviewers for feedback
- Ask for clarification if needed
- Explain your reasoning when appropriate
- Make requested changes promptly

### 23. Update Branch
```bash
# If main has new changes
git checkout main
git pull origin main
git checkout feature/TICKET-123-user-profile-settings
git rebase main

# Push force with lease (safer than force)
git push --force-with-lease
```

---

## Phase 9: Merge & Deploy

### 24. Merge PR
- Use squash merge for clean history
- Delete feature branch after merge

### 25. Verify in Staging
- [ ] Feature works in staging environment
- [ ] No errors in logs
- [ ] Performance is acceptable

### 26. Deploy to Production
- Follow deployment workflow
- Monitor for issues after deploy
- Announce feature if applicable

---

## Phase 10: Documentation

### 27. Update Documentation
- [ ] README if needed
- [ ] API documentation
- [ ] User guides
- [ ] Internal wiki/Notion

### 28. Knowledge Sharing
- Consider writing a tech blog post
- Share learnings in team meeting
- Update onboarding documentation
