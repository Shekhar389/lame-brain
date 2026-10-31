import { z } from 'zod';

export const ApiErrorDetailSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
});

export const ApiErrorPayloadSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.array(ApiErrorDetailSchema).optional(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ApiErrorPayloadSchema,
});

export function createApiSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.unknown()).optional(),
  });
}

export type ApiErrorDetail = z.infer<typeof ApiErrorDetailSchema>;
export type ApiErrorPayload = z.infer<typeof ApiErrorPayloadSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
