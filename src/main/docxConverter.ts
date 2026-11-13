const mammoth = require('mammoth');
import { readFile, writeFile } from 'fs/promises';
import { join, dirname, basename } from 'path';

export async function convertDocxToMarkdown(
  docxPath: string,
  onProgress?: (progress: { current: number; total: number; chapter?: string }) => void
): Promise<{ success: boolean; files: string[]; error?: string }> {
  try {
    // Read DOCX file
    const docxBuffer = await readFile(docxPath);
    
    // Convert DOCX to HTML first
    const result = await mammoth.convertToHtml({ buffer: docxBuffer });
    const html = result.value;
    const messages = result.messages;
    
    if (messages.length > 0) {
      console.warn('DOCX conversion warnings:', messages);
    }

    // Convert HTML to markdown (simple conversion)
    // For better results, we could use a library like turndown, but for now we'll do basic conversion
    let markdown = htmlToMarkdown(html);
    
    // Detect chapters
    const chapters = detectChapters(markdown);
    
    const outputDir = dirname(docxPath);
    const baseName = basename(docxPath, '.docx');
    const markdownFiles: string[] = [];

    if (chapters.length > 0) {
      // Split into chapter files
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const chapterNumber = String(i + 1).padStart(2, '0');
        const fileName = `${chapterNumber}.${sanitizeFileName(chapter.title)}.md`;
        const filePath = join(outputDir, fileName);

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
    } else {
      // Single file output
      const fileName = `${baseName}.md`;
      const filePath = join(outputDir, fileName);
      await writeFile(filePath, markdown, 'utf-8');
      markdownFiles.push(filePath);
      
      if (onProgress) {
        onProgress({
          current: 1,
          total: 1,
          chapter: 'Converting document',
        });
      }
    }

    return { success: true, files: markdownFiles };
  } catch (error: any) {
    console.error('Error converting DOCX:', error);
    return {
      success: false,
      files: [],
      error: error.message || 'Failed to convert DOCX',
    };
  }
}

export async function readDocxAsMarkdown(docxPath: string): Promise<string | null> {
  try {
    const docxBuffer = await readFile(docxPath);
    const result = await mammoth.convertToHtml({ buffer: docxBuffer });
    const html = result.value;
    const markdown = htmlToMarkdown(html);
    return markdown;
  } catch (error: any) {
    console.error('Error reading DOCX:', error);
    return null;
  }
}

function htmlToMarkdown(html: string): string {
  // Simple HTML to markdown conversion
  // Replace common HTML tags with markdown equivalents
  let markdown = html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br[^>]*>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

function detectChapters(markdown: string): Array<{ title: string; content: string }> {
  const chapters: Array<{ title: string; content: string }> = [];
  const lines = markdown.split('\n');
  let currentChapter: { title: string; content: string[] } | null = null;

  // Look for chapter patterns: # Chapter, ## Chapter, Chapter 1, etc.
  const chapterRegex = /^(#{1,3}\s+)?(Chapter\s+(?:\d+|[IVXLCDM]+)|(?:\d+\.\s+)?[A-Z][^.!?]{5,50})$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(chapterRegex);

    if (match && line.length < 100 && !line.includes('.') && line.length > 5) {
      if (currentChapter) {
        chapters.push({
          title: currentChapter.title,
          content: currentChapter.content.join('\n'),
        });
      }
      // Remove markdown headers (#) from title
      const title = line.replace(/^#+\s+/, '').trim();
      currentChapter = { title, content: [] };
    } else if (currentChapter) {
      currentChapter.content.push(line);
    }
  }

  if (currentChapter && currentChapter.content.length > 0) {
    chapters.push({
      title: currentChapter.title,
      content: currentChapter.content.join('\n'),
    });
  }

  // Filter out chapters that are too short (likely false positives)
  const validChapters = chapters.filter((ch) => ch.content.trim().length > 200);
  return validChapters.length > 0 ? validChapters : chapters;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

