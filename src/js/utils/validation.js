/**
 * Banana4all - Validation Utility
 *
 * Input validation and sanitization functions
 */

class Validator {
  // Regular expressions for validation
  static patterns = {
    apiKey: /^AIza[A-Za-z0-9_-]{35}$/,
    prompt: /^[\s\S]{1,4000}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    url: /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?$/
  };

  // Image MIME types
  static imageMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  /**
   * Validate API key
   * @param {string} apiKey - API key to validate
   * @returns {Object} Validation result
   */
  static validateAPIKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return {
        valid: false,
        error: 'API key is required and must be a string'
      };
    }

    if (apiKey.length < 39) {
      return {
        valid: false,
        error: 'API key appears to be too short'
      };
    }

    if (!apiKey.startsWith('AIza')) {
      return {
        valid: false,
        error: 'API key must start with "AIza"'
      };
    }

    // Check against known pattern (may vary for different API versions)
    if (!this.patterns.apiKey.test(apiKey)) {
      // Don't be too strict - some keys might not match exact pattern
      console.warn('API key format might be unusual');
    }

    return { valid: true };
  }

  /**
   * Validate generation prompt
   * @param {string} prompt - Prompt to validate
   * @returns {Object} Validation result
   */
  static validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return {
        valid: false,
        error: 'Prompt is required and must be a string'
      };
    }

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length === 0) {
      return {
        valid: false,
        error: 'Prompt cannot be empty'
      };
    }

    if (trimmedPrompt.length < 3) {
      return {
        valid: false,
        error: 'Prompt must be at least 3 characters long'
      };
    }

    if (trimmedPrompt.length > 4000) {
      return {
        valid: false,
        error: 'Prompt cannot exceed 4000 characters'
      };
    }

    // Check for potentially problematic content
    const problematicPatterns = [
      /\b(password|credit\s+card|social\s+security|ssn)\b/i,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
    ];

    for (const pattern of problematicPatterns) {
      if (pattern.test(trimmedPrompt)) {
        return {
          valid: false,
          error: 'Prompt contains potentially problematic content'
        };
      }
    }

    return {
      valid: true,
      sanitized: this.sanitizePrompt(trimmedPrompt)
    };
  }

  /**
   * Sanitize prompt by removing potentially harmful content
   * @param {string} prompt - Prompt to sanitize
   * @returns {string} Sanitized prompt
   */
  static sanitizePrompt(prompt) {
    // Remove script tags and other potentially harmful content
    return prompt
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate image data
   * @param {string} imageData - Base64 image data
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateImageData(imageData, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = this.imageMimeTypes
    } = options;

    if (!imageData || typeof imageData !== 'string') {
      return {
        valid: false,
        error: 'Image data is required and must be a string'
      };
    }

    try {
      // Extract MIME type from base64 data
      const matches = imageData.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (!matches) {
        return {
          valid: false,
          error: 'Invalid image data format'
        };
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Validate MIME type
      if (!allowedTypes.includes(mimeType)) {
        return {
          valid: false,
          error: `Unsupported image type: ${mimeType}`
        };
      }

      // Calculate file size
      const decodedSize = Math.floor(base64Data.length * 0.75); // Approximate
      if (decodedSize > maxSize) {
        return {
          valid: false,
          error: `Image size (${Math.round(decodedSize / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`
        };
      }

      return {
        valid: true,
        mimeType,
        size: decodedSize
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid image data format'
      };
    }
  }

  /**
   * Validate generation options
   * @param {Object} options - Options to validate
   * @returns {Object} Validation result
   */
  static validateOptions(options = {}) {
    const errors = [];
    const validated = {};

    // Temperature
    if (options.temperature !== undefined) {
      if (typeof options.temperature !== 'number' || options.temperature < 0 || options.temperature > 2) {
        errors.push('Temperature must be a number between 0 and 2');
      } else {
        validated.temperature = options.temperature;
      }
    }

    // Top P
    if (options.topP !== undefined) {
      if (typeof options.topP !== 'number' || options.topP < 0 || options.topP > 1) {
        errors.push('Top P must be a number between 0 and 1');
      } else {
        validated.topP = options.topP;
      }
    }

    // Top K
    if (options.topK !== undefined) {
      if (typeof options.topK !== 'number' || options.topK < 1 || options.topK > 100) {
        errors.push('Top K must be a number between 1 and 100');
      } else {
        validated.topK = Math.floor(options.topK);
      }
    }

    // Max tokens
    if (options.maxTokens !== undefined) {
      if (typeof options.maxTokens !== 'number' || options.maxTokens < 1 || options.maxTokens > 8192) {
        errors.push('Max tokens must be a number between 1 and 8192');
      } else {
        validated.maxTokens = Math.floor(options.maxTokens);
      }
    }

    // Number of images
    if (options.numImages !== undefined) {
      if (typeof options.numImages !== 'number' || options.numImages < 1 || options.numImages > 4) {
        errors.push('Number of images must be a number between 1 and 4');
      } else {
        validated.numImages = Math.floor(options.numImages);
      }
    }

    // Image size
    if (options.size) {
      const validSizes = ['512x512', '1024x1024', 'custom'];
      if (!validSizes.includes(options.size)) {
        errors.push(`Invalid image size. Must be one of: ${validSizes.join(', ')}`);
      } else {
        validated.size = options.size;
      }
    }

    // Quality
    if (options.quality) {
      const validQualities = ['draft', 'standard', 'high'];
      if (!validQualities.includes(options.quality)) {
        errors.push(`Invalid quality. Must be one of: ${validQualities.join(', ')}`);
      } else {
        validated.quality = options.quality;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      validated
    };
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return {
        valid: false,
        error: 'Email is required and must be a string'
      };
    }

    if (!this.patterns.email.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format'
      };
    }

    return { valid: true };
  }

  /**
   * Validate color (hex format)
   * @param {string} color - Color to validate
   * @returns {Object} Validation result
   */
  static validateColor(color) {
    if (!color || typeof color !== 'string') {
      return {
        valid: false,
        error: 'Color is required and must be a string'
      };
    }

    if (!this.patterns.hexColor.test(color)) {
      return {
        valid: false,
        error: 'Color must be in hex format (e.g., #FF0000)'
      };
    }

    return { valid: true };
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {Object} Validation result
   */
  static validateURL(url) {
    if (!url || typeof url !== 'string') {
      return {
        valid: false,
        error: 'URL is required and must be a string'
      };
    }

    if (!this.patterns.url.test(url)) {
      return {
        valid: false,
        error: 'Invalid URL format'
      };
    }

    return { valid: true };
  }

  /**
   * Validate user preferences
   * @param {Object} preferences - Preferences to validate
   * @returns {Object} Validation result
   */
  static validatePreferences(preferences) {
    if (!preferences || typeof preferences !== 'object') {
      return {
        valid: false,
        error: 'Preferences must be an object'
      };
    }

    const errors = [];

    // Theme
    if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
      errors.push('Invalid theme preference');
    }

    // Image quality
    if (preferences.imageQuality && !['draft', 'standard', 'high'].includes(preferences.imageQuality)) {
      errors.push('Invalid image quality preference');
    }

    // Default image size
    if (preferences.defaultImageSize && !['512x512', '1024x1024', 'custom'].includes(preferences.defaultImageSize)) {
      errors.push('Invalid default image size preference');
    }

    // Auto save history
    if (preferences.autoSaveHistory !== undefined && typeof preferences.autoSaveHistory !== 'boolean') {
      errors.push('Auto save history must be a boolean');
    }

    // Max history items
    if (preferences.maxHistoryItems !== undefined) {
      if (typeof preferences.maxHistoryItems !== 'number' || preferences.maxHistoryItems < 1 || preferences.maxHistoryItems > 1000) {
        errors.push('Max history items must be a number between 1 and 1000');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize string input
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  static sanitize(input) {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 10000); // Limit length
  }

  /**
   * Validate complete generation request
   * @param {string} prompt - Generation prompt
   * @param {Object} options - Generation options
   * @returns {Object} Validation result
   */
  static validateGenerationRequest(prompt, options = {}) {
    const promptValidation = this.validatePrompt(prompt);
    if (!promptValidation.valid) {
      return promptValidation;
    }

    const optionsValidation = this.validateOptions(options);
    if (!optionsValidation.valid) {
      return {
        valid: false,
        error: optionsValidation.errors.join(', ')
      };
    }

    return {
      valid: true,
      sanitizedPrompt: promptValidation.sanitized,
      validatedOptions: optionsValidation.validated
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
} else if (typeof window !== 'undefined') {
  window.Validator = Validator;
}