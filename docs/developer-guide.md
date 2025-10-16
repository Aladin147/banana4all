# 🛠️ Banana4all Developer Guide

This guide is for developers who want to contribute to Banana4all or understand its architecture and implementation.

**Table of Contents**
- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Code Structure](#code-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Building and Packaging](#building-and-packaging)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Adobe Photoshop UXP                     │
├─────────────────┬─────────────────────┬───────────────────┤
│   UI Layer      │   Business Logic    │   Data Layer      │
│   (HTML/CSS)    │   (JavaScript)      │   (Storage)       │
├─────────────────┴─────────────────────┴───────────────────┤
│                 Gemini API Client                          │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                Google Gemini API                        │
│             (gemini-2.5-flash)                          │
└─────────────────────────────────────────────────────────┘
```

### Component Responsibilities

- **UI Layer**: User interface, interactions, and visual feedback
- **Business Logic**: Plugin orchestration, data flow, and decision making
- **Data Layer**: Storage, caching, and configuration management
- **API Client**: Communication with Google Gemini services

## 💻 Development Setup

### Prerequisites

- **Node.js**: v16.0 or higher
- **npm**: v8.0 or higher
- **Adobe Photoshop**: 2024 or later (for testing)
- **Git**: For version control
- **VS Code** or similar code editor

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/Aladin147/banana4all.git
   cd banana4all
   npm install
   ```

2. **Development Environment**
   ```bash
   # Start development server
   npm start

   # Run tests in watch mode
   npm run test:watch

   # Lint code
   npm run lint
   ```

3. **Photoshop Development Setup**
   ```bash
   # Build plugin for development
   npm run build:dev

   # Load plugin in Photoshop:
   # Plugins > Manage Plugins > Add Plugin > Select dist folder
   ```

### Recommended VS Code Extensions

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **JavaScript (ES6) code snippets**: Helpful snippets
- **Live Server**: For UI development
- **GitLens**: Enhanced Git integration

## 📁 Code Structure

```
banana4all/
├── src/
│   ├── css/
│   │   └── styles.css           # Main stylesheets
│   ├── js/
│   │   ├── api-client.js       # Google Gemini API client
│   │   ├── storage.js         # Storage and configuration
│   │   ├── ui-controller.js   # User interface controller
│   │   └── main.js           # Application entry point
│   ├── images/               # Plugin images and icons
│   ├── index.html            # Main plugin UI
│   └── manifest.json         # UXP plugin manifest
├── docs/                     # Documentation
├── tests/                    # Test files
├── scripts/                  # Build and utility scripts
├── assets/                   # Static assets
├── package.json              # Node.js dependencies
├── webpack.config.js         # Build configuration
├── .gitignore               # Git ignore rules
└── README.md                 # Project overview
```

## 🔑 Key Components

### 1. API Client (`src/js/api-client.js`)

Handles all communication with Google Gemini API.

```javascript
class GeminiAPIClient {
  constructor() {
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.apiKey = null;
    this.model = 'gemini-2.5-flash';
  }

  async generateImage(prompt, options = {}) {
    // API implementation
  }

  async validateAPIKey() {
    // Key validation logic
  }
}
```

**Key Methods:**
- `generateImage()`: Generate images from text prompts
- `editImage()`: Modify existing images
- `inpaintImage()`: Edit specific areas of images
- `validateAPIKey()`: Test API key validity

### 2. Storage Manager (`src/js/storage.js`)

Manages local storage of user data and settings.

```javascript
class StorageManager {
  constructor() {
    this.storageKeys = {
      API_KEY: 'banana4all_api_key',
      USER_PREFERENCES: 'banana4all_user_preferences',
      // ...
    };
  }

  async storeAPIKey(apiKey) {
    // Encrypted storage implementation
  }

  async getGenerationHistory() {
    // History retrieval logic
  }
}
```

**Features:**
- Secure API key storage with encryption
- User preferences management
- Generation history tracking
- Caching for performance
- Import/export functionality

### 3. UI Controller (`src/js/ui-controller.js`)

Manages all user interface interactions and state.

```javascript
class UIController {
  constructor() {
    this.elements = {};
    this.currentGeneration = null;
    this.isLoading = false;
  }

  async init(apiClient, storageManager) {
    // Initialize UI and setup event listeners
  }

  async _handleGenerate() {
    // Handle generation requests
  }

  _renderResults(results) {
    // Display generation results
  }
}
```

**Responsibilities:**
- UI state management
- Event handling
- User feedback and notifications
- Result rendering
- Form validation

### 4. Application Entry Point (`src/js/main.js`)

Orchestrates all components and handles plugin lifecycle.

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize all components
  const apiClient = new GeminiAPIClient();
  const storageManager = new StorageManager();
  const uiController = new UIController();

  await uiController.init(apiClient, storageManager);
});
```

## 🔌 API Integration

### Google Gemini API

The plugin integrates with Google's Gemini 2.5 Flash API for image generation.

#### API Endpoints

```javascript
// Text-to-Image Generation
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

