import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import Header from './Header';
import MarkdownContent from './MarkdownContent';
import DictionaryPopup from './DictionaryPopup';
import { useTheme } from '../contexts/ThemeContext';
import { useFont } from '../contexts/FontContext';
import { useHighlight } from '../contexts/HighlightContext';

interface ReaderViewProps {
  filePath: string;
  onBack: () => void;
  onFileChange?: (filePath: string) => void;
}

const ReaderView: React.FC<ReaderViewProps> = ({ filePath, onBack, onFileChange }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; path: string }>>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();
  const { fontSettings } = useFont();
  const { getHighlightsForFile, addHighlight } = useHighlight();

  useEffect(() => {
    const loadFiles = async () => {
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
      const folderFiles = await window.electronAPI.getFilesInFolder(folderPath);
      setFiles(folderFiles);
      const index = folderFiles.findIndex((f) => f.path === filePath);
      setCurrentIndex(index);
    };
    loadFiles();
  }, [filePath]);

  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      // Check if it's a .docx file
      if (filePath.toLowerCase().endsWith('.docx')) {
        const markdownContent = await window.electronAPI.readDocxFile(filePath);
        if (markdownContent) {
          setContent(markdownContent);
        }
      } else {
        const fileContent = await window.electronAPI.readMarkdownFile(filePath);
        if (fileContent) {
          setContent(fileContent);
        }
      }
      setLoading(false);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    };
    loadFile();
  }, [filePath]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (currentIndex > 0) {
          const newPath = files[currentIndex - 1].path;
          if (onFileChange) {
            onFileChange(newPath);
          }
          window.electronAPI.setStoreValue('lastFile', newPath);
        }
      } else if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (currentIndex < files.length - 1) {
          const newPath = files[currentIndex + 1].path;
          if (onFileChange) {
            onFileChange(newPath);
          }
          window.electronAPI.setStoreValue('lastFile', newPath);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, files, onFileChange]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newPath = files[currentIndex - 1].path;
      if (onFileChange) {
        onFileChange(newPath);
      }
      window.electronAPI.setStoreValue('lastFile', newPath);
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      const newPath = files[currentIndex + 1].path;
      if (onFileChange) {
        onFileChange(newPath);
      }
      window.electronAPI.setStoreValue('lastFile', newPath);
    }
  };

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        // If it's a single word, show dictionary; otherwise show highlight menu
        const isSingleWord = selectedText.split(/\s+/).length === 1 && selectedText.length < 50;
        const range = selection.getRangeAt(0);
        setSelectedRange(range.cloneRange());
        setSelectedWord(selectedText);
        setShowHighlightMenu(!isSingleWord);
      } else {
        setShowHighlightMenu(false);
        setSelectedWord(null);
        setSelectedRange(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        const isSingleWord = selectedText.split(/\s+/).length === 1 && selectedText.length < 50;
        if (isSingleWord) {
          setShowHighlightMenu(false);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleHighlight = async (color: string) => {
    if (selectedWord && selectedRange) {
      await addHighlight({
        filePath,
        text: selectedWord,
        color,
        range: {
          start: selectedRange.startOffset,
          end: selectedRange.endOffset,
        },
      });
      setShowHighlightMenu(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: currentTheme.colors.primary }}></div>
          <p style={{ color: currentTheme.colors.foreground }}>Loading...</p>
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
        onPrevious={currentIndex > 0 ? handlePrevious : undefined}
        onNext={currentIndex < files.length - 1 ? handleNext : undefined}
        currentChapter={currentIndex + 1}
        totalChapters={files.length}
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <MarkdownContent
            ref={contentRef}
            content={content}
            filePath={filePath}
            highlights={getHighlightsForFile(filePath)}
          />
        </div>
      </div>
      {showHighlightMenu && selectedWord && (
        <div
          className="fixed z-50 p-2 rounded-lg shadow-xl"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex gap-2">
            {['yellow', 'green', 'blue', 'pink', 'orange'].map((color) => (
              <button
                key={color}
                onClick={() => handleHighlight(color)}
                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
      {selectedWord && !showHighlightMenu && selectedWord.split(/\s+/).length === 1 && (
        <DictionaryPopup word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  );
};

export default ReaderView;

