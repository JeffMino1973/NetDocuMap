# Building NetDoc for Windows

This guide explains how to build a Windows installer for the NetDoc network documentation application.

## 📋 Prerequisites

Before building the Windows installer, ensure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   
2. **All dependencies installed**
   ```bash
   npm install
   ```

3. **Windows 10/11** (recommended for building Windows installers)
   - You can build on macOS/Linux, but some features work best on Windows

## 🚀 Quick Start - Build Windows Installer

### Option 1: Using the Build Script (Recommended)

**First Time Setup:**

Run the setup script to configure package.json:

```bash
node setup-electron.cjs
```

This adds the required build scripts and Electron configuration to package.json. You only need to run this once.

**Build the Installer:**

Run the automated build script:

```bash
node build-windows.js
```

This will:
1. ✅ Build the React frontend (Vite)
2. ✅ Verify build completed successfully
3. ✅ Package with Electron (includes server source + tsx runtime)
4. ✅ Create Windows installers (NSIS + Portable)

### Option 2: Manual Build Steps

If you prefer to build manually:

```bash
# Step 0: First time setup (adds scripts to package.json)
node setup-electron.cjs

# Step 1: Build frontend
npm run build:client

# Step 2: Create Windows installer  
npx electron-builder --config electron-builder.config.js --win
```

## 📦 Build Output

After building, you'll find the installers in the `release/` folder:

```
release/
├── NetDoc-Setup-1.0.0.exe      # NSIS Installer (recommended)
└── NetDoc-Portable-1.0.0.exe   # Portable version (no install)
```

### NSIS Installer (NetDoc-Setup-1.0.0.exe)

**Best for:** Standard Windows installation

**Features:**
- ✅ Professional installation wizard
- ✅ Customizable installation directory
- ✅ Desktop shortcut creation
- ✅ Start Menu shortcuts
- ✅ Automatic uninstaller
- ✅ Integrates with Windows Add/Remove Programs

**Installation:**
1. Double-click `NetDoc-Setup-1.0.0.exe`
2. Follow the installation wizard
3. Choose installation directory (default: `C:\Users\{username}\AppData\Local\Programs\NetDoc`)
4. Select shortcut preferences
5. Click "Install"

**File Size:** ~150-200 MB (includes Node.js runtime and Chromium)

### Portable Version (NetDoc-Portable-1.0.0.exe)

**Best for:** Running without installation, USB drives, testing

**Features:**
- ✅ No installation required
- ✅ Run directly from any location
- ✅ Can be run from USB drives
- ✅ No admin rights needed
- ✅ Leaves no registry entries

**Usage:**
1. Copy `NetDoc-Portable-1.0.0.exe` anywhere (Desktop, USB drive, network share)
2. Double-click to run
3. No installation needed!

**File Size:** ~150-200 MB (includes Node.js runtime and Chromium)

## 🎨 Customizing the Build

### Change Application Icon

Replace `build/icon.png` with your custom icon:

```bash
# Your icon should be:
# - PNG format
# - 512x512 pixels (or larger)
# - Square aspect ratio
```

### Modify Application Info

Edit `electron-builder.config.js`:

```javascript
module.exports = {
  appId: 'com.yourcompany.netdoc',      // Change company name
  productName: 'Your Product Name',      // Change app name
  copyright: 'Copyright © 2024 Your Company',
  // ... other settings
};
```

### Configure NSIS Installer Options

In `electron-builder.config.js`, modify the `nsis` section:

```javascript
nsis: {
  oneClick: false,                       // false = wizard, true = one-click
  allowToChangeInstallationDirectory: true,  // Let users choose directory
  createDesktopShortcut: true,          // Create desktop shortcut
  createStartMenuShortcut: true,         // Create start menu entry
  perMachine: false,                     // false = per-user, true = system-wide
}
```

## 🔧 Advanced Build Options

### Build Only Portable Version

```bash
npx electron-builder --config electron-builder.config.js --win portable
```

### Build Only NSIS Installer

```bash
npx electron-builder --config electron-builder.config.js --win nsis
```

### Build for Both 32-bit and 64-bit

Edit `electron-builder.config.js`:

```javascript
win: {
  target: [
    {
      target: 'nsis',
      arch: ['x64', 'ia32']  // Added ia32 for 32-bit
    }
  ]
}
```

### Enable Auto-Updates

