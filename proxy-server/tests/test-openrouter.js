#!/usr/bin/env node

/**
 * Test script to verify OpenRouter API key
 * Usage: node test-openrouter.js YOUR_API_KEY
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node test-openrouter.js YOUR_API_KEY');
  process.exit(1);
}

console.log('Testing OpenRouter API key...');
console.log('Key format:', apiKey.substring(0, 15) + '...');

const requestBody = {
  model: 'google/gemini-2.5-flash-image-preview:free',
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
    console.log('Status Code:', res.statusCode);
    console.log('\nResponse:');
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS! Your API key works!');
      } else if (res.statusCode === 401) {
        console.log('\n❌ ERROR: Invalid API key or authentication failed');
        console.log('Please check:');
        console.log('1. Your API key is correct (starts with sk-or-v1-)');
        console.log('2. You copied the entire key');
        console.log('3. The key is active at https://openrouter.ai/keys');
      } else {
        console.log('\n⚠️  Unexpected response');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
});

req.write(body);
req.end();
