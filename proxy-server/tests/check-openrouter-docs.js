#!/usr/bin/env node

/**
 * Check OpenRouter documentation for image generation
 */

const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function checkDocs() {
  console.log('📚 Checking OpenRouter documentation...\n');
  
  // Check the docs page
  try {
    const docsHtml = await fetchPage('https://openrouter.ai/docs/responses');
    
    // Look for image-related content
    const imageMatches = docsHtml.match(/image[^<]{0,200}/gi);
    if (imageMatches) {
      console.log('Found image-related documentation:');
      imageMatches.slice(0, 10).forEach(match => {
        console.log('  -', match.substring(0, 150));
      });
    }
    
    // Look for content structure
    const contentMatches = docsHtml.match(/content[^<]{0,200}/gi);
    if (contentMatches) {
      console.log('\nFound content structure documentation:');
      contentMatches.slice(0, 10).forEach(match => {
        console.log('  -', match.substring(0, 150));
      });
    }
    
  } catch (e) {
    console.log('Could not fetch docs:', e.message);
  }
  
  // Check model-specific info
  console.log('\n\n📋 Checking model-specific information...\n');
  
  const modelsReq = await new Promise((resolve) => {
    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/models',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    
    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null)).end();
  });
  
  if (modelsReq && modelsReq.data) {
    const geminiImage = modelsReq.data.find(m => m.id === 'google/gemini-2.5-flash-image');
    if (geminiImage) {
      console.log('Gemini 2.5 Flash Image details:');
      console.log(JSON.stringify(geminiImage, null, 2));
    }
  }
}

checkDocs().catch(console.error);
