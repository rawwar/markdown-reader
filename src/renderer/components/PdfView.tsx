import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Header from './Header';
import { useTheme } from '../contexts/ThemeContext';
import { useFont } from '../contexts/FontContext';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  // Use CDN in development, or configure for production
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PdfViewProps {
  filePath: string;
  onBack: () => void;
  onFileChange?: (filePath: string) => void;
}

const PdfView: React.FC<PdfViewProps> = ({ filePath, onBack, onFileChange }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [pdfFiles, setPdfFiles] = useState<Array<{ name: string; path: string }>>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { currentTheme } = useTheme();
  const { fontSettings } = useFont();

  useEffect(() => {
    const loadPdfFiles = async () => {
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
      const pdfs = await window.electronAPI.getPdfsInFolder(folderPath);
      setPdfFiles(pdfs);
      const index = pdfs.findIndex((f) => f.path === filePath);
      setCurrentIndex(index);
    };
    loadPdfFiles();
  }, [filePath]);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setPageNumber(1);
        // Read PDF file as base64 data URL
        const fileContent = await window.electronAPI.readPdfFile(filePath);
        if (fileContent) {
          setPdfData(fileContent);
        } else {
          setError('Failed to load PDF file');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [filePath]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setPageNumber((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setPageNumber((prev) => Math.min(numPages, prev + 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setPageNumber(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        setPageNumber(numPages);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  // Apply theme to PDF canvas
  useEffect(() => {
    const styleId = 'pdf-theme-style';
    let style = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    
    // Calculate brightness adjustment based on theme
    const bgColor = currentTheme.colors.background;
    const isDark = currentTheme.type === 'dark';
    
    // Apply dark theme filter to invert PDF colors for better readability
    if (isDark) {
      // Invert colors and adjust brightness/contrast for dark themes
      style.textContent = `
        .react-pdf__Page {
          filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(1.1);
        }
        .react-pdf__Page__canvas {
          background: ${bgColor} !important;
          border-radius: 8px;
        }
        .react-pdf__Page__textContent {
          opacity: 0 !important;
        }
        .react-pdf__Page__textContent span {
          color: transparent !important;
        }
        .react-pdf__Page__annotations {
          filter: invert(1) hue-rotate(180deg);
        }
      `;
    } else {
      // Light theme - adjust brightness slightly
      style.textContent = `
        .react-pdf__Page {
          filter: brightness(1.05) contrast(1.05);
        }
        .react-pdf__Page__canvas {
          background: ${bgColor} !important;
          border-radius: 8px;
        }
        .react-pdf__Page__textContent {
          opacity: 0 !important;
        }
        .react-pdf__Page__textContent span {
          color: transparent !important;
        }
      `;
    }
    
    return () => {
      // Style persists and updates on theme change
    };
  }, [currentTheme]);

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: currentTheme.colors.primary }}></div>
          <p style={{ color: currentTheme.colors.foreground }}>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <p style={{ color: currentTheme.colors.accent }}>{error || 'Failed to load PDF'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <Header
        filePath={filePath}
        onBack={onBack}
        onPrevious={
          pageNumber > 1
            ? goToPrevPage
            : currentIndex > 0
            ? () => {
                const newPath = pdfFiles[currentIndex - 1].path;
                if (onFileChange) {
                  onFileChange(newPath);
                }
                window.electronAPI.setStoreValue('lastFile', newPath);
              }
            : undefined
        }
        onNext={
          pageNumber < numPages
            ? goToNextPage
            : currentIndex < pdfFiles.length - 1
            ? () => {
                const newPath = pdfFiles[currentIndex + 1].path;
                if (onFileChange) {
                  onFileChange(newPath);
                }
                window.electronAPI.setStoreValue('lastFile', newPath);
              }
            : undefined
        }
        currentChapter={pageNumber}
        totalChapters={numPages}
      />
      <div 
        className="flex-1 overflow-auto"
        style={{ 
          paddingTop: '24px',
          paddingBottom: '24px',
        }}
      >
        <div className="flex items-start justify-center min-h-full px-8 py-8">
          <div className="max-w-5xl w-full">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: currentTheme.colors.primary }}></div>
                  <p style={{ color: currentTheme.colors.foreground }}>Loading page...</p>
                </div>
              }
              error={
                <div className="text-center py-8">
                  <p style={{ color: currentTheme.colors.accent }}>Error loading PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-2xl mx-auto"
                width={Math.min(1200, window.innerWidth - 200)}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfView;

