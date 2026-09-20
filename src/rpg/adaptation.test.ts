import { expect, it } from 'vitest';
import { nextDifficulty } from './adaptation';

it('returns a simplified encounter after two incorrect moves', () => {
  expect(nextDifficulty(4, 2, 'good-fit')).toBe(3);
});

it('levels up after a quick good-fit win', () => expect(nextDifficulty(4, 0, 'too-easy')).toBe(5));
