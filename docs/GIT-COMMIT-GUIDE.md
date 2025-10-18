# Git Commit Guide for v1.1.0 Release

## Pre-Commit Checklist

- [x] All code changes tested in Photoshop
- [x] Semantic inpainting working correctly
- [x] Layer positioning accurate
- [x] Image resizing functional
- [x] Feathering applied properly
- [x] No diagnostics errors
- [x] Documentation updated
- [x] Changelog created
- [x] Release notes written

## Commit Steps

### 1. Check Status

```bash
git status
```

Expected changes:
- `src/js/main.js` - Inpainting workflow
- `src/js/photoshop-utils.js` - Cropping, resizing, positioning
- `src/config.js` - Phase 2 settings
- `proxy-server/server.js` - Semantic inpainting validation
- `docs/RELEASE-v1.1.0.md` - Release notes
- `docs/SEMANTIC-INPAINTING-FIX.md` - Technical documentation
- `CHANGELOG.md` - Version history

### 2. Stage Changes

```bash
# Stage all changes
git add .

# Or stage selectively
git add src/js/main.js
git add src/js/photoshop-utils.js
git add src/config.js
git add proxy-server/server.js
git add docs/
git add CHANGELOG.md
```

### 3. Commit with Descriptive Message

```bash
git commit -m "feat: Add semantic inpainting with selection-aware editing (v1.1.0)

Major Features:
- Semantic inpainting with Gemini 2.5 Flash
- Automatic selection detection and mode switching
- Smart cropping with configurable padding
- Automatic image resizing to match selection
- Precise layer positioning at selection coordinates
- Auto-feathering for seamless blending

Technical Improvements:
- New exportCroppedRegion() method using duplicate+crop
- Layer resizing with bicubic interpolation
- Two-step positioning: place + move
- Enhanced semantic prompt template
- Improved proxy validation for inpainting

Bug Fixes:
- Fixed layer placement using absolute coordinates
- Fixed image size mismatch with auto-resize
- Fixed selection bounds with proper padding
- Fixed mask application with feathering
- Fixed temp document cleanup

Breaking Changes: None (fully backward compatible)

Closes #2 (if you have an issue tracker)
"
```

### 4. Create Tag for Release

```bash
# Create annotated tag
git tag -a v1.1.0 -m "Release v1.1.0: Semantic Inpainting

Major release adding selection-aware semantic inpainting capabilities.

Key Features:
- Selection detection and auto-mode switching
- Semantic editing with Gemini 2.5 Flash
- Automatic resizing and positioning
- Feathered masking for seamless blending

See CHANGELOG.md for full details.
"

# Verify tag
git tag -l -n9 v1.1.0
```

### 5. Push to Remote

```bash
# Push commits
git push origin main

# Push tags
git push origin v1.1.0

# Or push everything
git push origin main --tags
```

## Alternative: Shorter Commit Message

If you prefer a more concise commit:

```bash
git commit -m "feat: semantic inpainting with selection-aware editing (v1.1.0)

- Add automatic selection detection and mode switching
- Implement smart cropping with padding
- Add automatic image resizing and positioning
- Apply feathered masking for seamless blending
- Update semantic prompt template
- Clean up unused methods

Fully backward compatible with v1.0.0
"
```

## Branch Strategy (Optional)

If you want to use a feature branch:

```bash
# Create feature branch
git checkout -b feature/semantic-inpainting

# Make changes and commit
git add .
git commit -m "feat: implement semantic inpainting"

# Push feature branch
git push origin feature/semantic-inpainting

# Create pull request on GitHub
# After review, merge to main

# Tag the release on main
git checkout main
git pull
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

## GitHub Release (Optional)

After pushing the tag, create a GitHub release:

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Select tag: `v1.1.0`
4. Release title: `v1.1.0 - Semantic Inpainting`
5. Description: Copy from `docs/RELEASE-v1.1.0.md`
6. Attach build artifacts (optional):
   - `banana4all-v1.1.0.zip` (plugin files)
   - `proxy-server-v1.1.0.zip` (proxy server)
7. Click "Publish release"

## Rollback (If Needed)

If something goes wrong:

```bash
# Revert to previous commit
git revert HEAD

# Or reset to previous tag
git reset --hard v1.0.0

# Force push (use with caution!)
git push origin main --force

# Delete tag locally and remotely
git tag -d v1.1.0
git push origin :refs/tags/v1.1.0
```

## Post-Commit Tasks

- [ ] Verify commit appears on GitHub
- [ ] Verify tag appears in releases
- [ ] Test clone on fresh machine
- [ ] Update README if needed
- [ ] Announce release (if applicable)
- [ ] Monitor for issues

---

**Ready to commit!** 🚀

Use the commands above to save your work and create a stable v1.1.0 release.
