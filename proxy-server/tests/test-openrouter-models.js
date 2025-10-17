#!/usr/bin/env node

/**
 * Test script to fetch current OpenRouter models and capabilities
 */

const https = require('https');

// Function to make API requests
function makeRequest(path, method = 'GET', apiKey = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'openrouter.ai',
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (apiKey) {
            options.headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, raw: true });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function investigateOpenRouter() {
    console.log('🔍 Investigating OpenRouter API...\n');

    // 1. Get list of all models (public endpoint)
    console.log('📋 Fetching available models...\n');
    const modelsResponse = await makeRequest('/api/v1/models');

    if (modelsResponse.status === 200 && modelsResponse.data.data) {
        const models = modelsResponse.data.data;
        console.log(`✅ Found ${models.length} total models\n`);

        // Filter for Gemini models
        console.log('🔍 GEMINI MODELS:\n');
        const geminiModels = models.filter(m => m.id.toLowerCase().includes('gemini'));

        geminiModels.forEach(m => {
            console.log(`Model ID: ${m.id}`);
            console.log(`  Name: ${m.name || 'N/A'}`);
            console.log(`  Context: ${m.context_length || 'N/A'} tokens`);
            if (m.pricing) {
                console.log(`  Pricing: $${m.pricing.prompt}/1M prompt tokens, $${m.pricing.completion}/1M completion tokens`);
                if (m.pricing.image) {
                    console.log(`  Image Pricing: $${m.pricing.image}/image`);
                }
            }
            if (m.architecture) {
                console.log(`  Modality: ${m.architecture.modality || 'N/A'}`);
                console.log(`  Instruct Type: ${m.architecture.instruct_type || 'N/A'}`);
            }
            if (m.top_provider) {
                console.log(`  Provider: ${m.top_provider.name || 'N/A'}`);
            }
            console.log('');
        });

        // Look for image generation models
        console.log('\n🎨 IMAGE GENERATION MODELS:\n');
        const imageGenModels = models.filter(m => {
            const id = m.id.toLowerCase();
            return id.includes('dall-e') ||
                id.includes('stable-diffusion') ||
                id.includes('flux') ||
                id.includes('imagen') ||
                id.includes('midjourney') ||
                (m.architecture && m.architecture.modality &&
                    (m.architecture.modality.includes('image->text') ||
                        m.architecture.modality.includes('text->image')));
        });

        imageGenModels.slice(0, 10).forEach(m => {
            console.log(`Model ID: ${m.id}`);
            console.log(`  Name: ${m.name || 'N/A'}`);
            if (m.pricing) {
                console.log(`  Pricing: $${m.pricing.prompt}/1M tokens`);
            }
            if (m.architecture) {
                console.log(`  Modality: ${m.architecture.modality || 'N/A'}`);
            }
            console.log('');
        });

        // Check for vision models (can process images)
        console.log('\n👁️ VISION MODELS (Can process images):\n');
        const visionModels = models.filter(m => {
            return m.architecture && m.architecture.modality &&
                m.architecture.modality.includes('image');
        });

        console.log(`Found ${visionModels.length} vision-capable models\n`);
        visionModels.slice(0, 10).forEach(m => {
            console.log(`Model ID: ${m.id}`);
            console.log(`  Modality: ${m.architecture.modality}`);
            if (m.pricing && m.pricing.prompt === '0') {
                console.log(`  💰 FREE MODEL`);
            }
            console.log('');
        });

    } else {
        console.log('❌ Failed to fetch models');
        console.log('Status:', modelsResponse.status);
        console.log('Response:', JSON.stringify(modelsResponse.data, null, 2).substring(0, 500));
    }

    console.log('\n✅ Investigation complete!');
}

investigateOpenRouter().catch(console.error);
