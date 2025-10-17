#!/usr/bin/env node

/**
 * Research script to understand OpenRouter's image generation capabilities
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Usage: node research-openrouter.js YOUR_API_KEY');
  process.exit(1);
}

console.log('🔍 Researching OpenRouter API...\n');

// Function to make API requests
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'openrouter.ai',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function research() {
  // 1. Get list of all models
  console.log('📋 Step 1: Fetching all available models...\n');
  const modelsResponse = await makeRequest('/api/v1/models');
  
  if (modelsResponse.status === 200 && modelsResponse.data.data) {
    const models = modelsResponse.data.data;
    console.log(`Found ${models.length} models\n`);
    
    // Filter for image-related models
    console.log('🎨 Image Generation Models:\n');
    const imageModels = models.filter(m => 
      m.id.includes('dall-e') || 
      m.id.includes('stable-diffusion') || 
      m.id.includes('flux') ||
      m.id.includes('imagen') ||
      m.id.includes('midjourney') ||
      (m.architecture && m.architecture.modality && m.architecture.modality.includes('image'))
    );
    
    imageModels.forEach(m => {
      console.log(`  - ${m.id}`);
      console.log(`    Name: ${m.name}`);
      if (m.pricing) {
        console.log(`    Pricing: $${m.pricing.prompt} per prompt, $${m.pricing.completion} per completion`);
      }
      if (m.architecture) {
        console.log(`    Modality: ${m.architecture.modality}`);
      }
      console.log('');
    });
    
    // 2. Test a simple text generation to understand response format
    console.log('\n📝 Step 2: Testing basic chat completion...\n');
    const chatTest = await makeRequest('/api/v1/chat/completions', 'POST', {
      model: 'google/gemini-flash-1.5-8b',
      messages: [{ role: 'user', content: 'Say hello' }]
    });
    
    console.log('Chat Response Status:', chatTest.status);
    console.log('Chat Response Structure:');
    console.log(JSON.stringify(chatTest.data, null, 2).substring(0, 500));
    
    // 3. Test image generation with DALL-E if available
    if (imageModels.some(m => m.id.includes('dall-e'))) {
      console.log('\n\n🎨 Step 3: Testing DALL-E image generation...\n');
      const dalleTest = await makeRequest('/api/v1/chat/completions', 'POST', {
        model: 'openai/dall-e-3',
        messages: [{ role: 'user', content: 'A red apple on a white table' }],
        max_tokens: 1000
      });
      
      console.log('DALL-E Response Status:', dalleTest.status);
      console.log('DALL-E Response:');
      console.log(JSON.stringify(dalleTest.data, null, 2));
    }
    
    // 4. Check if there's a specific images endpoint
    console.log('\n\n🔍 Step 4: Checking for images endpoint...\n');
    const imagesTest = await makeRequest('/api/v1/images/generations', 'POST', {
      model: 'openai/dall-e-3',
      prompt: 'A red apple',
      n: 1,
      size: '1024x1024'
    });
    
    console.log('Images Endpoint Status:', imagesTest.status);
    if (imagesTest.status === 200) {
      console.log('Images Endpoint Response:');
      console.log(JSON.stringify(imagesTest.data, null, 2));
    } else {
      console.log('Images endpoint not available or different format');
      console.log('Response:', JSON.stringify(imagesTest.data, null, 2).substring(0, 300));
    }
    
  } else {
    console.log('Failed to fetch models:', modelsResponse);
  }
  
  console.log('\n\n✅ Research complete!');
  console.log('\nKey Findings:');
  console.log('- Check the output above to understand:');
  console.log('  1. Which image models are available');
  console.log('  2. How responses are structured');
  console.log('  3. Whether there\'s a dedicated images endpoint');
  console.log('  4. How to properly request image generation');
}

research().catch(console.error);
