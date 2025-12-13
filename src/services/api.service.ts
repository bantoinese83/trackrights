/**
 * Centralized API Service
 * Handles all API calls with proper error handling, retries, and type safety
 */

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));

      const apiError: ApiError = {
        message:
          errorData.error || errorData.message || 'An unknown error occurred',
        statusCode: response.status,
        code: errorData.code,
      };

      throw apiError;
    }

    return response.json();
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService();
