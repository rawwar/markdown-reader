import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FontSettings {
  family: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  lineSpacing: 'compact' | 'regular' | 'relaxed';
}

const fontFamilies = [
  { id: 'inter', name: 'Inter', value: "'Inter', system-ui, sans-serif" },
  { id: 'georgia', name: 'Georgia', value: "'Georgia', serif" },
  { id: 'fira-code', name: 'Fira Code', value: "'Fira Code', 'Monaco', monospace" },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { id: 'source-code-pro', name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { id: 'cascadia-code', name: 'Cascadia Code', value: "'Cascadia Code', monospace" },
];

const fontSizes = {
  small: { base: '14px', lineHeight: '1.6' },
  medium: { base: '16px', lineHeight: '1.7' },
  large: { base: '18px', lineHeight: '1.8' },
  xlarge: { base: '20px', lineHeight: '1.9' },
};

const lineSpacings = {
  compact: '1.5',
  regular: '1.7',
  relaxed: '2.0',
};

interface FontContextType {
  fontSettings: FontSettings;
  setFontFamily: (family: string) => void;
  setFontSize: (size: FontSettings['size']) => void;
  setLineSpacing: (spacing: FontSettings['lineSpacing']) => void;
  fontFamilies: typeof fontFamilies;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: 'inter',
    size: 'medium',
    lineSpacing: 'regular',
  });

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await window.electronAPI.getStoreValue('fontSettings');
      if (saved) {
        setFontSettings(saved);
      }
    };
    loadSettings();
  }, []);

  const setFontFamily = async (family: string) => {
    const newSettings = { ...fontSettings, family };
    setFontSettings(newSettings);
    await window.electronAPI.setStoreValue('fontSettings', newSettings);
  };

  const setFontSize = async (size: FontSettings['size']) => {
    const newSettings = { ...fontSettings, size };
    setFontSettings(newSettings);
    await window.electronAPI.setStoreValue('fontSettings', newSettings);
  };

  const setLineSpacing = async (spacing: FontSettings['lineSpacing']) => {
    const newSettings = { ...fontSettings, lineSpacing: spacing };
    setFontSettings(newSettings);
    await window.electronAPI.setStoreValue('fontSettings', newSettings);
  };

  useEffect(() => {
    const root = document.documentElement;
    const fontFamily = fontFamilies.find((f) => f.id === fontSettings.family)?.value || fontFamilies[0].value;
    const fontSize = fontSizes[fontSettings.size];
    const lineSpacing = lineSpacings[fontSettings.lineSpacing];

    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--font-size-base', fontSize.base);
    root.style.setProperty('--font-line-height', fontSize.lineHeight);
    root.style.setProperty('--line-spacing', lineSpacing);
  }, [fontSettings]);

  return (
    <FontContext.Provider
      value={{
        fontSettings,
        setFontFamily,
        setFontSize,
        setLineSpacing,
        fontFamilies,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within FontProvider');
  }
  return context;
};

