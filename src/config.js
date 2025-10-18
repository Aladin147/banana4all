/**
 * Banana4All Configuration
 * Centralized configuration for the plugin
 */

const CONFIG = {
  // API Configuration
  api: {
    defaultProxyUrl: 'http://localhost:3000',
    proxyHealthTimeout: 5000, // ms
    defaultProvider: 'openrouter',
    defaultModel: 'google/gemini-2.5-flash-image',
  },

  // Photoshop Integration
  photoshop: {
    processingDelay: 1000, // ms - wait time after layer operations
    tempFilePrefix: 'temp_',
    defaultLayerNamePrefix: 'AI: ',
  },

  // Generation Settings
  generation: {
    defaultPromptPrefix: 'Generate an image of',
    maxPromptLength: 1000,
    imageFormat: 'png',
  },

  // Phase 2 Settings - Semantic Inpainting
  phase2: {
    selectionPadding: 10, // pixels - context around selection for better edits
    autoFeatherRadius: 3, // pixels - edge blending (2-5 recommended)
    maxVariants: 4,
    enableSeeding: true,
    // Semantic prompt template for precise inpainting
    promptTemplate: 'Edit only the selected area in this image crop: {PROMPT}. Keep all other elements, lighting, colors, shadows, and background completely unchanged. Blend naturally with surrounding areas.',
  },

  // UI Settings
  ui: {
    showApiKeyWarning: true,
    enableDebugLogging: false,
  },

  // Model Information
  models: {
    'google/gemini-2.5-flash-image': {
      name: 'Gemini 2.5 Flash',
      cost: '~$0.001',
      speed: '~8 sec',
      features: ['text-to-image', 'fast', 'identity-preserving'],
      watermarking: 'SynthID',
    },
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
