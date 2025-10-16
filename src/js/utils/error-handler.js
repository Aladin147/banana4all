/**
 * Banana4all - Error Handler Utility
 *
 * Centralized error handling for the application
 */

class ErrorHandler {
  static categories = {
    NETWORK: 'network',
    API: 'api',
    VALIDATION: 'validation',
    STORAGE: 'storage',
    UI: 'ui',
    UNKNOWN: 'unknown'
  };

  static errors = {
    // Network errors
    NETWORK_OFFLINE: {
      category: this.categories.NETWORK,
      code: 'NETWORK_OFFLINE',
      message: 'You appear to be offline. Please check your internet connection.',
      userFriendly: true,
      recoverable: true
    },
    NETWORK_TIMEOUT: {
      category: this.categories.NETWORK,
      code: 'NETWORK_TIMEOUT',
      message: 'Request timed out. Please try again.',
      userFriendly: true,
      recoverable: true
    },

    // API errors
    API_KEY_INVALID: {
      category: this.categories.API,
      code: 'API_KEY_INVALID',
      message: 'Invalid API key. Please check your credentials.',
      userFriendly: true,
      recoverable: false
    },
    API_RATE_LIMIT: {
      category: this.categories.API,
      code: 'API_RATE_LIMIT',
      message: 'Rate limit exceeded. Please wait before making more requests.',
      userFriendly: true,
      recoverable: true
    },
    API_QUOTA_EXCEEDED: {
      category: this.categories.API,
      code: 'API_QUOTA_EXCEEDED',
      message: 'API quota exceeded. Please check your usage or upgrade your plan.',
      userFriendly: true,
      recoverable: false
    },
    API_FORBIDDEN: {
      category: this.categories.API,
      code: 'API_FORBIDDEN',
      message: 'Access forbidden. Please check your API permissions.',
      userFriendly: true,
      recoverable: false
    },

    // Validation errors
    VALIDATION_EMPTY_PROMPT: {
      category: this.categories.VALIDATION,
      code: 'VALIDATION_EMPTY_PROMPT',
      message: 'Please enter a prompt to generate images.',
      userFriendly: true,
      recoverable: true
    },
    VALIDATION_INVALID_IMAGE: {
      category: this.categories.VALIDATION,
      code: 'VALIDATION_INVALID_IMAGE',
      message: 'Invalid image format. Please use a supported format.',
      userFriendly: true,
      recoverable: true
    },

    // Storage errors
    STORAGE_QUOTA_EXCEEDED: {
      category: this.categories.STORAGE,
      code: 'STORAGE_QUOTA_EXCEEDED',
      message: 'Storage quota exceeded. Please clear some history or data.',
      userFriendly: true,
      recoverable: true
    },

    // UI errors
    UI_RENDER_ERROR: {
      category: this.categories.UI,
      code: 'UI_RENDER_ERROR',
      message: 'Error displaying content. Please refresh the plugin.',
      userFriendly: true,
      recoverable: true
    }
  };

  /**
   * Handle an error with appropriate user feedback
   * @param {Error} error - The error object
   * @param {Object} context - Context information
   * @param {Function} callback - Optional callback for error recovery
   */
  static handle(error, context = {}, callback = null) {
    const errorInfo = this.categorizeError(error);

    // Log the error
    this.logError(errorInfo, context);

    // Show user-friendly message
    if (errorInfo.userFriendly) {
      this.showUserMessage(errorInfo.message, errorInfo.category, callback);
    } else {
      this.showUserMessage(
        'An unexpected error occurred. Please try again or contact support.',
        this.categories.UNKNOWN,
        callback
      );
    }

    // Track error for analytics
    this.trackError(errorInfo, context);

    return errorInfo;
  }

