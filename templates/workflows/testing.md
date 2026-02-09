---
description: Comprehensive testing workflow for reliable software delivery
---

# Testing Workflow

## Testing Philosophy

**The Testing Pyramid:**
```
        /\
       /  \     E2E Tests (Few, Slow, Expensive)
      /----\
     /      \   Integration Tests (Some)
    /--------\
   /          \ Unit Tests (Many, Fast, Cheap)
  /------------\
```

**Test Characteristics (FIRST):**
- **F**ast - Run quickly
- **I**ndependent - No dependencies between tests
- **R**epeatable - Same result every time
- **S**elf-validating - Pass or fail, no interpretation
- **T**imely - Written before or with code

---

## Unit Testing

### 1. Running Unit Tests
```bash
# Run all unit tests
npm test

# Run in watch mode during development
npm test -- --watch

# Run specific test file
npm test -- src/utils/formatter.test.js

# Run tests matching pattern
npm test -- --grep="should format currency"
```

### 2. Writing Effective Unit Tests
```javascript
// Good: Descriptive, focused, tests behavior
describe('PriceCalculator', () => {
  describe('calculateTotal', () => {
    it('should sum all item prices', () => {
      const items = [
        { name: 'Widget', price: 10 },
        { name: 'Gadget', price: 20 }
      ];
      
      expect(calculateTotal(items)).toBe(30);
    });
    
    it('should return 0 for empty cart', () => {
      expect(calculateTotal([])).toBe(0);
    });
    
    it('should apply percentage discount correctly', () => {
      const items = [{ price: 100 }];
      const discount = { type: 'percentage', value: 10 };
      
      expect(calculateTotal(items, discount)).toBe(90);
    });
    
    it('should not allow negative totals', () => {
      const items = [{ price: 10 }];
      const discount = { type: 'fixed', value: 100 };
      
      expect(calculateTotal(items, discount)).toBe(0);
    });
  });
});
```

### 3. Test Coverage
```bash
# Run with coverage report
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageReporters="html"
open coverage/index.html
```

**Coverage Targets:**
| Category | Minimum | Ideal |
|----------|---------|-------|
| Lines | 70% | 85% |
| Branches | 60% | 80% |
| Functions | 70% | 85% |
| Critical Paths | 100% | 100% |

### 4. Testing Edge Cases
Always test:
- [ ] Empty inputs (`[]`, `''`, `null`, `undefined`)
- [ ] Single item inputs
- [ ] Boundary values (0, MAX_INT, etc.)
- [ ] Invalid inputs (wrong types)
- [ ] Error conditions
- [ ] Async timeouts

```javascript
describe('validateEmail', () => {
  // Happy path
  it('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
  
  // Edge cases
  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
  
  it('should handle null gracefully', () => {
    expect(() => validateEmail(null)).not.toThrow();
    expect(validateEmail(null)).toBe(false);
  });
  
  // Boundary cases
  it('should accept email at max length', () => {
    const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(185) + '.com';
    expect(validateEmail(longEmail)).toBe(true);
  });
  
  it('should reject email exceeding max length', () => {
    const tooLong = 'a'.repeat(65) + '@' + 'b'.repeat(186) + '.com';
    expect(validateEmail(tooLong)).toBe(false);
  });
});
```

---

## Integration Testing

