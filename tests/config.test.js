/**
 * Tests for configuration
 */

const CONFIG = require('../src/config');

describe('CONFIG', () => {
  test('should have api configuration', () => {
    expect(CONFIG.api).toBeDefined();
    expect(CONFIG.api.defaultProxyUrl).toBe('http://localhost:3000');
    expect(CONFIG.api.defaultProvider).toBe('openrouter');
    expect(CONFIG.api.defaultModel).toBe('google/gemini-2.5-flash-image');
  });

  test('should have photoshop configuration', () => {
    expect(CONFIG.photoshop).toBeDefined();
    expect(CONFIG.photoshop.processingDelay).toBe(1000);
    expect(CONFIG.photoshop.tempFilePrefix).toBe('temp_');
  });

  test('should have phase2 configuration prepared', () => {
    expect(CONFIG.phase2).toBeDefined();
    expect(CONFIG.phase2.selectionPadding).toBe(10);
    expect(CONFIG.phase2.autoFeatherRadius).toBe(2);
    expect(CONFIG.phase2.maxVariants).toBe(4);
  });

  test('should have model information', () => {
    expect(CONFIG.models).toBeDefined();
    const geminiModel = CONFIG.models['google/gemini-2.5-flash-image'];
    expect(geminiModel).toBeDefined();
    expect(geminiModel.watermarking).toBe('SynthID');
    expect(geminiModel.features).toContain('text-to-image');
  });

  test('should have reasonable timeout values', () => {
    expect(CONFIG.api.proxyHealthTimeout).toBeGreaterThanOrEqual(3000);
    expect(CONFIG.photoshop.processingDelay).toBeGreaterThanOrEqual(500);
  });
});
