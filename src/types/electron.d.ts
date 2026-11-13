export interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
  getContentFolder: () => Promise<string | null>;
  readFolderStructure: (path: string) => Promise<any>;
  readMarkdownFile: (path: string) => Promise<string | null>;
  getFilesInFolder: (path: string) => Promise<Array<{ name: string; path: string }>>;
  getStoreValue: (key: string) => Promise<any>;
  setStoreValue: (key: string, value: any) => Promise<void>;
  getAllHighlights: () => Promise<any[]>;
  saveHighlight: (highlight: any) => Promise<any[]>;
  deleteHighlight: (highlightId: string) => Promise<any[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

