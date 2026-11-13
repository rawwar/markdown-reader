# Markdown Reader

A beautiful, feature-rich markdown reader application with customizable themes, fonts, text highlighting, and dictionary lookup.

## Features

- 📁 **Folder Navigation**: Browse and organize your markdown files by subject and book
- 📕 **PDF to Markdown Conversion**: Convert PDF files to markdown with automatic chapter detection
- 🎨 **20+ Themes**: Choose from 10+ dark and 10+ light themes inspired by VSCode
- 🔤 **Customizable Fonts**: Select from multiple font families, sizes, and line spacing options
- ✏️ **Text Highlighting**: Highlight important passages with multiple colors
- 🔍 **Highlight Search**: Search through all your highlights across files
- 📖 **Dictionary Lookup**: Click any word to see its definition instantly
- ⌨️ **Keyboard Shortcuts**: Navigate chapters with Cmd/Ctrl + Arrow keys
- 📱 **Responsive Design**: Beautiful on desktop, tablet, and mobile screens

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd markdown-reader
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run electron:dev
```

4. Build for production:
```bash
npm run build
npm run electron:build
```

## Usage

1. **Select Content Folder**: When you first launch the app, select the folder containing your markdown files
2. **Convert PDFs**: If you have PDF files in your folder, click "Convert to Markdown" to automatically split them into chapters
3. **Browse Books**: Navigate through folders to find your book
4. **Read**: Click on a markdown file to start reading
5. **Navigate Chapters**: Use Prev/Next buttons or Cmd/Ctrl + Arrow keys
6. **Customize**: Use the Font and Theme buttons in the header to customize your reading experience
7. **Highlight**: Select text and choose a highlight color
8. **Dictionary**: Click on any single word to see its definition
9. **Search Highlights**: Click the Highlights button to view and search all your highlights

### PDF Conversion

The app can automatically convert PDF files to markdown format:
- **Automatic Chapter Detection**: The app detects chapters using common patterns (Chapter 1, Chapter I, numbered headings, etc.)
- **Fallback**: If no chapters are detected, the PDF is split into logical sections based on page count
- **Output**: Each chapter is saved as a separate markdown file with numeric prefixes (01.chapter-name.md, 02.chapter-name.md, etc.)
- **Progress Tracking**: See real-time progress as chapters are converted

## Folder Structure

Organize your markdown files like this:

```
content/
  computer_science/
    books/
      DDIA/
        01.chapter1.md
        02.chapter2.md
        03.chapter3.md
      System Design/
        01.introduction.md
        02.scalability.md
```

Files are automatically sorted by their numeric prefix.

## Themes

The app includes 20+ beautiful themes:
- **Dark**: Dracula, Nord, Monokai, One Dark Pro, GitHub Dark, Solarized Dark, Ayu Dark, Gruvbox Dark, Tokyo Night, Catppuccin Mocha
- **Light**: GitHub Light, Solarized Light, Ayu Light, Gruvbox Light, One Light, Paper, Minimal, Warm Light, Cool Light, Sepia

## Fonts

Choose from:
- Inter (Sans-serif)
- Georgia (Serif)
- Fira Code (Monospace)
- JetBrains Mono (Monospace)
- Source Code Pro (Monospace)
- Cascadia Code (Monospace)

## Keyboard Shortcuts

- `Cmd/Ctrl + ←`: Previous chapter
- `Cmd/Ctrl + →`: Next chapter

## Development

- `npm run dev`: Start Vite dev server
- `npm run electron:dev`: Start Electron app in development
- `npm run build`: Build for production
- `npm run electron:build`: Build Electron app

## License

Apache License 2.0

