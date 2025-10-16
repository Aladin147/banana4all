/**
 * Banana4all - Google Gemini API Client
 *
 * Handles communication with Google Gemini API for image generation
 */

class GeminiAPIClient {
  constructor() {
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.apiKey = null;
    this.model = 'gemini-2.5-flash';
    this.maxRetries = 3;
    this.timeout = 30000; // 30 seconds
    this.version = '1.0.0';
    this.safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ];
  }

  /**
   * Set the API key for authentication
   * @param {string} apiKey - Google AI API key
   */
  setAPIKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Set the model to use for generation
   * @param {string} model - Model name (e.g., 'gemini-2.5-flash', 'gemini-2.5-pro')
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Validate the API key by making a test request
   * @returns {Promise<boolean>} True if API key is valid
   */
  async validateAPIKey() {
    try {
      const testPrompt = "Test";
      await this.generateText(testPrompt, { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('API Key validation failed:', error);
      return false;
    }
  }

  /**
   * Generate text from Gemini API
   * @param {string} prompt - Text prompt for generation
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 1024,
        candidateCount: options.candidateCount || 1
      }
    };

    return await this._makeRequest(url, requestBody);
  }

  /**
   * Generate image from text prompt
   * @param {string} prompt - Text prompt for image generation
   * @param {Object} options - Image generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(prompt, options = {}) {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 8192,
        candidateCount: options.candidateCount || 1,
        responseModalities: ['Text', 'Image']
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    const response = await this._makeRequest(url, requestBody);
    return this._extractImageData(response);
  }

  /**
   * Edit/modify an existing image
   * @param {string} imageData - Base64 encoded image data
   * @param {string} prompt - Text prompt for editing
   * @param {Object} options - Editing options
   * @returns {Promise<Object>} Edited image data
   */
  async editImage(imageData, prompt, options = {}) {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData
            }
          }
        ]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 8192,
        candidateCount: options.candidateCount || 1,
        responseModalities: ['Text', 'Image']
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    const response = await this._makeRequest(url, requestBody);
    return this._extractImageData(response);
  }

  /**
   * Inpainting - edit specific areas of an image
   * @param {string} imageData - Base64 encoded image data
   * @param {string} maskData - Base64 encoded mask data
   * @param {string} prompt - Text prompt for inpainting
   * @param {Object} options - Inpainting options
   * @returns {Promise<Object>} Inpainted image data
   */
  async inpaintImage(imageData, maskData, prompt, options = {}) {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData
            }
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: maskData
            }
          }
        ]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 8192,
        candidateCount: options.candidateCount || 1,
        responseModalities: ['Text', 'Image']
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    const response = await this._makeRequest(url, requestBody);
    return this._extractImageData(response);
  }

  /**
   * Make HTTP request to API with retry logic
   * @param {string} url - API endpoint URL
   * @param {Object} body - Request body
   * @param {number} attempt - Current attempt number (for retry)
   * @returns {Promise<Object>} API response
   */
  async _makeRequest(url, body, attempt = 1) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._makeRequest(url, body, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Extract image data from API response
   * @param {Object} response - API response
   * @returns {Object} Extracted image data
   */
  _extractImageData(response) {
    try {
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const content = candidates[0].content;
      if (!content.parts || content.parts.length === 0) {
        throw new Error('No content parts in response');
      }

      const imagePart = content.parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));
      if (!imagePart) {
        throw new Error('No image data found in response');
      }

      return {
        data: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
        text: content.parts.find(part => part.text)?.text || ''
      };
    } catch (error) {
      console.error('Error extracting image data:', error);
      throw error;
    }
  }

  /**
   * Get API usage information (if available)
   * @returns {Promise<Object>} Usage information
   */
  async getUsage() {
    // Note: This would require a different endpoint that may not be available
    // This is a placeholder for future usage tracking implementation
    return {
      requests: 0,
      tokens: 0,
      images: 0
    };
  }

  /**
   * Get available models
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
    const response = await this._makeRequest(url, {}, 1); // No retry for this call
    return response.models;
  }

  /**
   * Cancel any pending requests
   */
  cancelPendingRequests() {
    // Implementation would depend on how requests are tracked
    // This is a placeholder for future implementation
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiAPIClient;
} else if (typeof window !== 'undefined') {
  window.GeminiAPIClient = GeminiAPIClient;
}