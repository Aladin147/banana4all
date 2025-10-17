const { app } = require('photoshop');
const PhotoshopUtils = require('./photoshop-utils');

// API client
class AIImageClient {
  constructor(apiKey, proxyUrl = 'http://localhost:3000', provider = 'openrouter', model = null) {
    this.apiKey = apiKey;
    this.proxyUrl = proxyUrl;
    this.provider = provider;
    this.model = model;
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
      const timeoutId = setTimeout(() => controller.abort(), 2000);
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
}

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const promptInput = document.getElementById('prompt');
  const generateButton = document.getElementById('generate');
  
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

  generateButton.addEventListener('click', async () => {
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
      
      const client = new AIImageClient(apiKey, 'http://localhost:3000', 'openrouter', selectedModel);
      
      // Check proxy
      const proxyHealthy = await client.checkProxyHealth();
      if (!proxyHealthy) {
        throw new Error('Proxy server not running. Start it with: cd proxy-server && npm start');
      }
      
      // Generate image
      const layerName = `AI: ${prompt.substring(0, 30)}`;
      console.log('Generating image with prompt:', prompt);
      const result = await client.generateImage(prompt);
      
      // Create layer with the generated image
      console.log('Creating layer with image blob, size:', result.imageBlob.size);
      await PhotoshopUtils.createImageLayer(result.imageBlob, layerName);

    } catch (error) {
      console.error('Generation error:', error);
      let errorMessage = error.message;
      
      if (errorMessage.includes('API key') || errorMessage.includes('API_KEY_INVALID')) {
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
