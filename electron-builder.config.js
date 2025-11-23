/**
 * Electron Builder Configuration
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.netdoc.app',
  productName: 'NetDoc',
  copyright: 'Copyright © 2024 Network Documentation Team',
  
  directories: {
    output: 'release',
    buildResources: 'build'
  },
  
  files: [
    'electron/**/*',
    'dist/**/*',
    'server/**/*',
    'shared/**/*',
    'node_modules/**/*',
    'package.json',
    '!node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!node_modules/*.d.ts',
    '!node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ],
  
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'build/icon.png',
    artifactName: '${productName}-Setup-${version}.${ext}'
  },
  
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'NetDoc',
    perMachine: false,
    installerIcon: 'build/icon.png',
    uninstallerIcon: 'build/icon.png',
    installerHeader: 'build/icon.png',
    displayLanguageSelector: false
  },
  
  portable: {
    artifactName: '${productName}-Portable-${version}.${ext}'
  }
};
