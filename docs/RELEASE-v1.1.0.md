# Banana4All v1.1.0 - Semantic Inpainting Release

**Release Date:** October 18, 2025  
**Status:** Stable ✅

## 🎉 What's New

### Semantic Inpainting

The headline feature of v1.1.0 is **selection-aware semantic inpainting**. This allows you to make precise edits to specific areas of your images using natural language descriptions.

#### How It Works

1. **Create a selection** in Photoshop (any selection tool)
2. **Enter your prompt** (e.g., "add a dragon to the scene")
3. **Click Generate** - the plugin automatically:
   - Detects your selection
   - Crops the region with padding
   - Sends to Gemini with semantic instructions
   - Resizes and positions the result
   - Applies feathered masking for seamless blending

#### Example Use Cases

- **Object replacement**: "replace the car with a bicycle"
- **Style changes**: "change the carpet to blue"
- **Adding elements**: "add a dragon to the scene"
- **Texture modifications**: "make the wall brick instead of concrete"
- **Color adjustments**: "change the shirt to red"

## 🔧 Technical Improvements

### Automatic Image Resizing
Gemini sometimes returns images at different sizes than expected. The plugin now automatically resizes the result to match your selection dimensions using bicubic interpolation.

### Precise Layer Positioning
Layers are now placed at exact pixel coordinates using a two-step process:
1. Place at center
2. Calculate delta and move to target position

### Smart Cropping
The plugin exports your selection with configurable padding (default 10px) to give Gemini context about surrounding areas, resulting in better edits.

### Enhanced Semantic Prompts
Prompts now use a template that emphasizes preservation:
```
Edit only the selected area in this image crop: {YOUR_PROMPT}. 
Keep all other elements, lighting, colors, shadows, and background 
completely unchanged. Blend naturally with surrounding areas.
```

### Improved Feathering
Feather radius increased from 2px to 3px for more natural blending. Configurable in `src/config.js`.

## 📊 Performance

- **Crop size**: Typically 0.2-3 MB (well under 10 MB limit)
- **Generation time**: ~5-10 seconds per edit
- **Memory usage**: <500 MB during operation
- **Recommended selection size**: 100x100 to 2048x2048 pixels

## 🐛 Bug Fixes

- Fixed layer placement using absolute coordinates instead of relative offset
- Fixed image size mismatch by adding automatic resizing
- Fixed selection bounds calculation with proper padding
- Fixed mask application with correct feathering
- Fixed temp document cleanup to prevent crashes

## 🔄 Migration from v1.0.0

No breaking changes! v1.1.0 is fully backward compatible:
- Text-to-image generation still works exactly the same
- No configuration changes required
- Existing API keys are preserved
- Inpainting activates automatically when you have a selection

## ⚙️ Configuration

New configuration options in `src/config.js`:

```javascript
phase2: {
  selectionPadding: 10,        // Context around selection
  autoFeatherRadius: 3,        // Edge blending (2-5 recommended)
  promptTemplate: '...',       // Semantic prompt template
}
```

## 📝 Usage Tips

### For Best Results

1. **Selection size**: 200-1500 pixels works best
2. **Padding**: Keep default 10px for good context
3. **Prompts**: Be specific about what to change and what to keep
4. **Feathering**: 3-5px for natural blending, 1-2px for sharp edges

### Good Prompt Examples

✅ "change the person's hair to short blonde"  
✅ "replace the background with a sunset beach"  
✅ "add a red sports car in the driveway"  
✅ "change the wall color to sage green"

### Avoid

❌ "make it better" (too vague)  
❌ "add something cool" (not specific)  
❌ "change everything" (contradicts preservation)

## 🔮 What's Next

Potential features for v1.2.0:
- Multi-variant generation (generate 2-4 options at once)
- Layer groups for organizing variants
- Undo/redo support
- Batch processing multiple selections
- Custom feather radius per generation
- Selection history

## 🙏 Acknowledgments

- Google Gemini 2.5 Flash Image for semantic editing capabilities
- OpenRouter for API access
- Adobe UXP team for the plugin framework
- Community feedback and testing

## 📦 Installation

1. Download the latest release
2. Load in Photoshop via UXP Developer Tool
3. Start the proxy server: `cd proxy-server && npm start`
4. Enter your OpenRouter API key
5. Start creating!

## 🐛 Known Issues

- Very small selections (<100x100) may not work reliably
- Very large selections (>2048x2048) may timeout
- Complex prompts may be interpreted differently than expected
- Feathering may need manual adjustment for some images

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- Documentation: See `/docs` directory
- Examples: See `/docs/examples` (coming soon)

---

**Enjoy creating with Banana4All v1.1.0!** 🍌✨
