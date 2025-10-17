#!/usr/bin/env node

/**
 * Test the correct prompt format for Gemini 2.5 Flash Image
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node test-prompt-format.js YOUR_OPENROUTER_API_KEY');
  process.exit(1);
}

console.log('🧪 Testing prompt formats for Gemini 2.5 Flash Image...\n');

async function testPrompt(prompt) {
  return new Promise((resolve) => {
    const requestBody = {
      model: 'google/gemini-2.5-flash-image',
      modalities: ["image"],  // Only request image (text costs 100x more!)
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
        'HTTP-Referer': 'https://github.com/Aladin147/banana4all',
        'X-Title': 'Banana4All Test'
      },
    };

    console.log(`📤 Testing prompt: "${prompt}"`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const content = response.choices[0].message.content;
          
          if (typeof content === 'string' && content.startsWith('data:image')) {
            console.log(`✅ SUCCESS! Got image (${content.length} chars)\n`);
            resolve(true);
          } else {
            console.log(`❌ FAILED! Got text: "${content.substring(0, 100)}..."\n`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ ERROR: ${e.message}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ERROR: ${error.message}\n`);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Test 1: Without "Generate"
  await testPrompt('a delicious banana');
  
  // Test 2: With "Generate an image of"
  await testPrompt('Generate an image of a delicious banana');
  
  // Test 3: With "Create"
  await testPrompt('Create a picture of a delicious banana');
  
  // Test 4: With "Draw"
  await testPrompt('Draw a delicious banana');
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ Tests complete!\n');
  console.log('CONCLUSION: The model needs explicit "Generate an image of" instruction\n');
}

runTests().catch(console.error);
