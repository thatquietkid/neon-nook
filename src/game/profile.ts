import type { PlayerProfile, Track } from './types';

export type { PlayerProfile } from './types';

const PROFILE_KEY = 'neon-nook-profile-v1';
const TRACKS = new Set<Track>(['python', 'data', 'ml', 'ai']);

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
    const value: unknown = JSON.parse(stored);
    if (!isPlayerProfile(value)) return null;
    return value;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPlayerProfile = (value: unknown): value is PlayerProfile => {
  if (!isRecord(value) || typeof value.name !== 'string' || !TRACKS.has(value.track as Track)) {
    return false;
  }
  if (
    typeof value.xp !== 'number' ||
    !Number.isFinite(value.xp) ||
    typeof value.streak !== 'number' ||
    !Number.isFinite(value.streak) ||
    typeof value.unlockedLevel !== 'number' ||
    !Number.isFinite(value.unlockedLevel) ||
    !isRecord(value.confidence) ||
    !Object.values(value.confidence).every((confidence) => typeof confidence === 'number' && Number.isFinite(confidence)) ||
    !Array.isArray(value.completed) ||
    !value.completed.every((mission) => typeof mission === 'string')
  ) {
    return false;
  }
  return true;
};
