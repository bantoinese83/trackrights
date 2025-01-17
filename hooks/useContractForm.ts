import { useState } from 'react';

export function useContractForm(initialState: Record<string, string> = {}) {
  const [formData, setFormData] = useState<Record<string, string>>(initialState);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    handleInputChange,
    resetForm,
  };
}
