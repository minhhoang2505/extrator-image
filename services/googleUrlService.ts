import { FileType } from "../types";

export const parseGoogleUrl = (url: string): { type: FileType, exportUrl: string, filename: string } | null => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Regex for Docs
    const docMatch = path.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (docMatch) {
      const id = docMatch[1];
      // Use corsproxy.io to bypass CORS for the export link
      const exportUrl = `https://corsproxy.io/?` + encodeURIComponent(`https://docs.google.com/document/d/${id}/export?format=docx`);
      return {
        type: FileType.DOCX,
        exportUrl,
        filename: `google-doc-${id}.docx`
      };
    }

    // Regex for Sheets
    const sheetMatch = path.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetMatch) {
      const id = sheetMatch[1];
      const exportUrl = `https://corsproxy.io/?` + encodeURIComponent(`https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`);
      return {
        type: FileType.XLSX,
        exportUrl,
        filename: `google-sheet-${id}.xlsx`
      };
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

export const fetchFileFromUrl = async (url: string): Promise<File> => {
  const info = parseGoogleUrl(url);
  if (!info) {
    throw new Error("URL không hợp lệ. Chỉ hỗ trợ Google Docs và Google Sheets (link công khai).");
  }

  try {
    const response = await fetch(info.exportUrl);
    if (!response.ok) {
        if (response.status === 404) throw new Error("Không tìm thấy tài liệu.");
        if (response.status === 403 || response.status === 401) throw new Error("Không có quyền truy cập. Vui lòng đảm bảo tài liệu được chia sẻ ở chế độ 'Bất kỳ ai có liên kết' (Anyone with the link).");
        throw new Error("Không thể tải tài liệu từ Google.");
    }
    const blob = await response.blob();
    return new File([blob], info.filename, { type: info.type });
  } catch (e: any) {
    throw new Error(`Lỗi tải URL: ${e.message}`);
  }
};
