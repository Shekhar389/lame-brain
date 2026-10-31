process.env.GEMINI_API_KEY = 'test-gemini-key';

import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: 'Mock response from Gemini',
        }),
      };
    },
  };
});

import { createApp } from '../src/app.js';

describe('POST /api/v1/chat', () => {
  const app = createApp();

  it('returns status 200 with conforming ApiResponse<ChatResponseData> for valid prompt and history', async () => {
    const payload = {
      message: 'Hello, how are you?',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'model', content: 'Hello! How can I help you today?' },
      ],
    };

    const response = await request(app).post('/api/v1/chat').send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        message: {
          role: 'model',
        },
      },
    });
    expect(typeof response.body.data.message.content).toBe('string');
    expect(response.body.data.message.content.length).toBeGreaterThan(0);
  });

  it('fails with 400 when sending an empty or whitespace-only message', async () => {
    const emptyResponse = await request(app).post('/api/v1/chat').send({
      message: '   ',
    });

    expect(emptyResponse.status).toBe(400);
    expect(emptyResponse.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
    expect(emptyResponse.body.error.details).toBeDefined();
    expect(
      emptyResponse.body.error.details.some(
        (d: { field: string }) => d.field === 'message'
      )
    ).toBe(true);
  });

  it('fails with 400 when sending malformed history', async () => {
    const invalidRoleResponse = await request(app)
      .post('/api/v1/chat')
      .send({
        message: 'Hello',
        history: [{ role: 'invalid_role', content: 'test' }],
      });

    expect(invalidRoleResponse.status).toBe(400);
    expect(invalidRoleResponse.body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
      },
    });

    const invalidContentResponse = await request(app)
      .post('/api/v1/chat')
      .send({
        message: 'Hello',
        history: [{ role: 'user', content: 12345 }],
      });

    expect(invalidContentResponse.status).toBe(400);
    expect(invalidContentResponse.body.error.code).toBe('VALIDATION_ERROR');
  });
});
