// Photoshop utilities for layer management and image operations
const { app, core } = require('photoshop');

class PhotoshopUtils {
  
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
        const tempFile = await dataFolder.createFile(`temp_${Date.now()}.png`, { overwrite: true });
        
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
        
        // Wait longer for Photoshop to finish processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      const fs = require('uxp').storage.localFileSystem;
      const tempFolder = await fs.getTemporaryFolder();
      const tempFile = await tempFolder.createFile('selection_export.png', { overwrite: true });
      
      // Copy selection to new document
      const batchPlay = require('photoshop').action.batchPlay;
      
      // Copy selection
      await batchPlay([{ _obj: 'copy' }], {});
      
      // Create new document and paste
      const bounds = await this.getSelectionBounds();
      await batchPlay([{
        _obj: 'make',
        _target: { _ref: 'document' },
        width: { _unit: 'pixelsUnit', _value: bounds.width },
        height: { _unit: 'pixelsUnit', _value: bounds.height },
        resolution: { _unit: 'densityUnit', _value: 72 },
        mode: { _enum: 'colorMode', _value: 'RGBColorMode' },
        initialFill: { _enum: 'fill', _value: 'transparent' }
      }], {});
      
      // Paste
      await batchPlay([{ _obj: 'paste' }], {});
      
      // Export as PNG
      await batchPlay([{
        _obj: 'exportSelectionAsFileTypePressed',
        _target: { _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' },
        fileType: { _enum: 'fileType', _value: 'PNG' },
        filePath: tempFile.nativePath
      }], {});
      
      // Close the temporary document
      await batchPlay([{ _obj: 'close' }], {});
      
      // Read the exported file
      const arrayBuffer = await tempFile.read();
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      
      return blob;
    });
  }

  static async createMaskFromSelection() {
    if (!await this.hasActiveSelection()) {
      throw new Error('No active selection to create mask from');
    }

    return await core.executeAsModal(async () => {
      const fs = require('uxp').storage.localFileSystem;
      const tempFolder = await fs.getTemporaryFolder();
      const tempFile = await tempFolder.createFile('mask_export.png', { overwrite: true });
      
      const batchPlay = require('photoshop').action.batchPlay;
      const bounds = await this.getSelectionBounds();
      
      // Create new document for mask
      await batchPlay([{
        _obj: 'make',
        _target: { _ref: 'document' },
        width: { _unit: 'pixelsUnit', _value: bounds.width },
        height: { _unit: 'pixelsUnit', _value: bounds.height },
        resolution: { _unit: 'densityUnit', _value: 72 },
        mode: { _enum: 'colorMode', _value: 'grayscaleMode' },
        initialFill: { _enum: 'fill', _value: 'black' }
      }], {});
      
      // Fill selection area with white
      await batchPlay([{
        _obj: 'fill',
        using: { _enum: 'fillContents', _value: 'white' },
        mode: { _enum: 'blendMode', _value: 'normal' },
        opacity: { _unit: 'percentUnit', _value: 100 }
      }], {});
      
      // Export mask
      await batchPlay([{
        _obj: 'exportSelectionAsFileTypePressed',
        _target: { _ref: 'document', _enum: 'ordinal', _value: 'targetEnum' },
        fileType: { _enum: 'fileType', _value: 'PNG' },
        filePath: tempFile.nativePath
      }], {});
      
      // Close mask document
      await batchPlay([{ _obj: 'close' }], {});
      
      // Read the mask file
      const arrayBuffer = await tempFile.read();
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      
      return blob;
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