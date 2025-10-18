# Semantic Inpainting Implementation

## Understanding Gemini's Semantic Inpainting

Gemini 2.5 Flash doesn't support traditional mask-based inpainting. Instead, it uses **semantic editing**:

- **Traditional inpainting**: Send image + binary mask → Model fills masked areas
- **Semantic inpainting**: Send cropped image + text instructions → Model edits based on description

## The Correct Approach

Following Google's guidance for semantic inpainting:

### Workflow
1. **Crop to selection** (with small padding for context)
2. **Use precise prompt template**: "Edit only [element] in this image crop: [change]. Keep all other elements, lighting, colors, and background completely unchanged."
3. **Send via OpenRouter** with `modalities: ["image", "text"]`
4. **Composite back** at original selection coordinates

### Why This Works
- Gemini receives a **tight crop** around the selection
- The crop is small (<10 MB, ideally <7 MB)
- Semantic prompt tells Gemini **what to change** and **what to preserve**
- Gemini returns the edited crop at the **same size**
- Plugin composites it back at the **correct coordinates**

## Implementation Details

### 1. Export Cropped Region with Padding
```javascript
const padding = 10; // pixels
const paddedBounds = {
  left: Math.max(0, bounds.left - padding),
  top: Math.max(0, bounds.top - padding),
  width: bounds.width + (padding * 2),
  height: bounds.height + (padding * 2)
};

const croppedBlob = await PhotoshopUtils.exportCroppedRegion(paddedBounds);
```

### 2. Build Semantic Prompt
```javascript
const semanticPrompt = `Edit only the selected area in this image crop: ${prompt}. Keep all other elements, lighting, colors, and background completely unchanged.`;
```

### 3. Send to OpenRouter
```javascript
{
  model: "google/gemini-2.5-flash-image",
  modalities: ["image", "text"],
  messages: [{
    role: "user",
    content: [
      { type: "text", text: semanticPrompt },
      { 
        type: "image_url", 
        image_url: { url: "data:image/png;base64,..." }
      }
    ]
  }]
}
```

### 4. Composite Back
```javascript
// Place at padded bounds coordinates
position = {
  x: paddedBounds.left,
  y: paddedBounds.top
};

// Create layer at position
const layer = await PhotoshopUtils.createImageLayer(result.imageBlob, layerName, position);

// Apply feathered mask from saved selection
await PhotoshopUtils.restoreSelectionFromChannel('banana4all_temp');
await PhotoshopUtils.createLayerMaskFromSelection(layer, 2); // 2px feather
```

## Key Features

✅ **Tight crop** - Only sends the selection area (+ padding)
✅ **Small file size** - Typically <7 MB, well under 10 MB limit
✅ **Semantic control** - Precise instructions via prompt
✅ **Correct sizing** - Returned image matches crop size
✅ **Pixel-perfect alignment** - Composited at exact coordinates
✅ **Seamless blending** - Feathered mask for natural transitions

## Example Prompts

### Good Prompts (Specific)
- "Edit only the selected area in this image crop: change the hair to short blonde. Keep face, skin tone, lighting, and background completely unchanged."
- "Edit only the selected area in this image crop: add a red sports car. Keep road, trees, sky, and lighting completely unchanged."
- "Edit only the selected area in this image crop: replace with a modern glass building. Keep street, people, and sky completely unchanged."

### Bad Prompts (Vague)
- "add a dragon" ❌ (too vague)
- "make it better" ❌ (no specific instruction)
- "change everything" ❌ (contradicts "keep unchanged")

## Troubleshooting

### Issue: Edit appears in wrong location
**Cause**: Padding calculation incorrect
**Fix**: Ensure `paddedBounds.left` and `paddedBounds.top` are used for positioning

### Issue: Edges look harsh
**Cause**: No feathering applied
**Fix**: Ensure `createLayerMaskFromSelection` is called with feather radius (2px)

### Issue: File too large error
**Cause**: Selection too big
**Fix**: Warn user if selection > 2048x2048, suggest smaller selection

### Issue: Gemini edits wrong area
**Cause**: Prompt not specific enough
**Fix**: Use template: "Edit only the selected area in this image crop: [specific change]. Keep all other elements... unchanged."

## Testing Checklist

- [ ] Small selection (100x100) - should work fast
- [ ] Large selection (1000x1000) - should warn if >2048
- [ ] Selection at edge of canvas - padding should not go negative
- [ ] Complex selection shape - mask should follow selection
- [ ] Multiple edits - each should composite correctly
- [ ] Feathering - edges should blend seamlessly

---

*Implemented: October 18, 2025*
*Based on Google's semantic inpainting guidance*
