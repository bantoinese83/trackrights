/**
 * useContract Hook
 * Centralized hook for contract operations
 */

import { useCallback } from 'react';
import { useAppState } from '@/lib/contexts/StateContext';
import { contractService } from '@/services/contract.service';
import { useApi } from './useApi';
import type {
  SimplifyContractRequest,
  ReviseContractRequest,
  GenerateContractRequest,
} from '@/services/contract.service';

export function useContract() {
  const { state, dispatch } = useAppState();

  const simplifyContract = useApi(
    useCallback(
      async (...args: unknown[]) => {
        const request = args[0] as SimplifyContractRequest;
        // Clear previous simplified contract when starting new analysis
        dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: '' });
        dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });
        const response = await contractService.simplifyContract(request);
        dispatch({
          type: 'SET_ORIGINAL_CONTRACT',
          payload: request.contractText,
        });
        dispatch({
          type: 'SET_SIMPLIFIED_CONTRACT',
          payload: response.simplifiedContract,
        });
        return response;
      },
      [dispatch]
    )
  );

  const simplifyContractFromFile = useApi(
    useCallback(
      async (file: unknown) => {
        const fileObj = file as File;
        // Clear previous simplified contract when starting new analysis
        dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: '' });
        dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });
        const response =
          await contractService.simplifyContractFromFile(fileObj);
        let fileContent: string;
        if (fileObj.type === 'application/pdf') {
          const fileBuffer = await fileObj.arrayBuffer();
          const bytes = new Uint8Array(fileBuffer);
          const binary = bytes.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ''
          );
          fileContent = btoa(binary);
        } else {
          fileContent = await fileObj.text();
        }
        dispatch({
          type: 'SET_ORIGINAL_CONTRACT',
          payload: fileContent,
        });
        dispatch({
          type: 'SET_SIMPLIFIED_CONTRACT',
          payload: response.simplifiedContract,
        });
        return { ...response, fileType: fileObj.type };
      },
      [dispatch]
    )
  );

  const reviseContract = useApi(
    useCallback(
      async (...args: unknown[]) => {
        const request = args[0] as ReviseContractRequest;
        const response = await contractService.reviseContract(request);
        dispatch({
          type: 'SET_REVISED_CONTRACT',
          payload: response.revisedContract,
        });
        return response;
      },
      [dispatch]
    )
  );

  const generateContract = useApi(
    useCallback(async (...args: unknown[]) => {
      const request = args[0] as GenerateContractRequest;
      return await contractService.generateContract(request);
    }, [])
  );

  const clearContract = useCallback(() => {
    dispatch({ type: 'SET_ORIGINAL_CONTRACT', payload: '' });
    dispatch({ type: 'SET_SIMPLIFIED_CONTRACT', payload: '' });
    dispatch({ type: 'SET_REVISED_CONTRACT', payload: null });
  }, [dispatch]);

  return {
    state,
    simplifyContract,
    simplifyContractFromFile,
    reviseContract,
    generateContract,
    clearContract,
  };
}
