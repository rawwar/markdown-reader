import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { readdir, readFile, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, basename, dirname, resolve } from 'path';
import Store from 'electron-store';
import { convertPdfToMarkdown } from './pdfConverter';
import { convertDocxToMarkdown, readDocxAsMarkdown } from './docxConverter';

const store = new Store();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    frame: true,
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // DevTools can be opened manually with Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux)
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    store.set('contentFolder', result.filePaths[0]);
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-content-folder', async () => {
  const savedFolder = store.get('contentFolder', null) as string | null;
  if (savedFolder && typeof savedFolder === 'string' && existsSync(savedFolder)) {
    console.log('Using saved folder:', savedFolder);
    return savedFolder;
  }
  
  // Try multiple possible locations for the content folder
  const possiblePaths: string[] = [];
  
  // Always check process.cwd() first (most reliable in development)
  const cwdContent = join(process.cwd(), 'content');
  possiblePaths.push(cwdContent);
  console.log('Checking cwd content:', cwdContent, 'exists:', existsSync(cwdContent));
  
  if (!app.isPackaged) {
    // In development mode, check multiple locations
    // 1. Project root from __dirname (dist-electron/../../)
    const projectRoot = join(__dirname, '../../');
    possiblePaths.push(join(projectRoot, 'content'));
    console.log('Checking project root:', join(projectRoot, 'content'), 'exists:', existsSync(join(projectRoot, 'content')));
    
    // 2. App path
    const appPath = app.getAppPath();
    possiblePaths.push(join(appPath, 'content'));
    console.log('Checking app path:', join(appPath, 'content'), 'exists:', existsSync(join(appPath, 'content')));
    
    // 3. If __dirname is in dist-electron, go up two levels
    if (__dirname.includes('dist-electron')) {
      const rootFromDist = join(__dirname, '../../');
      const distContent = join(rootFromDist, 'content');
      possiblePaths.push(distContent);
      console.log('Checking dist-electron parent:', distContent, 'exists:', existsSync(distContent));
    }
  } else {
    // In production
    const appPath = app.getAppPath();
    possiblePaths.push(join(appPath, 'content'));
    if (process.resourcesPath) {
      possiblePaths.push(join(process.resourcesPath, 'content'));
    }
  }
  
  // Check each possible path
  for (const contentPath of possiblePaths) {
    const resolvedPath = resolve(contentPath);
    console.log('Checking path:', resolvedPath, 'exists:', existsSync(resolvedPath));
    if (existsSync(resolvedPath)) {
      console.log('Found content folder at:', resolvedPath);
      store.set('contentFolder', resolvedPath);
      return resolvedPath;
    }
  }
  
  console.log('No content folder found in any checked location');
  return null;
});

async function readFolderStructureRecursive(folderPath: string): Promise<any> {
  try {
    const structure: any = {
      name: basename(folderPath),
      path: folderPath,
      type: 'folder',
      children: [],
    };

    const entries = await readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(folderPath, entry.name);

      if (entry.isDirectory()) {
        const childStructure = await readFolderStructureRecursive(fullPath);
        structure.children.push({
          name: entry.name,
          path: fullPath,
          type: 'folder',
          children: childStructure?.children || [],
        });
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (ext === '.md') {
          structure.children.push({
            name: entry.name,
            path: fullPath,
            type: 'file',
          });
        } else if (ext === '.pdf') {
          structure.children.push({
            name: entry.name,
            path: fullPath,
            type: 'pdf',
          });
        } else if (ext === '.docx') {
          structure.children.push({
            name: entry.name,
            path: fullPath,
            type: 'docx',
          });
        }
      }
    }

    // Sort: folders first, then files by numeric prefix
    structure.children.sort((a: any, b: any) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      if (a.type === 'file') {
        const numA = parseInt(a.name.match(/^(\d+)/)?.[1] || '999999');
        const numB = parseInt(b.name.match(/^(\d+)/)?.[1] || '999999');
        return numA - numB;
      }
      return a.name.localeCompare(b.name);
    });

    return structure;
  } catch (error) {
    console.error('Error reading folder structure:', error);
    return null;
  }
}

ipcMain.handle('read-folder-structure', async (_, folderPath: string) => {
  return readFolderStructureRecursive(folderPath);
});

