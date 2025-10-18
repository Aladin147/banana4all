// Photoshop utilities for layer management and image operations
const { app, core } = require('photoshop');
const CONFIG = require('../config');

class PhotoshopUtils {
  
  // ===== Phase 2 Ready Methods =====
  // The following methods are prepared for Phase 2 selection-aware inpainting
  // They are not used in Phase 1 but tested and ready for integration
  
  static async hasActiveSelection() {
    try {
      const result = await core.executeAsModal(async () => {
        const batchPlay = require('photoshop').action.batchPlay;
        const result = await batchPlay([{
          _obj: 'get',
          _target: { _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' }
        }], {});
        return result[0].selection;
      });
      return result !== undefined;
    } catch {
      return false;
    }
  }

  static async getSelectionBounds() {
    if (!await this.hasActiveSelection()) {
      return null;
    }

    try {
      const result = await core.executeAsModal(async () => {
        const batchPlay = require('photoshop').action.batchPlay;
        const result = await batchPlay([{
          _obj: 'get',
          _target: { _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' }
        }], {});
        return result[0].selection;
      });
      
      return {
        left: result.left._value,
        top: result.top._value,
        right: result.right._value,
        bottom: result.bottom._value,
        width: result.right._value - result.left._value,
        height: result.bottom._value - result.top._value
      };
    } catch (error) {
      console.error('Error getting selection bounds:', error);
      return null;
    }
  }

  static async createImageLayer(imageBlob, layerName = 'AI Generated', position = null) {
    return await core.executeAsModal(async () => {
      const doc = app.activeDocument;
      const uxp = require('uxp');
      const fs = uxp.storage.localFileSystem;
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Get the plugin's data folder (more reliable than temp folder)
        const dataFolder = await fs.getDataFolder();
        
        // Create temp file with unique name
        const tempFile = await dataFolder.createFile(`${CONFIG.photoshop.tempFilePrefix}${Date.now()}.png`, { overwrite: true });
        
        // Convert blob to binary data
        const arrayBuffer = await imageBlob.arrayBuffer();
        const binaryData = new Uint8Array(arrayBuffer);
        
        // Write the file (UXP handles binary automatically for Uint8Array)
        await tempFile.write(binaryData);
        
        // CRITICAL: Create session token using getEntryWithUrl
        const sessionToken = fs.createSessionToken(await fs.getEntryWithUrl(tempFile.nativePath));
        
        // Place image in Photoshop using the session token
        const placeEvent = {
          _obj: 'placeEvent',
          null: {
            _path: sessionToken,  // Use the session token here!
            _kind: 'local'
          },
          freeTransformCenterState: {
            _enum: 'quadCenterState',
            _value: 'QCSAverage'
          },
          _options: {
            dialogOptions: 'dontDisplay'
          }
        };

        // If position is specified, add offset
        if (position) {
          placeEvent.offset = {
            _obj: 'offset',
            horizontal: { _unit: 'pixelsUnit', _value: position.x || 0 },
            vertical: { _unit: 'pixelsUnit', _value: position.y || 0 }
          };
        }
        
        // Execute the placement
        await batchPlay([placeEvent], {
          synchronousExecution: false,
          modalBehavior: 'wait'
        });
        
        // Rename the layer after placement
        if (doc.activeLayers && doc.activeLayers.length > 0) {
          doc.activeLayers[0].name = layerName;
        }
        
        // Wait for Photoshop to finish processing
        await new Promise(resolve => setTimeout(resolve, CONFIG.photoshop.processingDelay));
        
        // Clean up temporary file
        await tempFile.delete();
        
        return doc.activeLayers[0];
        
      } catch (error) {
        console.error('Error placing image:', error);
        throw error;
      }
    });
  }

  static async exportSelectionAsImage() {
    if (!await this.hasActiveSelection()) {
      throw new Error('No active selection to export');
    }

    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      const uxp = require('uxp');
      const fs = uxp.storage.localFileSystem;
      const dataFolder = await fs.getDataFolder();
      
      try {
        // Export selection content (selection should already be saved to channel by caller)
        const bounds = await this.getSelectionBounds();
        console.log(`Selection bounds: ${bounds.width}x${bounds.height}`);
        
        // Copy merged (includes all visible layers)
        await batchPlay([{ _obj: 'copyMerged' }], {});
        
        // Create temp document with selection size
        await batchPlay([{
          _obj: 'make',
          _target: [{ _ref: 'document' }],
          width: { _unit: 'pixelsUnit', _value: bounds.width },
          height: { _unit: 'pixelsUnit', _value: bounds.height },
          resolution: { _unit: 'densityUnit', _value: 72 },
          mode: { _enum: 'newDocumentMode', _value: 'RGBColorMode' },
          fill: { _enum: 'fill', _value: 'white' }
        }], {});
        
        const tempDoc = app.activeDocument;
        console.log(`Created temp document: ${tempDoc.id}`);
        
        // Paste
        await batchPlay([{ _obj: 'paste' }], {});
        
        // Flatten
        await batchPlay([{ _obj: 'flattenImage' }], {});
        
        // Export to temp file
        const tempFile = await dataFolder.createFile(`selection_${Date.now()}.png`, { overwrite: true });
        const token = fs.createSessionToken(tempFile);
        
        await batchPlay([{
          _obj: 'save',
          as: {
            _obj: 'PNGFormat',
            method: { _enum: 'PNGMethod', _value: 'quick' }
          },
          in: { _path: token, _kind: 'local' },
          copy: false
        }], {});
        
        console.log('Selection exported to temp file');
        
        // Read the file
        const arrayBuffer = await tempFile.read({ format: uxp.storage.formats.binary });
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        
        // Close temp document (don't save)
        await batchPlay([{
          _obj: 'close',
          saving: { _enum: 'yesNo', _value: 'no' }
        }], {});
        
        console.log('Temp document closed');
        
        // Clean up temp file
        await tempFile.delete();
        
        return blob;
        
      } catch (error) {
        console.error('Error in exportSelectionAsImage:', error);
        // Try to close any temp documents
        try {
          const docs = app.documents;
          if (docs.length > 1) {
            await batchPlay([{
              _obj: 'close',
              saving: { _enum: 'yesNo', _value: 'no' }
            }], {});
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        throw error;
      }
    });
  }

  static async createMaskFromSelection() {
    if (!await this.hasActiveSelection()) {
      throw new Error('No active selection to create mask from');
    }

    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      const uxp = require('uxp');
      const fs = uxp.storage.localFileSystem;
      const dataFolder = await fs.getDataFolder();
      
      try {
        const bounds = await this.getSelectionBounds();
        console.log(`Creating mask: ${bounds.width}x${bounds.height}`);
        
        // Create grayscale document for mask
        await batchPlay([{
          _obj: 'make',
          _target: [{ _ref: 'document' }],
          width: { _unit: 'pixelsUnit', _value: bounds.width },
          height: { _unit: 'pixelsUnit', _value: bounds.height },
          resolution: { _unit: 'densityUnit', _value: 72 },
          mode: { _enum: 'newDocumentMode', _value: 'grayscale' },
          fill: { _enum: 'fill', _value: 'white' }
        }], {});
        
        const maskDoc = app.activeDocument;
        console.log(`Created mask document: ${maskDoc.id}`);
        
        // Export mask to temp file
        const tempFile = await dataFolder.createFile(`mask_${Date.now()}.png`, { overwrite: true });
        const token = fs.createSessionToken(tempFile);
        
        await batchPlay([{
          _obj: 'save',
          as: {
            _obj: 'PNGFormat',
            method: { _enum: 'PNGMethod', _value: 'quick' }
          },
          in: { _path: token, _kind: 'local' },
          copy: false
        }], {});
        
        console.log('Mask exported to temp file');
        
        // Read the mask file
        const arrayBuffer = await tempFile.read({ format: uxp.storage.formats.binary });
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        
        // Close mask document (don't save)
        await batchPlay([{
          _obj: 'close',
          saving: { _enum: 'yesNo', _value: 'no' }
        }], {});
        
        console.log('Mask document closed');
        
        // Clean up temp file
        await tempFile.delete();
        
        return blob;
        
      } catch (error) {
        console.error('Error in createMaskFromSelection:', error);
        // Try to close any temp documents
        try {
          const docs = app.documents;
          if (docs.length > 1) {
            await batchPlay([{
              _obj: 'close',
              saving: { _enum: 'yesNo', _value: 'no' }
            }], {});
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        throw error;
      }
    });
  }

  // ===== Phase 2 New Methods =====
  
  /**
   * Export selection content and mask in a SINGLE modal scope
   * This avoids "host is in a modal state" errors
   */
  /**
   * Export selection using the SAME pattern as createImageLayer (which works!)
   * Key insight: Write blob TO file works, so reverse it - save doc, read file
   */
  static async exportSelectionAndMask() {
    // Check selection OUTSIDE modal to avoid nesting
    const hasSelection = await this.hasActiveSelection();
    if (!hasSelection) {
      throw new Error('No active selection to export');
    }

    // ONE modal scope for everything
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      const uxp = require('uxp');
      const fs = uxp.storage.localFileSystem;
      const dataFolder = await fs.getDataFolder();
      
      try {
        const originalDoc = app.activeDocument;
        const originalDocId = originalDoc.id;
        
        // Get selection bounds FIRST (before any operations)
        const boundsResult = await batchPlay([{
          _obj: 'get',
          _target: { _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' }
        }], {});
        
        const selection = boundsResult[0].selection;
        const bounds = {
          left: selection.left._value,
          top: selection.top._value,
          right: selection.right._value,
          bottom: selection.bottom._value,
          width: selection.right._value - selection.left._value,
          height: selection.bottom._value - selection.top._value
        };
        
        console.log(`Selection bounds: ${bounds.width}x${bounds.height}`);
        
        // STEP 1: Save selection to channel
        // Defensive: delete any stale temp selection channel before recreating
        try {
          await batchPlay([{ _obj: 'delete', _target: [{ _ref: 'channel', _name: 'banana4all_temp' }] }], {});
          console.log('Deleted stale selection channel: banana4all_temp');
        } catch (e) {
          // Channel may not exist; safe to ignore
        }
        await batchPlay([{
          _obj: 'make',
          new: { _ref: 'channel' },
          using: { _ref: 'channel', _enum: 'channel', _value: 'selection' },
          name: 'banana4all_temp'
        }], {});
        console.log('Selection saved to channel');
        
        // STEP 2: Export selection content
        await batchPlay([{ _obj: 'copyMerged' }], {});
        
        await batchPlay([{
          _obj: 'make',
          _target: [{ _ref: 'document' }],
          width: { _unit: 'pixelsUnit', _value: bounds.width },
          height: { _unit: 'pixelsUnit', _value: bounds.height },
          resolution: { _unit: 'densityUnit', _value: 72 },
          mode: { _enum: 'newDocumentMode', _value: 'RGBColorMode' },
          fill: { _enum: 'fill', _value: 'white' }
        }], {});
        
        await batchPlay([{ _obj: 'paste' }], {});
        await batchPlay([{ _obj: 'flattenImage' }], {});
        
        // Use document.saveAs.png - the CORRECT way!
        const tempDoc = app.activeDocument;
        const contentFile = await dataFolder.createFile(`content_${Date.now()}.png`, { overwrite: true });
        
        // This is the proper UXP way to save PNG
        await tempDoc.saveAs.png(contentFile, { 
          interlaced: false, 
          compression: 6 
        }, true); // asCopy = true
        
        console.log('Content saved via document.saveAs.png');
        
        // Close temp document
        await batchPlay([{ _obj: 'close', saving: { _enum: 'yesNo', _value: 'no' } }], {});
        
        // Read the file
        const contentBuffer = await contentFile.read({ format: uxp.storage.formats.binary });
        const contentBlob = new Blob([contentBuffer], { type: 'image/png' });
        console.log(`Content blob size: ${contentBlob.size}`);
        await contentFile.delete();
        
        // Small delay to ensure unique timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // STEP 3: Create mask using temp document (same as content)
        console.log('Creating mask document...');
        
        // Return to original document first
        await batchPlay([{
          _obj: 'select',
          _target: [{ _ref: 'document', _id: originalDocId }]
        }], {});
        
        // Create grayscale document for mask
        await batchPlay([{
          _obj: 'make',
          _target: [{ _ref: 'document' }],
          width: { _unit: 'pixelsUnit', _value: bounds.width },
          height: { _unit: 'pixelsUnit', _value: bounds.height },
          resolution: { _unit: 'densityUnit', _value: 72 },
          mode: { _enum: 'newDocumentMode', _value: 'grayscale' },
          fill: { _enum: 'fill', _value: 'white' }
        }], {});
        
        // Get the mask document immediately
        const maskDoc = app.activeDocument;
        console.log(`Mask document created: ${maskDoc ? maskDoc.id : 'null'}`);
        const maskFile = await dataFolder.createFile(`mask_${Date.now()}.png`, { overwrite: true });
        
        // Save mask using document.saveAs.png
        await maskDoc.saveAs.png(maskFile, { 
          interlaced: false, 
          compression: 6 
        }, true);
        
        console.log('Mask saved via document.saveAs.png');
        
        // Close mask document
        await batchPlay([{ _obj: 'close', saving: { _enum: 'yesNo', _value: 'no' } }], {});
        
        // Read mask file
        const maskBuffer = await maskFile.read({ format: uxp.storage.formats.binary });
        const maskBlob = new Blob([maskBuffer], { type: 'image/png' });
        console.log(`Mask blob size: ${maskBlob.size}`);
        await maskFile.delete();
        
        // STEP 4: Return to original document
        await batchPlay([{
          _obj: 'select',
          _target: [{ _ref: 'document', _id: originalDocId }]
        }], {});
        
        // STEP 5: Restore selection from channel
        await batchPlay([{
          _obj: 'set',
          _target: [{ _ref: 'channel', _enum: 'channel', _value: 'selection' }],
          to: { _ref: 'channel', _name: 'banana4all_temp' }
        }], {});
        console.log('Selection restored');
        
        // Temp files already cleaned up inline
        
        return { contentBlob, maskBlob, bounds };
        
      } catch (error) {
        console.error('Error in exportSelectionAndMask:', error);
        // Try to return to original document
        try {
          const docs = app.documents;
          if (docs.length > 1) {
            await batchPlay([{ _obj: 'close', saving: { _enum: 'yesNo', _value: 'no' } }], {});
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        throw error;
      }
    });
  }
  
  static async saveSelectionToChannel(channelName = 'temp_selection_backup') {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Save selection to alpha channel
        await batchPlay([{
          _obj: 'make',
          new: { _ref: 'channel' },
          using: { _ref: 'channel', _enum: 'channel', _value: 'selection' },
          name: channelName
        }], {});
        console.log(`Selection saved to channel: ${channelName}`);
        return true;
      } catch (error) {
        console.error('Error saving selection to channel:', error);
        return false;
      }
    });
  }

  static async restoreSelectionFromChannel(channelName = 'temp_selection_backup') {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Load selection from alpha channel
        await batchPlay([{
          _obj: 'set',
          _target: [{ _ref: 'channel', _enum: 'channel', _value: 'selection' }],
          to: { _ref: 'channel', _name: channelName }
        }], {});
        console.log(`Selection restored from channel: ${channelName}`);
        return true;
      } catch (error) {
        console.error('Error restoring selection from channel:', error);
        return false;
      }
    });
  }

  static async deleteChannel(channelName = 'temp_selection_backup') {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Delete the alpha channel
        await batchPlay([{
          _obj: 'delete',
          _target: [{ _ref: 'channel', _name: channelName }]
        }], {});
        console.log(`Channel deleted: ${channelName}`);
        return true;
      } catch (error) {
        console.error('Error deleting channel:', error);
        return false;
      }
    });
  }
  
  static async getSelectionWithPadding(padding = CONFIG.phase2.selectionPadding) {
    const bounds = await this.getSelectionBounds();
    if (!bounds) {
      return null;
    }

    return {
      left: bounds.left - padding,
      top: bounds.top - padding,
      right: bounds.right + padding,
      bottom: bounds.bottom + padding,
      width: bounds.width + (padding * 2),
      height: bounds.height + (padding * 2),
      padding: padding
    };
  }

  static async createLayerMaskFromSelection(layer, featherRadius = 0) {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Select the layer first
        await batchPlay([{
          _obj: 'select',
          _target: [{ _ref: 'layer', _id: layer.id }]
        }], {});

        // Apply feather to selection if specified
        if (featherRadius > 0) {
          await batchPlay([{
            _obj: 'feather',
            radius: { _unit: 'pixelsUnit', _value: featherRadius }
          }], {});
          console.log(`Applied ${featherRadius}px feather to selection`);
        }

        // Create layer mask from selection
        await batchPlay([{
          _obj: 'make',
          new: { _ref: 'channel' },
          at: { _ref: 'mask', _enum: 'mask', _value: 'revealSelection' },
          using: { _ref: 'channel', _enum: 'channel', _value: 'selection' }
        }], {});

        console.log('Layer mask created from selection');
      } catch (error) {
        console.error('Error creating layer mask:', error);
        throw error;
      }
    });
  }

  static async applyFeatherToLayerMask(layer, radius = CONFIG.phase2.autoFeatherRadius) {
    // This method is deprecated in favor of createLayerMaskFromSelection
    // which applies feathering during mask creation
    console.warn('applyFeatherToLayerMask is deprecated, use createLayerMaskFromSelection instead');
    return await this.createLayerMaskFromSelection(layer, radius);
  }

  static async createLayerGroup(name) {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Create a new layer group
        await batchPlay([{
          _obj: 'make',
          _target: [{ _ref: 'layerSection' }],
          using: {
            _obj: 'layerSection',
            name: name
          }
        }], {});

        // Get the newly created group (it becomes the active layer)
        const doc = app.activeDocument;
        const group = doc.activeLayers[0];
        
        console.log(`Created layer group: ${name}`);
        return group;
      } catch (error) {
        console.error('Error creating layer group:', error);
        throw error;
      }
    });
  }

  static async addLayerToGroup(layer, group) {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      
      try {
        // Move the layer into the group
        await batchPlay([{
          _obj: 'move',
          _target: [{ _ref: 'layer', _id: layer.id }],
          to: {
            _ref: 'layer',
            _id: group.id
          },
          adjustment: false
        }], {});

        console.log(`Added layer "${layer.name}" to group "${group.name}"`);
      } catch (error) {
        console.error('Error adding layer to group:', error);
        throw error;
      }
    });
  }

  static async downloadImageAsBlob(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    return await response.blob();
  }

  static async showProgress(message) {
    console.log(`[Banana4All] ${message}`);
    // Could implement a progress indicator in the UI later
  }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhotoshopUtils;
} else {
  window.PhotoshopUtils = PhotoshopUtils;
}