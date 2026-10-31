import { z } from 'zod';

export const ChatRoleSchema = z.enum(['user', 'model']);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const ChatTurnSchema = z.object({
  role: ChatRoleSchema,
  content: z.string(),
});
export type ChatTurn = z.infer<typeof ChatTurnSchema>;

export const ChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
  history: z.array(ChatTurnSchema).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseDataSchema = z.object({
  message: ChatTurnSchema,
});
export type ChatResponseData = z.infer<typeof ChatResponseDataSchema>;

// Canonical aliases conforming to camelCase naming conventions
export const chatRoleSchema = ChatRoleSchema;
export const chatTurnSchema = ChatTurnSchema;
export const chatRequestSchema = ChatRequestSchema;
export const chatResponseDataSchema = ChatResponseDataSchema;