ipcMain.handle('read-markdown-file', async (_, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('read-pdf-file', async (_, filePath: string) => {
  try {
    const pdfBuffer = await readFile(filePath);
    // Convert to base64 data URL for react-pdf
    const base64 = pdfBuffer.toString('base64');
    return `data:application/pdf;base64,${base64}`;
  } catch (error) {
    console.error('Error reading PDF file:', error);
    return null;
  }
});

ipcMain.handle('get-store-value', (_, key: string) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (_, key: string, value: any) => {
  store.set(key, value);
});

ipcMain.handle('get-all-highlights', () => {
  return store.get('highlights', []);
});

ipcMain.handle('save-highlight', (_, highlight: any) => {
  const highlights = store.get('highlights', []) as any[];
  highlights.push({
    ...highlight,
    id: Date.now().toString(),
    timestamp: Date.now(),
  });
  store.set('highlights', highlights);
  return highlights;
});

ipcMain.handle('delete-highlight', (_, highlightId: string) => {
  const highlights = store.get('highlights', []) as any[];
  const filtered = highlights.filter((h: any) => h.id !== highlightId);
  store.set('highlights', filtered);
  return filtered;
});

ipcMain.handle('get-files-in-folder', async (_, folderPath: string) => {
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.md')
      .map((entry) => ({
        name: entry.name,
        path: join(folderPath, entry.name),
      }))
      .sort((a, b) => {
        const numA = parseInt(a.name.match(/^(\d+)/)?.[1] || '999999');
        const numB = parseInt(b.name.match(/^(\d+)/)?.[1] || '999999');
        return numA - numB;
      });
    return files;
  } catch (error) {
    console.error('Error reading folder:', error);
    return [];
  }
});

ipcMain.handle('get-pdfs-in-folder', async (_, folderPath: string) => {
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const pdfs = entries
      .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.pdf')
      .map((entry) => ({
        name: entry.name,
        path: join(folderPath, entry.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return pdfs;
  } catch (error) {
    console.error('Error reading PDFs:', error);
    return [];
  }
});

ipcMain.handle('select-pdf-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('upload-pdf', async (_, pdfPath: string, targetPath: string) => {
  try {
    // Ensure target directory exists
    await mkdir(targetPath, { recursive: true });
    
    // Copy PDF to target location
    const pdfName = basename(pdfPath);
    const targetPdfPath = join(targetPath, pdfName);
    await copyFile(pdfPath, targetPdfPath);
    
    // Convert to markdown
    const result = await convertPdfToMarkdown(targetPdfPath, (progress) => {
      if (mainWindow) {
        mainWindow.webContents.send('pdf-conversion-progress', progress);
      }
    });
    
    return result;
  } catch (error: any) {
    console.error('Error uploading PDF:', error);
    return {
      success: false,
      files: [],
      error: error.message || 'Failed to upload and convert PDF',
    };
  }
});

ipcMain.handle('convert-pdf-to-markdown', async (_, pdfPath: string) => {
  try {
    const result = await convertPdfToMarkdown(pdfPath, (progress) => {
      // Send progress updates to renderer
      if (mainWindow) {
        mainWindow.webContents.send('pdf-conversion-progress', progress);
      }
    });
    return result;
  } catch (error: any) {
    console.error('Error converting PDF:', error);
    return {
      success: false,
      files: [],
      error: error.message || 'Failed to convert PDF',
    };
  }
});

ipcMain.handle('read-docx-file', async (_, filePath: string) => {
  try {
    const markdown = await readDocxAsMarkdown(filePath);
    return markdown;
  } catch (error: any) {
    console.error('Error reading DOCX file:', error);
    return null;
  }
});

ipcMain.handle('convert-docx-to-markdown', async (_, docxPath: string) => {
  try {
    const result = await convertDocxToMarkdown(docxPath, (progress) => {
      // Send progress updates to renderer
      if (mainWindow) {
        mainWindow.webContents.send('docx-conversion-progress', progress);
      }
    });
    return result;
  } catch (error: any) {
    console.error('Error converting DOCX:', error);
    return {
      success: false,
      files: [],
      error: error.message || 'Failed to convert DOCX',
    };
  }
});

