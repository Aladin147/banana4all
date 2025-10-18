# UXP Photoshop API Research Notes

## Current Problem
We're trying to export selection content and mask from Photoshop, but file operations are failing with "no such file or directory" errors even though files appear to be created.

## What We Know Works

### File Writing (Blob → File → Photoshop)
```javascript
// This pattern WORKS in createImageLayer:
const dataFolder = await fs.getDataFolder();
const tempFile = await dataFolder.createFile(`temp_${Date.now()}.png`, { overwrite: true });
const arrayBuffer = await imageBlob.arrayBuffer();
const binaryData = new Uint8Array(arrayBuffer);
await tempFile.write(binaryData);
const sessionToken = fs.createSessionToken(await fs.getEntryWithUrl(tempFile.nativePath));
// Use sessionToken in batchPlay
await tempFile.delete();
```

### What Doesn't Work

1. **Photoshop Save → File Read**
```javascript
// This FAILS:
await batchPlay([{
  _obj: 'save',
  as: { _obj: 'PNGFormat' },
  in: { _path: token, _kind: 'local' },
  copy: false
}], {});
const buffer = await file.read(); // ERROR: no such file or directory
```

2. **APIs that don't exist:**
- `fs.getTempFolder()` - doesn't exist
- `layer.getPixels()` - doesn't exist
- Direct pixel access APIs

## Questions for Research

1. **File System Timing**: Why can't we read files immediately after Photoshop saves them?
   - Is there a flush/sync operation needed?
   - Do we need different file system permissions?
   - Is `copy: true` vs `copy: false` the issue?

2. **Alternative Export Methods**: 
   - Can we use `exportDocument` instead of `save`?
   - Is there a way to get base64 directly from batchPlay?
   - Can we use clipboard operations?

3. **Document APIs**:
   - What properties/methods exist on `app.activeDocument`?
   - What properties/methods exist on layers?
   - Can we access pixel data any other way?

4. **Session Tokens**:
   - Do we need session tokens for reading files?
   - Are there different token types for read vs write?

## Research Sources Needed

1. Adobe UXP API Reference: https://developer.adobe.com/photoshop/uxp/
2. Photoshop batchPlay documentation
3. UXP File System API docs
4. Community forums/examples of working export code
5. Check if there's an imaging/canvas API in UXP

## Potential Solutions to Try

### Option 1: Use Different Save Method
Try `exportDocument` batchPlay action instead of `save`

### Option 2: Read File Outside Modal Scope
Maybe file operations need to happen outside executeAsModal?

### Option 3: Use Clipboard
Copy to clipboard, paste into HTML canvas, convert to blob

### Option 4: Keep Document Open
Don't close document, try to access it differently

### Option 5: Use Different File Location
Try system temp folder or user documents folder

## Next Steps
1. Search Adobe developer docs for file export examples
2. Look for UXP plugin examples that export images
3. Check if there's a working pattern in Adobe's sample plugins
4. Test if the issue is timing (longer delays) or fundamental API limitation
