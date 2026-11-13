import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface DictionaryPopupProps {
  word: string;
  onClose: () => void;
}

interface DictionaryDefinition {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

const DictionaryPopup: React.FC<DictionaryPopupProps> = ({ word, onClose }) => {
  const [definition, setDefinition] = useState<DictionaryDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchDefinition = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Word not found');
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setDefinition(data[0]);
        } else {
          setError('No definition found');
        }
      } catch (err) {
        setError('Unable to fetch definition. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    if (word) {
      fetchDefinition();
    }
  }, [word]);

  if (!word) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-2xl w-full rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-auto"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: currentTheme.colors.foreground }}
              >
                {word}
              </h2>
              {definition?.phonetic && (
                <p
                  className="text-sm opacity-70"
                  style={{ color: currentTheme.colors.foreground }}
                >
                  {definition.phonetic}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:opacity-70 transition-opacity"
              style={{ color: currentTheme.colors.foreground }}
            >
              ×
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
                style={{ borderColor: currentTheme.colors.primary }}
              ></div>
              <p style={{ color: currentTheme.colors.foreground }}>Loading...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p style={{ color: currentTheme.colors.accent }}>{error}</p>
            </div>
          )}

          {definition && !loading && (
            <div className="space-y-6">
              {definition.meanings.map((meaning, idx) => (
                <div key={idx}>
                  <h3
                    className="text-sm font-semibold uppercase tracking-wide mb-2"
                    style={{ color: currentTheme.colors.primary }}
                  >
                    {meaning.partOfSpeech}
                  </h3>
                  <ul className="space-y-3">
                    {meaning.definitions.map((def, defIdx) => (
                      <li key={defIdx}>
                        <p
                          className="mb-1"
                          style={{ color: currentTheme.colors.foreground }}
                        >
                          {def.definition}
                        </p>
                        {def.example && (
                          <p
                            className="text-sm italic opacity-70 pl-4 border-l-2"
                            style={{
                              color: currentTheme.colors.foreground,
                              borderColor: currentTheme.colors.border,
                            }}
                          >
                            "{def.example}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DictionaryPopup;

