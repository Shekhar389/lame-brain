import type { Request, Response, NextFunction } from 'express';
import type { ChatRequest, ApiResponse, ChatResponseData } from '@repo/shared';
import { ChatService } from './chat.service.js';

export class ChatController {
  constructor(private readonly chatService: ChatService = new ChatService()) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, history } = req.body as ChatRequest;
      const modelTurn = await this.chatService.processMessage(message, history ?? []);

      const response: ApiResponse<ChatResponseData> = {
        success: true,
        data: {
          message: modelTurn,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
