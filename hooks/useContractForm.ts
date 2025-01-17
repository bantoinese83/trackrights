import { useState } from 'react';

export function useContractForm(initialState = {}) {
  const [formData, setFormData] = useState(initialState);

  const handleInputChange = (key, value) => {
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