// Image Editing
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent

// Model Information
GET https://generativelanguage.googleapis.com/v1beta/models
```

#### Request Structure

```javascript
const requestBody = {
  contents: [{
    parts: [{
      text: prompt
    }]
  }],
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 8192,
    responseModalities: ['Text', 'Image']
  }
};
```

#### Authentication

API key authentication with retry logic and error handling:

```javascript
async _makeRequest(url, body, attempt = 1) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/
│   ├── api-client.test.js     # API client tests
│   ├── storage-manager.test.js # Storage tests
│   └── ui-controller.test.js  # UI controller tests
├── integration/
│   ├── api-integration.test.js # API integration tests
│   └── workflow.test.js       # End-to-end workflow tests
├── e2e/
│   └── plugin.test.js         # Full plugin tests
└── fixtures/                 # Test data and mocks
```

### Unit Testing

```javascript
// api-client.test.js
describe('GeminiAPIClient', () => {
  let apiClient;
  let mockFetch;

  beforeEach(() => {
    apiClient = new GeminiAPIClient();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  describe('generateImage', () => {
    it('should make API call with correct parameters', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                mimeType: 'image/jpeg',
                data: 'base64-image-data'
              }
            }]
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.generateImage('test prompt');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('generateContent'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test prompt')
        })
      );
    });
  });
});
```

### Integration Testing

```javascript
// api-integration.test.js
describe('API Integration', () => {
  let apiClient;
  let storageManager;

  beforeEach(() => {
    apiClient = new GeminiAPIClient();
    storageManager = new StorageManager();
  });

  describe('Full Generation Workflow', () => {
    it('should complete end-to-end image generation', async () => {
      // This would use mocked API responses
      const workflow = new GenerationWorkflow(apiClient, storageManager);
      const result = await workflow.generateImage('test prompt');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- api-client.test.js
```

## 🏗️ Building and Packaging

### Build Configuration

The plugin uses Webpack for bundling and optimization.

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  }
};
```

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Package plugin for distribution
npm run package
```

### Package Structure

```
dist/
├── bundle.js              # JavaScript bundle
├── styles.css            # Compiled styles
├── index.html           # HTML entry point
├── manifest.json        # Plugin manifest
└── assets/              # Static assets
```

### Photoshop UXP Plugin Requirements

The plugin must meet Adobe's UXP requirements:

1. **Manifest File**: Proper `manifest.json` with permissions
2. **Entry Points**: Defined UI panels and menus
3. **Security**: Proper permission requests
4. **Icons**: Appropriate icons for different themes

## 🐛 Debugging

### Development Tools

1. **Chrome DevTools**: Available in Photoshop for UXP debugging
   - Open with `Ctrl+Shift+I` (Windows) or `Cmd+Opt+I` (Mac)
   - Console for logging and debugging
   - Network tab for API calls
   - Elements tab for DOM inspection

2. **Console Logging**
   ```javascript
   // In main.js
   console.log('🍌 Banana4all - Initializing...');
   console.error('🚨 Error:', error);
   console.warn('⚠️ Warning:', message);
   ```

3. **Error Handling**
   ```javascript
   class ErrorHandler {
     static handle(error, context) {
       console.error('🚨 Error in', context, ':', error);
       // Show user-friendly error message
       UIController.showError('An error occurred. Please try again.');
     }
   }
   ```

### Common Debugging Scenarios

#### API Issues
```javascript
// Add debug logging to API calls
async generateImage(prompt, options = {}) {
  console.log('📤 Generating image with prompt:', prompt);
  console.log('🔧 Options:', options);

  try {
    const result = await this._makeRequest(url, body);
    console.log('✅ Generation successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Generation failed:', error);
    throw error;
  }
}
```

#### Storage Issues
```javascript
// Debug storage operations
async storeAPIKey(apiKey) {
  console.log('🔐 Storing API key...');

  try {
    const encryptedKey = this._encrypt(apiKey);
    await this.storage.setItem(this.storageKeys.API_KEY, encryptedKey);
    console.log('✅ API key stored successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to store API key:', error);
    return false;
  }
}
```

## ⚡ Performance Optimization

### Key Optimization Areas

#### 1. API Request Optimization
```javascript
// Request batching
async generateMultipleImages(prompts, options) {
  const batch = prompts.map(prompt =>
    this.generateImage(prompt, options)
  );
  return Promise.all(batch);
}

// Request caching
class APICache {
  constructor(ttl = 300000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }
}
```

#### 2. UI Performance
```javascript
// Debounce user input
const debouncedSearch = debounce((value) => {
  this.searchImages(value);
}, 300);

// Virtual scrolling for large lists
class VirtualScrollList {
  constructor(container, itemHeight, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
  }

  renderVisibleItems() {
    const visibleRange = this.getVisibleRange();
    // Render only visible items
  }
}
```

#### 3. Image Processing
```javascript
// Lazy loading
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }

  observe(image) {
    this.observer.observe(image);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
      }
    });
  }
}
```

### Performance Monitoring

```javascript
// Performance tracking
class PerformanceMonitor {
  static startTimer(label) {
    performance.mark(`${label}-start`);
  }

  static endTimer(label) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    return performance.getEntriesByName(label)[0].duration;
  }
}

