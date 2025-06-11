# Contributing Guide

This guide outlines the process for contributing to the GrowStack project.

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Git

### 2. Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/growstack.git
cd growstack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

## Development Workflow

### 1. Branch Naming Convention

- Feature branches: `feature/feature-name`
- Bug fix branches: `fix/bug-name`
- Documentation branches: `docs/doc-name`
- Release branches: `release/v1.0.0`

### 2. Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks

Example:
```
feat(auth): add social login support

- Add Google OAuth integration
- Add Facebook OAuth integration
- Update documentation

Closes #123
```

### 3. Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Write or update tests
4. Update documentation
5. Submit a pull request

Pull request template:
```markdown
## Description
[Describe your changes here]

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Test update

## Related Issues
[Link to related issues]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Code comments added/updated

## Checklist
- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No linting errors
- [ ] No security vulnerabilities
```

## Code Style

### 1. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2. ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
```

### 3. Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Testing

### 1. Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### 2. Writing Tests

```typescript
// Example test
import { UserService } from '../services/user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should create a new user', async () => {
    const user = await userService.createUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## Documentation

### 1. Code Documentation

```typescript
/**
 * Creates a new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<User>} Created user
 * @throws {Error} If user already exists
 */
async function createUser(userData: UserData): Promise<User> {
  // Implementation
}
```

### 2. API Documentation

```typescript
/**
 * @api {post} /api/users Create User
 * @apiName CreateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 *
 * @apiSuccess {Object} user Created user
 * @apiSuccess {String} user.id User ID
 * @apiSuccess {String} user.email User email
 *
 * @apiError {Object} error Error object
 * @apiError {String} error.message Error message
 */
```

## Security

### 1. Security Best Practices

- Never commit sensitive data
- Use environment variables for secrets
- Follow OWASP security guidelines
- Keep dependencies updated
- Use security scanning tools

### 2. Security Checklist

- [ ] No hardcoded credentials
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting implemented
- [ ] Security headers set
- [ ] Dependencies scanned
- [ ] Secrets managed properly

## Performance

### 1. Performance Guidelines

- Use appropriate indexes
- Implement caching
- Optimize database queries
- Use pagination
- Implement rate limiting
- Monitor performance metrics

### 2. Performance Checklist

- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] Pagination used
- [ ] Rate limiting configured
- [ ] Performance metrics monitored
- [ ] Load testing performed

## Release Process

### 1. Versioning

Follow [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

### 2. Release Steps

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release branch
4. Run tests
5. Create pull request
6. Merge to main
7. Create release tag
8. Deploy to production

## Support

### 1. Getting Help

- Check documentation
- Search existing issues
- Join community chat
- Contact maintainers

### 2. Reporting Issues

Use the issue template:
```markdown
## Description
[Describe the issue]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- OS: [e.g. Ubuntu 20.04]
- Node.js: [e.g. 18.0.0]
- Database: [e.g. PostgreSQL 14]
- Redis: [e.g. 7.0.0]

## Additional Context
[Any additional information]
```

## Code of Conduct

### 1. Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone.

### 2. Our Standards

- Be respectful
- Be inclusive
- Be collaborative
- Be constructive
- Be professional

### 3. Enforcement

- Report violations to maintainers
- Maintainers will review and take action
- Violations may result in temporary or permanent ban 