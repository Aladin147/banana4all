# 📖 Banana4all User Guide

**Table of Contents**
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Tips & Best Practices](#tips--best-practices)

## 🚀 Getting Started

Banana4all is a free Photoshop plugin that brings Google's powerful Gemini Flash AI image generation capabilities directly to your creative workflow. This guide will help you get up and running quickly.

### What You'll Need

- **Adobe Photoshop 2024 or later** (with UXP support)
- **Google AI API key** (get one for free from [Google AI Studio](https://ai.google.dev/))
- **Internet connection** for API calls
- **Basic Photoshop knowledge**

### Key Features

- 🎨 **Text-to-Image Generation**: Create images from text descriptions
- 🖼️ **Image Editing**: Enhance and modify existing images
- 🔐 **Your API Keys**: Use your personal Google AI credentials
- 📚 **Generation History**: Track and reuse your creations
- ⚡ **Fast Performance**: Optimized for speed with Gemini Flash

## 📦 Installation

### Step 1: Download the Plugin

1. Visit the [Banana4all GitHub repository](https://github.com/Aladin147/banana4all)
2. Click the "Releases" tab
3. Download the latest version (`banana4all-v1.0.0-beta.zip`)

### Step 2: Install in Photoshop

1. **Open Adobe Photoshop**
2. Go to **Plugins > Manage Plugins**
3. Click **"Add Plugin"**
4. Navigate to and select the downloaded ZIP file
5. **Enable** the Banana4all plugin
6. **Restart Photoshop**

### Step 3: Launch the Plugin

1. Open Photoshop
2. Go to **Plugins > Banana4all**
3. The plugin panel should appear

## ⚙️ Configuration

### Getting Your Google AI API Key

1. **Visit Google AI Studio**: [https://ai.google.dev/](https://ai.google.dev/)
2. **Sign in** with your Google account
3. **Create a new API key**:
   - Click "Get API Key" in the top right
   - Choose "Create API key in new project"
   - Copy your API key (it starts with `AIza...`)
4. **Note your usage limits** (free tier has generous limits)

### Setting Up in Banana4all

1. **Open Banana4all** from Photoshop's Plugins menu
2. **Locate the API Configuration section** at the top
3. **Paste your API key** in the input field
4. **Click "Save Key"**
5. **Wait for validation** - the status indicator should turn green

## 🎨 Basic Usage

### Text-to-Image Generation

1. **Enter Your Prompt**
   ```
   A photorealistic portrait of an astronaut cat wearing a space helmet, cinematic lighting, 8K detail
   ```

2. **Choose Settings**:
   - **Image Size**: 512×512 (fast), 1024×1024 (standard), or custom
   - **Quality**: Draft (fast), Standard (balanced), High (detailed)
   - **Number of Images**: 1-4 variations

3. **Click "Generate Images"**
   - Wait for the generation to complete (typically 15-60 seconds)
   - Progress will be shown in the loading modal

4. **Review Results**
   - Generated images appear in the Results section
   - Use buttons to download or copy images
   - Images are automatically saved to your generation history

### Image Editing

1. **Open or create an image** in Photoshop
2. **Open Banana4all**
3. **Describe your edits** in natural language:
   ```
   Enhance this image with vibrant colors and sharp details
   Change the background to a beautiful sunset
   Make the subject look more professional
   ```

4. **Click "Generate"** to see AI-powered edits

### Using Generation History

1. **Scroll to the History section** at the bottom
2. **Click any previous generation** to:
   - Load the original prompt
   - Reuse the settings
   - Generate new variations

3. **Clear history** by clicking the trash icon (if needed)

## 🔧 Advanced Features

### Prompt Engineering Tips

#### 📝 Effective Prompts

**Good Prompts:**
```
A professional portrait of a woman photographer in her studio, natural window lighting, Canon camera, blurred background, 85mm lens, photorealistic, 8K
```

**Better Prompts:**
```
A professional portrait of a woman photographer (30s) in her modern studio, soft natural window light from left, holding Canon EOS R5 with 85mm f/1.2 lens, wearing black sweater, shallow depth of field, warm tones, photorealistic, cinematic lighting, 8K resolution
```

#### 🎨 Style Prompts

**Photographic Styles:**
```
Ansel Adams style landscape, black and white, high contrast, dramatic mountains
```

**Artistic Styles:**
```
Van Gogh painting of a cityscape, swirling brushstrokes, vibrant colors
```

### Advanced Settings

#### Quality vs Speed Trade-offs

| Quality | Speed | Best For |
|---------|-------|----------|
| Draft | Fast (10-20s) | Quick iterations, concepts |
| Standard | Medium (30-45s) | General use, balanced quality |
| High | Slow (60-90s) | Final output, maximum detail |

#### Image Size Options

| Size | Resolution | Use Case |
|------|------------|----------|
| 512×512 | 0.3MP | Icons, quick previews |
| 1024×1024 | 1MP | General use, web images |
| Custom | Variable | Specific project needs |

### Batch Processing

Generate multiple variations simultaneously:

1. **Set "Number of Images"** to 2-4
2. **Enter your prompt**
3. **Click Generate**
4. **Review all variations** and choose the best

### Keyboard Shortcuts

- **Ctrl+Enter** (⌘+Return on Mac): Generate image
- **Ctrl+Delete** (⌘+Delete on Mac): Clear prompt
- **Ctrl+,** (⌘+, on Mac): Open settings
- **Escape**: Close modals

## 🚨 Troubleshooting

### Common Issues

#### 🔑 API Key Problems

**"Invalid API Key" Error**
- Verify your API key is correct
- Ensure your Google Cloud billing is enabled (even for free tier)
- Check if the Gemini API is enabled in your project

**Solution:**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Verify your API key works in the playground
3. Generate a new key if needed

#### 🌐 Network Issues

**"Connection Failed" Error**
- Check your internet connection
- Verify firewall isn't blocking requests
- Try again in a few minutes

#### ⚡ Performance Issues

**Slow Generation**
- Use "Draft" quality for faster results
- Reduce image size for quicker iterations
- Check your internet speed

#### 🖼️ Image Problems

**Poor Quality Results**
- Improve your prompts (be more descriptive)
- Use "High" quality setting
- Try different prompts and refine

**API Errors**
- Check Google AI status page for outages
- Verify your API quota isn't exceeded
- Try again later

### Resetting the Plugin

1. **Clear API Key**: Delete and re-enter your API key
2. **Clear History**: Use the trash icon in history section
3. **Reinstall Plugin**: Remove and reinstall from Adobe Exchange

## 💡 Tips & Best Practices

### 📝 Prompt Best Practices

#### 1. Be Specific and Detailed
```
Good: "A mountain landscape"
Better: "A majestic mountain landscape at sunset, snow-capped peaks, golden hour lighting, reflection in alpine lake, 8K"
```

#### 2. Include Technical Details
```
Professional portrait, studio lighting, 85mm lens, f/1.8 aperture, shallow depth of field, photorealistic
```

#### 3. Specify Style and Mood
```
Cinematic style, moody atmosphere, film noir aesthetic, dramatic shadows, vintage film grain
```

#### 4. Use Artistic References
```
In the style of Ansel Adams, black and white landscape, high contrast, dramatic clouds
```

### 🎯 Workflow Optimization

#### 1. Start with Draft Quality
- Use Draft for quick iterations
- Refine prompts before high-quality generation
- Save time and API credits

#### 2. Build Complex Images Step-by-Step
```
Step 1: "A basic landscape scene"
Step 2: "Add mountains and a lake"
Step 3: "Include golden hour lighting"
Step 4: "Add wildlife in the foreground"
```

#### 3. Use History Effectively
- Favorite useful prompts for reuse
- Track what works for your style
- Build a library of effective prompts

### 🔄 Iterative Generation

1. **Start Broad**: Begin with general concepts
2. **Add Details**: Gradually add specific elements
3. **Refine**: Adjust and improve based on results
4. **Finalize**: Generate high-quality versions

### 📊 Cost Management

- **Monitor Usage**: Track your API usage in Google Cloud Console
- **Free Tier**: Google offers generous free limits
- **Batch Wisely**: Generate multiple variations when you have good prompts
- **Draft Mode**: Use lower quality for experimentation

### 🎨 Creative Applications

#### Digital Art
- Concept art and illustrations
- Character design and development
- Environment and background creation

#### Photography
- Photo enhancement and restoration
- Style transfer and artistic effects
- Background replacement and extension

#### Marketing
- Social media content creation
- Ad creative and banners
- Product visualization

#### Personal Projects
- Personal artwork and gifts
- Creative experimentation
- Learning AI image generation

## 🆘 Getting Help

### Resources

- **Documentation**: [GitHub Wiki](https://github.com/Aladin147/banana4all/wiki)
- **Community**: [GitHub Discussions](https://github.com/Aladin147/banana4all/discussions)
- **Issues**: [Bug Reports](https://github.com/Aladin147/banana4all/issues)
- **Updates**: Follow our [GitHub Releases](https://github.com/Aladin147/banana4all/releases)

### Support Channels

- **GitHub Issues**: For bug reports and feature requests
- **Discord**: [Community Server](https://discord.gg/banana4all)
- **Email**: For private inquiries (check GitHub for contact info)

### Contributing

We welcome contributions! Check out our [Contributing Guide](../CONTRIBUTING.md) to:
- Report bugs
- Request features
- Submit code contributions
- Improve documentation

---

## 🎉 Next Steps

Now that you're familiar with Banana4all, explore these resources:

- **Advanced Techniques**: Check our blog for advanced tutorials
- **Community Gallery**: Share your creations and get inspired
- **Plugin Updates**: Stay updated with new features and improvements

**Happy creating! 🍌**