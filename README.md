# 🍌 Banana4all - Free Photoshop Plugin for Google Gemini Flash

![Banana4all Logo](https://img.shields.io/badge/Photoshop-Plugin-yellow?style=for-the-badge&logo=adobephotoshop)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0--beta-blue?style=for-the-badge)

**A free, open-source Photoshop plugin that brings Google's powerful Gemini Flash Image Preview (Nano Banana) AI image generation and editing capabilities directly to your workflow.**

## 🎯 Mission Statement

Democratize access to cutting-edge AI image generation by providing a free Photoshop plugin that allows users to use their own Google AI API keys, eliminating paywalls and giving creators full control over their AI tools.

## ✨ Key Features

- **🎨 Text-to-Image Generation**: Create images from text descriptions using Gemini Flash
- **🖼️ Image Editing & Enhancement**: Modify existing images with AI-powered tools
- **🔧 Inpainting & Outpainting**: Extend or modify specific areas of your images
- **🔐 Your API Keys**: Use your personal Google AI API credentials
- **🚀 High Performance**: Optimized for speed with Gemini 2.5 Flash
- **🌐 Cross-Platform**: Works on Windows and macOS
- **💰 Completely Free**: No subscriptions, no paywalls, no hidden costs

## 🚀 Quick Start

### Prerequisites

- Adobe Photoshop 2024 or later (with UXP support)
- Google AI API key (get one at [Google AI Studio](https://ai.google.dev/))
- Basic knowledge of Photoshop plugins

### Installation

1. **Download the latest release**
   ```bash
   git clone https://github.com/Aladin147/banana4all.git
   cd banana4all
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Install in Photoshop**
   - Open Photoshop
   - Go to `Plugins > Manage Plugins`
   - Click "Add Plugin" and select the `dist` folder
   - Enable the Banana4all plugin

5. **Configure API Key**
   - Open Banana4all from `Plugins > Banana4all`
   - Enter your Google AI API key in the settings
   - Test connection to verify setup

### First Use

1. Create a new document or open an existing image in Photoshop
2. Launch Banana4all from the Plugins menu
3. Enter your prompt or select an area to edit
4. Choose your generation settings
5. Click "Generate" and watch the magic happen!

## 📖 Documentation

- [📚 User Guide](docs/user-guide.md) - Complete user documentation
- [🔧 Developer Guide](docs/developer-guide.md) - For contributors and developers
- [🎯 Product Requirements](docs/PRD.md) - Detailed feature specifications
- [🛣️ Roadmap](docs/roadmap.md) - Development phases and milestones
- [🤝 Contributing](CONTRIBUTING.md) - How to contribute to the project

## 🏗️ Architecture

Banana4all is built using Adobe's modern UXP (Unified Extensibility Platform) with the following architecture:

```
Photoshop UXP Plugin
├── UI Layer (HTML/CSS)
├── Business Logic (JavaScript)
├── API Client (Gemini Integration)
└── Data Layer (Secure Storage)
```

### Key Technologies

- **Adobe UXP**: Modern plugin framework for Creative Cloud
- **Node.js**: Runtime for backend operations
- **Google Gemini API**: AI image generation and editing
- **Modern JavaScript**: ES6+ features and modules
- **Secure Storage**: Encrypted API key management

## 🎨 Usage Examples

### Basic Text-to-Image
```javascript
// Example prompt structure
const prompt = "A photorealistic portrait of a astronaut cat wearing a space helmet, cinematic lighting, 8K detail";
```

### Image Enhancement
```javascript
// Example editing prompt
const prompt = "Enhance this image with vibrant colors, sharpen details, add cinematic lighting";
```

### Inpainting
```javascript
// Example inpainting prompt
const prompt = "Replace the selected area with a beautiful mountain landscape";
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file for development:

```env
# Google AI API Configuration
GOOGLE_AI_API_KEY=your_api_key_here
GOOGLE_AI_PROJECT_ID=your_project_id

# Development Settings
NODE_ENV=development
PORT=3000
```

### Plugin Settings
- **API Key**: Your Google AI API key
- **Model Selection**: Choose between Gemini 2.5 Flash, Pro, or Lite
- **Quality Settings**: Balance speed vs quality
- **Batch Processing**: Enable/disable batch generation
- **Auto-save**: Save generated images automatically

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Adobe](https://www.adobe.com/) for the UXP platform
- [Google AI](https://ai.google.dev/) for the powerful Gemini API
- Open-source community for inspiration and tools
- All contributors who help make this project possible

## 📞 Support

- **Documentation**: Check our [docs](docs/) folder for detailed guides
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/Aladin147/banana4all/issues)
- **Discussions**: Join our community discussions on [GitHub Discussions](https://github.com/Aladin147/banana4all/discussions)
- **Discord**: [Join our Discord server](https://discord.gg/banana4all)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Aladin147/banana4all&type=Date)](https://star-history.com/#Aladin147/banana4all&Date)

---

**Made with ❤️ for the creative community**