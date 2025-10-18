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

  static async createImageLayer(imageBlob, layerName = 'AI Generated', position = null, expectedDimensions = null) {
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
        
        // Execute the placement (always at center first)
        await batchPlay([placeEvent], {
          synchronousExecution: false,
          modalBehavior: 'wait'
        });
        
        // Get the placed layer
        const layer = doc.activeLayers[0];
        
        // Rename the layer
        if (layer) {
          layer.name = layerName;
        }
        
        // If expected dimensions are specified, resize the layer first
        if (expectedDimensions && layer) {
          const currentWidth = layer.bounds.width;
          const currentHeight = layer.bounds.height;
          const targetWidth = expectedDimensions.width;
          const targetHeight = expectedDimensions.height;
          
          console.log(`Layer size: ${currentWidth}x${currentHeight}, expected: ${targetWidth}x${targetHeight}`);
          
          // Only resize if dimensions don't match (with 1px tolerance)
          if (Math.abs(currentWidth - targetWidth) > 1 || Math.abs(currentHeight - targetHeight) > 1) {
            console.log(`Resizing layer to match expected dimensions...`);
            
            // Calculate scale percentages
            const scaleX = (targetWidth / currentWidth) * 100;
            const scaleY = (targetHeight / currentHeight) * 100;
            
            console.log(`Scale: ${scaleX.toFixed(2)}% x ${scaleY.toFixed(2)}%`);
            
            // Transform the layer to exact dimensions
            await batchPlay([{
              _obj: 'transform',
              _target: [{ _ref: 'layer', _enum: 'ordinal', _value: 'targetEnum' }],
              freeTransformCenterState: {
                _enum: 'quadCenterState',
                _value: 'QCSCorner0' // Top-left corner as anchor
              },
              width: { _unit: 'percentUnit', _value: scaleX },
              height: { _unit: 'percentUnit', _value: scaleY },
              interfaceIconFrameDimmed: {
                _enum: 'interpolationType',
                _value: 'bicubic'
              }
            }], {});
            
            console.log(`Layer resized to ${layer.bounds.width}x${layer.bounds.height}`);
          } else {
            console.log('Layer size matches expected dimensions, no resize needed');
          }
        }
        
        // If position is specified, move the layer to exact coordinates
        if (position && layer) {
          console.log(`Moving layer to position (${position.x}, ${position.y})`);
          
          // Get current layer bounds
          const layerBounds = layer.bounds;
          const currentLeft = layerBounds.left;
          const currentTop = layerBounds.top;
          
          // Calculate offset needed
          const deltaX = position.x - currentLeft;
          const deltaY = position.y - currentTop;
          
          console.log(`Layer currently at (${currentLeft}, ${currentTop}), moving by (${deltaX}, ${deltaY})`);
          
          // Move the layer
          await batchPlay([{
            _obj: 'move',
            _target: [{ _ref: 'layer', _enum: 'ordinal', _value: 'targetEnum' }],
            to: {
              _obj: 'offset',
              horizontal: { _unit: 'pixelsUnit', _value: deltaX },
              vertical: { _unit: 'pixelsUnit', _value: deltaY }
            }
          }], {});
          
          console.log(`Layer moved to (${layer.bounds.left}, ${layer.bounds.top})`);
        }
        
        // Wait for Photoshop to finish processing
        await new Promise(resolve => setTimeout(resolve, CONFIG.photoshop.processingDelay));
        
        // Clean up temporary file
        await tempFile.delete();
        
        return layer;
        
      } catch (error) {
        console.error('Error placing image:', error);
        throw error;
      }
    });
  }

  // ===== Phase 2: Semantic Inpainting Methods =====
  
  /**
   * Export a cropped region of the document (for semantic inpainting)
   * @param {Object} bounds - {left, top, width, height}
   */
  static async exportCroppedRegion(bounds) {
    return await core.executeAsModal(async () => {
      const batchPlay = require('photoshop').action.batchPlay;
      const uxp = require('uxp');
      const fs = uxp.storage.localFileSystem;
      const dataFolder = await fs.getDataFolder();
      
      try {
        const originalDoc = app.activeDocument;
        const originalDocId = originalDoc.id;
        
        console.log(`Cropping region: ${bounds.width}x${bounds.height} at (${bounds.left}, ${bounds.top})`);
        
        // Duplicate the document
        await batchPlay([{
          _obj: 'duplicate',
          _target: [{ _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' }],
          name: 'temp_crop'
        }], {});
        
        const tempDoc = app.activeDocument;
        const tempDocId = tempDoc.id;
        
        // Flatten the duplicate
        await batchPlay([{ _obj: 'flattenImage' }], {});
        
        // Crop to the specified bounds
        await batchPlay([{
          _obj: 'crop',
          angle: { _unit: 'angleUnit', _value: 0 },
          to: {
            _obj: 'rectangle',
            top: { _unit: 'pixelsUnit', _value: bounds.top },
            left: { _unit: 'pixelsUnit', _value: bounds.left },
            bottom: { _unit: 'pixelsUnit', _value: bounds.top + bounds.height },
            right: { _unit: 'pixelsUnit', _value: bounds.left + bounds.width }
          },
          delete: true
        }], {});
        
        console.log(`Cropped temp doc to: ${tempDoc.width}x${tempDoc.height}`);
        
        // Save to temp file
        const tempFile = await dataFolder.createFile(`crop_${Date.now()}.png`, { overwrite: true });
        await tempDoc.saveAs.png(tempFile, { 
          interlaced: false, 
          compression: 6 
        }, true);
        
        console.log('Cropped region saved to temp file');
        
        // Read the file
        const arrayBuffer = await tempFile.read({ format: uxp.storage.formats.binary });
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        
        // Close temp document
        await batchPlay([{
          _obj: 'close',
          _target: [{ _ref: 'document', _id: tempDocId }],
          saving: { _enum: 'yesNo', _value: 'no' }
        }], {});
        
        // Return to original document
        await batchPlay([{
          _obj: 'select',
          _target: [{ _ref: 'document', _id: originalDocId }]
        }], {});
        
        console.log('Returned to original document');
        
        // Clean up temp file
        await tempFile.delete();
        
        return blob;
        
      } catch (error) {
        console.error('Error in exportCroppedRegion:', error);
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