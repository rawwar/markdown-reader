export default {
  appId: 'com.markdownreader.app',
  productName: 'Markdown Reader',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'dist-electron/**/*',
    'package.json',
  ],
  mac: {
    category: 'public.app-category.productivity',
    target: ['dmg', 'zip'],
    icon: 'assets/icon.icns',
  },
  win: {
    target: ['nsis', 'portable'],
    icon: 'assets/icon.ico',
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'assets/icon.png',
    category: 'Office',
  },
};

