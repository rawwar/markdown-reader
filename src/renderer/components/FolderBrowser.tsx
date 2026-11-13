import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import PdfUploadDialog from './PdfUploadDialog';
import { getHeaderBackground } from '../utils/themeUtils';

interface FolderItem {
  name: string;
  path: string;
  type: 'folder' | 'file' | 'pdf' | 'docx';
  children?: FolderItem[];
}

interface FolderBrowserProps {
  rootPath: string;
  onFileSelect: (filePath: string) => void;
}

const FolderBrowser: React.FC<FolderBrowserProps> = ({ rootPath, onFileSelect }) => {
  const [structure, setStructure] = useState<FolderItem | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([rootPath]));
  const [loading, setLoading] = useState(true);
  const [convertingPdf, setConvertingPdf] = useState<string | null>(null);
  const [convertingDocx, setConvertingDocx] = useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = useState<{ current: number; total: number; chapter?: string } | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { currentTheme } = useTheme();

  const loadStructure = async () => {
    setLoading(true);
    const data = await window.electronAPI.readFolderStructure(rootPath);
    setStructure(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStructure();
  }, [rootPath]);

  useEffect(() => {
    // Listen for PDF conversion progress
    window.electronAPI.onPdfConversionProgress((progress) => {
      setConversionProgress(progress);
    });
    // Listen for DOCX conversion progress
    window.electronAPI.onDocxConversionProgress((progress) => {
      setConversionProgress(progress);
    });
  }, []);

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handlePdfConvert = async (pdfPath: string) => {
    setConvertingPdf(pdfPath);
    setConversionProgress({ current: 0, total: 1 });
    
    try {
      const result = await window.electronAPI.convertPdfToMarkdown(pdfPath);
      if (result.success) {
        // Reload folder structure to show new markdown files
        await loadStructure();
        setConvertingPdf(null);
        setConversionProgress(null);
      } else {
        alert(`Failed to convert PDF: ${result.error}`);
        setConvertingPdf(null);
        setConversionProgress(null);
      }
    } catch (error: any) {
      alert(`Error converting PDF: ${error.message}`);
      setConvertingPdf(null);
      setConversionProgress(null);
    }
  };

  const handlePdfUpload = async (pdfPath: string, targetPath: string) => {
    setConvertingPdf(pdfPath);
    setConversionProgress({ current: 0, total: 1 });
    
    try {
      const result = await window.electronAPI.uploadPdf(pdfPath, targetPath);
      if (result.success) {
        await loadStructure();
        setConvertingPdf(null);
        setConversionProgress(null);
      } else {
        throw new Error(result.error || 'Failed to upload PDF');
      }
    } catch (error: any) {
      setConvertingPdf(null);
      setConversionProgress(null);
      throw error;
    }
  };

  const handleDocxConvert = async (docxPath: string) => {
    setConvertingDocx(docxPath);
    setConversionProgress({ current: 0, total: 1 });
    
    try {
      const result = await window.electronAPI.convertDocxToMarkdown(docxPath);
      if (result.success) {
        // Reload folder structure to show new markdown files
        await loadStructure();
        setConvertingDocx(null);
        setConversionProgress(null);
      } else {
        alert(`Failed to convert DOCX: ${result.error}`);
        setConvertingDocx(null);
        setConversionProgress(null);
      }
    } catch (error: any) {
      alert(`Error converting DOCX: ${error.message}`);
      setConvertingDocx(null);
      setConversionProgress(null);
    }
  };

  const renderItem = (item: FolderItem, level: number = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(item.path);
    const isFolder = item.type === 'folder';
    const isPdf = item.type === 'pdf';
    const isDocx = item.type === 'docx';
    const isConverting = convertingPdf === item.path || convertingDocx === item.path;

    return (
      <div key={item.path}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center py-2 px-4 rounded-lg transition-colors ${
            isFolder ? 'cursor-pointer hover:bg-opacity-10 hover:bg-blue-500' : 
            'cursor-pointer hover:bg-opacity-10 hover:bg-green-500'
          }`}
          style={{
            paddingLeft: `${level * 24 + 16}px`,
            color: currentTheme.colors.foreground,
          }}
          onClick={() => {
            if (isFolder) {
              toggleExpand(item.path);
            } else {
              // Allow clicking PDFs and DOCX files to view them
              onFileSelect(item.path);
            }
          }}
        >
          <span className="mr-3 text-lg">
            {isFolder ? (isExpanded ? '📂' : '📁') : isPdf ? '📕' : isDocx ? '📘' : '📄'}
          </span>
          <span className="flex-1 font-medium">{item.name}</span>
          {isFolder && (
            <span className="text-sm opacity-60">
              {item.children?.length || 0} items
            </span>
          )}
          {(isPdf || isDocx) && (
            <div className="ml-4 flex gap-2" style={{ WebkitAppRegion: 'no-drag', appRegion: 'no-drag' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPdf) {
                    handlePdfConvert(item.path);
                  } else if (isDocx) {
                    handleDocxConvert(item.path);
                  }
                }}
                disabled={isConverting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  backgroundColor: isConverting ? currentTheme.colors.secondary : currentTheme.colors.accent,
                  color: currentTheme.colors.background,
                }}
              >
                {isConverting ? 'Converting...' : 'Convert'}
              </button>
            </div>
          )}
        </motion.div>
        {isConverting && conversionProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 py-2"
            style={{ paddingLeft: `${level * 24 + 48}px` }}
          >
            <div className="text-sm opacity-70 mb-2" style={{ color: currentTheme.colors.foreground }}>
              {conversionProgress.chapter && `Converting: ${conversionProgress.chapter}`}
            </div>
            <div className="w-full bg-opacity-20 rounded-full h-2" style={{ backgroundColor: currentTheme.colors.border }}>
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: currentTheme.colors.primary }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(conversionProgress.current / conversionProgress.total) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-xs opacity-60 mt-1" style={{ color: currentTheme.colors.foreground }}>
              {conversionProgress.current} of {conversionProgress.total} chapters
            </div>
          </motion.div>
        )}
        {isFolder && isExpanded && item.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children.map((child) => renderItem(child, level + 1))}
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: currentTheme.colors.primary }}></div>
          <p style={{ color: currentTheme.colors.foreground }}>Loading folder structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* Draggable header bar */}
      <div
        className="h-12 flex items-center border-b"
        style={{
          backgroundColor: getHeaderBackground(currentTheme.colors.background, currentTheme.type),
          borderColor: currentTheme.colors.border,
          borderBottomWidth: '2px',
          boxShadow: currentTheme.type === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
          WebkitAppRegion: 'drag',
          appRegion: 'drag',
          paddingLeft: '80px', // Space for macOS window controls
          paddingRight: '24px',
        }}
      >
        <span
          className="text-sm font-medium opacity-70"
          style={{ color: currentTheme.colors.foreground }}
        >
          Markdown Reader
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-3xl font-bold"
              style={{ color: currentTheme.colors.foreground }}
            >
              Select a Book
            </h1>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.background,
                WebkitAppRegion: 'no-drag',
                appRegion: 'no-drag',
              }}
            >
              + Upload PDF
            </button>
          </div>
          <div className="space-y-1">
            {structure && renderItem(structure)}
          </div>
        </div>
      </div>

      <PdfUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handlePdfUpload}
        contentRootPath={rootPath}
      />
    </div>
  );
};

export default FolderBrowser;

