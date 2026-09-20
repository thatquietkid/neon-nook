// @vitest-environment node

import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createCerebrasClient, getCoachReply, type CoachRequest } from './coach';
import { createApp } from './index';

const validRequest: CoachRequest = {
  topic: 'python-lists',
  difficulty: 1,
  request: 'hint',
};

const providerReply = {
  choices: [{ message: { content: 'Start by thinking about what changes a list in place.' } }],
};

describe('study coach', () => {
  it('rejects a malformed coaching payload', async () => {
    const app = createApp({ coachClient: async () => providerReply });

    const response = await request(app).post('/api/coach').send({ topic: 4 });

    expect(response.status).toBe(400);
  });

  it('returns the local fallback when the provider throws', async () => {
    const failingClient = async (): Promise<unknown> => {
      throw new Error('provider unavailable');
    };

    await expect(getCoachReply(validRequest, failingClient)).resolves.toMatchObject({
      source: 'local',
      text: expect.stringContaining('python lists'),
    });
  });

  it('uses the local fallback when provider content has no usable text', async () => {
    await expect(getCoachReply(validRequest, async () => ({ choices: [] }))).resolves.toMatchObject({
      source: 'local',
    });
  });

  it('returns a text-only coach payload for a valid request', async () => {
    const app = createApp({ coachClient: async () => providerReply });

    const response = await request(app).post('/api/coach').send(validRequest);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ text: 'Start by thinking about what changes a list in place.' });
  });

  it('limits repeated coach requests from the same IP address', async () => {
    const app = createApp({ coachClient: async () => providerReply, rateLimit: 1 });

    await request(app).post('/api/coach').send(validRequest).expect(200);
    const response = await request(app).post('/api/coach').send(validRequest);

    expect(response.status).toBe(429);
  });

  it('sends a Cerebras-compatible chat completion request', async () => {
    let receivedUrl = '';
    let receivedInit: RequestInit | undefined;
    const fetcher: typeof fetch = async (url, init) => {
      receivedUrl = String(url);
      receivedInit = init;
      return new Response(JSON.stringify(providerReply), { status: 200 });
    };
    const client = createCerebrasClient({
      apiKey: 'test-key',
      model: 'gpt-oss-120b',
      fetcher,
    });

    const response = await client(validRequest);

    expect(receivedUrl).toBe('https://api.cerebras.ai/v1/chat/completions');
    expect(receivedInit?.headers).toMatchObject({ Authorization: 'Bearer test-key' });
    expect(JSON.parse(String(receivedInit?.body))).toMatchObject({
      model: 'gpt-oss-120b',
      messages: [
        { role: 'system' },
        { role: 'user', content: expect.stringContaining('python-lists') },
      ],
    });
    expect(response).toEqual(providerReply);
  });
});
