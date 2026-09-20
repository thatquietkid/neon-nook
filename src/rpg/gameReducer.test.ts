import { describe, expect, it } from 'vitest';
import { createRpgState, reduceRpg } from './gameReducer';

describe('Bytebrook RPG route', () => {
  it('clears coach text when a new battle turn begins', () => {
    const state = { ...createRpgState(), coachText: 'Try append.' };
    expect(reduceRpg(state, { type: 'NEXT_TURN' }).coachText).toBeNull();
  });

  it('unlocks Data Garden after winning Terminal Square', () => {
    const state = { ...createRpgState(), activeSceneId: 'terminal-square', encounterStatus: 'victory' as const };
    expect(reduceRpg(state, { type: 'CONTINUE' }).unlockedSceneIds).toContain('data-garden');
  });
  it('moves the explorer one grid tile without crossing the village boundary', () => {
    const state = { ...createRpgState(), player: { x: 0, y: 0 } };
    expect(reduceRpg(state, { type: 'MOVE', direction: 'left' }).player).toEqual({ x: 0, y: 0 });
    expect(reduceRpg(state, { type: 'MOVE', direction: 'right' }).player).toEqual({ x: 1, y: 0 });
  });
});
