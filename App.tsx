import React, { useState, useCallback } from 'react';
import { Dropzone } from './components/Dropzone';
import { ImageCard } from './components/ImageCard';
import { ExtractedImage } from './types';
import { extractImages } from './services/extractionService';
import { fetchFileFromUrl } from './services/googleUrlService';
import { analyzeImage } from './services/geminiService';
import saveAs from 'file-saver';
import { Image as ImageIcon, Trash2, DownloadCloud, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    const newImages: ExtractedImage[] = [];
    const errors: string[] = [];

    try {
      for (const file of files) {
        try {
          const images = await extractImages(file);
          newImages.push(...images);
        } catch (e: any) {
          errors.push(`${file.name}: ${e.message}`);
        }
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
      }

      if (newImages.length === 0 && errors.length === 0) {
        setError("Không tìm thấy hình ảnh nào trong các file đã chọn.");
      }

      setExtractedImages(prev => [...prev, ...newImages]);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi xử lý file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    processFiles(files);
  };

  const handleUrlSelected = async (url: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const file = await fetchFileFromUrl(url);
      await processFiles([file]);
    } catch (e: any) {
      setError(e.message);
      setIsProcessing(false);
    }
  };

  const handleAnalyzeImage = async (id: string) => {
    setExtractedImages(prev => prev.map(img => 
      img.id === id ? { ...img, isAnalyzing: true } : img
    ));

    const image = extractedImages.find(img => img.id === id);
    if (!image) return;

    try {
      const description = await analyzeImage(image.blob);
      setExtractedImages(prev => prev.map(img => 
        img.id === id ? { ...img, isAnalyzing: false, aiDescription: description } : img
      ));
    } catch (e) {
      setExtractedImages(prev => prev.map(img => 
        img.id === id ? { ...img, isAnalyzing: false } : img
      ));
    }
  };

  const handleDownloadImage = (image: ExtractedImage) => {
    saveAs(image.blob, image.name);
  };

  const handleDownloadAll = () => {
    extractedImages.forEach(img => {
      saveAs(img.blob, img.name);
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả ảnh đã trích xuất?")) {
      extractedImages.forEach(img => URL.revokeObjectURL(img.url));
      setExtractedImages([]);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Smart Extractor</h1>
              <p className="text-xs text-gray-500 font-medium">Powered by Hoang Vu</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {extractedImages.length > 0 && (
              <button 
                onClick={handleDownloadAll}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <DownloadCloud className="w-4 h-4" />
                Tải tất cả ({extractedImages.length})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload Section */}
        <section className="mb-10 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trích xuất hình ảnh từ tài liệu</h2>
            <p className="text-gray-600">
              Hỗ trợ Word (.docx), Excel (.xlsx), PDF và Google Docs/Sheets.
              <br className="hidden sm:block"/> 
              Sử dụng AI để tự động đặt tên và mô tả ảnh.
            </p>
          </div>
          
          <Dropzone 
            onFilesSelected={handleFilesSelected} 
            onUrlSelected={handleUrlSelected}
            isProcessing={isProcessing} 
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="whitespace-pre-line">{error}</div>
            </div>
          )}
        </section>

        {/* Gallery Section */}
        {extractedImages.length > 0 && (
          <section className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 Hình ảnh đã trích xuất
                 <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full">
                   {extractedImages.length}
                 </span>
               </h3>
               
               <button 
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
               >
                 <Trash2 className="w-4 h-4" />
                 Xóa tất cả
               </button>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {extractedImages.map((img) => (
                  <ImageCard 
                    key={img.id} 
                    image={img} 
                    onAnalyze={handleAnalyzeImage}
                    onDownload={handleDownloadImage}
                  />
                ))}
             </div>
          </section>
        )}

        {/* Empty State / Hints */}
        {extractedImages.length === 0 && !isProcessing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center text-gray-500 max-w-4xl mx-auto">
             <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold">1</div>
                <p className="text-sm">Tải lên file hoặc dán link Google Docs.</p>
             </div>
             <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 font-bold">2</div>
                <p className="text-sm">Hệ thống tự động quét và tách rời các file ảnh gốc từ tài liệu.</p>
             </div>
             <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600 font-bold">3</div>
                <p className="text-sm">Dùng Gemini AI để phân tích nội dung hoặc tải về máy.</p>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 Smart Image Extractor. Được xây dựng với React, JSZip, PDF.js và Gemini API.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;