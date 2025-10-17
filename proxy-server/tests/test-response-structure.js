#!/usr/bin/env node

/**
 * Test to see the EXACT response structure from OpenRouter
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node test-response-structure.js YOUR_OPENROUTER_API_KEY');
  process.exit(1);
}

console.log('🔍 Testing exact response structure from OpenRouter...\n');

const requestBody = {
  model: 'google/gemini-2.5-flash-image',
  modalities: ["image"],
  messages: [
    {
      role: 'user',
      content: 'Generate an image of a red apple'
    }
  ]
};

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
    'X-Title': 'Banana4All Test'
  },
};

console.log('📤 Sending request...\n');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`📥 Status: ${res.statusCode}\n`);
    
    try {
      const response = JSON.parse(data);
      const message = response.choices[0].message;
      
      console.log('📊 RESPONSE STRUCTURE:\n');
      console.log('Message keys:', Object.keys(message));
      console.log('');
      
      if (message.content) {
        console.log('✓ message.content exists');
        console.log('  Type:', typeof message.content);
        console.log('  Length:', message.content.length);
        console.log('  Preview:', message.content.substring(0, 100));
        console.log('');
      }
      
      if (message.images) {
        console.log('✓ message.images exists');
        console.log('  Type:', Array.isArray(message.images) ? 'array' : typeof message.images);
        console.log('  Length:', message.images.length);
        console.log('');
        
        if (message.images.length > 0) {
          const firstImage = message.images[0];
          console.log('  First image keys:', Object.keys(firstImage));
          console.log('');
          
          if (firstImage.image_url) {
            console.log('  ✓ firstImage.image_url exists');
            console.log('    Keys:', Object.keys(firstImage.image_url));
            
            if (firstImage.image_url.url) {
              const url = firstImage.image_url.url;
              console.log('    ✓ url exists');
              console.log('      Length:', url.length);
              console.log('      Starts with:', url.substring(0, 50));
              console.log('      Contains base64:', url.includes('base64'));
              
              // Try to extract base64
              if (url.startsWith('data:image')) {
                const match = url.match(/data:image\/([^;]+);base64,(.+)/);
                if (match) {
                  console.log('      ✅ Successfully extracted base64!');
                  console.log('      Mime type:', match[1]);
                  console.log('      Base64 length:', match[2].length);
                  console.log('      Base64 preview:', match[2].substring(0, 50));
                } else {
                  console.log('      ❌ Could not extract base64 with regex');
                }
              }
            }
          }
        }
      }
      
      console.log('\n📄 FULL RESPONSE (first 1000 chars):');
      console.log(JSON.stringify(response, null, 2).substring(0, 1000));
      
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(body);
req.end();
