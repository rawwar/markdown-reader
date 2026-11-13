import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface ThemePickerProps {
  onClose: () => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ onClose }) => {
  const { currentTheme, setTheme, themes } = useTheme();

  const darkThemes = themes.filter((t) => t.type === 'dark');
  const lightThemes = themes.filter((t) => t.type === 'light');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-16 left-0 right-0 z-50 shadow-2xl max-h-[80vh] overflow-auto"
      style={{
        backgroundColor: currentTheme.colors.background,
        borderBottom: `1px solid ${currentTheme.colors.border}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Dark Themes */}
        <div className="mb-8">
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wide"
            style={{ color: currentTheme.colors.foreground }}
          >
            Dark Themes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {darkThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  onClose();
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentTheme.id === theme.id ? 'ring-2' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor:
                    currentTheme.id === theme.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  ringColor: theme.colors.primary,
                }}
              >
                <div
                  className="h-12 rounded mb-2 flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                  }}
                >
                  Preview
                </div>
                <div
                  className="text-sm font-medium text-center"
                  style={{ color: theme.colors.foreground }}
                >
                  {theme.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Light Themes */}
        <div>
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wide"
            style={{ color: currentTheme.colors.foreground }}
          >
            Light Themes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {lightThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setTheme(theme.id);
                  onClose();
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentTheme.id === theme.id ? 'ring-2' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor:
                    currentTheme.id === theme.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  ringColor: theme.colors.primary,
                }}
              >
                <div
                  className="h-12 rounded mb-2 flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                  }}
                >
                  Preview
                </div>
                <div
                  className="text-sm font-medium text-center"
                  style={{ color: theme.colors.foreground }}
                >
                  {theme.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThemePicker;

