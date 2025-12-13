/**
 * Contract Service
 * Handles all contract-related API operations
 */

import { apiService, ApiError } from './api.service';

export interface SimplifyContractRequest {
  contractText: string;
}

export interface SimplifyContractResponse {
  simplifiedContract: string;
  originalContract?: string;
  message?: string;
}

export interface ReviseContractRequest {
  originalContract: string;
  instructions: string;
  role: string;
}

export interface ReviseContractResponse {
  revisedContract: string;
  message?: string;
}

export interface GenerateContractRequest {
  contractDetails: {
    id: string;
    title: string;
    description: string;
    fields: Record<string, { label: string; type: string }>;
  };
  contractInputs: Record<string, string | number>;
}

export interface GenerateContractResponse {
  generatedContract: string;
  message?: string;
}

export class ContractService {
  private readonly SIMPLIFY_ENDPOINT = '/api/simplify-contract';
  private readonly REVISE_ENDPOINT = '/api/revise-contract';
  private readonly GENERATE_ENDPOINT = '/api/generate-contract';

  async simplifyContract(
    request: SimplifyContractRequest
  ): Promise<SimplifyContractResponse> {
    try {
      return await apiService.post<SimplifyContractResponse>(
        this.SIMPLIFY_ENDPOINT,
        request
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async simplifyContractFromFile(
    file: File
  ): Promise<SimplifyContractResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      let fileContent: string;
      if (file.type === 'application/pdf') {
        const fileBuffer = await file.arrayBuffer();
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(fileBuffer);
        const binary = bytes.reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ''
        );
        fileContent = btoa(binary);
      } else if (file.type === 'text/plain') {
        fileContent = await file.text();
      } else {
        throw new Error(
          'Unsupported file type. Please upload a PDF or TXT file.'
        );
      }

      formData.append('fileContent', fileContent);

      return await apiService.postFormData<SimplifyContractResponse>(
        this.SIMPLIFY_ENDPOINT,
        formData
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async reviseContract(
    request: ReviseContractRequest
  ): Promise<ReviseContractResponse> {
    try {
      return await apiService.post<ReviseContractResponse>(
        this.REVISE_ENDPOINT,
        request
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async generateContract(
    request: GenerateContractRequest
  ): Promise<GenerateContractResponse> {
    try {
      return await apiService.post<GenerateContractResponse>(
        this.GENERATE_ENDPOINT,
        request
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      console.error('Contract service error:', error.message);
    } else if (this.isApiError(error)) {
      console.error('API error:', error.message, error.statusCode);
    } else {
      console.error('Unknown error:', error);
    }
  }

  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'statusCode' in error
    );
  }
}

export const contractService = new ContractService();
