#!/usr/bin/env node

/**
 * Test Gemini 2.5 Flash Image generation via OpenRouter
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node test-gemini-image-gen.js YOUR_OPENROUTER_API_KEY');
  process.exit(1);
}

console.log('🧪 Testing Gemini 2.5 Flash Image generation...\n');

function testImageGeneration(model, prompt) {
  return new Promise((resolve, reject) => {
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
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
        'HTTP-Referer': 'https://github.com/test',
        'X-Title': 'Test'
      },
    };

    console.log(`📤 Sending request to: ${model}`);
    console.log(`📝 Prompt: "${prompt}"\n`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`📥 Response Status: ${res.statusCode}\n`);
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode !== 200) {
            console.error('❌ Error Response:');
            console.error(JSON.stringify(response, null, 2));
            resolve({ success: false, error: response });
            return;
          }
          
          console.log('✅ Success! Response structure:');
          console.log(JSON.stringify(response, null, 2).substring(0, 1000));
          
          // Check for image data
          if (response.choices && response.choices[0]) {
            const message = response.choices[0].message;
            console.log('\n📊 Message structure:');
            console.log(JSON.stringify(message, null, 2).substring(0, 500));
            
            // Check different possible locations for image data
            if (message.content) {
              console.log('\n📝 Content type:', typeof message.content);
              if (typeof message.content === 'string') {
                console.log('Content preview:', message.content.substring(0, 200));
              } else {
                console.log('Content structure:', JSON.stringify(message.content).substring(0, 200));
              }
            }
          }
          
          resolve({ success: true, response });
        } catch (e) {
          console.error('❌ Failed to parse response:', e.message);
          console.error('Raw response:', data.substring(0, 500));
          resolve({ success: false, error: e.message });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

async function runTests() {
  // Test 1: Gemini 2.5 Flash Image
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('TEST 1: Gemini 2.5 Flash Image\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await testImageGeneration(
    'google/gemini-2.5-flash-image',
    'Generate an image of a red apple on a white table'
  );
  
  console.log('\n\n═══════════════════════════════════════════════════════════\n');
  console.log('TEST 2: Gemini 2.5 Flash Image Preview\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  await testImageGeneration(
    'google/gemini-2.5-flash-image-preview',
    'Generate an image of a blue car'
  );
  
  console.log('\n\n✅ All tests complete!');
}

runTests().catch(console.error);
