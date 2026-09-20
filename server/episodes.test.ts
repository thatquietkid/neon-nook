import { expect, it, vi } from 'vitest';
import { assignVariant, nextEpisode } from './episodes';

it('assigns the same player and episode family to the same A/B variant', () => {
  expect(assignVariant('player-a', 'lists')).toBe(assignVariant('player-a', 'lists'));
});

it('serves an approved cached variant before requesting the generator', async () => {
  const generate = vi.fn();
  const cached = { id: 'cached', familyId: 'lists', variant: 'A' as const, prompt: 'cached' };
  await expect(nextEpisode({ playerId: 'p', familyId: 'lists', cache: { find: async () => cached }, generate })).resolves.toEqual(cached);
  expect(generate).not.toHaveBeenCalled();
});
