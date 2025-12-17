import JSZip from 'jszip';
import { ExtractedImage, FileType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { extractImagesFromPdf } from './pdfExtractionService';

export const identifyFileType = (file: File): FileType => {
  if (file.type === FileType.DOCX || file.name.endsWith('.docx')) return FileType.DOCX;
  if (file.type === FileType.XLSX || file.name.endsWith('.xlsx')) return FileType.XLSX;
  if (file.type === FileType.PDF || file.name.endsWith('.pdf')) return FileType.PDF;
  return FileType.UNKNOWN;
};

export const extractImages = async (file: File): Promise<ExtractedImage[]> => {
  const type = identifyFileType(file);
  const images: ExtractedImage[] = [];

  if (type === FileType.PDF) {
     return await extractImagesFromPdf(file);
  }

  if (type === FileType.DOCX || type === FileType.XLSX) {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      
      // Office documents store images in 'media' folders
      const mediaFiles = Object.keys(content.files).filter(fileName => 
        fileName.includes('media/') && 
        (fileName.endsWith('.png') || 
         fileName.endsWith('.jpeg') || 
         fileName.endsWith('.jpg') || 
         fileName.endsWith('.gif') ||
         fileName.endsWith('.emf') ||
         fileName.endsWith('.wmf'))
      );

      for (const fileName of mediaFiles) {
        const fileData = await content.files[fileName].async('blob');
        
        // Determine mime type based on extension
        let mimeType = 'image/jpeg';
        if (fileName.endsWith('.png')) mimeType = 'image/png';
        if (fileName.endsWith('.gif')) mimeType = 'image/gif';
        if (fileName.endsWith('.wmf') || fileName.endsWith('.emf')) {
             // Basic support for vector formats by keeping them as is, browsers might not display them well.
             // Ideally convert to PNG, but keeping logic simple for now.
             mimeType = 'application/octet-stream';
        }

        const fixedBlob = new Blob([fileData], { type: mimeType });
        const url = URL.createObjectURL(fixedBlob);
        
        const cleanName = fileName.split('/').pop() || `image-${Date.now()}`;

        images.push({
          id: uuidv4(),
          name: cleanName,
          blob: fixedBlob,
          url: url,
          type: mimeType,
          sourceFile: file.name
        });
      }
    } catch (e) {
      console.error("Extraction error", e);
      throw new Error("Không thể đọc file Office. File có thể bị hỏng hoặc có mật khẩu.");
    }
  } else {
    throw new Error(`Định dạng file không được hỗ trợ (${file.name}). Chỉ hỗ trợ .docx, .xlsx, .pdf`);
  }

  return images;
};
