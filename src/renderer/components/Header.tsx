import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FontPicker from './FontPicker';
import ThemePicker from './ThemePicker';
import HighlightsPanel from './HighlightsPanel';
import { useTheme } from '../contexts/ThemeContext';
import { getHeaderBackground } from '../utils/themeUtils';

interface HeaderProps {
  filePath: string;
  onBack: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentChapter?: number;
  totalChapters?: number;
}

const Header: React.FC<HeaderProps> = ({
  filePath,
  onBack,
  onPrevious,
  onNext,
  currentChapter,
  totalChapters,
}) => {
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const { currentTheme } = useTheme();

  const fileName = filePath.split('/').pop() || 'Untitled';

  return (
    <>
      <div
        className="h-16 flex items-center justify-between border-b"
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
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg hover:bg-opacity-10 transition-colors font-medium"
            style={{ 
              color: currentTheme.colors.foreground,
              WebkitAppRegion: 'no-drag',
              appRegion: 'no-drag',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ← Back
          </button>
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="px-3 py-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ 
                color: currentTheme.colors.foreground,
                WebkitAppRegion: 'no-drag',
                appRegion: 'no-drag',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ← Prev
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="px-3 py-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ 
                color: currentTheme.colors.foreground,
                WebkitAppRegion: 'no-drag',
                appRegion: 'no-drag',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Next →
            </button>
          )}
          {currentChapter && totalChapters && (
            <span
              className="text-sm font-medium opacity-70"
              style={{ color: currentTheme.colors.foreground }}
            >
              Chapter {currentChapter} of {totalChapters}
            </span>
          )}
          <span
            className="text-sm font-medium opacity-70"
            style={{ color: currentTheme.colors.foreground }}
          >
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag', appRegion: 'no-drag' }}>
          <button
            onClick={() => {
              setShowHighlights(!showHighlights);
              setShowFontPicker(false);
              setShowThemePicker(false);
            }}
            className="px-4 py-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: currentTheme.colors.foreground }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Highlights
          </button>
          <button
            onClick={() => {
              setShowFontPicker(!showFontPicker);
              setShowThemePicker(false);
              setShowHighlights(false);
            }}
            className="px-4 py-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: currentTheme.colors.foreground }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Font
          </button>
          <button
            onClick={() => {
              setShowThemePicker(!showThemePicker);
              setShowFontPicker(false);
              setShowHighlights(false);
            }}
            className="px-4 py-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: currentTheme.colors.foreground }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Theme
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFontPicker && (
          <FontPicker onClose={() => setShowFontPicker(false)} />
        )}
        {showThemePicker && (
          <ThemePicker onClose={() => setShowThemePicker(false)} />
        )}
        {showHighlights && (
          <HighlightsPanel filePath={filePath} onClose={() => setShowHighlights(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

