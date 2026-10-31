import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiSuccessResponse, ApiErrorResponse } from '@repo/shared';

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to unwrap the standardized API Envelope
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiSuccessResponse<unknown>>) => {
    // If response matches our standard envelope, return unwrapped data
    if (response.data && response.data.success === true) {
      return response;
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data?.error) {
      const serverError = error.response.data.error;
      const enhancedError = new Error(serverError.message);
      (enhancedError as any).code = serverError.code;
      (enhancedError as any).details = serverError.details;
      (enhancedError as any).status = error.response.status;
      return Promise.reject(enhancedError);
    }
    return Promise.reject(error);
  }
);
