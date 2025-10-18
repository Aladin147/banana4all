# Phase 2: Pro-Grade Inpainting & Layer Hygiene - Requirements

## Introduction

Phase 2 extends Banana4All from basic text-to-image generation to professional-grade selection-aware inpainting with seamless blending and multi-variant generation. This phase enables users to generate AI content directly into selected areas of their Photoshop documents while preserving unselected content and maintaining non-destructive workflows.

## Glossary

- **Plugin**: The Banana4All UXP plugin running inside Adobe Photoshop
- **Selection**: A user-defined area in Photoshop marked for editing (created via marquee, lasso, or other selection tools)
- **Inpainting**: AI-based image generation that fills or modifies only the selected area while preserving surrounding content
- **Mask**: A binary (black/white) image defining which pixels should be modified (white) vs preserved (black)
- **Feathering**: Gradual blending of edges to create seamless transitions between generated and original content
- **Variant**: An alternative version of the same generation request with different random seed
- **Layer Group**: A Photoshop organizational structure containing multiple related layers
- **Bounding Box**: The rectangular area that encompasses a selection
- **Session Token**: UXP security mechanism for file system access
- **Modal Execution**: Photoshop's required context for DOM manipulation operations

## Requirements

### Requirement 1: Selection Detection

**User Story:** As a Photoshop user, I want the plugin to automatically detect when I have an active selection, so that I can choose between full-image generation and selection-aware inpainting.

#### Acceptance Criteria

1. WHEN the Plugin UI loads, THE Plugin SHALL check for an active selection in the current document
2. WHEN a selection exists, THE Plugin SHALL display "Generate in Selection" mode option
3. WHEN no selection exists, THE Plugin SHALL display "Generate New Layer" mode option
4. WHEN the selection changes, THE Plugin SHALL update the mode display within 500 milliseconds
5. WHERE the user has no active document open, THE Plugin SHALL disable generation controls and display "Open a document to begin"

### Requirement 2: Selection Bounds Extraction

**User Story:** As a developer, I want to extract precise selection boundaries, so that I can crop the generation area and align the result correctly.

#### Acceptance Criteria

1. WHEN a selection exists, THE Plugin SHALL extract the bounding box coordinates (left, top, right, bottom)
2. THE Plugin SHALL calculate width and height from the bounding box coordinates
3. THE Plugin SHALL add configurable padding to the bounding box (default 10 pixels)
4. WHEN the selection is smaller than 64x64 pixels, THE Plugin SHALL display a warning message
5. WHEN the selection is larger than 2048x2048 pixels, THE Plugin SHALL display a performance warning

### Requirement 3: Selection Content Export

**User Story:** As a user, I want the plugin to capture my selected area's content, so that the AI can generate content that blends with the existing image.

#### Acceptance Criteria

1. WHEN generating in selection mode, THE Plugin SHALL export the selected area as a PNG image
2. THE Plugin SHALL preserve the original image's color profile during export
3. THE Plugin SHALL include the configurable padding area in the export
4. THE Plugin SHALL convert the exported content to base64 format for API transmission
5. IF export fails, THEN THE Plugin SHALL display an error message and cancel the generation

### Requirement 4: Mask Generation

**User Story:** As a developer, I want to generate a binary mask from the selection, so that the API knows which pixels to modify.

#### Acceptance Criteria

1. WHEN generating in selection mode, THE Plugin SHALL create a grayscale mask image
2. THE Plugin SHALL fill selected areas with white (255) in the mask
3. THE Plugin SHALL fill unselected areas with black (0) in the mask
4. THE Plugin SHALL match the mask dimensions to the exported content dimensions
5. THE Plugin SHALL convert the mask to base64 format for API transmission

### Requirement 5: Auto-Feathering

**User Story:** As a user, I want generated content to blend seamlessly with my original image, so that edits look natural and professional.

#### Acceptance Criteria

1. WHEN placing a generated layer in selection mode, THE Plugin SHALL apply edge feathering to the layer mask
2. THE Plugin SHALL use a configurable feather radius (default 2 pixels)
3. THE Plugin SHALL apply feathering only to the mask edges, not the entire selection
4. WHERE the user has disabled auto-feathering in settings, THE Plugin SHALL skip feathering
5. THE Plugin SHALL preserve the original layer content while applying the feathered mask

### Requirement 6: Exact Layer Alignment

**User Story:** As a user, I want generated content to appear exactly where my selection was, so that I don't need to manually reposition layers.

#### Acceptance Criteria

1. WHEN placing a generated layer, THE Plugin SHALL position it at the exact selection coordinates
2. THE Plugin SHALL account for the padding offset when positioning the layer
3. THE Plugin SHALL preserve the document's DPI and resolution settings
4. THE Plugin SHALL maintain pixel-perfect alignment even with non-rectangular selections
5. IF alignment fails, THEN THE Plugin SHALL place the layer at document origin and log a warning

### Requirement 7: Multi-Variant Generation

**User Story:** As a user, I want to generate multiple variations of the same prompt, so that I can choose the best result without re-typing my prompt.

#### Acceptance Criteria

