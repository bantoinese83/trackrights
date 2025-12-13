/**
 * useFileUpload Hook
 * Handles file upload operations with validation and error handling
 */

import { useState, useCallback } from 'react';
import { fileService, FileValidationResult } from '@/services/file.service';

interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onSuccess?: (file: File) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  file: File | null;
  error: string | null;
  isUploading: boolean;
  validation: FileValidationResult | null;
  handleFileSelect: (file: File | null) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearFile: () => void;
  validateFile: (file: File) => FileValidationResult;
}

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const { onSuccess, onError } = options;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validation, setValidation] = useState<FileValidationResult | null>(
    null
  );

  const validateFile = useCallback(
    (fileToValidate: File): FileValidationResult => {
      const result = fileService.validateFile(fileToValidate);
      setValidation(result);
      if (!result.isValid) {
        setError(result.error ?? 'Invalid file');
        onError?.(result.error ?? 'Invalid file');
      } else {
        setError(null);
      }
      return result;
    },
    [onError]
  );

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) {
        setFile(null);
        setValidation(null);
        setError(null);
        return;
      }

      const validationResult = validateFile(selectedFile);
      if (validationResult.isValid) {
        setFile(selectedFile);
        onSuccess?.(selectedFile);
      } else {
        setFile(null);
      }
    },
    [validateFile, onSuccess]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] || null;
      handleFileSelect(selectedFile);
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    setValidation(null);
    setIsUploading(false);
  }, []);

  return {
    file,
    error,
    isUploading,
    validation,
    handleFileSelect,
    handleFileChange,
    clearFile,
    validateFile,
  };
}