To enable automatic updates, you'll need to:

1. Set up a release server
2. Configure the update URL in Electron main process
3. Sign your installers (see Code Signing section)

## 🔐 Code Signing (Production)

For production deployments, you should sign your installers to avoid Windows SmartScreen warnings.

### Get a Code Signing Certificate

1. Purchase from a Certificate Authority (CA):
   - DigiCert
   - Sectigo
   - GlobalSign

2. Save certificate as `.pfx` file

### Configure Signing in electron-builder.config.js

```javascript
win: {
  certificateFile: 'path/to/certificate.pfx',
  certificatePassword: process.env.CERT_PASSWORD,
  signDllsAndExes: true
}
```

**Security Note:** Never commit certificate passwords to version control! Use environment variables.

## 📊 Build Size Optimization

The installer is large (~150-200MB) because it includes:
- Electron runtime (~100MB)
- Chromium browser engine (~70MB)
- Node.js runtime
- Your application code

### Tips to Reduce Size:

1. **Remove Unused Dependencies**
   ```bash
   npm prune --production
   ```

2. **Exclude Dev Dependencies**
   - Already configured in `electron-builder.config.js`

3. **Use Compression**
   ```javascript
   nsis: {
     compression: 'maximum'  // Add to config
   }
   ```

## 🧪 Testing the Installer

### Test Installation

1. Build the installer
2. Run `NetDoc-Setup-1.0.0.exe`
3. Complete installation
4. Launch the app from Desktop or Start Menu
5. Verify all features work correctly

### Test Portable Version

1. Copy `NetDoc-Portable-1.0.0.exe` to a different location
2. Run directly
3. Verify database and settings persist correctly

### Test on Clean Windows VM

For production, test on a clean Windows installation:
- Use Windows Sandbox (Windows 10/11 Pro)
- Use VirtualBox or VMware
- Verify no missing dependencies

## 🐛 Troubleshooting

### Build Fails with "Cannot find module"

**Solution:** Ensure all dependencies are installed
```bash
npm install
```

### Installer Won't Run - SmartScreen Warning

**Solution:** This is expected for unsigned applications
- Click "More info" → "Run anyway"
- Or sign your installer (see Code Signing section)

### Application Window is Blank

**Solution:** Check that the server is starting
- Look in Task Manager for Node.js process
- Check logs in: `%APPDATA%\NetDoc\logs`

### Port 5000 Already in Use

**Solution:** Change port in `electron/main.js`:
```javascript
env: {
  PORT: '5001'  // Change to different port
}
```

## 📝 Build Scripts Reference

### package.json Scripts (Manual Addition Required)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist-server/index.js",
    "build:all": "npm run build:client && npm run build:server",
    "electron:dev": "electron .",
    "electron:build": "node build-windows.js"
  }
}
```

### Additional package.json Fields

Add these to `package.json`:

```json
{
  "name": "netdoc",
  "productName": "NetDoc",
  "description": "Professional network documentation system",
  "main": "electron/main.js"
}
```

## 🌐 Distribution

### Internal Network Distribution

For school network deployment:

1. **Network Share:**
   ```
   \\server\software\NetDoc-Setup-1.0.0.exe
   ```

2. **Group Policy Deployment (Windows Domain):**
   - Use NSIS installer
   - Deploy via Group Policy Software Installation

3. **SCCM/Intune:**
   - Package as .msi (requires build configuration change)

### External Distribution

For outside distribution:

1. **Website Download:**
   - Host installer on your website
   - Provide SHA256 checksum for verification

2. **Cloud Storage:**
   - Google Drive, Dropbox, OneDrive
   - Share download link

## 📋 Checklist Before Release

- [ ] Test installer on clean Windows 10/11
- [ ] Verify all features work in installed version
- [ ] Test uninstaller removes all files
- [ ] Check portable version works from USB drive
- [ ] Update version number in package.json
- [ ] Sign installers (production only)
- [ ] Create release notes
- [ ] Test on both 64-bit and 32-bit (if supporting both)

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)
- [Code Signing Guide](https://www.electron.build/code-signing)

## 💡 Support

For issues with building the installer:

1. Check this documentation first
2. Review electron-builder logs in console
3. Check the `release/` folder for build artifacts
4. Verify Node.js and npm versions

## 📄 License

This build configuration is part of the NetDoc application.
See LICENSE.txt for details.