1. WHERE the user enables multi-variant mode, THE Plugin SHALL generate up to 4 variants per request
2. THE Plugin SHALL create a layer group named "AI Variants: [prompt]" for organizing variants
3. THE Plugin SHALL name each variant layer "Variant 1", "Variant 2", etc.
4. THE Plugin SHALL generate variants sequentially to avoid API rate limits
5. WHERE variant generation is enabled, THE Plugin SHALL use different random seeds for each variant

### Requirement 8: Layer Group Organization

**User Story:** As a user, I want my generated layers organized in groups, so that my layer panel stays clean and manageable.

#### Acceptance Criteria

1. WHEN generating multiple variants, THE Plugin SHALL create a collapsed layer group
2. THE Plugin SHALL place all variant layers inside the group
3. THE Plugin SHALL position the group at the top of the layer stack
4. THE Plugin SHALL preserve existing layer groups and not interfere with user organization
5. WHERE only one variant is generated, THE Plugin SHALL create a standalone layer without a group

### Requirement 9: Proxy Server Inpainting Support

**User Story:** As a developer, I want the proxy server to support inpainting requests, so that selection content and masks can be sent to the API.

#### Acceptance Criteria

1. WHEN the proxy receives an inpainting request, THE Proxy Server SHALL include both the image and mask in the API payload
2. THE Proxy Server SHALL format the request according to OpenRouter's image editing specification
3. THE Proxy Server SHALL handle base64 image data for both content and mask
4. THE Proxy Server SHALL validate that mask dimensions match content dimensions
5. IF the API returns an error, THEN THE Proxy Server SHALL return a descriptive error message to the Plugin

### Requirement 10: UI Mode Switching

**User Story:** As a user, I want to easily switch between full-image and selection modes, so that I can use the appropriate generation method for my task.

#### Acceptance Criteria

1. THE Plugin SHALL display a mode selector with "New Layer" and "Edit Selection" options
2. WHEN no selection exists, THE Plugin SHALL disable the "Edit Selection" option
3. WHEN a selection exists, THE Plugin SHALL enable both options
4. THE Plugin SHALL remember the user's last selected mode in localStorage
5. THE Plugin SHALL display the current mode prominently in the UI

### Requirement 11: Progress Feedback

**User Story:** As a user, I want to see progress updates during multi-variant generation, so that I know the plugin is working and how long to wait.

#### Acceptance Criteria

1. WHEN generating multiple variants, THE Plugin SHALL display "Generating variant X of Y"
2. THE Plugin SHALL update the progress message after each variant completes
3. THE Plugin SHALL show the total elapsed time during generation
4. THE Plugin SHALL allow cancellation during multi-variant generation
5. WHERE generation is cancelled, THE Plugin SHALL keep successfully generated variants and discard incomplete ones

### Requirement 12: Error Handling for Selection Operations

**User Story:** As a user, I want clear error messages when selection operations fail, so that I can understand and fix the problem.

#### Acceptance Criteria

1. IF selection export fails, THEN THE Plugin SHALL display "Failed to export selection content"
2. IF mask generation fails, THEN THE Plugin SHALL display "Failed to create selection mask"
3. IF layer alignment fails, THEN THE Plugin SHALL display "Layer placed at origin - manual positioning required"
4. IF the selection is too small, THEN THE Plugin SHALL display "Selection must be at least 64x64 pixels"
5. THE Plugin SHALL log detailed error information to the console for debugging

### Requirement 13: Configuration Integration

**User Story:** As a developer, I want Phase 2 settings centralized in the config file, so that behavior can be easily adjusted without code changes.

#### Acceptance Criteria

1. THE Plugin SHALL read selection padding from CONFIG.phase2.selectionPadding
2. THE Plugin SHALL read feather radius from CONFIG.phase2.autoFeatherRadius
3. THE Plugin SHALL read max variants from CONFIG.phase2.maxVariants
4. THE Plugin SHALL read seeding preference from CONFIG.phase2.enableSeeding
5. WHERE config values are invalid, THE Plugin SHALL use safe default values and log a warning

### Requirement 14: Non-Destructive Workflow

**User Story:** As a user, I want all edits to be non-destructive, so that I can always revert or adjust my changes.

#### Acceptance Criteria

1. THE Plugin SHALL never modify the original layer content
2. THE Plugin SHALL create new layers for all generated content
3. THE Plugin SHALL use layer masks for blending, not pixel deletion
4. THE Plugin SHALL preserve the original selection after generation completes
5. THE Plugin SHALL allow users to adjust opacity and blend modes on generated layers

### Requirement 15: Performance Optimization

**User Story:** As a user, I want the plugin to remain responsive during generation, so that I can continue working in Photoshop.

#### Acceptance Criteria

1. THE Plugin SHALL execute all Photoshop operations within executeAsModal contexts
2. THE Plugin SHALL clean up temporary files within 5 seconds of generation completion
3. THE Plugin SHALL limit memory usage to under 500MB during multi-variant generation
4. THE Plugin SHALL not block the Photoshop UI during API requests
5. WHERE generation takes longer than 30 seconds, THE Plugin SHALL display a "Still working..." message
