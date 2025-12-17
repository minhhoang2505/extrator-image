export interface ExtractedImage {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  type: string;
  sourceFile: string;
  aiDescription?: string;
  isAnalyzing?: boolean;
}

export enum FileType {
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PDF = 'application/pdf',
  UNKNOWN = 'unknown'
}

export interface ExtractionResult {
  images: ExtractedImage[];
  error?: string;
}

// Gemini specific types
export enum AIModel {
  FLASH = 'gemini-2.5-flash',
}
