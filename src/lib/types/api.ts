/**
 * API Types
 * Type definitions for API requests and responses
 */

export interface Content {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

export interface SimplifyRequest {
  contractText: string;
}
