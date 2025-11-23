#!/usr/bin/env node

/**
 * Setup script for Electron Windows build
 * This script adds the necessary configuration to package.json
 */

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   NetDoc - Electron Build Setup                          ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add required scripts
const requiredScripts = {
  'build:client': 'vite build',
  'build:all': 'npm run build:client',
  'electron:dev': 'electron .',
  'electron:build': 'node build-windows.js'
};

// Add main field
const requiredFields = {
  name: 'netdoc',
  productName: 'NetDoc',
  description: 'Professional network documentation system for managing school network infrastructure',
  author: 'Network Documentation Team',
  main: 'electron/main.js'
};

let modified = false;

// Update fields
for (const [key, value] of Object.entries(requiredFields)) {
  if (packageJson[key] !== value) {
    packageJson[key] = value;
    modified = true;
    console.log(`✅ Updated package.json field: ${key}`);
  }
}

// Ensure scripts object exists
if (!packageJson.scripts) {
  packageJson.scripts = {};
  modified = true;
  console.log(`✅ Created scripts section`);
}

// Add scripts
for (const [scriptName, scriptCommand] of Object.entries(requiredScripts)) {
  if (!packageJson.scripts[scriptName]) {
    packageJson.scripts[scriptName] = scriptCommand;
    modified = true;
    console.log(`✅ Added script: ${scriptName}`);
  }
}

if (modified) {
  // Write back to package.json
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ✅ Setup Complete!                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\npackage.json has been updated with Electron configuration.');
  console.log('\nYou can now build the Windows installer:');
  console.log('  npm run electron:build\n');
} else {
  console.log('\n✅ package.json already configured!');
  console.log('\nYou can build the Windows installer:');
  console.log('  npm run electron:build\n');
}
