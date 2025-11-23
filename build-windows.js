#!/usr/bin/env node

/**
 * Build script for creating Windows installer
 * This script builds both the client and server, then packages everything with Electron
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', reject);
  });
}

async function build() {
  try {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   NetDoc - Windows Installer Builder                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    // Step 1: Build client (Vite)
    console.log('\n📦 Step 1/3: Building React frontend...');
    await run('npm', ['run', 'build:client']);
    console.log('✅ Frontend build complete!');
    
    // Step 2: Verify frontend build exists
    console.log('\n📦 Step 2/3: Verifying build...');
    if (!fs.existsSync('dist')) {
      throw new Error('Frontend build not found! (dist folder missing)');
    }
    console.log('✅ Build verification complete!');
    console.log('Note: Server code will be included as TypeScript source (run with tsx)');
    
    // Step 3: Package with Electron Builder
    console.log('\n📦 Step 3/3: Creating Windows installer...');
    await run('npx', ['electron-builder', '--config', 'electron-builder.config.js', '--win']);
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ BUILD COMPLETE!                                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📁 Windows installer created in: release/ folder');
    console.log('\nYou will find:');
    console.log('  • NetDoc-Setup-1.0.0.exe     (NSIS Installer)');
    console.log('  • NetDoc-Portable-1.0.0.exe  (Portable Version)');
    console.log('\n💡 The NSIS installer provides:');
    console.log('  • Professional installation wizard');
    console.log('  • Desktop and Start Menu shortcuts');
    console.log('  • Automatic uninstaller');
    console.log('\n💡 The Portable version:');
    console.log('  • Runs without installation');
    console.log('  • Can be run from USB drive');
    console.log('  • No admin rights required');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
