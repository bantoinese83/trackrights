/**
 * FileUpload Component
 * Refactored to use new hooks and services - no prop drilling
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, Music, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '@/components/kokonutui/loader';
import { ContractInput } from './ContractInput';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useContract } from '@/hooks/useContract';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppState } from '@/lib/contexts/StateContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function FileUpload() {
  const [isFileUpload, setIsFileUpload] = useLocalStorage<boolean>(
    'trackrights_file_upload_mode',
    true
  );
  const { handleError } = useErrorHandler();
  const { simplifyContract, simplifyContractFromFile } = useContract();
  const { state, dispatch } = useAppState();

  const {
    file,
    error: fileError,
    handleFileChange,
    clearFile,
    validateFile,
  } = useFileUpload({
    onSuccess: async (selectedFile) => {
      // Clear previous results before starting new analysis
      dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: '' });
      dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });

      try {
        if (selectedFile.type === 'application/pdf') {
          const result = await simplifyContractFromFile.execute(selectedFile);
          if (result) {
            clearFile();
          }
        } else {
          const fileContent = await selectedFile.text();
          const result = await simplifyContract.execute({
            contractText: fileContent,
          });
          if (result) {
            clearFile();
          }
        }
      } catch (err) {
        handleError(err, 'Failed to process file');
      }
    },
    onError: (error: string) => {
      handleError(new Error(error), 'File validation failed');
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      handleError(new Error('No file selected'), 'Please select a file');
      return;
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      return;
    }

    // Clear previous results before starting new analysis
    dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: '' });
    dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });

    try {
      if (file.type === 'application/pdf') {
        await simplifyContractFromFile.execute(file);
      } else {
        const fileContent = await file.text();
        await simplifyContract.execute({ contractText: fileContent });
      }
      clearFile();
    } catch (err) {
      handleError(err, 'Failed to process contract');
    }
  };

  // Show processing indicator only while loading AND before simplified contract is available
  // This prevents the indicator from showing after content is already generated
  const isProcessing =
    (simplifyContract.loading || simplifyContractFromFile.loading) &&
    !state.simplifiedContract;
  const error =
    fileError ||
    simplifyContract.error?.message ||
    simplifyContractFromFile.error?.message;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        className="flex items-center justify-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex items-center bg-white/10 p-1 rounded-lg backdrop-blur-sm shadow-lg border border-white/20">
          <button
            type="button"
            onClick={() => setIsFileUpload(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isFileUpload
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setIsFileUpload(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              !isFileUpload
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Paste Text
          </button>
        </div>
      </motion.div>

      {isFileUpload ? (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 rounded-2xl backdrop-blur-lg bg-card/40 border border-border shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
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
                className="flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-primary/30 border-dashed rounded-xl cursor-pointer bg-card/50 hover:bg-primary/5 transition-all duration-300 relative z-10 group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Music className="w-12 h-12 mb-3 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                  </motion.div>
                  <Upload className="w-10 h-10 mb-4 text-primary/50 group-hover:text-primary transition-colors duration-300" />
                  <p className="mb-2 text-base text-foreground font-medium">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, DOCX, TXT (MAX. 10MB)
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Your files are processed securely and never stored
                  </div>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 w-full max-w-sm"
                    >
                      <div className="text-sm text-primary font-medium flex items-center justify-between">
                        <span className="truncate mr-4">✓ {file.name}</span>
                        <span className="text-xs text-primary/70 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </motion.div>
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
                size="lg"
                className="w-full sm:w-auto font-semibold py-6 px-10 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100 text-base"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Analyze Contract
              </Button>
            </div>
          )}
        </motion.form>
      ) : (
        <ContractInput />
      )}

      {isProcessing && (
        <div className="mt-8">
          <Loader
            title="AI Legal Team Analyzing"
            subtitle="This may take 30-60 seconds"
            size="lg"
          />
        </div>
      )}

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