// Usage
PerformanceMonitor.startTimer('image-generation');
// ... perform generation
const duration = PerformanceMonitor.endTimer('image-generation');
console.log(`Generation took ${duration}ms`);
```

## 🔐 Security Considerations

### API Key Security

#### 1. Secure Storage
```javascript
// Encryption for API keys
_encrypt(data) {
  // In production, use proper encryption like AES-256
  const key = 'banana4all-encryption-key';
  let encrypted = '';

  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }

  return btoa(encrypted);
}
```

#### 2. Secure Transmission
```javascript
// Always use HTTPS
const API_BASE_URL = 'https://generativelanguage.googleapis.com';

// Validate API responses
validateResponse(response) {
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Invalid API response');
  }

  if (response.candidates[0].content?.finishReason === 'SAFETY') {
    throw new Error('Content blocked by safety filters');
  }
}
```

### User Data Protection

#### 1. Local Storage Security
```javascript
// Store only necessary data
async storeMinimalUserData(settings) {
  const minimalData = {
    preferences: {
      theme: settings.theme,
      imageQuality: settings.imageQuality
      // Exclude sensitive data
    }
  };

  return this.storage.setItem('user_prefs', JSON.stringify(minimalData));
}
```

#### 2. Input Sanitization
```javascript
// Sanitize user input
sanitizePrompt(prompt) {
  // Remove potentially harmful content
  const clean = prompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  return clean.trim();
}
```

## 🚀 Deployment

### Version Management

```bash
# Version bump script
npm run version:bump

# Release preparation
npm run release:prepare

# Tag creation
git tag v1.0.0
git push origin v1.0.0
```

### Distribution Channels

1. **GitHub Releases**: For open-source distribution
2. **Adobe Exchange**: For Photoshop plugin store
3. **Direct Download**: For website distribution

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/
```

---

This guide provides a comprehensive overview of the Banana4all codebase. For specific implementation details, refer to the source code and inline documentation.

Happy coding! 🍌