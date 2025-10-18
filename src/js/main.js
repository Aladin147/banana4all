const { app } = require('photoshop');
const PhotoshopUtils = require('./photoshop-utils');
const CONFIG = require('../config');

// API client
class AIImageClient {
  constructor(apiKey, proxyUrl = CONFIG.api.defaultProxyUrl, provider = CONFIG.api.defaultProvider, model = null) {
    this.apiKey = apiKey;
    this.proxyUrl = proxyUrl;
    this.provider = provider;
    this.model = model || CONFIG.api.defaultModel;
  }

  async generateImage(prompt) {
    const response = await fetch(`${this.proxyUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        model: this.model,
        prompt: prompt,
        provider: this.provider
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        // Handle nested error object
        if (errorData.error && typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || JSON.stringify(errorData.error);
        } else {
          errorMessage = errorData.error || errorData.message || 'Unknown error';
        }
        console.error('Proxy error:', errorData);
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`${errorMessage}`);
    }

    const data = await response.json();
    
    // Extract image from Gemini response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data || part.inlineData) {
          const imageData = part.inline_data || part.inlineData;
          const base64Data = imageData.data;
          const mimeType = imageData.mime_type || imageData.mimeType || 'image/jpeg';
          
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          
          return { imageBlob: blob, prompt: prompt };
        }
      }
    }
    
    throw new Error('No image data returned from API');
  }

  async checkProxyHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.proxyHealthTimeout);
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

  async inpaintSelection(prompt, contentBlob, maskBlob, bounds) {
    // Check size and warn if too large
    const sizeMB = contentBlob.size / (1024 * 1024);
    console.log(`Content size: ${sizeMB.toFixed(2)}MB`);
    
    if (sizeMB > 10) {
      console.warn('Image is too large for API (>10MB). Consider using smaller selections.');
      // TODO: Implement automatic downscaling
    }
    
    // Convert content to base64
    const contentBase64 = await this.blobToBase64(contentBlob);
    
    // Build semantic inpainting prompt using template from config
    const semanticPrompt = CONFIG.phase2.promptTemplate.replace('{PROMPT}', prompt);
    console.log(`Semantic inpainting prompt: ${semanticPrompt}`);

    const response = await fetch(`${this.proxyUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: this.apiKey,
        model: this.model,
        prompt: semanticPrompt,
        provider: this.provider,
        mode: 'inpaint', // Use inpaint mode for proper formatting
        imageData: contentBase64, // Send cropped selection
        bounds: bounds
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        if (errorData.error && typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || JSON.stringify(errorData.error);
        } else {
          errorMessage = errorData.error || errorData.message || 'Unknown error';
        }
        console.error('Inpainting error:', errorData);
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(`${errorMessage}`);
    }

    const data = await response.json();
    
    // Extract image from Gemini response (same format as generateImage)
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inline_data || part.inlineData) {
          const imageData = part.inline_data || part.inlineData;
          const base64Data = imageData.data;
          const mimeType = imageData.mime_type || imageData.mimeType || 'image/jpeg';
          
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          
          return { 
            imageBlob: blob, 
            prompt: prompt,
            mode: 'inpaint',
            bounds: bounds
          };
        }
      }
    }
    
    throw new Error('No image data returned from API');
  }

  async generateVariants(prompt, count, mode = 'full', contentBlob = null, maskBlob = null, bounds = null) {
    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating variant ${i + 1} of ${count}...`);
        
        let result;
        if (mode === 'inpaint' && contentBlob && maskBlob && bounds) {
          result = await this.inpaintSelection(prompt, contentBlob, maskBlob, bounds);
        } else {
          result = await this.generateImage(prompt);
        }

        result.variantIndex = i + 1;
        result.mode = mode;
        results.push(result);

        console.log(`Variant ${i + 1} completed in ${Date.now() - startTime}ms`);
      } catch (error) {
        console.error(`Error generating variant ${i + 1}:`, error);
        // Continue with other variants even if one fails
        // Return partial results
      }
    }

    if (results.length === 0) {
      throw new Error('All variant generations failed');
    }

    return results;
  }

  async blobToBase64(blob) {
    // UXP doesn't have FileReader, use arrayBuffer instead
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Mode Manager for handling selection-aware UI state
class ModeManager {
  constructor() {
    this.currentMode = CONFIG.phase2.defaultMode; // 'full' | 'inpaint'
    this.hasSelection = false;
    this.variantCount = 1;
    this.selectionCheckInterval = null;
  }

  async updateMode() {
    // Check if there's an active selection
    this.hasSelection = await PhotoshopUtils.hasActiveSelection();
    this.updateUI();
  }

  getMode() {
    // Return 'inpaint' only if selection exists AND user has selected inpaint mode
    const effectiveMode = this.hasSelection && this.currentMode === 'inpaint' ? 'inpaint' : 'full';
    console.log(`getMode: hasSelection=${this.hasSelection}, currentMode=${this.currentMode}, returning=${effectiveMode}`);
    return effectiveMode;
  }

  setMode(mode) {
    console.log(`ModeManager.setMode called with: ${mode}`);
    this.currentMode = mode;
    if (CONFIG.phase2.rememberMode) {
      localStorage.setItem('banana4all_mode', mode);
    }
    this.updateUI();
    console.log(`Mode is now: ${this.currentMode}`);
  }

  loadSavedMode() {
    if (CONFIG.phase2.rememberMode) {
      const savedMode = localStorage.getItem('banana4all_mode');
      if (savedMode) {
        this.currentMode = savedMode;
      }
    }
  }

  updateUI() {
    // Update mode hint based on selection
    const modeHint = document.getElementById('mode-hint');

    if (!modeHint) {
      return; // UI not ready yet
    }

    // Automatically set mode based on selection
    if (this.hasSelection) {
      this.currentMode = 'inpaint';
      modeHint.textContent = '✂️ Selection detected - Will inpaint into selected area';
      modeHint.style.color = '#f59e0b';
      modeHint.style.fontSize = '12px';
    } else {
      this.currentMode = 'full';
      modeHint.textContent = '🖼️ No selection - Will generate new layer';
      modeHint.style.color = '#999';
      modeHint.style.fontSize = '12px';
    }
  }

  startSelectionMonitoring() {
    // Check for selection changes every 500ms
    this.selectionCheckInterval = setInterval(async () => {
      await this.updateMode();
    }, 500);
  }

  stopSelectionMonitoring() {
    if (this.selectionCheckInterval) {
      clearInterval(this.selectionCheckInterval);
      this.selectionCheckInterval = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const promptInput = document.getElementById('prompt');
  const generateButton = document.getElementById('generate');
  const variantCountSelect = document.getElementById('variantCount');
  
  // Initialize ModeManager
  const modeManager = new ModeManager();
  // Don't load saved mode - always auto-detect based on selection
  
  // Load saved API key
  const savedApiKey = localStorage.getItem('banana4all_api_key');
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }

  // Save API key on change
  const saveApiKey = () => {
    const key = apiKeyInput.value ? apiKeyInput.value.trim() : '';
    if (key) {
      localStorage.setItem('banana4all_api_key', key);
      console.log('API key saved');
    }
  };

  apiKeyInput.addEventListener('change', saveApiKey);
  apiKeyInput.addEventListener('input', saveApiKey);

  // Variant count change listener
  variantCountSelect.addEventListener('change', () => {
    modeManager.variantCount = parseInt(variantCountSelect.value);
    console.log('Variant count set to:', modeManager.variantCount);
  });

  // Initial mode update and start monitoring
  (async () => {
    await modeManager.updateMode();
    modeManager.startSelectionMonitoring();
  })();

  generateButton.addEventListener('click', async () => {
    // Prevent duplicate clicks
    if (generateButton.disabled) {
      console.log('Button already disabled, ignoring click');
      return;
    }

    // Get values from Spectrum components
    const apiKey = apiKeyInput.value ? apiKeyInput.value.trim() : '';
    const prompt = promptInput.value ? promptInput.value.trim() : '';
    const selectedModel = 'google/gemini-2.5-flash-image';
    
    console.log('Generate clicked');
    console.log('API Key length:', apiKey.length);
    console.log('Prompt:', prompt);

    if (!apiKey || !prompt) {
      await app.showAlert('Please enter your OpenRouter API key and a prompt.');
      return;
    }

    if (!app.activeDocument) {
      await app.showAlert('Please open a document first.');
      return;
    }

    try {
      generateButton.disabled = true;
      generateButton.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
      
      const client = new AIImageClient(apiKey, CONFIG.api.defaultProxyUrl, CONFIG.api.defaultProvider, selectedModel);
      
      // Check proxy
      const proxyHealthy = await client.checkProxyHealth();
      if (!proxyHealthy) {
        throw new Error('Proxy server not running. Start it with: cd proxy-server && npm start');
      }
      
      // Get current mode
      const mode = modeManager.getMode();
      console.log(`Generation mode: ${mode}`);
      
      let result;
      let position = null;
      
      if (mode === 'inpaint') {
        // Semantic inpainting: crop to selection + padding, send to Gemini, composite back
        console.log('Starting semantic inpainting workflow...');
        
        // Check if selection exists
        const hasSelection = await PhotoshopUtils.hasActiveSelection();
        if (!hasSelection) {
          throw new Error('No active selection found. Please create a selection first.');
        }
        
        // Get selection bounds with padding
        const bounds = await PhotoshopUtils.getSelectionBounds();
        const padding = CONFIG.phase2.selectionPadding;
        const paddedBounds = {
          left: Math.max(0, bounds.left - padding),
          top: Math.max(0, bounds.top - padding),
          width: bounds.width + (padding * 2),
          height: bounds.height + (padding * 2)
        };
        
        console.log(`Selection: ${bounds.width}x${bounds.height} at (${bounds.left}, ${bounds.top})`);
        console.log(`Padded crop: ${paddedBounds.width}x${paddedBounds.height} at (${paddedBounds.left}, ${paddedBounds.top})`);
        
        // Save selection to channel for later mask creation
        await PhotoshopUtils.saveSelectionToChannel('banana4all_temp');
        console.log('Selection saved to channel');
        
        // Export tight crop around selection (with padding)
        const croppedBlob = await PhotoshopUtils.exportCroppedRegion(paddedBounds);
        console.log(`Cropped region exported: ${croppedBlob.size} bytes (${(croppedBlob.size / (1024 * 1024)).toFixed(2)} MB)`);
        
        // Generate with semantic inpainting
        // Gemini will edit the crop and return it (may be different size)
        result = await client.inpaintSelection(prompt, croppedBlob, null, bounds);
        
        // Store expected dimensions for resizing
        result.expectedWidth = paddedBounds.width;
        result.expectedHeight = paddedBounds.height;
        
        // Place at padded bounds coordinates (composite back)
        position = {
          x: paddedBounds.left,
          y: paddedBounds.top
        };
        
        console.log(`Will composite result at position (${position.x}, ${position.y})`);
        console.log(`Expected dimensions: ${paddedBounds.width}x${paddedBounds.height}`);
      } else {
        // Full image generation mode
        console.log('Generating full image...');
        result = await client.generateImage(prompt);
      }
      
      // Create layer with the generated image
      const layerName = `${CONFIG.photoshop.defaultLayerNamePrefix}${prompt.substring(0, 30)}`;
      console.log('Creating layer with image blob, size:', result.imageBlob.size);
      
      // For inpaint mode, pass expected dimensions for resizing
      const expectedDimensions = mode === 'inpaint' ? {
        width: result.expectedWidth,
        height: result.expectedHeight
      } : null;
      
      const layer = await PhotoshopUtils.createImageLayer(result.imageBlob, layerName, position, expectedDimensions);
      
      // Create layer mask for inpaint mode
      if (mode === 'inpaint') {
        console.log('Creating layer mask from selection...');
        try {
          // Restore selection from channel
          await PhotoshopUtils.restoreSelectionFromChannel('banana4all_temp');
          console.log('Selection restored, creating mask...');
          
          // Don't check hasActiveSelection (causes nested modal) - just try to create mask
          await PhotoshopUtils.createLayerMaskFromSelection(layer, CONFIG.phase2.autoFeatherRadius);
          console.log('Layer mask created with feathering');
          
          // Clean up the temporary channel
          await PhotoshopUtils.deleteChannel('banana4all_temp');
        } catch (maskError) {
          console.error('Failed to create layer mask:', maskError);
          try {
            await PhotoshopUtils.deleteChannel('banana4all_temp');
          } catch (cleanupError) {
            console.error('Failed to clean up channel:', cleanupError);
          }
        }
      }
      
      console.log('Generation complete!');

    } catch (error) {
      console.error('Generation error:', error);
      let errorMessage = error.message;
      
      if (errorMessage.includes('User not found') || errorMessage.includes('401')) {
        errorMessage = 'Invalid API key or account not found. Please:\n1. Verify your OpenRouter API key at openrouter.ai/keys\n2. Make sure your account is active\n3. Try generating a new API key';
      } else if (errorMessage.includes('API key') || errorMessage.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = 'API quota exceeded. Please check your billing.';
      } else if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
        errorMessage = 'Content blocked by safety filters. Please modify your prompt.';
      }
      
      await app.showAlert(`Error: ${errorMessage}`);
    } finally {
      generateButton.disabled = false;
      generateButton.innerHTML = '<span class="btn-icon">✨</span> Generate';
    }
  });
});
