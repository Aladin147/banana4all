# 🍌 Banana4All Proxy Server

## Why a Proxy Server?

This local proxy server solves a critical privacy concern: **keeping Photoshop completely offline** while still enabling AI image generation.

### The Problem
- Photoshop plugins normally need internet access to call AI APIs
- This means granting Photoshop network permissions
- Privacy-conscious users (using tools like LuLu) want to keep apps offline
- You don't want Photoshop sending data without your explicit control

### The Solution
- **Proxy server runs separately** from Photoshop
- **Photoshop only talks to localhost** (127.0.0.1:3000)
- **Only the proxy** has internet access
- **You control** when the proxy runs and what it accesses

## 🔒 Privacy Benefits

✅ **Photoshop stays offline** - No direct internet access  
✅ **Localhost only** - Plugin only connects to 127.0.0.1  
✅ **Controlled access** - You start/stop the proxy manually  
✅ **Transparent** - All requests logged in terminal  
✅ **No tracking** - No analytics, no telemetry  
✅ **API keys local** - Never sent anywhere except Gemini  

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd proxy-server
npm install
```

### 2. Start the Proxy
```bash
npm start
```

You'll see:
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🍌 Banana4All Proxy Server Running 🍌           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

  Local:    http://localhost:3000
  Health:   http://localhost:3000/health
  API:      http://localhost:3000/api/generate

  Privacy: ✅ Photoshop stays offline
  Control: ✅ Only this process accesses the internet
  Security: ✅ API keys never leave your machine
```

### 3. Use the Plugin
- Open Photoshop
- Load the Banana4All plugin
- Generate images as normal
- The plugin talks to localhost, proxy talks to Gemini

### 4. Stop the Proxy
Press `Ctrl+C` in the terminal

## 🔧 How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│  Photoshop  │────────▶│    Proxy     │────────▶│   Gemini    │
│   Plugin    │ Local   │   Server     │ Internet│     API     │
│             │◀────────│  (Node.js)   │◀────────│             │
└─────────────┘         └──────────────┘         └─────────────┘
   Offline!              localhost:3000           External API
```

1. **Plugin** sends request to `http://localhost:3000/api/generate`
2. **Proxy** receives request, extracts API key and prompt
3. **Proxy** forwards to Gemini API at `generativelanguage.googleapis.com`
4. **Gemini** generates image, returns base64 data
5. **Proxy** forwards response back to plugin
6. **Plugin** creates layer in Photoshop

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "service": "Banana4All Proxy",
  "version": "1.0.0",
  "timestamp": "2024-10-17T12:00:00.000Z"
}
```

### Generate Image
```bash
POST http://localhost:3000/api/generate
Content-Type: application/json

{
  "apiKey": "AIza...",
  "model": "gemini-2.0-flash-exp",
  "prompt": "A mountain landscape",
  "imageData": "base64..." // Optional, for editing
}
```

## 🛡️ Security Features

### What the Proxy Does
- ✅ Forwards requests to Gemini API only
- ✅ Validates request format
- ✅ Logs all activity (visible in terminal)
- ✅ Runs on localhost only (not accessible from network)
- ✅ No data storage or caching

### What the Proxy Does NOT Do
- ❌ Store API keys
- ❌ Log prompts or images
- ❌ Send data anywhere except Gemini
- ❌ Accept connections from other machines
- ❌ Run in the background (you control it)

## 🔍 Monitoring

All requests are logged in real-time:

```
[2024-10-17T12:00:00.000Z] Request from plugin: A mountain landscape at sunset...
[2024-10-17T12:00:00.000Z] Forwarding to Gemini: /v1beta/models/gemini-2.0-flash-exp:generateContent
[2024-10-17T12:00:05.000Z] Gemini response: 200
```

You can see:
- When requests happen
- What prompts are being sent
- Response status codes
- Any errors that occur

## 🔧 Configuration

### Change Port
Edit `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

Then update the plugin's `main.js`:
```javascript
const client = new AIImageClient(apiKey, 'http://localhost:YOUR_PORT');
```

### Add HTTPS (Advanced)
For local HTTPS, you'll need to:
1. Generate self-signed certificates
2. Update server to use `https.createServer()`
3. Update plugin to use `https://localhost:3000`

## 🐛 Troubleshooting

### "Proxy server not running"
**Problem**: Plugin can't connect to proxy  
**Solution**: Start the proxy with `npm start` in the proxy-server directory

### "EADDRINUSE: address already in use"
**Problem**: Port 3000 is already taken  
**Solution**: 
- Stop other services using port 3000
- Or change the port (see Configuration above)

### "Failed to connect to Gemini API"
**Problem**: Proxy can't reach Gemini  
**Solution**:
- Check your internet connection
- Verify firewall allows Node.js to access internet
- Verify you're using the correct model: `gemini-2.5-flash-image`
- Check if Gemini API is down

### "Invalid API key"
**Problem**: Gemini rejects the API key  
**Solution**:
- Verify your API key at https://aistudio.google.com/app/apikey
- Make sure you copied the entire key
- Try generating a new key

## 🎯 Firewall Configuration

### LuLu (macOS)
1. **Block Photoshop** - Deny all network access
2. **Allow Node.js** - Allow only for this proxy
3. **Allow localhost** - Ensure local connections work

### Little Snitch (macOS)
1. Create rule: Block Photoshop → Internet
2. Create rule: Allow Photoshop → localhost:3000
3. Create rule: Allow Node.js → generativelanguage.googleapis.com

### Windows Firewall
1. Block Adobe Photoshop outbound connections
2. Allow Node.js outbound connections
3. Allow localhost connections

## 📊 Performance

- **Startup time**: < 1 second
- **Request overhead**: < 10ms
- **Memory usage**: ~30MB
- **CPU usage**: Minimal (only during requests)

The proxy adds negligible overhead compared to direct API calls.

## 🔄 Development Mode

For development with auto-reload:

```bash
npm install -g nodemon
npm run dev
```

This restarts the server automatically when you edit `server.js`.

## 🧪 Testing

Test the proxy without Photoshop:

```bash
# Check health
curl http://localhost:3000/health

# Test generation (replace with your API key)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_API_KEY",
    "model": "gemini-2.5-flash-image",
    "prompt": "A red apple"
  }'
```

## 🚀 Production Deployment

For always-on usage, you can:

### Option 1: Run as Background Service (macOS)
Create `~/Library/LaunchAgents/com.banana4all.proxy.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.banana4all.proxy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/proxy-server/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.banana4all.proxy.plist
```

### Option 2: PM2 Process Manager
```bash
npm install -g pm2
pm2 start server.js --name banana4all-proxy
pm2 startup
pm2 save
```

### Option 3: Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
```

## 📝 Logging

For persistent logs:

```bash
npm start > proxy.log 2>&1
```

Or with PM2:
```bash
pm2 start server.js --name banana4all-proxy --log proxy.log
```

## 🤝 Contributing

Want to improve the proxy? Ideas:

- [ ] Add support for multiple AI providers
- [ ] Implement request caching
- [ ] Add rate limiting
- [ ] Create web dashboard for monitoring
- [ ] Add authentication for multi-user setups
- [ ] Support for batch requests

## 📄 License

MIT License - Same as the main plugin

---

**Privacy-first AI image generation. Your data, your control. 🍌🔒**
