import { describe, expect, it } from 'vitest';
import { createProfile, loadProfile } from './profile';

describe('profile engine', () => {
  it('persists a new player with zero XP and an unlocked first mission', () => {
    const profile = createProfile('Nitin', 'ml');
    expect(profile).toMatchObject({ xp: 0, streak: 0, unlockedLevel: 1 });
  });

  it.each([
    ['an empty object', '{}'],
    ['an invalid XP value', '{"xp":"bad"}'],
  ])('rejects malformed stored profile: %s', (_description, stored) => {
    window.localStorage.setItem('neon-nook-profile-v1', stored);
    expect(loadProfile()).toBeNull();
  });
});
