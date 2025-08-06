# 🤝 Contributing to ZingCab

Thank you for your interest in contributing to ZingCab! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Code of Conduct](#code-of-conduct)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control
- **Knowledge** of JavaScript/Node.js and React

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zingcabv2.2b.git
   cd zingcabv2.2b
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/zingcab/zingcabv2.2b.git
   ```

## 🔧 Development Setup

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers**:
   ```bash
   # Backend only
   npm run dev:backend
   
   # Frontend only (in another terminal)
   npm run dev:frontend
   
   # Both (if available)
   npm run dev
   ```

### Development Commands

```bash
# Testing
npm test                    # Run all tests
npm run test:backend        # Backend tests only
npm run test:frontend       # Frontend tests only
npm run test:enhanced-routes # Enhanced route tests

# Linting and Formatting
npm run lint               # Lint all code
npm run lint:backend       # Lint backend only
npm run format             # Format code with Prettier

# Documentation
npm run docs               # Generate and serve docs
npm run docs:generate      # Generate docs only

# Deployment
npm run deploy             # Deploy with basic method
npm run deploy:pm2         # Deploy with PM2
npm run deploy:nginx       # Deploy with Nginx
npm run health             # Health check
```

## 📝 Code Standards

### JavaScript/Node.js

- **ESLint**: Use the provided ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Conventional Commits**: Follow conventional commit format
- **JSDoc**: Document functions and classes

### Code Style

```javascript
// ✅ Good
const calculateFare = (distance, carType) => {
  const baseFare = getBaseFare(carType);
  return baseFare + (distance * getPerKmRate(carType));
};

// ❌ Bad
const calculateFare=(distance,carType)=>{const baseFare=getBaseFare(carType);return baseFare+(distance*getPerKmRate(carType))};
```

### File Naming

- **Files**: Use kebab-case (`user-profile.js`)
- **Components**: Use PascalCase (`UserProfile.jsx`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Functions**: Use camelCase (`calculateFare`)

### Directory Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── styles/             # CSS and styling
└── lib/                # Third-party library configs
```

## 🧪 Testing

### Test Structure

```
test_suite/
├── 01_fixed_routes_test.js      # Fixed route pricing tests
├── 02_zone_based_test.js        # Zone-based pricing tests
├── 03_standard_pricing_test.js  # Standard pricing tests
├── 04_roundtrip_test.js         # Roundtrip service tests
├── 05_rental_test.js            # Rental service tests
├── 06_edge_cases_test.js        # Edge cases and error tests
└── run_all_tests.js             # Test runner
```

### Writing Tests

```javascript
// Example test structure
describe('Fare Calculation', () => {
  it('should calculate correct fare for fixed route', async () => {
    const testData = {
      pickup_lat: 22.5726,
      pickup_lng: 88.3639,
      drop_lat: 21.6291,
      drop_lng: 87.5325,
      car_type: 'sedan',
      service_type: 'oneway'
    };
    
    const response = await axios.post('/api/fare/estimate', testData);
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.pricing_type).toBe('fixed_route');
  });
});
```

### Test Coverage

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and workflows
- **End-to-End Tests**: Test complete user journeys
- **Performance Tests**: Test system performance under load

## 🔄 Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write your code following the standards
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 3. Commit Changes

Use conventional commit format:

```bash
git commit -m "feat: add new route pricing algorithm"
git commit -m "fix: resolve zone detection issue"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for enhanced routes"
```

### 4. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then create a Pull Request on GitHub with:

- **Clear title** describing the change
- **Detailed description** of what was changed and why
- **Screenshots** if UI changes were made
- **Test results** showing all tests pass

### 5. PR Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainers review the code
3. **Address Feedback**: Make requested changes
4. **Merge**: Once approved, PR is merged

## 🐛 Issue Reporting

### Before Reporting

1. **Search** existing issues for duplicates
2. **Check** documentation for solutions
3. **Test** with latest version

### Issue Template

```markdown
## Bug Report

**Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Node.js Version: [e.g. 18.20.8]
- Browser: [e.g. Chrome, Firefox]

**Additional Context**
Any other context about the problem.
```

### Feature Request Template

```markdown
## Feature Request

**Description**
Clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternative Solutions**
Other ways to solve this problem.

**Additional Context**
Any other context or screenshots.
```

## 📚 Documentation

### Code Documentation

- **JSDoc**: Document all public functions and classes
- **README**: Keep README up to date
- **API Docs**: Update API documentation for changes
- **Comments**: Add inline comments for complex logic

### Example JSDoc

```javascript
/**
 * Calculate fare based on distance and car type
 * @param {number} distance - Distance in kilometers
 * @param {string} carType - Type of car (sedan, suv, etc.)
 * @param {Object} options - Additional options
 * @param {boolean} options.isNight - Whether it's night time
 * @param {boolean} options.isFestive - Whether it's festive period
 * @returns {number} Calculated fare in rupees
 * @throws {Error} If car type is not supported
 */
function calculateFare(distance, carType, options = {}) {
  // Implementation
}
```

## 🚀 Deployment

### Testing Deployment

```bash
# Test deployment locally
npm run deploy

# Test with PM2
npm run deploy:pm2

# Test with Nginx
npm run deploy:nginx
```

### Production Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Ensure database is properly configured
3. **SSL**: Set up SSL certificates
4. **Monitoring**: Set up monitoring and logging

## 📋 Code of Conduct

### Our Standards

- **Respectful**: Be respectful of others
- **Inclusive**: Welcome contributions from everyone
- **Professional**: Maintain professional behavior
- **Constructive**: Provide constructive feedback

### Unacceptable Behavior

- **Harassment**: Any form of harassment
- **Discrimination**: Discrimination based on any characteristic
- **Trolling**: Deliberate trolling or inflammatory behavior
- **Spam**: Unwanted commercial content

### Enforcement

Violations will be addressed by the project maintainers and may result in:

- **Warning**: Private or public warning
- **Temporary Ban**: Temporary ban from contributing
- **Permanent Ban**: Permanent ban for serious violations

## 🎯 Areas for Contribution

### High Priority

- **Bug Fixes**: Fix reported bugs
- **Performance**: Improve system performance
- **Security**: Address security vulnerabilities
- **Documentation**: Improve documentation

### Medium Priority

- **New Features**: Add requested features
- **UI/UX**: Improve user interface
- **Testing**: Add more test coverage
- **Refactoring**: Improve code quality

### Low Priority

- **Optimization**: Minor optimizations
- **Styling**: Cosmetic improvements
- **Comments**: Add helpful comments
- **Examples**: Add usage examples

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Email**: team@zingcab.in for private matters

### Resources

- **Documentation**: [docs/](docs/) folder
- **API Reference**: [docs/API.md](docs/API.md)
- **Examples**: Check test files for examples
- **Community**: Join our community discussions

## 🙏 Recognition

Contributors will be recognized in:

- **README**: Contributors section
- **Releases**: Release notes
- **Documentation**: Contributor acknowledgments
- **Website**: Contributors page

---

**Thank you for contributing to ZingCab! 🚗**

Your contributions help make transportation better for West Bengal. 