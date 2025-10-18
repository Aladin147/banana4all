# 🍌 Banana4All

**AI Image Generation for Photoshop** — Powered by Google's Gemini 2.5 Flash Image (Nano Banana)

Fast, affordable, high-quality image generation directly in Photoshop. Generate new images from text prompts with professional results at ~$0.001 per image.

---

## ✨ Features

**Phase 1 - Text-to-Image** ✅
- ✅ Text-to-image generation
- ✅ Direct layer creation in Photoshop
- ✅ Fast generation (~8 seconds)
- ✅ Ultra-low cost (~$0.001 per image)
- ✅ Clean, dark-themed UI
- ✅ API key persistence

**Phase 2 - Semantic Inpainting** ✅ NEW!
- ✅ Selection-aware inpainting
- ✅ Automatic mode detection
- ✅ Smart cropping with padding
- ✅ Automatic image resizing
- ✅ Precise layer positioning
- ✅ Auto-feathering for seamless blending

**Coming Soon**
- 🔜 Phase 3: Multi-variant generation & layer groups
- 🔜 Phase 4: Reference-guided edits & prompt presets
- 🔜 Phase 5: Multi-backend support & high-res pipeline
- 🔜 Phase 6: Context fidelity & realism controls
- 🔜 Phase 7: Live previews & advanced workflows

---

## 🚀 Quick Start

### Prerequisites
- Adobe Photoshop 2023 or later (UXP support required)
- Node.js 14+ (for proxy server)
- OpenRouter API key ([get one free](https://openrouter.ai/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/banana4all.git
   cd banana4all
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd proxy-server
   npm install
   cd ..
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Start the proxy server**
   ```bash
   cd proxy-server
   npm start
   ```
   Keep this terminal running.

5. **Load plugin in Photoshop**
   - Open Photoshop
   - Go to **Plugins > Manage Plugins**
   - Click **Add Plugin**
   - Select the `dist` folder from this project
   - The plugin will appear in your panels

---

## 📖 Usage

### Text-to-Image Generation

1. **Enter your API key**
   - Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys)
   - Paste it in the "OpenRouter API Key" field
   - It will be saved automatically

2. **Create a document**
   - Open or create a Photoshop document
   - Any size works (recommended: 1024x1024 or larger)

3. **Generate an image**
   - Enter a descriptive prompt (e.g., "a delicious banana on a wooden table, warm lighting, food photography")
   - Click **Generate Image**
   - Wait ~8 seconds
   - A new layer will be created with your generated image

### Semantic Inpainting (NEW!)

1. **Create a selection**
   - Use any selection tool (Marquee, Lasso, Magic Wand, etc.)
   - Select the area you want to edit
   - The plugin will automatically detect your selection

2. **Enter your edit prompt**
   - Describe what you want to change (e.g., "add a dragon to the scene")
   - Be specific about what to change and what to keep
   - Click **Generate Image**

3. **Watch the magic happen**
   - Plugin crops the selection with padding
   - Sends to Gemini with semantic instructions
   - Automatically resizes and positions the result
   - Applies feathered masking for seamless blending

### Tips for Better Results

**Text-to-Image:**
- Be specific about style, lighting, and composition
- Mention camera angles, materials, and atmosphere
- Use descriptive adjectives
- Reference art styles or photography techniques

**Inpainting:**
- Keep selections between 200-1500 pixels for best results
- Be specific: "change the carpet to blue" not "make it better"
- Describe what to change AND what to preserve
- Use natural language: "add a red sports car in the driveway"

---

## 🏗️ Architecture

```
banana4all/
├── src/                    # Plugin source code
│   ├── js/
│   │   ├── main.js        # UI logic & API client
│   │   └── photoshop-utils.js  # Photoshop layer operations
│   ├── css/
│   │   └── styles.css     # Dark theme styling
│   ├── index.html         # Plugin UI
│   └── manifest.json      # UXP plugin manifest
│
├── dist/                   # Built plugin (load this in Photoshop)
│
├── proxy-server/           # Local API proxy
│   ├── server.js          # Express server
│   └── package.json
│
├── docs/                   # Documentation
│   └── ResearchDoc-referencemap.md  # Roadmap & research
│
└── webpack.config.js       # Build configuration
```

### Why a Proxy Server?

The proxy server keeps Photoshop offline while handling external API calls. This provides:
- **Privacy**: API keys never leave your machine
- **Security**: Photoshop doesn't need internet access
- **Control**: All API traffic goes through one local process
- **Flexibility**: Easy to swap API providers

---

## 🔧 Development

### Build Commands

```bash
# Production build
npm run build

# Development build with watch mode
npm run watch
```

### Project Structure

- **UXP Plugin**: Built with vanilla JavaScript, uses Spectrum Web Components
- **Proxy Server**: Node.js/Express server for API routing
- **Build System**: Webpack for bundling and optimization

### Key Files

- `src/js/main.js` - Plugin UI logic and API client
- `src/js/photoshop-utils.js` - Photoshop DOM manipulation
- `proxy-server/server.js` - API proxy with OpenRouter integration
- `src/manifest.json` - UXP plugin configuration

---

## 🎨 Model Information

**Gemini 2.5 Flash Image** (Nano Banana)
- Fast generation (~5-10 seconds)
- High visual quality
- Strong identity preservation
- Good for portraits, products, and scenes
- Includes SynthID watermarking
- Cost: ~$0.001 per image via OpenRouter

---

## 🐛 Troubleshooting

### Plugin doesn't appear in Photoshop
- Make sure you selected the `dist` folder, not the root folder
- Restart Photoshop after loading the plugin
- Check that manifest.json exists in the dist folder

### "Proxy server not running" error
- Make sure the proxy server is running: `cd proxy-server && npm start`
- Check that it's running on port 3000
- Look for the banana ASCII art in the terminal

### Generation fails
- Verify your API key is correct
- Check the proxy server logs for errors
- Ensure you have an active document open in Photoshop
- Check your OpenRouter account has credits

### Input fields not working
- The plugin uses Spectrum UXP components
- If fields are unresponsive, try reloading the plugin
- Check browser console for errors (Developer > Console)

---

## 📋 Roadmap

See [docs/ResearchDoc-referencemap.md](docs/ResearchDoc-referencemap.md) for detailed roadmap.

**Phase 1** ✅ - Basic text-to-image generation (COMPLETE)

**Phase 2** ✅ - Semantic inpainting (COMPLETE - v1.1.0)
- Selection-aware inpainting
- Automatic mode detection
- Smart cropping with padding
- Automatic resizing and positioning
- Auto-feathering for seamless blending

**Phase 3** 🔜 - Multi-variant generation
- Generate 2-4 variants at once
- Layer groups for organization
- Variant comparison

**Phase 4** 🔜 - Reference-guided edits
- Reference image input
- Color hinting
- Prompt presets

**Phase 4** 🔜 - Multi-backend & high-res
- Multiple API providers
- High-resolution pipeline
- Batch processing

**Phase 5** 🔜 - Context fidelity
- Auto-context windows
- Lighting consistency
- Edge-aware blending

**Phase 6** 🔜 - Power-user features
- Live preview grids
- Brush-guided generation
- History & recipes
- Content badges

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Photoshop
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Google Gemini team for Nano Banana
- OpenRouter for API access
- Adobe for UXP framework
- The Photoshop plugin community

---

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/banana4all/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/banana4all/discussions)

---

**Made with 🍌 for the creative community**
