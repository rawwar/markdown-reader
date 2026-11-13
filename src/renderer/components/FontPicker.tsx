import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useFont } from '../contexts/FontContext';

interface FontPickerProps {
  onClose: () => void;
}

const FontPicker: React.FC<FontPickerProps> = ({ onClose }) => {
  const { currentTheme } = useTheme();
  const { fontSettings, setFontFamily, setFontSize, setLineSpacing, fontFamilies } = useFont();

  const fontSizes = [
    { id: 'small', label: 'Small', value: 'small' as const },
    { id: 'medium', label: 'Medium', value: 'medium' as const },
    { id: 'large', label: 'Large', value: 'large' as const },
    { id: 'xlarge', label: 'X-Large', value: 'xlarge' as const },
  ];

  const lineSpacings = [
    { id: 'compact', label: 'Compact', icon: '≡' },
    { id: 'regular', label: 'Regular', icon: '≡' },
    { id: 'relaxed', label: 'Relaxed', icon: '≡' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-16 left-0 right-0 z-50 shadow-2xl"
      style={{
        backgroundColor: currentTheme.colors.background,
        borderBottom: `1px solid ${currentTheme.colors.border}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Font Size Preview */}
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wide"
            style={{ color: currentTheme.colors.foreground }}
          >
            Font Size
          </h3>
          <div className="flex items-center gap-4">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.value)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  fontSettings.size === size.value
                    ? 'ring-2'
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor:
                    fontSettings.size === size.value
                      ? `${currentTheme.colors.primary}20`
                      : 'transparent',
                  color: currentTheme.colors.foreground,
                  ringColor: currentTheme.colors.primary,
                }}
              >
                <div
                  className="text-center"
                  style={{
                    fontSize:
                      size.value === 'small'
                        ? '14px'
                        : size.value === 'medium'
                        ? '16px'
                        : size.value === 'large'
                        ? '18px'
                        : '20px',
                  }}
                >
                  Aa
                </div>
                <div className="text-xs mt-1">{size.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wide"
            style={{ color: currentTheme.colors.foreground }}
          >
            Font Family
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {fontFamilies.map((font) => (
              <button
                key={font.id}
                onClick={() => setFontFamily(font.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  fontSettings.family === font.id
                    ? 'ring-2'
                    : 'hover:border-opacity-50'
                }`}
                style={{
                  backgroundColor:
                    fontSettings.family === font.id
                      ? `${currentTheme.colors.primary}20`
                      : 'transparent',
                  borderColor:
                    fontSettings.family === font.id
                      ? currentTheme.colors.primary
                      : currentTheme.colors.border,
                  color: currentTheme.colors.foreground,
                  fontFamily: font.value,
                  ringColor: currentTheme.colors.primary,
                }}
              >
                <div className="font-semibold mb-1">{font.name}</div>
                <div className="text-sm opacity-70">The quick brown fox</div>
              </button>
            ))}
          </div>
        </div>

        {/* Line Spacing */}
        <div>
          <h3
            className="text-sm font-semibold mb-4 uppercase tracking-wide"
            style={{ color: currentTheme.colors.foreground }}
          >
            Line Spacing
          </h3>
          <div className="flex items-center gap-4">
            {lineSpacings.map((spacing) => (
              <button
                key={spacing.id}
                onClick={() => setLineSpacing(spacing.id as any)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  fontSettings.lineSpacing === spacing.id
                    ? 'ring-2'
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor:
                    fontSettings.lineSpacing === spacing.id
                      ? `${currentTheme.colors.primary}20`
                      : 'transparent',
                  color: currentTheme.colors.foreground,
                  ringColor: currentTheme.colors.primary,
                }}
              >
                <div className="text-2xl mb-2">{spacing.icon}</div>
                <div className="text-sm">{spacing.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FontPicker;

