# Changelog

All notable changes to Banana4All will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-18

### Added - Phase 2: Semantic Inpainting 🎨

#### Core Features
- **Selection-aware inpainting** - Automatically detects selections and switches to inpaint mode
- **Semantic editing with Gemini 2.5 Flash** - Uses Google's semantic inpainting approach
- **Automatic image resizing** - Handles API returning different sizes than expected
- **Precise layer positioning** - Places edited content at exact selection coordinates
- **Auto-feathering** - Seamless edge blending with configurable radius (default 3px)
- **Smart cropping** - Exports selection + padding for better context

#### Technical Improvements
- New `exportCroppedRegion()` method for efficient region export
- Automatic layer resizing with bicubic interpolation
- Improved layer positioning with delta calculation
- Selection channel management for mask creation
- Configurable semantic prompt template in config

#### UI/UX
- Real-time selection detection (500ms polling)
- Mode indicator: "✂️ Selection detected" vs "🖼️ No selection"
- Automatic mode switching based on selection state
- Clear console logging for debugging

### Changed
- Updated feather radius from 2px to 3px for better blending
- Enhanced semantic prompt template for more precise edits
- Improved error handling for inpainting workflow
- Optimized proxy server validation for semantic inpainting

### Fixed
- Layer placement now uses correct absolute positioning
- Image size mismatch handled with automatic scaling
- Selection bounds properly calculated with padding
- Mask application works correctly with feathering
- Temp document cleanup prevents crashes

### Technical Details
- Crop workflow: duplicate → flatten → crop → export
- Resize workflow: place → resize → move → mask
- Prompt template: "Edit only the selected area... Keep all other elements... unchanged"
- OpenRouter format: `modalities: ["image", "text"]` for semantic editing

## [1.0.0] - 2025-10-17

### Added - Phase 1: Basic Text-to-Image

#### Core Features
- Text-to-image generation with Gemini 2.5 Flash
- OpenRouter API integration via local proxy
- Layer creation with automatic naming
- API key persistence in localStorage
- Proxy health checking

#### Infrastructure
- Local proxy server for API requests
- UXP plugin architecture for Photoshop 2024+
- Webpack build system
- Jest testing framework
- Comprehensive configuration system

#### UI
- Clean, modern interface with Spectrum Web Components
- API key input with validation
- Prompt input with character limit
- Generate button with loading states
- Error handling with user-friendly messages

### Technical Stack
- Adobe UXP 7.4.3
- Photoshop API 25.11.0
- Node.js proxy server
- OpenRouter API
- Google Gemini 2.5 Flash Image model

---

## Release Notes

### v1.1.0 - Semantic Inpainting Release

This release brings professional-grade inpainting capabilities to Banana4All. You can now:

1. **Select any area** in your Photoshop document
2. **Describe the change** you want (e.g., "add a dragon", "change carpet to blue")
3. **Get precise edits** that blend seamlessly with your original image

The plugin automatically:
- Detects your selection and switches to inpaint mode
- Crops the region with padding for context
- Sends to Gemini with a precise semantic prompt
- Resizes the result to match your selection
- Places it at the exact coordinates
- Applies feathered masking for seamless blending

**Recommended Settings:**
- Selection padding: 10px (configurable in config.js)
- Feather radius: 3px (configurable in config.js)
- Keep selections under 2048x2048 for best performance

**Known Limitations:**
- Gemini uses semantic understanding, not pixel-perfect masks
- Very small selections (<100x100) may not work well
- Very large selections (>2048x2048) may be slow or fail

### v1.0.0 - Initial Release

First public release with basic text-to-image generation capabilities.

---

*For detailed technical documentation, see `/docs` directory*
