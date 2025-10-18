#!/usr/bin/env node

/**
 * Banana4All Proxy Server
 * 
 * A lightweight local proxy that handles API requests for the Photoshop plugin.
 * This allows Photoshop to stay offline while the proxy handles external traffic.
 * 
 * Usage:
 *   node server.js
 *   or
 *   npm start (from proxy-server directory)
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';



// CORS headers for local development
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle OpenRouter API requests
 */
function handleOpenRouter(apiKey, model, prompt, imageData, res, mode = 'full', contentImage = null, maskImage = null) {
  const selectedModel = model || 'google/gemini-2.5-flash-image';

  // Build the request based on mode
  let requestBody;

  if (mode === 'inpaint' && imageData) {
    // Semantic inpainting mode - send cropped image with semantic prompt
    console.log(`[${new Date().toISOString()}] Semantic inpainting mode: image length ${imageData.length}`);
    
    requestBody = {
      model: selectedModel,
      modalities: ["image", "text"],
      n: 1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageData}`
              }
            }
          ]
        }
      ]
    };
  } else if (imageData) {
    // Image editing mode - use vision model with image input (legacy)
    requestBody = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageData}`
              }
            }
          ]
        }
      ]
    };
  } else {
    // Text-to-image generation
    // For Gemini 2.5 Flash Image, we need to explicitly request image generation
    // Prepend "Generate an image of" if not already present
    let imagePrompt = prompt;
    if (!prompt.toLowerCase().includes('generate') && !prompt.toLowerCase().includes('create') && !prompt.toLowerCase().includes('draw')) {
      imagePrompt = `Generate an image of ${prompt}`;
    }

    requestBody = {
      model: selectedModel,
      modalities: ["image"],  // Only request image output (text costs 100x more!)
      n: 1,  // Generate only 1 image (prevents duplicates)
      messages: [
        {
          role: 'user',
          content: imagePrompt
        }
      ]
    };
  }

  const body = JSON.stringify(requestBody);

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'HTTP-Referer': 'https://github.com/Aladin147/banana4all',
      'X-Title': 'Banana4All Photoshop Plugin'
    },
  };

  console.log(`[${new Date().toISOString()}] API Key format: ${apiKey.substring(0, 10)}...`);
  console.log(`[${new Date().toISOString()}] API Key length: ${apiKey.length}`);
  console.log(`[${new Date().toISOString()}] Forwarding to OpenRouter: ${selectedModel}`);
  console.log(`[${new Date().toISOString()}] Request body:`, JSON.stringify(requestBody, null, 2));

  if (!imageData) {
    const actualPrompt = requestBody.messages[0].content;
    console.log(`[${new Date().toISOString()}] Image generation prompt: "${actualPrompt}"`);
  }

  const req = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      console.log(`[${new Date().toISOString()}] OpenRouter response: ${apiRes.statusCode}`);

      if (apiRes.statusCode !== 200) {
        console.error(`[${new Date().toISOString()}] OpenRouter error:`, data);
        res.writeHead(apiRes.statusCode, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(data);
        return;
      }

      try {
        const response = JSON.parse(data);

        // Convert OpenRouter response to Gemini-like format
        const message = response.choices[0].message;
        const content = message.content;

        // Check if response contains an image URL or base64
        let imageBase64 = null;
        let mimeType = 'image/png';

        console.log(`[${new Date().toISOString()}] Content type: ${typeof content}`);

        // Method 1: Check for array content with image_url objects (OpenAI format)
        if (Array.isArray(content)) {
          console.log(`[${new Date().toISOString()}] Content is array with ${content.length} parts`);
          for (const part of content) {
            if (part.type === 'image_url' && part.image_url) {
              const url = part.image_url.url;
              if (url && url.startsWith('data:image')) {
                // Extract mime type and base64 data
                const match = url.match(/data:image\/([^;]+);base64,(.+)/);
                if (match) {
                  mimeType = `image/${match[1]}`;
                  imageBase64 = match[2];
                  console.log(`[${new Date().toISOString()}] Found image in array format (${mimeType})`);
                  break;
                }
              }
            }
            // Also check for inline_data format
            if (part.inline_data && part.inline_data.data) {
              imageBase64 = part.inline_data.data;
              mimeType = part.inline_data.mime_type || 'image/png';
              console.log(`[${new Date().toISOString()}] Found image in inline_data format (${mimeType})`);
              break;
            }
          }
        }
        // Method 2: Check for string content with data URL (THIS IS WHAT GEMINI 2.5 FLASH IMAGE RETURNS!)
        else if (typeof content === 'string') {
          console.log(`[${new Date().toISOString()}] Content is string, length: ${content.length}`);

          if (content.startsWith('data:image')) {
            const match = content.match(/data:image\/([^;]+);base64,(.+)/);
            if (match) {
              mimeType = `image/${match[1]}`;
              imageBase64 = match[2];
              console.log(`[${new Date().toISOString()}] Found image in string data URL format (${mimeType})`);
            }
          } else if (content.includes('data:image')) {
            // Try to extract from text
            const match = content.match(/data:image\/([^;]+);base64,([A-Za-z0-9+/=]+)/);
            if (match) {
              mimeType = `image/${match[1]}`;
              imageBase64 = match[2];
              console.log(`[${new Date().toISOString()}] Extracted image from text (${mimeType})`);
            }
          } else {
            // The content might be pure base64 without the data URL prefix
            // Check if it looks like base64 (only contains base64 characters)
            if (/^[A-Za-z0-9+/=]+$/.test(content) && content.length > 100) {
              imageBase64 = content;
              console.log(`[${new Date().toISOString()}] Content appears to be raw base64 data`);
            }
          }
        }

        // Method 3: Check for images array (OpenRouter format with modalities)
        if (!imageBase64 && message.images && Array.isArray(message.images) && message.images.length > 0) {
          console.log(`[${new Date().toISOString()}] Checking images array with ${message.images.length} images`);
          const firstImage = message.images[0];
          console.log(`[${new Date().toISOString()}] First image structure:`, JSON.stringify(firstImage).substring(0, 200));
          
          if (firstImage.image_url && firstImage.image_url.url) {
            const url = firstImage.image_url.url;
            console.log(`[${new Date().toISOString()}] Image URL length: ${url.length}, starts with: ${url.substring(0, 50)}`);
            
            if (url.startsWith('data:image')) {
              const match = url.match(/data:image\/([^;]+);base64,(.+)/);
              if (match) {
                mimeType = `image/${match[1]}`;
                imageBase64 = match[2];
                console.log(`[${new Date().toISOString()}] Found image in images array (${mimeType}), base64 length: ${imageBase64.length}`);
              } else {
                console.log(`[${new Date().toISOString()}] URL didn't match base64 pattern`);
              }
            } else {
              console.log(`[${new Date().toISOString()}] URL doesn't start with data:image`);
            }
          } else {
            console.log(`[${new Date().toISOString()}] No image_url.url found in first image`);
          }
        }

        // Method 4: Check for direct image field
        if (!imageBase64 && message.image) {
          imageBase64 = message.image;
          console.log(`[${new Date().toISOString()}] Found image in direct field`);
        }

        if (imageBase64) {
          // Return in Gemini-compatible format
          const geminiFormat = {
            candidates: [{
              content: {
                parts: [{
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                  }
                }]
              }
            }]
          };

          console.log(`[${new Date().toISOString()}] Successfully converted to Gemini format, base64 data length: ${imageBase64.length}`);
          res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify(geminiFormat));
        } else {
          console.error(`[${new Date().toISOString()}] No image found in response`);
          console.error(`[${new Date().toISOString()}] Content type:`, typeof content);
          console.error(`[${new Date().toISOString()}] Content preview:`, JSON.stringify(content).substring(0, 200));

          res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'No image data in response',
            details: 'The model did not return an image. Try a different model or check the response format.',
            contentType: typeof content,
            contentPreview: JSON.stringify(content).substring(0, 200)
          }));
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error parsing OpenRouter response:`, error);
        res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Failed to parse response',
          details: error.message
        }));
      }
    });
  });

  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Error connecting to OpenRouter:`, error);
    res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to connect to OpenRouter',
      details: error.message
    }));
  });

  req.write(body);
  req.end();
}

