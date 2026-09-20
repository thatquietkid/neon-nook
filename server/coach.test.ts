// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
const originalModel = process.env.CEREBRAS_MODEL;

afterEach(() => {
  vi.useRealTimers();
  if (originalModel === undefined) delete process.env.CEREBRAS_MODEL;
  else process.env.CEREBRAS_MODEL = originalModel;
});

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

  it('does not let a forwarded-for header create new rate-limit buckets', async () => {
    const app = createApp({ coachClient: async () => providerReply, rateLimit: 1 });

    await request(app)
      .post('/api/coach')
      .set('X-Forwarded-For', '203.0.113.10')
      .send(validRequest)
      .expect(200);
    const response = await request(app)
      .post('/api/coach')
      .set('X-Forwarded-For', '203.0.113.11')
      .send(validRequest);

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

  it('uses the default model when the environment override is blank', async () => {
    process.env.CEREBRAS_MODEL = '   ';
    let receivedInit: RequestInit | undefined;
    const fetcher: typeof fetch = async (_url, init) => {
      receivedInit = init;
      return new Response(JSON.stringify(providerReply), { status: 200 });
    };

    await createCerebrasClient({ apiKey: 'test-key', fetcher })(validRequest);

    expect(JSON.parse(String(receivedInit?.body))).toMatchObject({ model: 'gpt-oss-120b' });
  });

  it('falls back locally when the provider exceeds the eight-second timeout', async () => {
    vi.useFakeTimers();
    let aborted = false;
    const fetcher: typeof fetch = async (_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        aborted = true;
        reject(new Error('request timed out'));
      });
    });
    const reply = getCoachReply(validRequest, createCerebrasClient({ apiKey: 'test-key', fetcher }));

    await vi.advanceTimersByTimeAsync(8_000);

    await expect(reply).resolves.toMatchObject({ source: 'local' });
    expect(aborted).toBe(true);
  });
});

describe('production SPA hosting', () => {
  let staticDirectory: string | undefined;

  afterEach(() => {
    if (staticDirectory) rmSync(staticDirectory, { force: true, recursive: true });
    staticDirectory = undefined;
  });

  it('serves the built SPA index at the root URL', async () => {
    staticDirectory = mkdtempSync(join(tmpdir(), 'neon-nook-dist-'));
    writeFileSync(join(staticDirectory, 'index.html'), '<!doctype html><title>Neon Nook</title>');
    const app = createApp({ coachClient: async () => providerReply, staticDirectory });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<title>Neon Nook</title>');
  });

  it('uses the SPA index for client routes without intercepting API paths', async () => {
    staticDirectory = mkdtempSync(join(tmpdir(), 'neon-nook-dist-'));
    writeFileSync(join(staticDirectory, 'index.html'), '<!doctype html><title>Neon Nook</title>');
    const app = createApp({ coachClient: async () => providerReply, staticDirectory });

    const clientRoute = await request(app).get('/missions/one');
    const apiRoute = await request(app).get('/api/coach');

    expect(clientRoute.status).toBe(200);
    expect(clientRoute.text).toContain('<title>Neon Nook</title>');
    expect(apiRoute.status).toBe(404);
  });
});
