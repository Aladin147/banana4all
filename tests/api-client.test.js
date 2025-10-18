/**
 * Tests for AIImageClient
 */

describe('AIImageClient', () => {
  let AIImageClient;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the main.js module structure
    AIImageClient = class {
      constructor(apiKey, proxyUrl = 'http://localhost:3000', provider = 'openrouter', model = null) {
        this.apiKey = apiKey;
        this.proxyUrl = proxyUrl;
        this.provider = provider;
        this.model = model;
      }

      async checkProxyHealth() {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(`${this.proxyUrl}/health`, {
            method: 'GET',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response.ok;
        } catch (error) {
          return false;
        }
      }
    };
  });

  describe('constructor', () => {
    test('should initialize with required parameters', () => {
      const client = new AIImageClient('test-key');
      expect(client.apiKey).toBe('test-key');
      expect(client.proxyUrl).toBe('http://localhost:3000');
      expect(client.provider).toBe('openrouter');
    });

    test('should accept custom proxy URL', () => {
      const client = new AIImageClient('test-key', 'http://custom:4000');
      expect(client.proxyUrl).toBe('http://custom:4000');
    });

    test('should accept custom model', () => {
      const client = new AIImageClient('test-key', 'http://localhost:3000', 'openrouter', 'custom-model');
      expect(client.model).toBe('custom-model');
    });
  });

  describe('checkProxyHealth', () => {
    test('should return true when proxy is healthy', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });
      
      const client = new AIImageClient('test-key');
      const result = await client.checkProxyHealth();
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/health',
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('should return false when proxy is down', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection refused'));
      
      const client = new AIImageClient('test-key');
      const result = await client.checkProxyHealth();
      
      expect(result).toBe(false);
    });

    test('should return false on timeout', async () => {
      // Mock fetch to throw abort error (simulating timeout)
      global.fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('The operation was aborted'))
      );
      
      const client = new AIImageClient('test-key');
      const result = await client.checkProxyHealth();
      
      expect(result).toBe(false);
    });
  });
});
