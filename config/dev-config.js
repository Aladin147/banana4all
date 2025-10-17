/**
 * DEVELOPMENT CONFIGURATION
 *
 * This file contains development settings and API keys for local testing.
 * This file is gitignored and should never be committed to version control.
 *
 * WARNING: This file contains sensitive information.
 * Do not share or commit this file to public repositories.
 */

window.Banana4allDevConfig = {
  // Google AI API Configuration
  googleAI: {
    apiKey: 'AIzaSyB_9iNOFYkYfhyneYFML0O07XgLeNA_ciQ', // Development API key
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash'
  },

  // Development Settings
  development: {
    enableDebugMode: true,
    enableConsoleLogging: true,
    autoLoadAPIKey: true,
    simulateAPI: false // Set to true to mock API responses for testing
  },

  // Testing Configuration
  testing: {
    enableTestMode: false,
    mockResponses: false,
    skipAPIValidation: false
  },

  // Performance Settings
  performance: {
    enableMonitoring: true,
    logSlowOperations: true,
    slowOperationThreshold: 500 // milliseconds
  }
};

// Auto-populate API key in UI when in development mode
if (typeof window !== 'undefined' && window.Banana4allDevConfig) {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for the UI to initialize
    setTimeout(() => {
      const apiKeyInput = document.getElementById('api-key');
      const saveButton = document.getElementById('save-api-key');

      if (apiKeyInput && saveButton && window.Banana4allDevConfig.googleAI.apiKey) {
        // Auto-fill the API key
        apiKeyInput.value = window.Banana4allDevConfig.googleAI.apiKey;

        // Auto-save if enabled
        if (window.Banana4allDevConfig.development.autoLoadAPIKey) {
          // Trigger save after a short delay to ensure storage is ready
          setTimeout(() => {
            if (saveButton && !saveButton.disabled) {
              saveButton.click();
              console.log('🔑 Development API key automatically loaded and saved');
            }
          }, 1000);
        }
      }
    }, 500);
  });
}

console.log('🔧 Development configuration loaded (API key ready for testing)');