# Development Guide

## Project Overview

Banana4All is a UXP plugin for Adobe Photoshop that integrates Google's Gemini 2.5 Flash Image (Nano Banana) for AI image generation.

---

## Architecture

### Components

1. **UXP Plugin** (`src/`)
   - Runs inside Photoshop
   - Vanilla JavaScript + Spectrum Web Components
   - Communicates with local proxy server

2. **Proxy Server** (`proxy-server/`)
   - Node.js/Express server
   - Handles API calls to OpenRouter
   - Keeps Photoshop offline

3. **Build System**
   - Webpack for bundling
   - Copies assets to `dist/`

---

## Development Setup

### Prerequisites

```bash
node -v  # v14 or higher
npm -v   # v6 or higher
```

### Initial Setup

```bash
# Install root dependencies
npm install

# Install proxy server dependencies
cd proxy-server
npm install
cd ..

# Build the plugin
npm run build
```

### Development Workflow

1. **Start proxy server** (in one terminal)
   ```bash
   cd proxy-server
   npm start
   ```

2. **Watch for changes** (in another terminal)
   ```bash
   npm run watch
   ```

3. **Load plugin in Photoshop**
   - Plugins > Manage Plugins > Add Plugin
   - Select the `dist` folder
   - Reload plugin after changes

---

## Code Structure

### Plugin Code (`src/js/`)

#### `main.js`
Main entry point for the plugin.

**Key classes:**
- `AIImageClient` - Handles API communication with proxy server
  - `generateImage(prompt)` - Sends generation request
  - `checkProxyHealth()` - Verifies proxy is running

**Event handlers:**
- API key persistence (localStorage)
- Generate button click handler
- Input validation

#### `photoshop-utils.js`
Photoshop DOM manipulation utilities.

**Key methods:**
- `createImageLayer(imageBlob, layerName)` - Creates layer from image data
  - Uses UXP file system to write temp file
  - Creates session token with `getEntryWithUrl()`
  - Places image using batchPlay
  - Cleans up temp files

**Critical implementation details:**
```javascript
// Session token creation (required for UXP)
const sessionToken = fs.createSessionToken(
  await fs.getEntryWithUrl(tempFile.nativePath)
);

// Place image using batchPlay
await batchPlay([{
  _obj: 'placeEvent',
  null: {
    _path: sessionToken,  // Use session token, not path!
    _kind: 'local'
  }
}], {});
```

### Proxy Server (`proxy-server/server.js`)

**Endpoints:**
- `GET /health` - Health check
- `POST /api/generate` - Image generation

**Request flow:**
1. Receive request from plugin
2. Add "Generate an image of" prefix if needed
3. Forward to OpenRouter with `modalities: ["image"]`
4. Parse response (handles multiple formats)
5. Convert to Gemini-compatible format
6. Return to plugin

**Key features:**
- CORS headers for local development
- Error handling and logging
- Response format normalization
- Support for both text and image inputs

---

## Build System

### Webpack Configuration

```javascript
// webpack.config.js
{
  entry: './src/js/main.js',
  output: {
    path: 'dist/',
    filename: 'main.js'
  },
  externals: {
    uxp: 'commonjs2 uxp',
    photoshop: 'commonjs2 photoshop'
  }
}
```

**What gets bundled:**
- `src/js/main.js` + `src/js/photoshop-utils.js` → `dist/main.js`
- `src/index.html` → `dist/index.html` (processed by HtmlWebpackPlugin)
- `src/css/styles.css` → `dist/css/styles.css` (copied)
- `src/manifest.json` → `dist/manifest.json` (copied)
- `src/icons/` → `dist/icons/` (copied)

---

## UXP Specifics

### File System Operations

UXP has strict file system security. To place images:

1. Write to data folder (not temp folder)
2. Create session token using `getEntryWithUrl()`
3. Use token in batchPlay, not file path

```javascript
const dataFolder = await fs.getDataFolder();
const tempFile = await dataFolder.createFile('temp.png');
await tempFile.write(binaryData);

// CRITICAL: Use getEntryWithUrl
const token = fs.createSessionToken(
  await fs.getEntryWithUrl(tempFile.nativePath)
);
```

### Spectrum Web Components

The UI uses Spectrum UXP components:
- `<sp-textfield>` for text input
- `<sp-textarea>` for multiline input

Access values with `.value` property:
```javascript
const apiKey = document.getElementById('apiKey').value;
```

### BatchPlay

Photoshop operations use batchPlay (action descriptor):