### 5. API Integration Tests
```javascript
describe('User API', () => {
  let testUser;
  
  beforeEach(async () => {
    // Setup test data
    testUser = await createTestUser();
  });
  
  afterEach(async () => {
    // Cleanup
    await deleteTestUser(testUser.id);
  });
  
  it('GET /users/:id should return user data', async () => {
    const response = await request(app)
      .get(`/users/${testUser.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);
    
    expect(response.body).toMatchObject({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name
    });
    expect(response.body).not.toHaveProperty('password');
  });
  
  it('GET /users/:id should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/users/non-existent-id')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(404);
    
    expect(response.body.error).toBe('User not found');
  });
  
  it('GET /users/:id should return 401 without auth', async () => {
    await request(app)
      .get(`/users/${testUser.id}`)
      .expect(401);
  });
});
```

### 6. Database Integration Tests
```javascript
describe('UserRepository', () => {
  let db;
  
  beforeAll(async () => {
    db = await connectTestDatabase();
    await db.migrate.latest();
  });
  
  beforeEach(async () => {
    await db('users').truncate();
  });
  
  afterAll(async () => {
    await db.destroy();
  });
  
  it('should create and retrieve user', async () => {
    const userId = await UserRepository.create({
      email: 'test@example.com',
      name: 'Test User'
    });
    
    const user = await UserRepository.findById(userId);
    
    expect(user.email).toBe('test@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);
  });
  
  it('should handle concurrent updates correctly', async () => {
    const userId = await UserRepository.create({ balance: 100 });
    
    // Simulate race condition
    await Promise.all([
      UserRepository.updateBalance(userId, -30),
      UserRepository.updateBalance(userId, -30)
    ]);
    
    const user = await UserRepository.findById(userId);
    expect(user.balance).toBe(40);
  });
});
```

---

## End-to-End Testing

### 7. Running E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- --spec="cypress/e2e/checkout.cy.js"

# Run with headed browser (visible)
npm run test:e2e -- --headed

# Run against specific environment
CYPRESS_BASE_URL=https://staging.example.com npm run test:e2e
```

### 8. Writing E2E Tests
```javascript
// cypress/e2e/checkout.cy.js
describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
    cy.visit('/products');
  });
  
  it('should complete full checkout process', () => {
    // Add item to cart
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="add-to-cart"]').click();
    });
    
    // Verify cart updated
    cy.get('[data-testid="cart-count"]').should('contain', '1');
    
    // Go to checkout
    cy.get('[data-testid="checkout-button"]').click();
    cy.url().should('include', '/checkout');
    
    // Fill shipping info
    cy.get('[data-testid="shipping-address"]').type('123 Main St');
    cy.get('[data-testid="shipping-city"]').type('Anytown');
    
    // Fill payment info
    cy.get('[data-testid="card-number"]').type('4242424242424242');
    cy.get('[data-testid="card-expiry"]').type('12/25');
    cy.get('[data-testid="card-cvc"]').type('123');
    
    // Submit order
    cy.get('[data-testid="submit-order"]').click();
    
    // Verify success
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-testid="order-number"]').should('exist');
    cy.get('[data-testid="order-status"]').should('contain', 'Confirmed');
  });
  
  it('should show validation errors for invalid card', () => {
    // ... add item and go to checkout
    
    cy.get('[data-testid="card-number"]').type('1234567890');
    cy.get('[data-testid="submit-order"]').click();
    
    cy.get('[data-testid="card-error"]')
      .should('be.visible')
      .and('contain', 'Invalid card number');
  });
});
```

---

## Performance Testing

### 9. Load Testing
```bash
# Using k6
k6 run load-test.js

# Using Artillery
artillery run load-test.yml
```

```javascript
// load-test.js (k6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Spike
    { duration: '1m', target: 0 }     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01']    // Less than 1% failure rate
  }
};

export default function() {
  const res = http.get('https://api.example.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
  
  sleep(1);
}
```

---

## Test Maintenance

### 10. Dealing with Flaky Tests
```javascript
// Bad: Flaky due to timing
it('should load data', async () => {
  await page.click('#load-button');
  await page.waitForTimeout(2000);  // Don't do this!
  expect(await page.$('#data')).toBeTruthy();
});

// Good: Wait for specific condition
it('should load data', async () => {
  await page.click('#load-button');
  await page.waitForSelector('#data', { state: 'visible' });
  expect(await page.$('#data')).toBeTruthy();
});
```

### 11. Test Organization
```
tests/
├── unit/                    # Unit tests (fast, isolated)
│   ├── utils/
│   ├── services/
│   └── components/
├── integration/             # Integration tests
│   ├── api/
│   └── database/
├── e2e/                     # End-to-end tests
│   ├── user-flows/
│   └── admin-flows/
├── fixtures/                # Test data
├── mocks/                   # Mock implementations
└── helpers/                 # Shared test utilities
```

---

## CI/CD Integration

### 12. Test in CI Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

---

## Quick Commands Reference

```bash
# Unit tests
npm test                           # Run all
npm test -- --watch               # Watch mode
npm test -- --coverage            # With coverage
npm test -- path/to/file.test.js  # Specific file

# Integration tests
npm run test:integration
npm run test:api

# E2E tests
npm run test:e2e
npm run test:e2e -- --headed      # With browser visible

# All tests
npm run test:all

# Coverage report
npm run coverage:report
open coverage/lcov-report/index.html
```
