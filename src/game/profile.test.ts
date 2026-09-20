import { describe, expect, it } from 'vitest';
import { createProfile } from './profile';

describe('profile engine', () => {
  it('persists a new player with zero XP and an unlocked first mission', () => {
    const profile = createProfile('Nitin', 'ml');
    expect(profile).toMatchObject({ xp: 0, streak: 0, unlockedLevel: 1 });
  });
});
