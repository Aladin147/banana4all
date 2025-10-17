# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email the maintainers directly. Do not open a public issue.

## API Key Security

**NEVER commit API keys to the repository!**

### Best Practices

1. **Use environment variables**
   ```bash
   export OPENROUTER_API_KEY=your-key-here
   ```

2. **Use .env files (gitignored)**
   ```bash
   # Create .env file
   echo "OPENROUTER_API_KEY=your-key-here" > proxy-server/.env
   ```

3. **Pass as command line argument**
   ```bash
   node test-script.js YOUR_API_KEY
   ```

### If You Accidentally Commit an API Key

1. **Immediately revoke the key** at [OpenRouter](https://openrouter.ai/keys)
2. **Generate a new key**
3. **Remove from git history:**
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push** (⚠️ Warning: This rewrites history)
   ```bash
   git push origin --force --all
   ```

### Protected Files

The following files are gitignored to prevent accidental commits:
- `.env`
- `.env.local`
- `*.key`
- `api-keys.txt`
- `secrets/`

## Security Features

### Plugin Architecture
- **Offline Photoshop**: Plugin doesn't make external requests
- **Local Proxy**: Only the proxy server accesses the internet
- **No Logging**: API keys are never logged
- **Local Storage**: Keys stored in browser localStorage only

### Data Privacy
- No telemetry or analytics
- No data sent to third parties (except OpenRouter API)
- Temporary files are deleted after use
- No persistent storage of generated images

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Known Security Considerations

1. **localStorage**: API keys are stored in browser localStorage
   - Accessible to the plugin only
   - Not encrypted (browser-level security)
   - Cleared when plugin is removed

2. **Proxy Server**: Runs on localhost:3000
   - Only accepts connections from localhost
   - CORS restricted
   - No authentication (local only)

3. **File System**: Plugin writes to data folder
   - Temporary files only
   - Cleaned up after use
   - No access to user documents

## Security Checklist for Contributors

- [ ] No API keys in code
- [ ] No sensitive data in commits
- [ ] Environment variables for secrets
- [ ] .env files are gitignored
- [ ] Test files don't contain real keys
- [ ] Documentation doesn't expose credentials

## Contact

For security concerns, contact the maintainers directly.
