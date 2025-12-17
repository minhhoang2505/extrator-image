import * as pdfjsLibProxy from 'pdfjs-dist';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedImage } from '../types';

// Workaround for esm.sh import behavior with pdfjs-dist:
// The module is often exported as 'default' in the namespace object.
const pdfjs = (pdfjsLibProxy as any).default || pdfjsLibProxy;

// Set worker source to a stable CDN (cdnjs) to avoid loading issues with esm.sh in worker context
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export const extractImagesFromPdf = async (file: File): Promise<ExtractedImage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Use the resolved pdfjs object
  const loadingTask = pdfjs.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;
  const images: ExtractedImage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    
    // Get operator list to find images
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      
      // Check for image painting operators using the resolved pdfjs object
      if (fn === pdfjs.OPS.paintImageXObject) {
        const imgName = ops.argsArray[i][0];
        
        try {
          // Get the image object from the page's resources
          const imgObj = await page.objs.get(imgName);
          
          if (imgObj && imgObj.data) {
            const { width, height, data } = imgObj;
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              const imageData = ctx.createImageData(width, height);
              
              // Handle different color spaces
              if (data.length === width * height * 4) {
                // RGBA
                imageData.data.set(data);
              } else if (data.length === width * height * 3) {
                // RGB - convert to RGBA
                for (let j = 0, k = 0; j < data.length; j += 3, k += 4) {
                  imageData.data[k] = data[j];
                  imageData.data[k + 1] = data[j + 1];
                  imageData.data[k + 2] = data[j + 2];
                  imageData.data[k + 3] = 255; // Alpha
                }
              } else if (data.length === width * height) {
                 // Grayscale
                 for (let j = 0, k = 0; j < data.length; j++, k += 4) {
                     const val = data[j];
                     imageData.data[k] = val;
                     imageData.data[k + 1] = val;
                     imageData.data[k + 2] = val;
                     imageData.data[k + 3] = 255;
                 }
              }
              
              ctx.putImageData(imageData, 0, 0);
              
              const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
              
              if (blob) {
                images.push({
                  id: uuidv4(),
                  name: `pdf-image-p${pageNum}-${imgName}.png`,
                  blob: blob,
                  url: URL.createObjectURL(blob),
                  type: 'image/png',
                  sourceFile: file.name
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to extract image ${imgName} from page ${pageNum}`, error);
        }
      }
    }
  }
  
  return images;
};