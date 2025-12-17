import React from 'react';
import { Download, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { ExtractedImage } from '../types';

interface ImageCardProps {
  image: ExtractedImage;
  onAnalyze: (id: string) => void;
  onDownload: (image: ExtractedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onAnalyze, onDownload }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col group">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img 
          src={image.url} 
          alt={image.name}
          className="w-full h-full object-contain p-2"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        {/* Type Badge */}
        <div className="absolute top-2 right-2">
           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm uppercase">
             {image.name.split('.').pop()}
           </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="truncate pr-2">
            <h4 className="text-sm font-medium text-gray-900 truncate" title={image.name}>
              {image.name}
            </h4>
            <p className="text-xs text-gray-500 truncate" title={image.sourceFile}>
              Từ: {image.sourceFile}
            </p>
          </div>
        </div>

        {/* AI Description Area */}
        <div className="mb-4 flex-1">
          {image.isAnalyzing ? (
             <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 p-2 rounded-lg animate-pulse">
               <Sparkles className="w-3 h-3" />
               Đang phân tích với Gemini...
             </div>
          ) : image.aiDescription ? (
            <div className="bg-purple-50 border border-purple-100 p-2 rounded-lg">
               <div className="flex items-center gap-1.5 mb-1">
                 <Sparkles className="w-3 h-3 text-purple-600" />
                 <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Gemini AI</span>
               </div>
               <p className="text-xs text-gray-700 leading-relaxed">
                 {image.aiDescription}
               </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 p-2 rounded-lg text-center h-full flex flex-col justify-center items-center gap-1 min-h-[60px]">
               <p className="text-xs text-gray-400">Chưa có mô tả</p>
               <button 
                onClick={() => onAnalyze(image.id)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
               >
                 <Sparkles className="w-3 h-3" />
                 Tạo mô tả
               </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onDownload(image)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Tải về
          </button>
          {!image.aiDescription && !image.isAnalyzing && (
            <button
              onClick={() => onAnalyze(image.id)}
              className="flex items-center justify-center p-2 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
              title="Phân tích bằng AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};