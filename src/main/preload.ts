import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getContentFolder: () => ipcRenderer.invoke('get-content-folder'),
  selectPdfFile: () => ipcRenderer.invoke('select-pdf-file'),
  uploadPdf: (pdfPath: string, targetPath: string) => ipcRenderer.invoke('upload-pdf', pdfPath, targetPath),
  readFolderStructure: (path: string) => ipcRenderer.invoke('read-folder-structure', path),
  readMarkdownFile: (path: string) => ipcRenderer.invoke('read-markdown-file', path),
  readPdfFile: (path: string) => ipcRenderer.invoke('read-pdf-file', path),
  getFilesInFolder: (path: string) => ipcRenderer.invoke('get-files-in-folder', path),
  getPdfsInFolder: (path: string) => ipcRenderer.invoke('get-pdfs-in-folder', path),
  convertPdfToMarkdown: (pdfPath: string) => ipcRenderer.invoke('convert-pdf-to-markdown', pdfPath),
  onPdfConversionProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('pdf-conversion-progress', (_, progress) => callback(progress));
  },
  readDocxFile: (path: string) => ipcRenderer.invoke('read-docx-file', path),
  convertDocxToMarkdown: (docxPath: string) => ipcRenderer.invoke('convert-docx-to-markdown', docxPath),
  onDocxConversionProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('docx-conversion-progress', (_, progress) => callback(progress));
  },
  getStoreValue: (key: string) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key: string, value: any) => ipcRenderer.invoke('set-store-value', key, value),
  getAllHighlights: () => ipcRenderer.invoke('get-all-highlights'),
  saveHighlight: (highlight: any) => ipcRenderer.invoke('save-highlight', highlight),
  deleteHighlight: (highlightId: string) => ipcRenderer.invoke('delete-highlight', highlightId),
});

declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;
      getContentFolder: () => Promise<string | null>;
      selectPdfFile: () => Promise<string | null>;
      uploadPdf: (pdfPath: string, targetPath: string) => Promise<{ success: boolean; files: string[]; error?: string }>;
      readFolderStructure: (path: string) => Promise<any>;
      readMarkdownFile: (path: string) => Promise<string | null>;
      readPdfFile: (path: string) => Promise<string | null>;
      getFilesInFolder: (path: string) => Promise<Array<{ name: string; path: string }>>;
      getPdfsInFolder: (path: string) => Promise<Array<{ name: string; path: string }>>;
      convertPdfToMarkdown: (pdfPath: string) => Promise<{ success: boolean; files: string[]; error?: string }>;
      onPdfConversionProgress: (callback: (progress: any) => void) => void;
      readDocxFile: (path: string) => Promise<string | null>;
      convertDocxToMarkdown: (docxPath: string) => Promise<{ success: boolean; files: string[]; error?: string }>;
      onDocxConversionProgress: (callback: (progress: any) => void) => void;
      getStoreValue: (key: string) => Promise<any>;
      setStoreValue: (key: string, value: any) => Promise<void>;
      getAllHighlights: () => Promise<any[]>;
      saveHighlight: (highlight: any) => Promise<any[]>;
      deleteHighlight: (highlightId: string) => Promise<any[]>;
    };
  }
}