```javascript
const { action } = require('photoshop');
await action.batchPlay([{
  _obj: 'placeEvent',
  null: { _path: sessionToken, _kind: 'local' }
}], {});
```

---

## API Integration

### OpenRouter Request Format

```javascript
{
  model: "google/gemini-2.5-flash-image",
  modalities: ["image"],  // Only request images
  n: 1,  // Generate 1 image
  messages: [{
    role: "user",
    content: "Generate an image of [prompt]"
  }]
}
```

### Response Handling

OpenRouter returns images in `message.images[]` array:

```javascript
{
  choices: [{
    message: {
      images: [{
        image_url: {
          url: "data:image/png;base64,..."
        }
      }]
    }
  }]
}
```

Proxy converts to Gemini format:

```javascript
{
  candidates: [{
    content: {
      parts: [{
        inline_data: {
          mime_type: "image/png",
          data: "base64string..."
        }
      }]
    }
  }]
}
```

---

## Testing

### Manual Testing Checklist

**Basic functionality:**
- [ ] Plugin loads in Photoshop
- [ ] API key field accepts input
- [ ] Prompt field accepts input
- [ ] API key persists after reload
- [ ] Generate button enables/disables correctly

**Generation:**
- [ ] Proxy server health check works
- [ ] Image generates successfully
- [ ] Layer is created with correct name
- [ ] Image appears in document
- [ ] Multiple generations work
- [ ] Error messages are clear

**Edge cases:**
- [ ] No API key shows error
- [ ] No prompt shows error
- [ ] No document open shows error
- [ ] Proxy server down shows error
- [ ] Invalid API key shows error

### Debugging

**Plugin console:**
```
Photoshop > Developer > Console
```

**Proxy server logs:**
Check terminal where `npm start` is running

**Common issues:**
1. "Cannot read properties of undefined (reading 'binary')"
   - Fixed: Don't use `formats.binary`, just pass Uint8Array

2. "Invalid file token"
   - Fixed: Use `getEntryWithUrl()` to create session token

3. Input fields not accepting text
   - Fixed: Use Spectrum components (`<sp-textfield>`)

---

## Performance Considerations

### Image Generation
- Average: 5-10 seconds
- Depends on: prompt complexity, server load, network speed

### Memory Management
- Temp files are cleaned up after placement
- Large images (>5MB) handled efficiently with streaming

### Network
- Proxy server runs locally (no latency)
- API calls to OpenRouter (~100-200ms overhead)

---

## Security

### API Key Storage
- Stored in localStorage (browser-level security)
- Never sent to external servers except OpenRouter
- Proxy server doesn't log keys

### File System
- Only writes to plugin data folder
- Temp files deleted after use
- No access to user documents

### Network
- Photoshop stays offline
- Only proxy server makes external requests
- CORS restricted to localhost

---

## Future Development

See [ResearchDoc-referencemap.md](ResearchDoc-referencemap.md) for detailed roadmap.

### Phase 2 Implementation Notes

**Selection-aware inpainting:**
```javascript
// Get selection bounds
const bounds = await PhotoshopUtils.getSelectionBounds();

// Export selection as image
const selectionBlob = await PhotoshopUtils.exportSelectionAsImage();

// Send to API with mask
const result = await client.editImage(selectionBlob, mask, prompt);
```

**Auto-feathering:**
```javascript
// After placing layer, feather edges
await batchPlay([{
  _obj: 'feather',
  radius: { _unit: 'pixelsUnit', _value: 2 }
}], {});
```

### Phase 3 Implementation Notes

**Reference image:**
```javascript
// User selects a layer as reference
const refLayer = app.activeDocument.activeLayers[0];
const refBlob = await PhotoshopUtils.exportLayerAsBlob(refLayer);

// Send with generation request
const result = await client.generateImage(prompt, { reference: refBlob });
```

---

## Code Style

- Use ES6+ features
- Async/await for promises
- Clear variable names
- Comments for complex logic
- Error handling with try/catch

---

## Deployment

### Building for Release

```bash
# Clean build
rm -rf dist/
npm run build

# Test in Photoshop
# Load dist/ folder

# Create release package
cd dist/
zip -r ../banana4all-v1.0.0.zip .
```

### Version Bumping

1. Update `package.json` version
2. Update `src/manifest.json` version
3. Rebuild
4. Tag release in git

---

## Resources

- [UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [Photoshop API Reference](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)

---

## Getting Help

- Check existing issues on GitHub
- Review UXP documentation
- Test in Photoshop console
- Check proxy server logs
- Ask in discussions
