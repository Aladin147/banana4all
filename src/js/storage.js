/**
 * Banana4all - Storage Manager
 *
 * Handles secure storage of API keys, user preferences, and cached data
 */

class StorageManager {
  constructor() {
    this.storageKeys = {
      API_KEY: 'banana4all_api_key',
      USER_PREFERENCES: 'banana4all_user_preferences',
      GENERATION_HISTORY: 'banana4all_generation_history',
      PRESETS: 'banana4all_presets',
      USAGE_STATS: 'banana4all_usage_stats',
      CACHE: 'banana4all_cache'
    };

    this.defaultPreferences = {
      theme: 'dark',
      imageQuality: 'standard',
      defaultImageSize: '1024x1024',
      autoSaveHistory: true,
      maxHistoryItems: 100,
      defaultModel: 'gemini-2.5-flash',
      temperature: 0.7,
      showAdvancedOptions: false,
      keyboardShortcuts: {
        generate: 'Ctrl+Enter',
        clear: 'Ctrl+Delete',
        settings: 'Ctrl+,'
      }
    };
  }

  /**
   * Initialize storage manager
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Check if UXP storage is available
      if (window.require && window.require.uxp) {
        this.storage = window.require.uxp.storage;
      } else {
        // Fallback to localStorage for development
        this.storage = {
          getItem: (key) => localStorage.getItem(key),
          setItem: (key, value) => localStorage.setItem(key, value),
          removeItem: (key) => localStorage.removeItem(key),
          clear: () => localStorage.clear()
        };
      }

      // Initialize default preferences if not set
      await this._initializeDefaultPreferences();
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      // Use localStorage as fallback
      this.storage = {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
      };
    }
  }

  /**
   * Store API key with encryption
   * @param {string} apiKey - The API key to store
   * @returns {Promise<boolean>} True if stored successfully
   */
  async storeAPIKey(apiKey) {
    try {
      // Encrypt the API key before storing
      const encryptedKey = this._encrypt(apiKey);
      await this.storage.setItem(this.storageKeys.API_KEY, encryptedKey);
      return true;
    } catch (error) {
      console.error('Error storing API key:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt API key
   * @returns {Promise<string|null>} The decrypted API key or null if not found
   */
  async getAPIKey() {
    try {
      const encryptedKey = await this.storage.getItem(this.storageKeys.API_KEY);
      if (!encryptedKey) return null;

      return this._decrypt(encryptedKey);
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  /**
   * Remove stored API key
   * @returns {Promise<boolean>} True if removed successfully
   */
  async removeAPIKey() {
    try {
      await this.storage.removeItem(this.storageKeys.API_KEY);
      return true;
    } catch (error) {
      console.error('Error removing API key:', error);
      return false;
    }
  }

  /**
   * Store user preferences
   * @param {Object} preferences - User preferences object
   * @returns {Promise<boolean>} True if stored successfully
   */
  async storePreferences(preferences) {
    try {
      const mergedPreferences = { ...this.defaultPreferences, ...preferences };
      const preferencesJSON = JSON.stringify(mergedPreferences);
      await this.storage.setItem(this.storageKeys.USER_PREFERENCES, preferencesJSON);
      return true;
    } catch (error) {
      console.error('Error storing preferences:', error);
      return false;
    }
  }

  /**
   * Retrieve user preferences
   * @returns {Promise<Object>} User preferences object
   */
  async getPreferences() {
    try {
      const preferencesJSON = await this.storage.getItem(this.storageKeys.USER_PREFERENCES);
      if (!preferencesJSON) return this.defaultPreferences;

      return { ...this.defaultPreferences, ...JSON.parse(preferencesJSON) };
    } catch (error) {
      console.error('Error retrieving preferences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Add generation to history
   * @param {Object} generation - Generation data object
   * @returns {Promise<boolean>} True if added successfully
   */
  async addGenerationToHistory(generation) {
    try {
      const history = await this.getGenerationHistory();

      const newEntry = {
        ...generation,
        id: this._generateId(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };

      history.unshift(newEntry);

      // Keep only the most recent items
      const preferences = await this.getPreferences();
      const maxItems = preferences.maxHistoryItems || 100;
      const trimmedHistory = history.slice(0, maxItems);

      const historyJSON = JSON.stringify(trimmedHistory);
      await this.storage.setItem(this.storageKeys.GENERATION_HISTORY, historyJSON);
      return true;
    } catch (error) {
      console.error('Error adding generation to history:', error);
      return false;
    }
  }

  /**
   * Retrieve generation history
   * @returns {Promise<Array>} Array of generation objects
   */
  async getGenerationHistory() {
    try {
      const historyJSON = await this.storage.getItem(this.storageKeys.GENERATION_HISTORY);
      return historyJSON ? JSON.parse(historyJSON) : [];
    } catch (error) {
      console.error('Error retrieving generation history:', error);
      return [];
    }
  }

  /**
   * Clear generation history
   * @returns {Promise<boolean>} True if cleared successfully
   */
  async clearGenerationHistory() {
    try {
      await this.storage.setItem(this.storageKeys.GENERATION_HISTORY, '[]');
      return true;
    } catch (error) {
      console.error('Error clearing generation history:', error);
      return false;
    }
  }

  /**
   * Store presets
   * @param {Array} presets - Array of preset objects
   * @returns {Promise<boolean>} True if stored successfully
   */
  async storePresets(presets) {
    try {
      const presetsJSON = JSON.stringify(presets);
      await this.storage.setItem(this.storageKeys.PRESETS, presetsJSON);
      return true;
    } catch (error) {
      console.error('Error storing presets:', error);
      return false;
    }
  }

  /**
   * Retrieve presets
   * @returns {Promise<Array>} Array of preset objects
   */
  async getPresets() {
    try {
      const presetsJSON = await this.storage.getItem(this.storageKeys.PRESETS);
      return presetsJSON ? JSON.parse(presetsJSON) : this._getDefaultPresets();
    } catch (error) {
      console.error('Error retrieving presets:', error);
      return this._getDefaultPresets();
    }
  }

  /**
   * Update usage statistics
   * @param {Object} stats - Usage statistics to update
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateUsageStats(stats) {
    try {
      const currentStats = await this.getUsageStats();
      const updatedStats = {
        ...currentStats,
        ...stats,
        lastUpdated: new Date().toISOString()
      };

      const statsJSON = JSON.stringify(updatedStats);
      await this.storage.setItem(this.storageKeys.USAGE_STATS, statsJSON);
      return true;
    } catch (error) {
      console.error('Error updating usage stats:', error);
      return false;
    }
  }

  /**
   * Retrieve usage statistics
   * @returns {Promise<Object>} Usage statistics object
   */
  async getUsageStats() {
    try {
      const statsJSON = await this.storage.getItem(this.storageKeys.USAGE_STATS);
      return statsJSON ? JSON.parse(statsJSON) : this._getDefaultUsageStats();
    } catch (error) {
      console.error('Error retrieving usage stats:', error);
      return this._getDefaultUsageStats();
    }
  }

  /**
   * Cache data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<boolean>} True if cached successfully
   */
  async cacheData(key, data, ttl = 3600000) {
    try {
      const cache = await this.getCache();
      cache[key] = {
        data,
        timestamp: new Date().toISOString(),
        ttl
      };

      const cacheJSON = JSON.stringify(cache);
      await this.storage.setItem(this.storageKeys.CACHE, cacheJSON);
      return true;
    } catch (error) {
      console.error('Error caching data:', error);
      return false;
    }
  }

  /**
   * Retrieve cached data
   * @param {string} key - Cache key
   * @returns {Promise<Object|null>} Cached data or null if expired/not found
   */
  async getCachedData(key) {
    try {
      const cache = await this.getCache();
      const cachedItem = cache[key];

      if (!cachedItem) return null;

      // Check if cache has expired
      const now = new Date();
      const cacheTime = new Date(cachedItem.timestamp);
      const age = now - cacheTime;

      if (age > cachedItem.ttl) {
        // Remove expired item
        delete cache[key];
        await this.storage.setItem(this.storageKeys.CACHE, JSON.stringify(cache));
        return null;
      }

      return cachedItem.data;
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  }

  /**
   * Clear all cached data
   * @returns {Promise<boolean>} True if cleared successfully
   */
  async clearCache() {
    try {
      await this.storage.setItem(this.storageKeys.CACHE, '{}');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Export all data
   * @returns {Promise<Object>} All stored data
   */
  async exportData() {
    try {
      const [
        preferences,
        generationHistory,
        presets,
        usageStats
      ] = await Promise.all([
        this.getPreferences(),
        this.getGenerationHistory(),
        this.getPresets(),
        this.getUsageStats()
      ]);

      return {
        preferences,
        generationHistory,
        presets,
        usageStats,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import data
   * @param {Object} data - Data to import
   * @returns {Promise<boolean>} True if imported successfully
   */
  async importData(data) {
    try {
      if (data.preferences) {
        await this.storePreferences(data.preferences);
      }
      if (data.generationHistory) {
        await this.storage.setItem(
          this.storageKeys.GENERATION_HISTORY,
          JSON.stringify(data.generationHistory)
        );
      }
      if (data.presets) {
        await this.storePresets(data.presets);
      }
      if (data.usageStats) {
        await this.storage.setItem(
          this.storageKeys.USAGE_STATS,
          JSON.stringify(data.usageStats)
        );
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Clear all stored data
   * @returns {Promise<boolean>} True if cleared successfully
   */
  async clearAllData() {
    try {
      await Promise.all([
        this.storage.removeItem(this.storageKeys.API_KEY),
        this.storage.removeItem(this.storageKeys.USER_PREFERENCES),
        this.storage.removeItem(this.storageKeys.GENERATION_HISTORY),
        this.storage.removeItem(this.storageKeys.PRESETS),
        this.storage.removeItem(this.storageKeys.USAGE_STATS),
        this.storage.removeItem(this.storageKeys.CACHE)
      ]);

      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Private helper methods

  /**
   * Initialize default preferences
   * @returns {Promise<void>}
   */
  async _initializeDefaultPreferences() {
    const existingPrefs = await this.storage.getItem(this.storageKeys.USER_PREFERENCES);
    if (!existingPrefs) {
      await this.storePreferences(this.defaultPreferences);
    }
  }

  /**
   * Get cache data
   * @returns {Promise<Object>} Cache object
   */
  async getCache() {
    try {
      const cacheJSON = await this.storage.getItem(this.storageKeys.CACHE);
      return cacheJSON ? JSON.parse(cacheJSON) : {};
    } catch (error) {
      console.error('Error retrieving cache:', error);
      return {};
    }
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Encrypt data (simple obfuscation for demo purposes)
   * @param {string} data - Data to encrypt
   * @returns {string} Encrypted data
   */
  _encrypt(data) {
    // In production, use proper encryption like AES
    // This is a simple XOR-based obfuscation for demo
    const key = 'banana4all-encryption-key';
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   * @returns {string} Decrypted data
   */
  _decrypt(encryptedData) {
    // In production, use proper decryption
    // This reverses the simple XOR obfuscation
    const key = 'banana4all-encryption-key';
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  }

  /**
   * Get default presets
   * @returns {Array} Default presets array
   */
  _getDefaultPresets() {
    return [
      {
        id: 'preset-photorealistic',
        name: 'Photorealistic',
        description: 'Realistic photography style',
        settings: {
          temperature: 0.3,
          topP: 0.9,
          topK: 30,
          quality: 'high'
        }
      },
      {
        id: 'preset-artistic',
        name: 'Artistic',
        description: 'Creative and artistic style',
        settings: {
          temperature: 0.9,
          topP: 0.95,
          topK: 50,
          quality: 'high'
        }
      },
      {
        id: 'preset-fast',
        name: 'Fast Draft',
        description: 'Quick generation for ideation',
        settings: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          quality: 'draft'
        }
      }
    ];
  }

  /**
   * Get default usage statistics
   * @returns {Object} Default usage stats
   */
  _getDefaultUsageStats() {
    return {
      totalGenerations: 0,
      totalImages: 0,
      totalTokens: 0,
      averageGenerationTime: 0,
      preferredModels: {},
      preferredSizes: {},
      preferredQuality: {},
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}