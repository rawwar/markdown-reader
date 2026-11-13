import { useState, useEffect } from 'react';
import ReaderView from './components/ReaderView';
import PdfView from './components/PdfView';
import FolderBrowser from './components/FolderBrowser';
import { ThemeProvider } from './contexts/ThemeContext';
import { FontProvider } from './contexts/FontContext';
import { HighlightProvider } from './contexts/HighlightContext';

function App() {
  const [contentFolder, setContentFolder] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [showBrowser, setShowBrowser] = useState(true);

  useEffect(() => {
    const loadContentFolder = async () => {
      const folder = await window.electronAPI.getContentFolder();
      if (folder) {
        setContentFolder(folder);
        const lastFile = await window.electronAPI.getStoreValue('lastFile');
        if (lastFile) {
          setCurrentFile(lastFile);
          setShowBrowser(false);
        }
      } else {
        // If no content folder found, still show browser but allow folder selection
        // User can select a different folder if needed
      }
    };
    loadContentFolder();
  }, []);

  const handleFolderSelect = async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      setContentFolder(folder);
    }
  };

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
    setShowBrowser(false);
    window.electronAPI.setStoreValue('lastFile', filePath);
  };

  const handleBackToBrowser = () => {
    setShowBrowser(true);
  };

  // Show folder selection only if no content folder exists
  if (!contentFolder) {
    return (
      <ThemeProvider>
        <FontProvider>
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md">
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Markdown Reader
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                No content folder found. Please select a folder or create a "content" folder in the app directory.
              </p>
              <button
                onClick={handleFolderSelect}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Select Content Folder
              </button>
            </div>
          </div>
        </FontProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <FontProvider>
        <HighlightProvider>
          {showBrowser ? (
            <FolderBrowser
              rootPath={contentFolder}
              onFileSelect={handleFileSelect}
            />
          ) : (
            (() => {
              const isPdf = currentFile!.toLowerCase().endsWith('.pdf');
              if (isPdf) {
                return (
                  <PdfView
                    filePath={currentFile!}
                    onBack={handleBackToBrowser}
                    onFileChange={(newPath) => setCurrentFile(newPath)}
                  />
                );
              }
              return (
                <ReaderView
                  filePath={currentFile!}
                  onBack={handleBackToBrowser}
                  onFileChange={(newPath) => setCurrentFile(newPath)}
                />
              );
            })()
          )}
        </HighlightProvider>
      </FontProvider>
    </ThemeProvider>
  );
}

export default App;

