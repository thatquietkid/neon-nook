import { z } from 'zod';

export const coachRequestSchema = z.object({
  topic: z.string().trim().min(1).max(120),
  difficulty: z.number().int().min(1).max(8),
  request: z.enum(['hint', 'explain']),
}).strict();

const providerReplySchema = z.object({
  choices: z.array(z.object({
    message: z.object({ content: z.string().trim().min(1).max(2_000) }),
  })).min(1),
});

export type CoachRequest = z.infer<typeof coachRequestSchema>;
export type CoachClient = (request: CoachRequest) => Promise<unknown>;

type CerebrasClientOptions = {
  apiKey?: string;
  model?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

const localCoachReply = (request: CoachRequest): string => {
  const topic = request.topic.replaceAll('-', ' ');
  const framing = request.request === 'hint'
    ? 'Start with the smallest rule that connects the question to the concept.'
    : 'Break the concept into its purpose, the key rule, and one concrete example.';

  return `${framing} For ${topic}, reread the mission prompt and compare each choice to that rule.`;
};

export const createCerebrasClient = ({
  apiKey = process.env.CEREBRAS_API_KEY,
  model = process.env.CEREBRAS_MODEL?.trim() || 'gpt-oss-120b',
  fetcher = fetch,
  timeoutMs = 8_000,
}: CerebrasClientOptions = {}): CoachClient => async (request) => {
  if (!apiKey) throw new Error('CEREBRAS_API_KEY is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 180,
        messages: [
          {
            role: 'system',
            content: 'You are Neon Nook’s concise study coach. Give a supportive, accurate explanation in at most three sentences. Do not provide answers without reasoning.',
          },
          {
            role: 'user',
            content: `Topic: ${request.topic}\nDifficulty: ${request.difficulty}/8\nNeed: ${request.request}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Cerebras request failed with ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export const getCoachReply = async (request: CoachRequest, client: CoachClient): Promise<{ text: string; source: 'provider' | 'local' }> => {
  try {
    const validatedRequest = coachRequestSchema.parse(request);
    const providerReply = providerReplySchema.parse(await client(validatedRequest));
    return { text: providerReply.choices[0].message.content, source: 'provider' };
  } catch {
    return { text: localCoachReply(request), source: 'local' };
  }
};
