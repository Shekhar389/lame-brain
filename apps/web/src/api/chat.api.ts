import { apiClient } from './client.js';
import type { ChatRequest, ChatResponseData, ApiSuccessResponse } from '@repo/shared';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponseData> {
  const response = await apiClient.post<ApiSuccessResponse<ChatResponseData>>('/chat', request);
  return response.data.data;
}
