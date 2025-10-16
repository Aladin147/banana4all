/**
 * Banana4all - UI Controller
 *
 * Manages user interface interactions and updates
 */

class UIController {
  constructor() {
    this.elements = {};
    this.currentGeneration = null;
    this.isLoading = false;
    this.apiClient = null;
    this.storageManager = null;
    this.generationQueue = [];
  }

  /**
   * Initialize UI controller
   * @param {GeminiAPIClient} apiClient - API client instance
   * @param {StorageManager} storageManager - Storage manager instance
   */
  async init(apiClient, storageManager) {
    this.apiClient = apiClient;
    this.storageManager = storageManager;

    this._cacheElements();
    this._setupEventListeners();
    await this._loadInitialState();
  }

  /**
   * Cache DOM elements for better performance
   */
  _cacheElements() {
    this.elements = {
      // API Configuration
      apiKeyInput: document.getElementById('api-key'),
      saveApiKeyBtn: document.getElementById('save-api-key'),
      apiStatus: document.getElementById('api-status'),
      statusIndicator: document.querySelector('.status-indicator'),
      statusText: document.querySelector('.status-text'),

      // Generation Controls
      promptTextarea: document.getElementById('prompt'),
      imageSizeSelect: document.getElementById('image-size'),
      qualitySelect: document.getElementById('quality'),
      numImagesInput: document.getElementById('num-images'),
      generateBtn: document.getElementById('generate-btn'),
      btnText: document.querySelector('.btn-text'),
      btnLoading: document.querySelector('.btn-loading'),

      // Results
      resultsContainer: document.getElementById('results-container'),
      historyContainer: document.getElementById('history-container'),

      // Modals
      loadingModal: document.getElementById('loading-modal'),
      errorModal: document.getElementById('error-modal'),
      successModal: document.getElementById('success-modal'),
      loadingText: document.getElementById('loading-text'),
      errorMessage: document.getElementById('error-message'),
      successMessage: document.getElementById('success-message'),
      progressFill: document.getElementById('progress-fill'),

      // Footer Links
      helpBtn: document.getElementById('help-btn'),
      settingsBtn: document.getElementById('settings-btn'),
      aboutBtn: document.getElementById('about-btn'),

      // Modal Close Buttons
      errorCloseBtn: document.getElementById('error-close-btn'),
      successCloseBtn: document.getElementById('success-close-btn')
    };
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // API Configuration
    this.elements.saveApiKeyBtn.addEventListener('click', () => this._handleSaveAPIKey());
    this.elements.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this._handleSaveAPIKey();
    });

    // Generation
    this.elements.generateBtn.addEventListener('click', () => this._handleGenerate());
    this.elements.promptTextarea.addEventListener('keypress', (e) => {
      if (e.ctrlKey && e.key === 'Enter') this._handleGenerate();
    });

    // Modal Close
    this.elements.errorCloseBtn.addEventListener('click', () => this._hideModal('error'));
    this.elements.successCloseBtn.addEventListener('click', () => this._hideModal('success'));

    // Footer Links
    this.elements.helpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._showHelp();
    });

    this.elements.settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._showSettings();
    });

    this.elements.aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._showAbout();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this._handleKeyboardShortcuts(e));
  }

  /**
   * Load initial state from storage
   */
  async _loadInitialState() {
    try {
      // Load API key
      const apiKey = await this.storageManager.getAPIKey();
      if (apiKey) {
        this.elements.apiKeyInput.value = apiKey;
        await this._validateAndSetAPIKey(apiKey);
      }

      // Load preferences
      const preferences = await this.storageManager.getPreferences();
      this._applyPreferences(preferences);

      // Load generation history
      const history = await this.storageManager.getGenerationHistory();
      this._renderHistory(history);
    } catch (error) {
      console.error('Error loading initial state:', error);
    }
  }

  /**
   * Handle API key save
   */
  async _handleSaveAPIKey() {
    const apiKey = this.elements.apiKeyInput.value.trim();
    if (!apiKey) {
      this._showError('Please enter an API key');
      return;
    }

    this._setLoading(true);
    try {
      const success = await this._validateAndSetAPIKey(apiKey);
      if (success) {
        await this.storageManager.storeAPIKey(apiKey);
        this._showSuccess('API key saved successfully!');
      } else {
        this._showError('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      this._showError('Failed to save API key: ' + error.message);
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Validate and set API key
   * @param {string} apiKey - API key to validate
   * @returns {Promise<boolean>} True if valid
   */
  async _validateAndSetAPIKey(apiKey) {
    this.apiClient.setAPIKey(apiKey);
    const isValid = await this.apiClient.validateAPIKey();

    if (isValid) {
      this._updateAPIStatus('connected');
      return true;
    } else {
      this._updateAPIStatus('error');
      return false;
    }
  }

  /**
   * Update API status indicator
   * @param {string} status - Status ('connected', 'error', 'disconnected')
   */
  _updateAPIStatus(status) {
    const indicator = this.elements.statusIndicator;
    const text = this.elements.statusText;

    indicator.classList.remove('connected');

    switch (status) {
      case 'connected':
        indicator.classList.add('connected');
        text.textContent = 'Connected';
        break;
      case 'error':
        text.textContent = 'Connection Error';
        break;
      default:
        text.textContent = 'Not configured';
    }
  }

  /**
   * Handle image generation
   */
  async _handleGenerate() {
    const prompt = this.elements.promptTextarea.value.trim();
    if (!prompt) {
      this._showError('Please enter a prompt');
      return;
    }

    const apiKey = await this.storageManager.getAPIKey();
    if (!apiKey) {
      this._showError('Please configure your API key first');
      return;
    }

    this._setLoading(true);
    this._showModal('loading', 'Generating your image...');

    try {
      const options = this._getGenerationOptions();
      const startTime = Date.now();

      // For now, we'll simulate generation since we don't have actual API setup
      // In real implementation, this would call the API
      const result = await this._simulateGeneration(prompt, options);

      const generationTime = Date.now() - startTime;
      await this._handleGenerationSuccess(result, prompt, generationTime, options);

    } catch (error) {
      this._hideModal('loading');
      this._showError('Generation failed: ' + error.message);
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Get generation options from UI
   * @returns {Object} Generation options
   */
  _getGenerationOptions() {
    return {
      size: this.elements.imageSizeSelect.value,
      quality: this.elements.qualitySelect.value,
      numImages: parseInt(this.elements.numImagesInput.value),
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    };
  }

  /**
   * Simulate generation (replace with actual API call)
   * @param {string} prompt - Generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Simulated result
   */
  async _simulateGeneration(prompt, options) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Simulate progress
    const steps = ['Initializing...', 'Processing...', 'Generating...', 'Finalizing...'];
    for (let i = 0; i < steps.length; i++) {
      this.elements.loadingText.textContent = steps[i];
      this.elements.progressFill.style.width = `${((i + 1) / steps.length) * 100}%`;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Return simulated result
    return {
      success: true,
      data: this._generatePlaceholderImage(),
      prompt,
      options,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate placeholder image data
   * @returns {string} Base64 placeholder image
   */
  _generatePlaceholderImage() {
    // Create a simple SVG placeholder
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#f0f0f0"/>
        <text x="256" y="256" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#666">
          Generated Image
        </text>
        <text x="256" y="280" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#999">
          Placeholder
        </text>
      </svg>
    `;

    return btoa(svg);
  }

  /**
   * Handle successful generation
   * @param {Object} result - Generation result
   * @param {string} prompt - Original prompt
   * @param {number} generationTime - Time taken to generate
   * @param {Object} options - Generation options
   */
  async _handleGenerationSuccess(result, prompt, generationTime, options) {
    this._hideModal('loading');

    // Add to history
    const historyEntry = {
      prompt,
      imageData: result.data,
      options,
      generationTime,
      success: true
    };

    await this.storageManager.addGenerationToHistory(historyEntry);
    await this._updateUsageStats(historyEntry);

    // Show results
    this._renderResults([historyEntry]);
    this._updateHistoryDisplay();

    this._showSuccess('Image generated successfully!');
  }

  /**
   * Render generation results
   * @param {Array} results - Array of result objects
   */
  _renderResults(results) {
    this.elements.resultsContainer.innerHTML = '';

    results.forEach((result, index) => {
      const resultElement = this._createResultElement(result, index);
      this.elements.resultsContainer.appendChild(resultElement);
    });
  }

  /**
   * Create result element
   * @param {Object} result - Result object
   * @param {number} index - Result index
   * @returns {HTMLElement} Result element
   */
  _createResultElement(result, index) {
    const element = document.createElement('div');
    element.className = 'result-item fade-in';

    const image = document.createElement('img');
    image.src = `data:image/svg+xml;base64,${result.imageData}`;
    image.alt = `Generated image ${index + 1}`;
    image.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'result-item-info';

    const promptText = document.createElement('p');
    promptText.textContent = result.prompt.length > 50
      ? result.prompt.substring(0, 50) + '...'
      : result.prompt;

    const actions = document.createElement('div');
    actions.className = 'result-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn-download';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => this._downloadImage(result, index));

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => this._copyImage(result, index));

    actions.appendChild(downloadBtn);
    actions.appendChild(copyBtn);

    info.appendChild(promptText);
    info.appendChild(actions);

    element.appendChild(image);
    element.appendChild(info);

    return element;
  }

  /**
   * Update history display
   */
  async _updateHistoryDisplay() {
    const history = await this.storageManager.getGenerationHistory();
    this._renderHistory(history);
  }

  /**
   * Render generation history
   * @param {Array} history - Generation history array
   */
  _renderHistory(history) {
    this.elements.historyContainer.innerHTML = '';

    if (history.length === 0) {
      this.elements.historyContainer.innerHTML = `
        <div class="empty-state">
          <p>Your generation history will appear here</p>
        </div>
      `;
      return;
    }

    history.slice(0, 10).forEach(item => {
      const historyElement = this._createHistoryElement(item);
      this.elements.historyContainer.appendChild(historyElement);
    });
  }

  /**
   * Create history element
   * @param {Object} item - History item
   * @returns {HTMLElement} History element
   */
  _createHistoryElement(item) {
    const element = document.createElement('div');
    element.className = 'history-item';
    element.addEventListener('click', () => this._loadFromHistory(item));

    const header = document.createElement('div');
    header.className = 'history-item-header';

    const prompt = document.createElement('div');
    prompt.className = 'history-prompt';
    prompt.textContent = item.prompt.length > 60
      ? item.prompt.substring(0, 60) + '...'
      : item.prompt;

    const date = document.createElement('div');
    date.className = 'history-date';
    date.textContent = item.date;

    header.appendChild(prompt);
    header.appendChild(date);

    const details = document.createElement('div');
    details.className = 'history-details';

    const size = document.createElement('span');
    size.textContent = item.options.size;

    const quality = document.createElement('span');
    quality.textContent = item.options.quality;

    details.appendChild(size);
    details.appendChild(quality);

    element.appendChild(header);
    element.appendChild(details);

    return element;
  }

  /**
   * Load from history
   * @param {Object} item - History item
   */
  _loadFromHistory(item) {
    this.elements.promptTextarea.value = item.prompt;
    this.elements.imageSizeSelect.value = item.options.size;
    this.elements.qualitySelect.value = item.options.quality;
    this.elements.numImagesInput.value = item.options.numImages || 1;

    // Smooth scroll to prompt textarea
    this.elements.promptTextarea.scrollIntoView({ behavior: 'smooth' });
    this.elements.promptTextarea.focus();
  }

  /**
   * Download image
   * @param {Object} result - Result object
   * @param {number} index - Result index
   */
  _downloadImage(result, index) {
    const link = document.createElement('a');
    link.download = `banana4all-${Date.now()}-${index}.svg`;
    link.href = `data:image/svg+xml;base64,${result.imageData}`;
    link.click();
  }

  /**
   * Copy image to clipboard
   * @param {Object} result - Result object
   * @param {number} index - Result index
   */
  async _copyImage(result, index) {
    try {
      const blob = new Blob([atob(result.imageData)], { type: 'image/svg+xml' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/svg+xml': blob })
      ]);
      this._showSuccess('Image copied to clipboard!');
    } catch (error) {
      this._showError('Failed to copy image to clipboard');
    }
  }

  /**
   * Update usage statistics
   * @param {Object} generation - Generation data
   */
  async _updateUsageStats(generation) {
    const stats = await this.storageManager.getUsageStats();
    stats.totalGenerations++;
    stats.totalImages++;
    stats.averageGenerationTime =
      (stats.averageGenerationTime * (stats.totalGenerations - 1) + generation.generationTime) /
      stats.totalGenerations;

    await this.storageManager.updateUsageStats(stats);
  }

  /**
   * Apply preferences to UI
   * @param {Object} preferences - User preferences
   */
  _applyPreferences(preferences) {
    // Apply theme
    if (preferences.theme === 'light') {
      document.body.classList.add('light-theme');
    }

    // Apply default settings
    this.elements.imageSizeSelect.value = preferences.defaultImageSize || '1024x1024';
    this.elements.qualitySelect.value = preferences.imageQuality || 'standard';
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  _handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'Enter':
          if (!this.isLoading) {
            event.preventDefault();
            this._handleGenerate();
          }
          break;
        case 'Delete':
          event.preventDefault();
          this.elements.promptTextarea.value = '';
          break;
        case ',':
          event.preventDefault();
          this._showSettings();
          break;
      }
    }
  }

  /**
   * Show modal
   * @param {string} type - Modal type ('loading', 'error', 'success')
   * @param {string} message - Modal message
   */
  _showModal(type, message) {
    const modal = this.elements[`${type}Modal`];
    const textElement = this.elements[`${type}Message`];

    if (textElement && message) {
      textElement.textContent = message;
    }

    modal.style.display = 'flex';

    // Reset progress for loading modal
    if (type === 'loading') {
      this.elements.progressFill.style.width = '0%';
    }
  }

  /**
   * Hide modal
   * @param {string} type - Modal type
   */
  _hideModal(type) {
    const modal = this.elements[`${type}Modal`];
    modal.style.display = 'none';
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  _showError(message) {
    this._showModal('error', message);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  _showSuccess(message) {
    this._showModal('success', message);
  }

  /**
   * Show help dialog
   */
  _showHelp() {
    const helpMessage = `
Banana4all Help:

1. Set up your Google AI API key in the API Configuration section
2. Enter a prompt describing the image you want to generate
3. Choose your preferred settings and click "Generate Images"
4. Generated images will appear in the Results section
5. Use the History section to view and reuse previous generations

Keyboard Shortcuts:
• Ctrl+Enter: Generate image
• Ctrl+Delete: Clear prompt
• Ctrl+,: Open settings

For more information, visit our documentation.
    `;
    alert(helpMessage);
  }

  /**
   * Show settings dialog
   */
  _showSettings() {
    alert('Settings dialog will be implemented soon.');
  }

  /**
   * Show about dialog
   */
  _showAbout() {
    const aboutMessage = `
Banana4all v1.0.0-beta

A free, open-source Photoshop plugin for Google Gemini Flash AI integration.

Made with ❤️ by the Banana4all Team

GitHub: https://github.com/yourusername/banana4all
License: MIT
    `;
    alert(aboutMessage);
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  _setLoading(loading) {
    this.isLoading = loading;
    this.elements.generateBtn.disabled = loading;

    if (loading) {
      this.elements.btnText.style.display = 'none';
      this.elements.btnLoading.style.display = 'inline';
    } else {
      this.elements.btnText.style.display = 'inline';
      this.elements.btnLoading.style.display = 'none';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
} else if (typeof window !== 'undefined') {
  window.UIController = UIController;
}