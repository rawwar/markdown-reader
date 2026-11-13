import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface PdfUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (pdfPath: string, targetPath: string) => Promise<void>;
  contentRootPath: string;
}

const PdfUploadDialog: React.FC<PdfUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  contentRootPath,
}) => {
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [targetPath, setTargetPath] = useState<string>('');
  const [pathType, setPathType] = useState<'relative' | 'absolute'>('relative');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTheme } = useTheme();

  const handleSelectPdf = async () => {
    const selected = await window.electronAPI.selectPdfFile();
    if (selected) {
      setPdfPath(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!pdfPath) {
      setError('Please select a PDF file');
      return;
    }

    let finalPath: string;
    if (pathType === 'relative') {
      if (!targetPath.trim()) {
        setError('Please enter a path (e.g., books/brain/thinking_fast_and_slow)');
        return;
      }
      finalPath = `${contentRootPath}/${targetPath}`;
    } else {
      if (!targetPath.trim()) {
        setError('Please enter a full path');
        return;
      }
      finalPath = targetPath;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload(pdfPath, finalPath);
      // Reset form
      setPdfPath(null);
      setTargetPath('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

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
          className="max-w-2xl w-full rounded-2xl shadow-2xl p-6"
          style={{
            backgroundColor: currentTheme.colors.background,
            border: `1px solid ${currentTheme.colors.border}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ color: currentTheme.colors.foreground }}
            >
              Upload PDF
            </h2>
            <button
              onClick={onClose}
              className="text-2xl hover:opacity-70 transition-opacity"
              style={{ color: currentTheme.colors.foreground }}
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* PDF Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.foreground }}
              >
                PDF File
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectPdf}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.background,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Select PDF
                </button>
                <span
                  className="text-sm flex-1 truncate"
                  style={{ color: currentTheme.colors.foreground }}
                >
                  {pdfPath ? pdfPath.split('/').pop() : 'No file selected'}
                </span>
              </div>
            </div>

            {/* Path Type Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.foreground }}
              >
                Save Location
              </label>
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => setPathType('relative')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathType === 'relative' ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor:
                      pathType === 'relative'
                        ? `${currentTheme.colors.primary}20`
                        : 'transparent',
                    color: currentTheme.colors.foreground,
                    ringColor: currentTheme.colors.primary,
                  }}
                >
                  Relative Path
                </button>
                <button
                  onClick={() => setPathType('absolute')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathType === 'absolute' ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor:
                      pathType === 'absolute'
                        ? `${currentTheme.colors.primary}20`
                        : 'transparent',
                    color: currentTheme.colors.foreground,
                    ringColor: currentTheme.colors.primary,
                  }}
                >
                  Full Path
                </button>
              </div>

              {/* Path Input */}
              <div>
                <input
                  type="text"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  placeholder={
                    pathType === 'relative'
                      ? 'e.g., books/brain/thinking_fast_and_slow'
                      : '/full/path/to/destination'
                  }
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: currentTheme.colors.codeBackground,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.foreground,
                  }}
                />
                {pathType === 'relative' && (
                  <p
                    className="text-xs mt-1 opacity-70"
                    style={{ color: currentTheme.colors.foreground }}
                  >
                    Relative to content folder: {contentRootPath}
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: `${currentTheme.colors.accent}20`,
                  color: currentTheme.colors.accent,
                }}
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: currentTheme.colors.codeBackground,
                  color: currentTheme.colors.foreground,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !pdfPath}
                className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  color: currentTheme.colors.background,
                }}
              >
                {uploading ? 'Uploading...' : 'Upload & Convert'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PdfUploadDialog;

