#!/usr/bin/env node

/**
 * Package script for Banana4all Photoshop plugin
 * Creates a distributable package for Adobe Exchange
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createPackage() {
  const packageDir = path.resolve(__dirname, '../dist');
  const packageFile = path.resolve(__dirname, '../banana4all.zip');
  const version = require('../package.json').version;

  console.log(`🍌 Packaging Banana4all v${version}...`);

  // Ensure dist directory exists
  if (!fs.existsSync(packageDir)) {
    console.error('❌ Dist directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Create zip file
  const output = fs.createWriteStream(packageFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInBytes = archive.pointer();
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      console.log(`✅ Package created successfully!`);
      console.log(`📦 File: ${packageFile}`);
      console.log(`📏 Size: ${sizeInMB} MB`);
      console.log(`🗂️  Files: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('❌ Error creating package:', err);
      reject(err);
    });

    archive.pipe(output);
    archive.directory(packageDir, false);
    archive.finalize();
  });
}

if (require.main === module) {
  createPackage().catch(console.error);
}

module.exports = { createPackage };