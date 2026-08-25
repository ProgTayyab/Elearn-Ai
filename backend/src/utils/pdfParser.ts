import fs from 'fs';
import path from 'path';

/**
 * Extracts text content from a PDF file using pdf-parse.
 * Returns the extracted text or an empty string if extraction fails.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, '../../', filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`PDF file not found: ${absolutePath}`);
      return '';
    }

    const dataBuffer = fs.readFileSync(absolutePath);
    // pdf-parse@1.1.1 uses a default export
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(dataBuffer);
    return data.text?.trim() || '';
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    return '';
  }
}
