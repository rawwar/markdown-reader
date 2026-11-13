const pdfParse = require('pdf-parse');
import { readFile, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';

interface Chapter {
  title: string;
  content: string;
  pageNumber: number;
}

export async function convertPdfToMarkdown(
  pdfPath: string,
  onProgress?: (progress: { current: number; total: number; chapter?: string }) => void
): Promise<{ success: boolean; files: string[]; error?: string }> {
  try {
    // Read PDF file
    const pdfBuffer = await readFile(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    // Extract text from PDF
    const fullText = pdfData.text || '';
    const pages = fullText.split(/\f|\n\n\n+/).filter((p: string) => p.trim().length > 0); // Page breaks or large gaps

    // Detect chapters using common patterns
    const chapters = detectChapters(fullText, pages);

    if (chapters.length === 0) {
      // If no chapters detected, split by pages (every 10 pages or so)
      const pagesPerChapter = Math.max(5, Math.floor(pages.length / 10));
      for (let i = 0; i < pages.length; i += pagesPerChapter) {
        const chapterPages = pages.slice(i, i + pagesPerChapter);
        chapters.push({
          title: `Chapter ${Math.floor(i / pagesPerChapter) + 1}`,
          content: chapterPages.join('\n\n'),
          pageNumber: i + 1,
        });
      }
    }

    // Create markdown files
    const outputDir = dirname(pdfPath);
    const baseName = basename(pdfPath, '.pdf');
    const markdownFiles: string[] = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const chapterNumber = String(i + 1).padStart(2, '0');
      const fileName = `${chapterNumber}.${sanitizeFileName(chapter.title)}.md`;
      const filePath = join(outputDir, fileName);

      // Create markdown content
      const markdownContent = `# ${chapter.title}\n\n${chapter.content.trim()}\n`;

      await writeFile(filePath, markdownContent, 'utf-8');
      markdownFiles.push(filePath);

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: chapters.length,
          chapter: chapter.title,
        });
      }
    }

    return { success: true, files: markdownFiles };
  } catch (error: any) {
    console.error('Error converting PDF:', error);
    return {
      success: false,
      files: [],
      error: error.message || 'Failed to convert PDF',
    };
  }
}

function detectChapters(fullText: string, pages: string[]): Chapter[] {
  const chapters: Chapter[] = [];
  
  // Common chapter patterns
  const chapterPatterns = [
    /^Chapter\s+(\d+)[:.\s]+(.+)$/im,
    /^Chapter\s+([IVX]+)[:.\s]+(.+)$/im,
    /^(\d+)[:.\s]+(.+)$/m,
    /^Part\s+(\d+)[:.\s]+(.+)$/im,
    /^(\d+)\.\s+(.+)$/m,
  ];

  const lines = fullText.split('\n');
  let currentChapter: { title: string; startLine: number; content: string[] } | null = null;
  let pageNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line matches chapter pattern
    let matched = false;
    for (const pattern of chapterPatterns) {
      const match = line.match(pattern);
      if (match && line.length < 100) {
        // Found a chapter heading
        if (currentChapter) {
          // Save previous chapter
          chapters.push({
            title: currentChapter.title,
            content: currentChapter.content.join('\n'),
            pageNumber: Math.floor((currentChapter.startLine / lines.length) * pages.length) + 1,
          });
        }
        
        // Start new chapter
        const chapterTitle = match[2] || match[1] || line;
        currentChapter = {
          title: chapterTitle.trim(),
          startLine: i,
          content: [line],
        };
        matched = true;
        break;
      }
    }

    if (!matched && currentChapter) {
      currentChapter.content.push(line);
    }

    // Update page number estimate
    if (line.includes('\f')) {
      pageNumber++;
    }
  }

  // Add last chapter
  if (currentChapter) {
    chapters.push({
      title: currentChapter.title,
      content: currentChapter.content.join('\n'),
      pageNumber: Math.floor((currentChapter.startLine / lines.length) * pages.length) + 1,
    });
  }

  // Filter out chapters that are too short (likely false positives)
  // Also ensure we have at least one chapter
  const validChapters = chapters.filter((ch) => ch.content.trim().length > 200);
  return validChapters.length > 0 ? validChapters : chapters;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50);
}

