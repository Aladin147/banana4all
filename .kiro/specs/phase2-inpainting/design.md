# Phase 2: Pro-Grade Inpainting & Layer Hygiene - Design Document

## Overview

Phase 2 transforms Banana4All from a basic text-to-image generator into a professional inpainting tool. The design focuses on selection-aware generation, seamless blending, and multi-variant workflows while maintaining the non-destructive, layer-based approach that Photoshop users expect.

**Key Design Principles:**
- Non-destructive: All edits create new layers with masks
- Seamless: Auto-feathering and precise alignment for natural blending
- Flexible: Support both full-image and selection-based workflows
- Organized: Layer groups keep the panel clean
- Responsive: Async operations don't block Photoshop UI

## Architecture

### High-Level Flow

```
User Creates Selection → Plugin Detects Mode → User Enters Prompt
    ↓
Selection Mode Active?
    ↓ YES                           ↓ NO
Export Selection Content        Generate Full Image
Generate Binary Mask           (Phase 1 Flow)
Send to Proxy with Mask
    ↓
Proxy Formats Inpaint Request → OpenRouter API → Gemini 2.5 Flash
    ↓
Receive Generated Image(s)
    ↓
Multi-Variant Enabled?
    ↓ YES                           ↓ NO
Create Layer Group              Create Single Layer
Generate N Variants             Apply Feathering
Place in Group                  Align to Selection
    ↓
Apply Auto-Feathering to Each
Align to Selection Bounds
Clean Up Temp Files
```

## Components and Interfaces

### 1. Selection Manager (photoshop-utils.js)

**Purpose:** Detect and extract selection information

**Methods (already implemented in Phase 1):**
- `hasActiveSelection()` - Check if selection exists
- `getSelectionBounds()` - Get selection coordinates
- `exportSelectionAsImage()` - Export selection content
- `createMaskFromSelection()` - Generate binary mask

**New methods for Phase 2:**
- `getSelectionWithPadding(padding)` - Add padding to bounds
- `applyFeatherToLayerMask(layer, radius)` - Feather mask edges
- `createLayerGroup(name)` - Create layer group
- `addLayerToGroup(layer, group)` - Add layer to group

### 2. Inpainting Client (main.js)

**Purpose:** Extend AIImageClient to support inpainting

**New methods:**
- `inpaintSelection(prompt, contentBlob, maskBlob, bounds)` - Inpaint into selection
- `generateVariants(prompt, count, mode, ...)` - Generate multiple variants

### 3. Mode Manager (main.js)

**Purpose:** Manage UI state based on selection presence

**Responsibilities:**
- Detect selection changes
- Update UI mode selector
- Remember user preferences
- Enable/disable appropriate controls

### 4. Layer Manager (photoshop-utils.js)

**Purpose:** Handle layer creation, grouping, and organization

**Responsibilities:**
- Create variant groups
- Place layers with alignment
- Apply feathering
- Organize layer stack

### 5. Proxy Server Inpainting Handler (server.js)

**Purpose:** Format and send inpainting requests to OpenRouter

**Responsibilities:**
- Accept content + mask images
- Format for OpenRouter API
- Handle inpainting responses
- Return normalized results

## Data Models

### Generation Request
```javascript
{
  apiKey: string,
  model: string,
  prompt: string,
  mode: 'full' | 'inpaint',
  provider: string,
  contentImage?: string,  // base64
  maskImage?: string,     // base64
  bounds?: { left, top, width, height },
  variantCount?: number,
  seed?: number
}
```

### UI State
```javascript
{
  mode: 'full' | 'inpaint',
  hasSelection: boolean,
  variantCount: number,
  isGenerating: boolean,
  currentVariant: number,
  totalVariants: number
}
```

## Error Handling

### Selection Validation
- Check selection exists
- Validate minimum size (64x64)
- Warn on large selections (>2048x2048)
- Handle export failures gracefully

### API Error Handling
- Mask format errors
- Size limit errors
- API failures
- Timeout handling

### Cleanup on Failure
- Delete temp files
- Reset UI state
- Show clear error messages
- Log details for debugging

## Testing Strategy

### Unit Tests
- Selection detection
- Bounds calculation
- Mode management
- Layer creation

### Integration Tests
- Full inpainting workflow
- Multi-variant generation
- Error scenarios
- Cleanup verification

### Manual Testing
- Various selection tools
- Different document sizes
- Edge cases and limits
- Performance under load

## UI Design

### Mode Selector
- Toggle between "New Layer" and "Edit Selection"
- Disable "Edit Selection" when no selection
- Visual feedback for active mode

### Variant Selector
- Dropdown: 1-4 variants
- Show estimated time
- Disable during generation

### Progress Display
- Show current variant number
- Display elapsed time
- Allow cancellation
- Update in real-time

## Performance Considerations

- Limit selection size to 2048x2048
- Clean up temp files immediately
- Sequential variant generation (avoid rate limits)
- Async operations don't block UI
- Memory-efficient image handling

## Security Considerations

- Temp files in plugin data folder only
- Session tokens for file operations
- No logging of image data
- HTTPS for API requests
- Input validation before API calls

## Success Metrics

- Selection detection: 100% reliable
- Layer alignment: Within 1 pixel
- Feathering: Seamless blending
- Multi-variant: All variants generated
- Performance: <10s per variant
- Memory: <500MB total usage

## Next Step

Create detailed implementation tasks in tasks.md
