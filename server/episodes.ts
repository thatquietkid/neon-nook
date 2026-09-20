import { z } from 'zod';
export const episodeSchema = z.object({ id: z.string().min(1).max(120), familyId: z.string().min(1).max(80), variant: z.enum(['A', 'B']), prompt: z.string().min(1).max(1200) }).strict();
export type EpisodeVariant = z.infer<typeof episodeSchema>;
export const assignVariant = (playerId: string, familyId: string): 'A' | 'B' => {
  let hash = 0; for (const character of `${playerId}:${familyId}`) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return (hash >>> 0) % 2 === 0 ? 'A' : 'B';
};
type Cache = { find: (familyId: string, variant: 'A' | 'B') => Promise<EpisodeVariant | null> };
type NextEpisodeOptions = { playerId: string; familyId: string; cache: Cache; generate: (variant: 'A' | 'B') => Promise<unknown> };
export const nextEpisode = async ({ playerId, familyId, cache, generate }: NextEpisodeOptions): Promise<EpisodeVariant> => {
  const variant = assignVariant(playerId, familyId);
  const cached = await cache.find(familyId, variant);
  if (cached) return episodeSchema.parse(cached);
  return episodeSchema.parse(await generate(variant));
};
