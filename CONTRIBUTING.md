# 🤝 Contributing to Banana4all

Thank you for your interest in contributing to Banana4all! We welcome all forms of contributions - from code and documentation to bug reports and feature requests.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Documentation Standards](#documentation-standards)
- [Testing Guidelines](#testing-guidelines)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Adobe Photoshop** (2024 or later for testing)
- **Git** for version control
- **A GitHub account**

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork https://github.com/Aladin147/banana4all to your GitHub account
   # Clone your fork locally
   git clone https://github.com/Aladin147/banana4all.git
   cd banana4all
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install

   # Run development server
   npm start

   # Run tests
   npm test
   ```

3. **Create Your Feature Branch**
   ```bash
   # Create a new branch for your contribution
   git checkout -b feature/your-feature-name
   ```

### Understanding the Codebase

- **`/src`**: Source code for the plugin
  - **`/js`**: JavaScript modules
  - **`/css`**: Stylesheets
  - **`index.html`**: Main plugin UI
- **`/docs`**: Documentation
- **`/tests`**: Test files
- **`/scripts`**: Build and utility scripts

## 🔄 Development Workflow

### 1. Choose What to Work On

- **Bug Fixes**: Check [Issues with "bug" label](https://github.com/Aladin147/banana4all/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
- **Features**: Check [Issues with "enhancement" label](https://github.com/Aladin147/banana4all/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)
- **Documentation**: Check [Issues with "documentation" label](https://github.com/Aladin147/banana4all/issues?q=is%3Aopen+is%3Aissue+label%3Adocumentation)
- **Good First Issues**: Check [Issues with "good first issue" label](https://github.com/Aladin147/banana4all/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

### 2. Make Your Changes

```bash
# Create your feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Write tests for new functionality
# Update documentation if needed

# Check that tests pass
npm test

# Check code style
npm run lint

# Build the plugin
npm run build
```

### 3. Test Your Changes

- **Manual Testing**: Test in Photoshop
- **Unit Tests**: Ensure all tests pass
- **Integration Tests**: Test with actual API calls
- **Cross-Platform**: Test on both Windows and macOS if possible

### 4. Commit Your Changes

```bash
# Add changed files
git add .

# Commit with descriptive message
git commit -m "feat: add amazing feature that does X

- Add new functionality for X
- Include tests for the feature
- Update documentation accordingly

Resolves #123"
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/amazing-feature

# Create pull request on GitHub
```

## 📋 Pull Request Guidelines

### PR Requirements

1. **Clear Title**: Use [Conventional Commits](#conventional-commits) format
2. **Detailed Description**: Explain what you did and why
3. **Issue Reference**: Link to related issues (e.g., "Fixes #123")
4. **Tests Included**: Add tests for new functionality
5. **Documentation Updated**: Update relevant documentation
6. **No Breaking Changes**: Avoid breaking changes unless absolutely necessary

### PR Template

```markdown
## 🎯 Changes
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring
- [ ] Performance improvement

## 📝 Description
A clear and concise description of the changes.

## 🔗 Related Issues
Closes #123
Related to #456

## 🧪 Testing
- [ ] Unit tests written and passing
- [ ] Manual testing completed
- [ ] Cross-platform testing (if applicable)

## 📚 Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] User guide updated

## 🔄 Checklist
- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Changes are backward compatible
```

## 🐛 Issue Guidelines

### Reporting Bugs

When creating a bug report, please include:

1. **Environment Information**
   - Operating system and version
   - Photoshop version
   - Plugin version
   - Node.js version

2. **Steps to Reproduce**
   - Clear, step-by-step instructions
   - Expected behavior
   - Actual behavior
   - Screenshots if relevant

3. **Error Messages**
   - Console errors
   - Plugin error messages
   - Stack traces

### Bug Report Template

```markdown
## 🐛 Bug Description
A clear description of the bug.

## 🌍 Environment
- OS: [e.g., Windows 11, macOS 13.0]
- Photoshop: [e.g., 25.0]
- Plugin: [e.g., 1.0.0-beta]
- Node.js: [e.g., 18.17.0]

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## 📋 Expected Behavior
A description of what you expected to happen.

## 🚨 Actual Behavior
A description of what actually happened.

## 📸 Screenshots
If applicable, add screenshots to help explain your problem.

## 📝 Additional Context
Add any other context about the problem here.

## 💻 Console Output
```
Console errors or stack traces here
```
```

### Feature Requests

When requesting a new feature:

1. **Clear Title**: Describe the feature in one line
2. **Use Case**: Explain why you need this feature
3. **Proposed Solution**: Describe how you envision the feature
4. **Alternatives**: Mention any alternative solutions considered
5. **Implementation**: Include any implementation suggestions if you have them

## 📝 Coding Standards

### JavaScript Standards

1. **ES6+ Features**: Use modern JavaScript features
2. **Code Style**: Follow Airbnb JavaScript Style Guide
3. **Naming Conventions**:
   - Use camelCase for variables and functions
   - Use PascalCase for classes and constructors
   - Use UPPER_CASE for constants
   - Use descriptive names

4. **Code Organization**:
   - Keep functions small and focused
   - Use meaningful comments for complex logic
   - Group related functionality together

```javascript
// ✅ Good example
class GeminiAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateImage(prompt) {
    try {
      const response = await this._makeAPICall(prompt);
      return this._processResponse(response);
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }

  _makeAPICall(prompt) {
    // Implementation
  }

  _processResponse(response) {
    // Implementation
  }
}
```

### CSS Standards

1. **BEM Methodology**: Use Block-Element-Modifier naming
2. **CSS Variables**: Use CSS custom properties for theming
3. **Responsive Design**: Mobile-first approach
4. **Performance**: Avoid expensive selectors and animations

```css
/* ✅ Good example */
.generation-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.generation-controls__prompt {
  margin-bottom: var(--spacing-md);
}

.generation-controls__button--primary {
  background-color: var(--primary-color);
}

.generation-controls__button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### HTML Standards

1. **Semantic HTML**: Use appropriate HTML5 elements
2. **Accessibility**: Include proper ARIA labels and roles
3. **SEO**: Use proper meta tags and heading structure

```html
<!-- ✅ Good example -->
<main class="app-main" role="main">
  <section class="section" aria-labelledby="generation-heading">
    <h2 id="generation-heading">Image Generation</h2>
    <div class="generation-controls">
      <!-- Content -->
    </div>
  </section>
</main>
```

## 📚 Documentation Standards

### Code Documentation

Use JSDoc for JavaScript documentation:

```javascript
/**
 * Generates an image using the Gemini API
 * @param {string} prompt - Text prompt for image generation
 * @param {Object} options - Generation options
 * @param {string} options.size - Image size (e.g., '1024x1024')
 * @param {string} options.quality - Image quality (e.g., 'high')
 * @returns {Promise<Object>} Generated image data
 * @throws {Error} When API call fails
 */
async generateImage(prompt, options = {}) {
  // Implementation
}
```

### README Updates

- Keep `README.md` up to date with:
  - Installation instructions
  - Configuration steps
  - Feature descriptions
  - Development setup
  - Contributing guidelines

### API Documentation

- Keep `docs/` folder updated with:
  - User guides
  - Developer documentation
  - API references
  - Troubleshooting guides

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Use Jest for testing framework
- Aim for 80%+ code coverage
- Test both success and error cases

```javascript
describe('GeminiAPIClient', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new GeminiAPIClient();
    apiClient.setAPIKey('test-key');
  });

  describe('generateImage', () => {
    it('should generate an image successfully', async () => {
      // Test implementation
    });

    it('should handle API errors', async () => {
      // Test error handling
    });
  });
});
```

### Integration Tests

- Test component interactions
- Test API integration (use mock API for development)
- Test user workflows
- Test error scenarios

### Manual Testing

- Test in actual Photoshop environment
- Test on different platforms
- Test with various image formats
- Test with different API scenarios

## 📦 Release Process

### Versioning

- Follow [Semantic Versioning](https://semver.org/)
- Use format: `MAJOR.MINOR.PATCH`
- Update `package.json` version accordingly

### Release Checklist

1. **Pre-Release**
   - [ ] All tests pass
   - [ ] Documentation is updated
   - [ ] Changelog is updated
   - [ ] Version is incremented

2. **Release**
   - [ ] Create release tag
   - [ ] Create GitHub release
   - [ ] Build distribution package
   - [ ] Update Adobe Exchange if applicable

3. **Post-Release**
   - [ ] Monitor for issues
   - [ ] Respond to user feedback
   - [ ] Plan next release

### Changelog Format

```markdown
## [1.0.0] - 2024-10-16

### Added
- Initial release of Banana4all
- Google Gemini Flash integration
- Text-to-image generation
- Basic image editing capabilities
- Secure API key management
- Generation history tracking

### Changed
- Nothing yet

### Fixed
- Nothing yet
```

## 🏅 Recognition

Contributors will be recognized in:

- **Contributors list** in README
- **Release notes** for significant contributions
- **Code commit attribution** through Git history
- **GitHub Contributors page**

## 📞 Getting Help

- **Documentation**: Check the `/docs` folder
- **Discussions**: Join our [GitHub Discussions](https://github.com/Aladin147/banana4all/discussions)
- **Issues**: Report bugs or request features
- **Discord**: [Join our Discord server](https://discord.gg/banana4all)

## 🎉 Thank You!

Your contributions make Banana4all better for everyone. We appreciate your time and effort in helping us create an amazing open-source project!

---

**Happy coding! 🍌**