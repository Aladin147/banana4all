# Phase 2: Pro-Grade Inpainting & Layer Hygiene - Implementation Tasks

## Task Overview

This task list breaks down Phase 2 implementation into discrete, manageable coding steps. Each task builds incrementally on previous work and references specific requirements from the requirements document.

---

## - [ ] 1. Extend PhotoshopUtils with Phase 2 selection methods
  - Implement `getSelectionWithPadding(padding)` to add configurable padding to selection bounds
  - Implement `applyFeatherToLayerMask(layer, radius)` to apply edge feathering using batchPlay
  - Implement `createLayerGroup(name)` to create and return a layer group
  - Implement `addLayerToGroup(layer, group)` to add a layer to an existing group
  - _Requirements: 2.3, 5.1, 5.2, 8.1, 8.2_

## - [ ] 2. Add mode detection and UI state management
- [ ] 2.1 Create ModeManager class in main.js
  - Implement constructor with default state (mode: 'full', hasSelection: false, variantCount: 1)
  - Implement `updateMode()` to check for active selection and update state
  - Implement `getMode()` to return current effective mode
  - Implement `updateUI()` to enable/disable mode selector buttons
  - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2_

- [ ] 2.2 Add mode selector UI elements to index.html
  - Add mode selector div with "New Layer" and "Edit Selection" buttons
  - Add variant count selector (dropdown with options 1-4)
  - Add hint text that updates based on selection state
  - Style mode buttons with active/disabled states in styles.css
  - _Requirements: 10.1, 10.3, 10.4, 11.1_

- [ ] 2.3 Wire up mode detection on plugin load and selection changes
  - Initialize ModeManager on DOMContentLoaded
  - Call `updateMode()` on plugin load
  - Add periodic selection check (every 500ms) to detect changes
  - Update UI when selection state changes
  - _Requirements: 1.4, 10.5_

## - [ ] 3. Implement inpainting request flow in AIImageClient
- [ ] 3.1 Add inpaintSelection method to AIImageClient
  - Accept prompt, contentBlob, maskBlob, and bounds parameters
  - Convert blobs to base64 strings
  - Send POST request to `/api/generate` with mode: 'inpaint'
  - Include contentImage and maskImage in request body
  - Parse and return response in same format as generateImage
  - _Requirements: 3.1, 3.4, 4.5, 9.1_

- [ ] 3.2 Add generateVariants method to AIImageClient
  - Accept prompt, count, mode, and optional inpainting parameters
  - Loop to generate N variants sequentially
  - Use different seeds for each variant if CONFIG.phase2.enableSeeding is true
  - Return array of GenerationResult objects with variantIndex
  - Handle errors gracefully and return partial results if some variants fail
  - _Requirements: 7.1, 7.5, 13.4_

## - [ ] 4. Update proxy server to handle inpainting requests
- [ ] 4.1 Add inpainting support to handleOpenRouter function
  - Check if request includes contentImage and maskImage
  - Format OpenRouter request with image array containing content and mask
  - Add mask indicator to distinguish mask from content image
  - Send formatted request to OpenRouter API
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 4.2 Add request validation for inpainting
  - Validate that mask dimensions match content dimensions
  - Validate base64 format for both images
  - Return descriptive error if validation fails
  - Log validation errors for debugging
  - _Requirements: 9.4, 9.5_

## - [ ] 5. Implement layer creation with alignment and feathering
- [ ] 5.1 Update createImageLayer to support position parameter
  - Modify createImageLayer to accept optional position {x, y}
  - Use position in placeEvent offset if provided
  - Ensure pixel-perfect alignment with selection bounds
  - Account for padding offset when positioning
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 5.2 Add feathering logic after layer placement
  - Check if mode is 'inpaint' and auto-feathering is enabled
  - Apply feather to layer mask using applyFeatherToLayerMask
  - Use CONFIG.phase2.autoFeatherRadius for feather amount
  - Preserve original layer content while feathering mask
  - _Requirements: 5.1, 5.2, 5.5, 13.2_

## - [ ] 6. Implement multi-variant generation and layer grouping
- [ ] 6.1 Create LayerManager class with createVariantGroup method
  - Accept prompt and array of GenerationResult objects
  - Create layer group with name "AI Variants: [prompt]"
  - Loop through variants and create layer for each
  - Add each layer to the group
  - Position group at top of layer stack
  - _Requirements: 7.2, 7.3, 8.1, 8.2, 8.3_

- [ ] 6.2 Update generate button handler to support multi-variant mode
  - Check variant count from UI selector
  - If count > 1, call generateVariants instead of single generation
  - Pass all variants to LayerManager.createVariantGroup
  - If count === 1, create standalone layer without group
  - _Requirements: 7.1, 7.4, 8.5_

## - [ ] 7. Add progress feedback for multi-variant generation
- [ ] 7.1 Create progress UI elements
  - Add progress bar div with fill element
  - Add progress text span for status messages
  - Add cancel button
  - Style progress elements in styles.css
  - Hide progress UI by default
  - _Requirements: 11.1, 11.2_

