import type { PlayerProfile, Track } from './types';

export type { PlayerProfile } from './types';

const PROFILE_KEY = 'neon-nook-profile-v1';

export const createProfile = (name: string, track: Track): PlayerProfile => ({
  name,
  track,
  xp: 0,
  streak: 0,
  unlockedLevel: 1,
  confidence: {},
  completed: [],
});

export const saveProfile = (profile: PlayerProfile): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const loadProfile = (): PlayerProfile | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(PROFILE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as PlayerProfile;
  } catch {
    return null;
  }
};