  /**
   * Categorize an error based on its properties
   * @param {Error} error - The error object
   * @returns {Object} Categorized error information
   */
  static categorizeError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorName = error.name || '';

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return this.errors.NETWORK_OFFLINE;
    }

    if (errorName === 'AbortError' || errorMessage.includes('timeout')) {
      return this.errors.NETWORK_TIMEOUT;
    }

    // API errors
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return this.errors.API_KEY_INVALID;
    }

    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return this.errors.API_RATE_LIMIT;
    }

    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return this.errors.API_FORBIDDEN;
    }

    if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
      return this.errors.API_QUOTA_EXCEEDED;
    }

    // Validation errors
    if (errorMessage.includes('empty prompt') || errorMessage.includes('prompt is required')) {
      return this.errors.VALIDATION_EMPTY_PROMPT;
    }

    if (errorMessage.includes('image') && errorMessage.includes('invalid')) {
      return this.errors.VALIDATION_INVALID_IMAGE;
    }

    // Storage errors
    if (errorMessage.includes('quota') && errorMessage.includes('storage')) {
      return this.errors.STORAGE_QUOTA_EXCEEDED;
    }

    // UI errors
    if (errorMessage.includes('render') || errorMessage.includes('dom')) {
      return this.errors.UI_RENDER_ERROR;
    }

    // Unknown error
    return {
      category: this.categories.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      userFriendly: false,
      recoverable: true
    };
  }

  /**
   * Log error details for debugging
   * @param {Object} errorInfo - Error information
   * @param {Object} context - Context information
   */
  static logError(errorInfo, context) {
    const logData = {
      timestamp: new Date().toISOString(),
      error: errorInfo,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    if (errorInfo.category === this.categories.UNKNOWN) {
      console.error('🚨 Unknown Error:', logData);
    } else {
      console.warn(`⚠️ ${errorInfo.category.toUpperCase()} Error:`, logData);
    }
  }

  /**
   * Show user-friendly error message
   * @param {string} message - Error message
   * @param {string} category - Error category
   * @param {Function} callback - Optional recovery callback
   */
  static showUserMessage(message, category, callback = null) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('error-modal');
    if (!modal) {
      modal = this.createErrorModal();
      document.body.appendChild(modal);
    }

    // Update message
    const messageElement = modal.querySelector('.error-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // Update category icon and styling
    const iconElement = modal.querySelector('.error-icon');
    if (iconElement) {
      iconElement.className = `error-icon error-icon--${category}`;
    }

    // Show modal
    modal.style.display = 'flex';

    // Setup close button
    const closeBtn = modal.querySelector('.error-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
      };
    }
  }

  /**
   * Create error modal element
   * @returns {HTMLElement} Error modal
   */
  static createErrorModal() {
    const modal = document.createElement('div');
    modal.id = 'error-modal';
    modal.className = 'modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
      background-color: var(--bg-secondary, #2D2D2D);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      border: 1px solid var(--border-color, #404040);
      color: var(--text-primary, #FFFFFF);
    `;

    content.innerHTML = `
      <div class="error-icon" style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <h3 style="margin: 0 0 16px 0; color: var(--text-primary, #FFFFFF);">Error</h3>
      <p class="error-message" style="margin: 0 0 20px 0; color: var(--text-secondary, #B0B0B0);"></p>
      <button class="error-close-btn" style="
        background-color: var(--primary-color, #FFC107);
        color: var(--bg-primary, #1E1E1E);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      ">Close</button>
    `;

    modal.appendChild(content);
    return modal;
  }

  /**
   * Track error for analytics
   * @param {Object} errorInfo - Error information
   * @param {Object} context - Context information
   */
  static trackError(errorInfo, context) {
    // Store error history
    const errorHistory = JSON.parse(localStorage.getItem('banana4all_error_history') || '[]');

    errorHistory.push({
      ...errorInfo,
      context,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 errors
    if (errorHistory.length > 50) {
      errorHistory.splice(0, errorHistory.length - 50);
    }

    localStorage.setItem('banana4all_error_history', JSON.stringify(errorHistory));
  }

  /**
   * Get error history
   * @returns {Array} Array of error objects
   */
  static getErrorHistory() {
    return JSON.parse(localStorage.getItem('banana4all_error_history') || '[]');
  }

  /**
   * Clear error history
   */
  static clearErrorHistory() {
    localStorage.removeItem('banana4all_error_history');
  }

  /**
   * Create a custom error with standard format
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {string} category - Error category
   * @returns {Error} Error object
   */
  static createError(code, message, category = this.categories.UNKNOWN) {
    const error = new Error(message);
    error.code = code;
    error.category = category;
    error.timestamp = new Date().toISOString();
    return error;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
}