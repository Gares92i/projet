declare module 'pdfkit' {
  import { Readable } from 'stream';
  
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    bufferPages?: boolean;
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
    };
  }

  class PDFDocument extends Readable {
    constructor(options?: PDFDocumentOptions);
    
    pipe(destination: any): this;
    end(): void;
    addPage(): void;
    switchToPage(pageNumber: number): void;
    bufferedPageRange(): { start: number; count: number };
    moveDown(lines?: number): this;
    font(fontName: string): this;
    fontSize(size: number): this;
    text(text: string, options?: any): this;
    y: number;
  }

  export = PDFDocument;
} 