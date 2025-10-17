#!/usr/bin/env node

const https = require('https');

const apiKey = process.argv[2] || process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: No API key provided!');
  console.error('\nUsage:');
  console.error('  node test-image-gen.js YOUR_API_KEY');
  console.error('  OR set OPENROUTER_API_KEY environment variable');
  console.error('\nGet your key at: https://openrouter.ai/keys');
  process.exit(1);
}

console.log('Testing image generation with google/gemini-2.5-flash-image...\n');

const requestBody = {
  model: 'google/gemini-2.5-flash-image',
  modalities: ["image"],  // Only request image output (text costs 100x more!)
  messages: [
    {
      role: 'user',
      content: 'Generate an image of a red apple on a white table'
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

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('\nFull Response:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.choices && parsed.choices[0]) {
        console.log('\n\n📊 Response Analysis:');
        console.log('- Message role:', parsed.choices[0].message.role);
        console.log('- Content type:', typeof parsed.choices[0].message.content);
        
        if (parsed.choices[0].message.images) {
          console.log('- Images array found with', parsed.choices[0].message.images.length, 'images');
          parsed.choices[0].message.images.forEach((img, i) => {
            if (img.image_url && img.image_url.url) {
              const url = img.image_url.url;
              console.log(`  Image ${i}: ${url.substring(0, 50)}... (${url.length} chars)`);
            }
          });
        }
        
        if (Array.isArray(parsed.choices[0].message.content)) {
          console.log('- Content is array with', parsed.choices[0].message.content.length, 'items');
          parsed.choices[0].message.content.forEach((item, i) => {
            console.log(`  Item ${i}:`, Object.keys(item));
          });
        }
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(body);
req.end();
