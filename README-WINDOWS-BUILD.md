# 🪟 Building NetDoc for Windows - Quick Guide

This is a quick-start guide for creating a Windows installer for NetDoc. For detailed documentation, see [BUILD.md](BUILD.md).

## ⚡ Quick Build (4 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Setup Script (First Time Only)

```bash
node setup-electron.cjs
```

This configures package.json with the required Electron build scripts.

### Step 3: Build Windows Installer

```bash
node build-windows.js
```

### Step 4: Get Your Installer

Find your installers in the `release/` folder:
- `NetDoc-Setup-1.0.0.exe` - Full installer with wizard
- `NetDoc-Portable-1.0.0.exe` - Portable version (no install needed)

## ✅ What Gets Built

The Windows installer packages your complete NetDoc application:

- ✅ React frontend (web interface)
- ✅ Express backend (API server)
- ✅ Built-in database (in-memory storage)
- ✅ Monitoring service (background worker)
- ✅ All dependencies included

## 💻 System Requirements

**To Build:**
- Windows 10/11, macOS, or Linux
- Node.js 18 or higher
- 2 GB free disk space

**To Run (End Users):**
- Windows 10/11 (64-bit)
- No additional software needed (includes Node.js runtime)
- 500 MB disk space

## 📦 Installer Types

### NSIS Installer (NetDoc-Setup-1.0.0.exe)

**Best for:** Standard Windows installations in schools/organizations

- Professional installation wizard
- Desktop and Start Menu shortcuts
- Appears in Windows "Add/Remove Programs"
- Automatic uninstaller
- ~150 MB file size

**How to install:**
1. Double-click the .exe file
2. Follow the wizard
3. Launch from Desktop shortcut

### Portable Version (NetDoc-Portable-1.0.0.exe)

**Best for:** Testing, USB drives, no-installation scenarios

- No installation required
- Run from anywhere (Desktop, USB drive, network share)
- No admin rights needed
- Perfect for testing or temporary use
- ~150 MB file size

**How to use:**
1. Copy the .exe file anywhere
2. Double-click to run
3. That's it!

## 🎯 Common Use Cases

### Scenario 1: School IT Department Installation

**Goal:** Install on all IT staff computers

**Solution:** Use NSIS Installer
```
1. Run build: node build-windows.js
2. Distribute: Copy NetDoc-Setup-1.0.0.exe to network share
3. Install: IT staff run the installer
4. Result: Shortcut on Desktop, app in Start Menu
```

### Scenario 2: Quick Demo for Management

**Goal:** Show NetDoc to administrators without installing

**Solution:** Use Portable Version
```
1. Copy NetDoc-Portable-1.0.0.exe to USB drive
2. Run directly from USB on any Windows PC
3. No installation, no traces left behind
```

### Scenario 3: Network Share Deployment

**Goal:** Make available to all network users

**Solution:** Network Share + Shortcuts
```
1. Place NetDoc-Portable-1.0.0.exe on network share
2. Create shortcuts pointing to network location
3. Users run from network (no local installation)
```

## 🔧 Customization

### Change App Name

Edit `electron-builder.config.js`:
```javascript
productName: 'Your School Network Docs'
```

### Change Icon

Replace `build/icon.png` with your custom icon (512x512 PNG)

### Change Version

Edit `package.json`:
```json
"version": "1.0.1"
```

Then rebuild!

## ⚠️ Known Issues

### Windows SmartScreen Warning

**Issue:** Windows shows "Windows protected your PC" warning

**Why:** Unsigned applications trigger SmartScreen

**Solution for Users:**
1. Click "More info"
2. Click "Run anyway"

**Solution for Production:** 
- Sign your installer with a code signing certificate
- See [BUILD.md](BUILD.md) for details

### Antivirus False Positives

**Issue:** Some antivirus software flags the installer

**Why:** Electron apps can trigger heuristic detection

**Solution:**
- Add exception in antivirus software
- Sign your installer (production)
- Scan with VirusTotal to verify it's clean

## 📋 Before Distribution Checklist

- [ ] Test installer on clean Windows 10/11
- [ ] Verify NetDoc launches after installation
- [ ] Check all features work (devices, ports, monitoring)
- [ ] Test uninstaller removes everything
- [ ] Test portable version on different PC
- [ ] Update version number if needed
- [ ] Create user documentation

## 🆘 Troubleshooting

### Build fails with errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Try build again
node build-windows.js
```

### "Cannot find module" errors

```bash
# Ensure all dependencies installed
npm install

# Rebuild
node build-windows.js
```

### App shows blank window after install

**Check:** Server might not be starting
- Open Task Manager → Look for "NetDoc" process
- If missing, try reinstalling

## 📞 Next Steps

1. **Read full documentation:** [BUILD.md](BUILD.md)
2. **Build your installer:** `node build-windows.js`
3. **Test on another PC:** Copy installer to different Windows machine
4. **Distribute:** Share with your team!

## 📚 Additional Files

- `BUILD.md` - Comprehensive build documentation
- `electron-builder.config.js` - Build configuration
- `build-windows.js` - Automated build script
- `electron/main.js` - Electron application entry point

---

**Need help?** Check [BUILD.md](BUILD.md) for detailed troubleshooting and advanced configuration options.
