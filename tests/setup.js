/**
 * Jest test setup
 * Mocks for UXP and Photoshop APIs
 */

// Mock UXP storage
global.uxp = {
  storage: {
    localFileSystem: {
      getDataFolder: jest.fn(),
      getTemporaryFolder: jest.fn(),
      createSessionToken: jest.fn(),
      getEntryWithUrl: jest.fn(),
    },
  },
};

// Mock Photoshop API
global.photoshop = {
  app: {
    activeDocument: null,
    showAlert: jest.fn(),
  },
  core: {
    executeAsModal: jest.fn((fn) => fn()),
  },
  action: {
    batchPlay: jest.fn(),
  },
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock Blob
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.type = options?.type || '';
    this.size = parts.reduce((acc, part) => acc + (part.length || part.byteLength || 0), 0);
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size));
  }
};

// Mock atob/btoa
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

console.log('Test environment setup complete');
