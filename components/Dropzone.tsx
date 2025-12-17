import React, { useCallback, useState } from 'react';
import { Upload, Link as LinkIcon, Loader2, FileType } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onUrlSelected: (url: string) => void;
  isProcessing: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, onUrlSelected, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, isProcessing]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  }, [onFilesSelected]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSelected(url.trim());
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'file' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'url' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Google Docs/Sheets URL
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'file' ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative group cursor-pointer
              border-2 border-dashed rounded-xl p-8 sm:p-12
              transition-all duration-300 ease-in-out
              flex flex-col items-center justify-center text-center
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
              }
              ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isProcessing}
              accept=".docx,.xlsx,.doc,.xls,.pdf"
            />

            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:shadow-md transition-shadow">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Upload className={`w-8 h-8 ${isDragOver ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Đang xử lý...' : 'Kéo thả file vào đây'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Hỗ trợ Word, Excel và PDF
            </p>

            <div className="flex gap-2 justify-center flex-wrap">
              <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">DOCX</span>
              <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">XLSX</span>
              <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-100">PDF</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="flex flex-col items-center gap-4 py-8">
            <div className="w-full max-w-md">
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                Dán link Google Docs hoặc Sheets
              </label>
              <div className="flex gap-2">
                <input
                  id="url-input"
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  className="flex-1 rounded-lg border-gray-300 border shadow-sm focus:border-primary focus:ring-primary p-2.5 text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isProcessing}
                  required
                />
                <button
                  type="submit"
                  disabled={isProcessing || !url}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lấy ảnh'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                * Lưu ý: Tài liệu phải được chia sẻ ở chế độ "Bất kỳ ai có liên kết" (Anyone with the link).
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
