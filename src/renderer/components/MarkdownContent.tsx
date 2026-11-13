import { forwardRef, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { useTheme } from '../contexts/ThemeContext';
import { useFont } from '../contexts/FontContext';
import { Highlight } from '../contexts/HighlightContext';

interface MarkdownContentProps {
  content: string;
  filePath: string;
  highlights: Highlight[];
}

const MarkdownContent = forwardRef<HTMLDivElement, MarkdownContentProps>(
  ({ content, filePath, highlights }, ref) => {
    const { currentTheme } = useTheme();
    const { fontSettings } = useFont();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
    }, []);

    const html = marked.parse(content);

    useEffect(() => {
      if (contentRef.current) {
        // Apply highlight styles
        const highlightElements = contentRef.current.querySelectorAll('[data-highlight]');
        highlightElements.forEach((el) => {
          const highlightId = el.getAttribute('data-highlight');
          const highlight = highlights.find((h) => h.id === highlightId);
          if (highlight) {
            (el as HTMLElement).style.backgroundColor = highlight.color;
            (el as HTMLElement).style.padding = '2px 4px';
            (el as HTMLElement).style.borderRadius = '3px';
          }
        });

        // Ensure headers are visible in dark themes
        const headers = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headers.forEach((header) => {
          const level = parseInt(header.tagName.charAt(1));
          if (currentTheme.type === 'dark') {
            // In dark themes, use primary color for h1-h3, lighter foreground for h4-h6
            if (level <= 3) {
              (header as HTMLElement).style.color = currentTheme.colors.primary;
              (header as HTMLElement).style.opacity = '1';
            } else {
              (header as HTMLElement).style.color = currentTheme.colors.foreground;
              (header as HTMLElement).style.opacity = '0.95';
            }
          } else {
            // In light themes, use primary color for all headers
            (header as HTMLElement).style.color = currentTheme.colors.primary;
            (header as HTMLElement).style.opacity = '1';
          }
        });
      }
    }, [highlights, html, currentTheme]);

    return (
      <div
        ref={ref || contentRef}
        className="markdown-content"
        style={{
          color: currentTheme.colors.foreground,
          fontFamily: `var(--font-family)`,
          fontSize: `var(--font-size-base)`,
          lineHeight: `var(--line-spacing)`,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

MarkdownContent.displayName = 'MarkdownContent';

export default MarkdownContent;

