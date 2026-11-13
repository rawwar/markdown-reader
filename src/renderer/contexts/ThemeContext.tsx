import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    codeBackground: string;
    codeForeground: string;
    selection: string;
    highlight: string;
  };
}

const themes: Theme[] = [
  // Dark Themes
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    colors: {
      background: '#282a36',
      foreground: '#f8f8f2',
      primary: '#bd93f9',
      secondary: '#6272a4',
      accent: '#ff79c6',
      border: '#44475a',
      codeBackground: '#21222c',
      codeForeground: '#f8f8f2',
      selection: '#44475a',
      highlight: '#ffb86c',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    type: 'dark',
    colors: {
      background: '#2e3440',
      foreground: '#eceff4',
      primary: '#88c0d0',
      secondary: '#5e81ac',
      accent: '#81a1c1',
      border: '#3b4252',
      codeBackground: '#3b4252',
      codeForeground: '#eceff4',
      selection: '#434c5e',
      highlight: '#a3be8c',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    type: 'dark',
    colors: {
      background: '#272822',
      foreground: '#f8f8f2',
      primary: '#a6e22e',
      secondary: '#66d9ef',
      accent: '#f92672',
      border: '#49483e',
      codeBackground: '#1e1f1c',
      codeForeground: '#f8f8f2',
      selection: '#49483e',
      highlight: '#e6db74',
    },
  },
  {
    id: 'one-dark',
    name: 'One Dark Pro',
    type: 'dark',
    colors: {
      background: '#282c34',
      foreground: '#abb2bf',
      primary: '#61afef',
      secondary: '#56b6c2',
      accent: '#c678dd',
      border: '#3e4451',
      codeBackground: '#21252b',
      codeForeground: '#abb2bf',
      selection: '#3e4451',
      highlight: '#e5c07b',
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    type: 'dark',
    colors: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      primary: '#58a6ff',
      secondary: '#79c0ff',
      accent: '#f85149',
      border: '#30363d',
      codeBackground: '#161b22',
      codeForeground: '#c9d1d9',
      selection: '#264f78',
      highlight: '#ffa657',
    },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    type: 'dark',
    colors: {
      background: '#002b36',
      foreground: '#839496',
      primary: '#268bd2',
      secondary: '#2aa198',
      accent: '#d33682',
      border: '#073642',
      codeBackground: '#001e26',
      codeForeground: '#93a1a1',
      selection: '#073642',
      highlight: '#b58900',
    },
  },
  {
    id: 'ayu-dark',
    name: 'Ayu Dark',
    type: 'dark',
    colors: {
      background: '#0d1117',
      foreground: '#b3b1ad',
      primary: '#39bae6',
      secondary: '#ffb454',
      accent: '#ff8f40',
      border: '#1f2329',
      codeBackground: '#151821',
      codeForeground: '#b3b1ad',
      selection: '#1f2329',
      highlight: '#ffcc66',
    },
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    type: 'dark',
    colors: {
      background: '#282828',
      foreground: '#ebdbb2',
      primary: '#83a598',
      secondary: '#8ec07c',
      accent: '#fb4934',
      border: '#3c3836',
      codeBackground: '#1d2021',
      codeForeground: '#ebdbb2',
      selection: '#3c3836',
      highlight: '#fabd2f',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    type: 'dark',
    colors: {
      background: '#1a1b26',
      foreground: '#a9b1d6',
      primary: '#7aa2f7',
      secondary: '#9ece6a',
      accent: '#bb9af7',
      border: '#2f3549',
      codeBackground: '#16161e',
      codeForeground: '#a9b1d6',
      selection: '#2f3549',
      highlight: '#e0af68',
    },
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    type: 'dark',
    colors: {
      background: '#1e1e2e',
      foreground: '#cdd6f4',
      primary: '#89b4fa',
      secondary: '#a6e3a1',
      accent: '#f38ba8',
      border: '#313244',
      codeBackground: '#181825',
      codeForeground: '#cdd6f4',
      selection: '#45475a',
      highlight: '#f9e2af',
    },
  },
  // Light Themes
  {
    id: 'github-light',
    name: 'GitHub Light',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#24292f',
      primary: '#0969da',
      secondary: '#0550ae',
      accent: '#cf222e',
      border: '#d0d7de',
      codeBackground: '#f6f8fa',
      codeForeground: '#24292f',
      selection: '#b6e3ff',
      highlight: '#fff8c5',
    },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    type: 'light',
    colors: {
      background: '#fdf6e3',
      foreground: '#586e75',
      primary: '#268bd2',
      secondary: '#2aa198',
      accent: '#d33682',
      border: '#eee8d5',
      codeBackground: '#faf3e0',
      codeForeground: '#657b83',
      selection: '#eee8d5',
      highlight: '#b58900',
    },
  },
  {
    id: 'ayu-light',
    name: 'Ayu Light',
    type: 'light',
    colors: {
      background: '#fafafa',
      foreground: '#5c6773',
      primary: '#39bae6',
      secondary: '#86b300',
      accent: '#f29668',
      border: '#e6e6e6',
      codeBackground: '#f8f8f8',
      codeForeground: '#5c6773',
      selection: '#d4d4d4',
      highlight: '#ffcc66',
    },
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    type: 'light',
    colors: {
      background: '#fbf1c7',
      foreground: '#3c3836',
      primary: '#458588',
      secondary: '#79740e',
      accent: '#cc241d',
      border: '#ebdbb2',
      codeBackground: '#f2e5bc',
      codeForeground: '#3c3836',
      selection: '#ebdbb2',
      highlight: '#d79921',
    },
  },
  {
    id: 'one-light',
    name: 'One Light',
    type: 'light',
    colors: {
      background: '#fafafa',
      foreground: '#383a42',
      primary: '#4078f2',
      secondary: '#0184bc',
      accent: '#a626a4',
      border: '#e1e4e8',
      codeBackground: '#f0f0f0',
      codeForeground: '#383a42',
      selection: '#e5e5e5',
      highlight: '#c18401',
    },
  },
  {
    id: 'paper',
    name: 'Paper',
    type: 'light',
    colors: {
      background: '#fefefe',
      foreground: '#333333',
      primary: '#0066cc',
      secondary: '#006699',
      accent: '#cc0000',
      border: '#e0e0e0',
      codeBackground: '#f5f5f5',
      codeForeground: '#333333',
      selection: '#e3f2fd',
      highlight: '#fff9c4',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#2d3748',
      primary: '#3182ce',
      secondary: '#4a5568',
      accent: '#e53e3e',
      border: '#e2e8f0',
      codeBackground: '#f7fafc',
      codeForeground: '#2d3748',
      selection: '#bee3f8',
      highlight: '#fefcbf',
    },
  },
  {
    id: 'warm',
    name: 'Warm Light',
    type: 'light',
    colors: {
      background: '#faf8f3',
      foreground: '#3c3836',
      primary: '#458588',
      secondary: '#79740e',
      accent: '#cc241d',
      border: '#ebdbb2',
      codeBackground: '#f2e5bc',
      codeForeground: '#3c3836',
      selection: '#ebdbb2',
      highlight: '#d79921',
    },
  },
  {
    id: 'cool',
    name: 'Cool Light',
    type: 'light',
    colors: {
      background: '#f8f9fa',
      foreground: '#212529',
      primary: '#0d6efd',
      secondary: '#6c757d',
      accent: '#dc3545',
      border: '#dee2e6',
      codeBackground: '#e9ecef',
      codeForeground: '#212529',
      selection: '#cfe2ff',
      highlight: '#fff3cd',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    type: 'light',
    colors: {
      background: '#f4ecd8',
      foreground: '#5c4b37',
      primary: '#8b6914',
      secondary: '#6b5b2d',
      accent: '#8b4513',
      border: '#d4c4a8',
      codeBackground: '#e8dcc6',
      codeForeground: '#5c4b37',
      selection: '#d4c4a8',
      highlight: '#d4a574',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>('dracula');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await window.electronAPI.getStoreValue('theme');
      if (savedTheme && themes.find((t) => t.id === savedTheme)) {
        setCurrentThemeId(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (themeId: string) => {
    setCurrentThemeId(themeId);
    await window.electronAPI.setStoreValue('theme', themeId);
  };

  const currentTheme = themes.find((t) => t.id === currentThemeId) || themes[0];

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    root.style.setProperty('--theme-type', currentTheme.type);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

