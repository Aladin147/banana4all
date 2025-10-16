// Jest setup file
global.fetch = require('jest-fetch-mock');

// Mock UXP APIs for testing
global.require = {
  uxp: {
    storage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    }
  }
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Set up global test utilities
global.testUtils = {
  createMockDOM: () => {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    return container;
  },

  cleanupMockDOM: () => {
    const container = document.getElementById('test-container');
    if (container) {
      container.remove();
    }
  },

  createMockEvent: (type, properties = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, properties);
    return event;
  }
};

// Cleanup after each test
afterEach(() => {
  global.testUtils.cleanupMockDOM();
  fetch.resetMocks();
  jest.clearAllMocks();
});