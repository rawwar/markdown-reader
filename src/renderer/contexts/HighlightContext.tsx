import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Highlight {
  id: string;
  filePath: string;
  text: string;
  color: string;
  timestamp: number;
  range?: { start: number; end: number };
}

interface HighlightContextType {
  highlights: Highlight[];
  addHighlight: (highlight: Omit<Highlight, 'id' | 'timestamp'>) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  getHighlightsForFile: (filePath: string) => Highlight[];
  searchHighlights: (query: string) => Highlight[];
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const HighlightProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const loadHighlights = async () => {
      const saved = await window.electronAPI.getAllHighlights();
      setHighlights(saved || []);
    };
    loadHighlights();
  }, []);

  const addHighlight = async (highlight: Omit<Highlight, 'id' | 'timestamp'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const updated = await window.electronAPI.saveHighlight(newHighlight);
    setHighlights(updated);
  };

  const removeHighlight = async (id: string) => {
    const updated = await window.electronAPI.deleteHighlight(id);
    setHighlights(updated);
  };

  const getHighlightsForFile = (filePath: string) => {
    return highlights.filter((h) => h.filePath === filePath);
  };

  const searchHighlights = (query: string) => {
    if (!query.trim()) return highlights;
    const lowerQuery = query.toLowerCase();
    return highlights.filter(
      (h) =>
        h.text.toLowerCase().includes(lowerQuery) ||
        h.filePath.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <HighlightContext.Provider
      value={{
        highlights,
        addHighlight,
        removeHighlight,
        getHighlightsForFile,
        searchHighlights,
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within HighlightProvider');
  }
  return context;
};

