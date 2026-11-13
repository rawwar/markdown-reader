import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useHighlight } from '../contexts/HighlightContext';

interface HighlightsPanelProps {
  filePath: string;
  onClose: () => void;
}

const HighlightsPanel: React.FC<HighlightsPanelProps> = ({ filePath, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentTheme } = useTheme();
  const { highlights, removeHighlight, searchHighlights, getHighlightsForFile } = useHighlight();
  const [displayedHighlights, setDisplayedHighlights] = useState(highlights);

  useEffect(() => {
    if (searchQuery.trim()) {
      setDisplayedHighlights(searchHighlights(searchQuery));
    } else {
      setDisplayedHighlights(getHighlightsForFile(filePath));
    }
  }, [searchQuery, highlights, filePath, searchHighlights, getHighlightsForFile]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-16 right-0 bottom-0 w-96 z-50 shadow-2xl"
      style={{
        backgroundColor: currentTheme.colors.background,
        borderLeft: `1px solid ${currentTheme.colors.border}`,
      }}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b" style={{ borderColor: currentTheme.colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: currentTheme.colors.foreground }}
            >
              Highlights
            </h2>
            <button
              onClick={onClose}
              className="text-xl hover:opacity-70 transition-opacity"
              style={{ color: currentTheme.colors.foreground }}
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="Search highlights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: currentTheme.colors.codeBackground,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.foreground,
            }}
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          {displayedHighlights.length === 0 ? (
            <div
              className="text-center py-8 opacity-50"
              style={{ color: currentTheme.colors.foreground }}
            >
              {searchQuery ? 'No highlights match your search' : 'No highlights yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedHighlights.map((highlight) => (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: currentTheme.colors.codeBackground,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: highlight.color }}
                    />
                    <button
                      onClick={() => removeHighlight(highlight.id)}
                      className="text-sm opacity-50 hover:opacity-100 transition-opacity"
                      style={{ color: currentTheme.colors.foreground }}
                    >
                      Delete
                    </button>
                  </div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: currentTheme.colors.foreground }}
                  >
                    {highlight.text}
                  </p>
                  <p
                    className="text-xs opacity-50"
                    style={{ color: currentTheme.colors.foreground }}
                  >
                    {new Date(highlight.timestamp).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HighlightsPanel;