/**
 * Handle Google AI API requests (fallback)
 */
function handleGoogleAI(apiKey, model, prompt, imageData, res) {
  const geminiModel = model || 'gemini-2.5-flash-image-preview';
  const geminiPath = `/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const geminiBody = {
    contents: [{
      parts: []
    }]
  };

  if (prompt) {
    geminiBody.contents[0].parts.push({ text: prompt });
  }

  if (imageData) {
    geminiBody.contents[0].parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imageData
      }
    });
  }

  const body = JSON.stringify(geminiBody);

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: geminiPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  console.log(`[${new Date().toISOString()}] Forwarding to Google AI: ${geminiPath}`);

  const req = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      console.log(`[${new Date().toISOString()}] Google AI response: ${apiRes.statusCode}`);

      if (apiRes.statusCode !== 200) {
        console.error(`[${new Date().toISOString()}] Google AI error:`, data);
      }

      res.writeHead(apiRes.statusCode, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(data);
    });
  });

  req.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Error connecting to Google AI:`, error);
    res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to connect to Google AI',
      details: error.message
    }));
  });

  req.write(body);
  req.end();
}

/**
 * Handle incoming requests
 */
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  // Parse URL
  const parsedUrl = url.parse(req.url, true);

  // Health check endpoint
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Banana4All Proxy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // API proxy endpoint
  if (parsedUrl.pathname === '/api/generate' && req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        const { apiKey, model, prompt, imageData, provider, mode, contentImage, maskImage, bounds } = requestData;

        if (!apiKey) {
          res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API key is required' }));
          return;
        }

        // Validate inpainting requests (semantic inpainting uses imageData, not contentImage/maskImage)
        if (mode === 'inpaint') {
          if (!imageData) {
            res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Semantic inpainting requires imageData (cropped region)' 
            }));
            return;
          }

          // Validate base64 format
          const base64Regex = /^[A-Za-z0-9+/=]+$/;
          if (!base64Regex.test(imageData)) {
            res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Invalid imageData format - must be base64' 
            }));
            return;
          }

          console.log(`[${new Date().toISOString()}] Semantic inpainting request validated`);
          if (bounds) {
            console.log(`[${new Date().toISOString()}] Selection bounds: ${bounds.width}x${bounds.height} at (${bounds.left}, ${bounds.top})`);
          }
        }

        console.log(`[${new Date().toISOString()}] Request from plugin: ${prompt ? prompt.substring(0, 50) : 'image edit'}...`);
        console.log(`[${new Date().toISOString()}] Mode: ${mode || 'full'}, Provider: ${provider || 'openrouter'}, Model: ${model}`);

        // Route to appropriate provider
        if (provider === 'openrouter' || !provider) {
          handleOpenRouter(apiKey, model, prompt, imageData, res, mode, contentImage, maskImage);
        } else if (provider === 'google') {
          handleGoogleAI(apiKey, model, prompt, imageData, res);
        } else {
          res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Unknown provider: ${provider}` }));
        }

      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error parsing request:`, error);
        res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Invalid request format',
          details: error.message
        }));
      }
    });

    return;
  }

  // Unknown endpoint
  res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    availableEndpoints: ['/health', '/api/generate']
  }));
});

// Start server
server.listen(PORT, 'localhost', () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║           🍌 Banana4All Proxy Server Running 🍌           ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Local:    http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
  console.log(`  API:      http://localhost:${PORT}/api/generate`);
  console.log('');
  console.log('  Privacy: ✅ Photoshop stays offline');
  console.log('  Control: ✅ Only this process accesses the internet');
  console.log('  Security: ✅ API keys never leave your machine');
  console.log('');
  console.log('  Press Ctrl+C to stop the server');
  console.log('');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Server stopped. Goodbye! 🍌\n');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});
