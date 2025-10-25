export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: any;
  status: number;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  retryAfter: number | null; // seconds
}

export interface RateLimitError extends ApiError {
  error: "Rate limit exceeded";
  code: 429;
  retryAfter?: number;
  message?: string;
}

export interface AuthenticationError extends ApiError {
  error: "Forbidden";
  message: "Invalid or missing API key";
  code: 403;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}
