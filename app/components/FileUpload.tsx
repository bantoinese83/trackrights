'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProcessingIndicator } from './ProcessingIndicator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ContractInput } from './ContractInput';

interface FileUploadProps {
  onFileProcessedAction: (
    originalContract: string,
    simplifiedContract: string,
    fileType: string
  ) => void;
}

export function FileUpload({ onFileProcessedAction }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFileUpload, setIsFileUpload] = useState(true);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file before analyzing.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let fileContent: string;
      if (file.type === 'application/pdf') {
        fileContent = await convertToBase64(file);
      } else {
        fileContent = await file.text();
      }

      const response = await fetch('/api/simplify-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractText: fileContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      onFileProcessedAction(
        fileContent,
        responseData.simplifiedContract,
        file.type
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContractSubmit = async (contractText: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/simplify-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      onFileProcessedAction(
        contractText,
        responseData.simplifiedContract,
        'text/plain'
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        className="flex items-center justify-center space-x-4 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex items-center bg-purple-900/50 p-2 rounded-xl backdrop-blur-sm shadow-xl border border-purple-500/20">
          <Label
            htmlFor="input-method"
            className={`px-6 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
              isFileUpload
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-purple-200/60 hover:text-purple-200'
            }`}
            onClick={() => setIsFileUpload(true)}
          >
            Upload Contract
          </Label>
          <Label
            htmlFor="input-method"
            className={`px-6 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
              !isFileUpload
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-purple-200/60 hover:text-purple-200'
            }`}
            onClick={() => setIsFileUpload(false)}
          >
            Input Contract
          </Label>
          <Switch
            id="input-method"
            checked={isFileUpload}
            onCheckedChange={(checked) => setIsFileUpload(checked)}
            className="hidden"
          />
        </div>
      </motion.div>

      {isFileUpload ? (
        <ContractInput onContractSubmitAction={handleContractSubmit} />
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 rounded-2xl backdrop-blur-lg bg-purple-900/20 border border-purple-500/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <label htmlFor="contract" className="sr-only">
              Upload Contract
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="contract"
                className="flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-purple-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-purple-50 transition-colors duration-300 relative z-10"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <Music className="w-12 h-12 mb-3 text-purple-500" />
                  <Upload className="w-10 h-10 mb-3 text-purple-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, TXT (MAX. 10MB)
                  </p>
                  {file && (
                    <div className="mt-4 text-sm text-purple-600 font-medium">
                      Selected file: {file.name}
                    </div>
                  )}
                </div>
              </label>
              <input
                id="contract"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                disabled={isProcessing}
              />
            </div>
          </div>
          {file && !isProcessing && (
            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                Analyze Contract
              </Button>
            </div>
          )}
        </motion.form>
      )}

      {isProcessing && <ProcessingIndicator />}

      {error && (
        <motion.div
          className="mt-6 p-4 bg-red-100/90 backdrop-blur-sm text-red-700 rounded-xl border border-red-200 flex items-center shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
