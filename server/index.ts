import 'dotenv/config';
import express from 'express';
import { coachRequestSchema, createCerebrasClient, getCoachReply, type CoachClient } from './coach';

type AppOptions = {
  coachClient?: CoachClient;
  rateLimit?: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;

const createIpLimiter = (limit: number) => {
  const visits = new Map<string, { count: number; resetAt: number }>();

  return (ip: string): boolean => {
    const now = Date.now();
    const visit = visits.get(ip);
    if (!visit || visit.resetAt <= now) {
      visits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }
    if (visit.count >= limit) return false;
    visit.count += 1;
    return true;
  };
};

export const createApp = ({ coachClient = createCerebrasClient(), rateLimit = 20 }: AppOptions = {}) => {
  const app = express();
  const allowRequest = createIpLimiter(rateLimit);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '10kb' }));

  app.post('/api/coach', async (req, res) => {
    const parsed = coachRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ text: 'Please send a topic, difficulty, and coaching request.' });
    }
    if (!allowRequest(req.ip ?? 'unknown')) {
      return res.status(429).json({ text: 'The coach needs a short cooldown. Please try again shortly.' });
    }

    const reply = await getCoachReply(parsed.data, coachClient);
    return res.json({ text: reply.text });
  });

  return app;
};

export const app = createApp();

if (process.argv[1]?.endsWith('server/index.ts')) {
  const port = Number(process.env.PORT ?? 8787);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Neon Nook coach server listening on port ${port}`);
  });
}
