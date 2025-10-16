/**
 * Banana4all - Main Application Entry Point
 *
 * Initializes the plugin and coordinates all components
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🍌 Banana4all - Initializing...');

  try {
    // Initialize core components
    const apiClient = new GeminiAPIClient();
    const storageManager = new StorageManager();
    const uiController = new UIController();

    // Initialize storage first
    await storageManager.init();
    console.log('✅ Storage manager initialized');

    // Initialize UI controller with dependencies
    await uiController.init(apiClient, storageManager);
    console.log('✅ UI controller initialized');

    // Set up global error handling
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', event.error);
      // Show user-friendly error message
      uiController._showError('An unexpected error occurred. Please try again.');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      event.preventDefault();
      // Show user-friendly error message
      uiController._showError('An unexpected error occurred. Please try again.');
    });

    // Set up plugin lifecycle handlers
    _setupPluginLifecycleHandlers(uiController, storageManager);

    console.log('🎉 Banana4all initialized successfully!');

    // Log plugin ready state
    if (window.require && window.require.uxp) {
      window.require.uxp.uxpbridge.on('ready', () => {
        console.log('🔌 UXP plugin bridge ready');
      });
    }

  } catch (error) {
    console.error('💥 Failed to initialize Banana4all:', error);
    // Show fallback error message
    document.body.innerHTML = `
      <div style="padding: 20px; color: white; text-align: center;">
        <h1>🍌 Banana4all</h1>
        <p>Failed to initialize plugin. Please restart Photoshop or contact support.</p>
        <p style="color: #999; font-size: 12px;">Error: ${error.message}</p>
      </div>
    `;
  }
});

/**
 * Setup plugin lifecycle handlers
 * @param {UIController} uiController - UI controller instance
 * @param {StorageManager} storageManager - Storage manager instance
 */
function _setupPluginLifecycleHandlers(uiController, storageManager) {
  // Handle plugin visibility changes
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      // Refresh data when plugin becomes visible
      await uiController._updateHistoryDisplay();
      console.log('🔄 Refreshed data on plugin visibility change');
    }
  });

  // Handle plugin resize events
  window.addEventListener('resize', () => {
    // Debounce resize handling
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
      console.log('📏 Plugin resized');
    }, 250);
  });

  // Handle keyboard navigation
  document.addEventListener('keydown', (event) => {
    // Enhanced keyboard navigation for accessibility
    if (event.key === 'Escape') {
      // Close any open modals
      const openModals = document.querySelectorAll('.modal[style*="flex"]');
      openModals.forEach(modal => {
        if (modal.id === 'loading-modal') return; // Don't close loading modal
        modal.style.display = 'none';
      });
    }
  });

  // Set up cleanup on plugin unload
  window.addEventListener('beforeunload', async () => {
    try {
      // Save any pending data
      console.log('🧹 Cleaning up plugin state...');
      // Add any additional cleanup logic here
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
}

// Export main components for debugging
window.Banana4all = {
  version: '1.0.0-beta',
  apiClient: null,
  storageManager: null,
  uiController: null,
  debug: {
    log: (...args) => console.log('🍌 Debug:', ...args),
    error: (...args) => console.error('🚨 Debug:', ...args),
    warn: (...args) => console.warn('⚠️ Debug:', ...args)
  }
};

// Global utility functions
window.Banana4all.utils = {
  /**
   * Format file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Format duration in human readable format
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration: (milliseconds) => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  },

  /**
   * Debounce function to limit how often a function can be called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function to limit how often a function can be called
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit time in milliseconds
   * @returns {Function} Throttled function
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @returns {boolean} True if valid image file
   */
  validateImageFile: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  },

  /**
   * Create object URL from file
   * @param {File} file - File to create URL from
   * @returns {string} Object URL
   */
  createObjectURL: (file) => {
    return URL.createObjectURL(file);
  },

  /**
   * Revoke object URL
   * @param {string} url - Object URL to revoke
   */
  revokeObjectURL: (url) => {
    URL.revokeObjectURL(url);
  }
};

// Performance monitoring
if ('performance' in window) {
  window.Banana4all.performance = {
    start: (label) => {
      performance.mark(`${label}-start`);
    },
    end: (label) => {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const duration = performance.getEntriesByName(label)[0].duration;
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
      return duration;
    }
  };
}

// Error tracking
window.Banana4all.errorTracking = {
  errors: [],
  log: (error, context = {}) => {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context
    };
    window.Banana4all.errorTracking.errors.push(errorInfo);
    console.error('🚨 Error tracked:', errorInfo);
  },
  getErrors: () => {
    return window.Banana4all.errorTracking.errors;
  },
  clearErrors: () => {
    window.Banana4all.errorTracking.errors = [];
  }
};

// Feature detection
window.Banana4all.features = {
  clipboard: () => 'clipboard' in navigator && 'write' in navigator.clipboard,
  notifications: () => 'Notification' in window,
  localStorage: () => 'localStorage' in window,
  webWorkers: () => 'Worker' in window,
  fileAPI: () => 'File' in window && 'FileReader' in window,
  canvas: () => {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  }
};

// Initialize feature detection
Object.keys(window.Banana4all.features).forEach(feature => {
  const isSupported = window.Banana4all.features[feature]();
  console.log(`🔍 Feature ${feature}: ${isSupported ? '✅ Supported' : '❌ Not supported'}`);
});

console.log('🍌 Banana4all - Ready for adventure!');