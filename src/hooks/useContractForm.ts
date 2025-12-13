/**
 * useContractForm Hook
 * Enhanced form management with validation and error handling
 */

import { useState, useCallback } from 'react';

export interface FormField {
  value: string;
  error?: string;
}

export interface UseContractFormReturn {
  formData: Record<string, string>;
  errors: Record<string, string>;
  handleInputChange: (key: string, value: string) => void;
  setFieldError: (key: string, error: string) => void;
  clearFieldError: (key: string) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  getFieldValue: (key: string) => string;
}

export function useContractForm(
  initialState: Record<string, string> = {}
): UseContractFormReturn {
  const [formData, setFormData] =
    useState<Record<string, string>>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback(
    (key: string, value: string) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      // Clear error when user starts typing
      if (errors[key]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setFieldError = useCallback((key: string, error: string) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, []);

  const clearFieldError = useCallback((key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        newErrors[key] = `${key} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const getFieldValue = useCallback(
    (key: string): string => {
      return formData[key] ?? '';
    },
    [formData]
  );

  return {
    formData,
    errors,
    handleInputChange,
    setFieldError,
    clearFieldError,
    resetForm,
    validateForm,
    getFieldValue,
  };
}