- [ ] 7.2 Update generateVariants to emit progress events
  - Show progress UI before starting generation
  - Update progress text with "Generating variant X of Y"
  - Update progress bar fill width based on completion percentage
  - Show elapsed time in progress text
  - Hide progress UI when complete or cancelled
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 7.3 Implement cancellation support
  - Add cancellation flag to AIImageClient
  - Check flag before each variant generation
  - Stop generation loop if cancelled
  - Keep successfully generated variants
  - Clean up temp files for incomplete variants
  - _Requirements: 11.4, 11.5_

## - [ ] 8. Add comprehensive error handling
- [ ] 8.1 Implement selection validation
  - Check selection exists before inpainting
  - Validate minimum selection size (64x64 pixels)
  - Show warning for large selections (>2048x2048)
  - Display clear error messages for validation failures
  - _Requirements: 2.4, 2.5, 12.1, 12.4_

- [ ] 8.2 Add error handling for export operations
  - Wrap exportSelectionAsImage in try-catch
  - Wrap createMaskFromSelection in try-catch
  - Show "Failed to export selection content" on export error
  - Show "Failed to create selection mask" on mask error
  - Log detailed errors to console
  - _Requirements: 3.5, 12.2, 12.5_

- [ ] 8.3 Add error handling for layer operations
  - Catch alignment failures in createImageLayer
  - Fall back to document origin if alignment fails
  - Show "Layer placed at origin - manual positioning required" message
  - Log alignment errors for debugging
  - _Requirements: 6.5, 12.3, 12.5_

## - [ ] 9. Integrate configuration system
- [ ] 9.1 Update all hardcoded values to use CONFIG
  - Replace selection padding with CONFIG.phase2.selectionPadding
  - Replace feather radius with CONFIG.phase2.autoFeatherRadius
  - Replace max variants with CONFIG.phase2.maxVariants
  - Replace seeding preference with CONFIG.phase2.enableSeeding
  - Add validation for config values with fallback to defaults
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

## - [ ] 10. Add cleanup and resource management
- [ ] 10.1 Implement temp file cleanup
  - Track all temp files created during generation
  - Delete temp files within 5 seconds of completion
  - Clean up on error or cancellation
  - Log cleanup failures as warnings
  - _Requirements: 14.2, 15.2_

- [ ] 10.2 Optimize memory usage
  - Limit concurrent operations to prevent memory spikes
  - Use streaming for large image data where possible
  - Monitor memory usage during multi-variant generation
  - Add memory limit checks (500MB max)
  - _Requirements: 15.3_

## - [ ] 11. Update documentation
- [ ] 11.1 Update README.md with Phase 2 features
  - Add selection-aware inpainting to features list
  - Add multi-variant generation to features list
  - Update usage section with mode selector instructions
  - Add tips for best inpainting results
  - _Requirements: All_

- [ ] 11.2 Update DEVELOPMENT.md with Phase 2 implementation details
  - Document new PhotoshopUtils methods
  - Document ModeManager class
  - Document LayerManager class
  - Document inpainting request format
  - Add Phase 2 testing guidelines
  - _Requirements: All_

## - [ ] 12. Testing and validation
- [ ] 12.1 Write unit tests for new PhotoshopUtils methods
  - Test getSelectionWithPadding with various padding values
  - Test applyFeatherToLayerMask with different radii
  - Test createLayerGroup and addLayerToGroup
  - _Requirements: 2.3, 5.1, 8.1_

- [ ] 12.2 Write unit tests for ModeManager
  - Test mode detection with and without selection
  - Test UI state updates
  - Test mode preference persistence
  - _Requirements: 1.1, 1.2, 10.4, 10.5_

- [ ] 12.3 Write integration test for full inpainting workflow
  - Create mock selection
  - Export content and mask
  - Send inpainting request
  - Verify layer placement and alignment
  - Verify feathering applied
  - _Requirements: All Phase 2 requirements_

- [ ] 12.4 Manual testing with various selection types
  - Test with rectangular marquee selections
  - Test with lasso selections
  - Test with magic wand selections
  - Test with different document sizes and resolutions
  - Verify alignment accuracy and feathering quality
  - _Requirements: All Phase 2 requirements_

---

## Implementation Order

**Week 1 (Days 1-3): Core Inpainting**
1. Task 1: Extend PhotoshopUtils
2. Task 3: Implement inpainting request flow
3. Task 4: Update proxy server
4. Task 5: Layer creation with alignment

**Week 1 (Days 4-5): UI and Mode Management**
5. Task 2: Mode detection and UI
6. Task 8: Error handling
7. Task 9: Configuration integration

**Week 2 (Days 6-7): Multi-Variant**
8. Task 6: Multi-variant generation
9. Task 7: Progress feedback
10. Task 10: Cleanup and optimization

**Week 2 (Days 8-10): Polish and Testing**
11. Task 11: Documentation
12. Task 12: Testing and validation
13. Final bug fixes and refinements

---

## Notes

- All tasks including tests are required for comprehensive Phase 2 implementation
- Each task should be completed and tested before moving to the next
- Commit after each major task completion
- Test in Photoshop frequently during development
- Keep Phase 1 functionality working throughout Phase 2 development
