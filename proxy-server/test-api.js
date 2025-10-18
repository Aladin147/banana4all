#!/usr/bin/env node

/**
 * Test script to verify OpenRouter API key
 * Usage: node test-api.js YOUR_API_KEY
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node test-api.js YOUR_API_KEY');
  process.exit(1);
}

console.log('Testing OpenRouter API key...');
console.log(`API Key: ${apiKey.substring(0, 10)}...`);
console.log(`API Key length: ${apiKey.length}`);

const requestBody = {
  model: 'google/gemini-2.5-flash-image',
  modalities: ['image'],
  n: 1,
  messages: [
    {
      role: 'user',
      content: 'Generate an image of a simple red circle'
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
    'X-Title': 'Banana4All Test Script'
  },
};

console.log('\nSending request to OpenRouter...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Response status: ${res.statusCode}`);
    console.log(`Response headers:`, res.headers);
    console.log(`\nResponse body:`);
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ API key is valid and working!');
      } else {
        console.log('\n❌ API request failed. Check the error above.');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.write(body);
req.end();
