import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LLM_PROVIDER: z.enum(['gemini', 'openrouter']).optional(),
  GEMINI_API_KEY: z.string().trim().optional().transform((val) => val || undefined),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  OPENROUTER_API_KEY: z.string().trim().optional().transform((val) => val || undefined),
  OPENROUTER_MODEL: z.string().default('meta-llama/llama-3.3-70b-instruct:free'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
