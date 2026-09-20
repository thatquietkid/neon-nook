export type Track = 'python' | 'data' | 'ml' | 'ai';

export type PlayerProfile = {
  name: string;
  track: Track;
  xp: number;
  streak: number;
  unlockedLevel: number;
  confidence: Record<string, number>;
  completed: string[];
};
