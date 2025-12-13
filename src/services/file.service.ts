/**
 * File Service
 * Handles file operations and validations
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export class FileService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  validateFile(file: File): FileValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Unsupported file type. Please upload a PDF, TXT, or DOCX file.',
      };
    }

    return { isValid: true };
  }

  async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error('Failed to convert file to base64'));
          }
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => {
        reject(new Error(`File read error: ${error}`));
      };
    });
  }

  async readTextFile(file: File): Promise<string> {
    return file.text();
  }

  async readPdfFile(file: File): Promise<string> {
    return this.convertToBase64(file);
  }

  getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() ?? '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const fileService = new FileService();
