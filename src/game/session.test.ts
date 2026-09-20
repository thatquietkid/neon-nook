import { describe, expect, it } from 'vitest';
import { applyReward, LEVELS, recommendMission } from './missions';
import { reduceSession, startSession } from './session';
import { createProfile } from './profile';

describe('mission progression', () => {
  it('unlocks level two after the level-one mission is completed', () => {
    const profile = createProfile('Nitin', 'python');

    expect(applyReward(profile, LEVELS[0], true).unlockedLevel).toBe(2);
  });

  it('records only one completion and awards no XP for an incorrect attempt', () => {
    const profile = createProfile('Nitin', 'python');
    const missed = applyReward(profile, LEVELS[0], false);
    const completed = applyReward(missed, LEVELS[0], true);
    const replayed = applyReward(completed, LEVELS[0], true);

    expect(missed).toMatchObject({ xp: 0, completed: [], unlockedLevel: 1 });
    expect(completed).toMatchObject({ xp: 40, completed: ['python-lists'], unlockedLevel: 2 });
    expect(replayed.xp).toBe(40);
  });

  it('recommends an unlocked mission matching the requested session length', () => {
    const profile = { ...createProfile('Nitin', 'ml'), unlockedLevel: 6 };

    expect(recommendMission(profile, 7)).toMatchObject({ level: expect.any(Number), minutes: 7 });
    expect(recommendMission(profile, 7).level).toBeLessThanOrEqual(6);
  });
});

describe('session reducer', () => {
  it('does not advance elapsed time while paused', () => {
    expect(reduceSession({ status: 'paused', elapsed: 12 }, { type: 'TICK' }).elapsed).toBe(12);
  });

  it('moves from intro to playing, tracks time, and completes a correct answer', () => {
    const mission = LEVELS[0];
    const intro = startSession(mission);
    const playing = reduceSession(intro, { type: 'BEGIN' });
    const ticking = reduceSession(playing, { type: 'TICK' });
    const completed = reduceSession(ticking, { type: 'ANSWER', answer: mission.answer });

    expect(ticking).toMatchObject({ status: 'playing', elapsed: 1 });
    expect(completed).toMatchObject({ status: 'complete', answer: mission.answer, correct: true });
  });

  it('shows a retry result for an incorrect answer', () => {
    const playing = reduceSession(startSession(LEVELS[0]), { type: 'BEGIN' });

    expect(reduceSession(playing, { type: 'ANSWER', answer: 'not this one' })).toMatchObject({
      status: 'result',
      correct: false,
    });
  });

  it('resumes the current attempt and restart clears only attempt progress', () => {
    const playing = reduceSession(startSession(LEVELS[0]), { type: 'BEGIN' });
    const paused = reduceSession(reduceSession(playing, { type: 'TICK' }), { type: 'PAUSE' });
    const resumed = reduceSession(paused, { type: 'RESUME' });
    const restarted = reduceSession(paused, { type: 'RESTART' });

    expect(resumed).toMatchObject({ status: 'playing', elapsed: 1, mission: LEVELS[0] });
    expect(restarted).toMatchObject({ status: 'intro', elapsed: 0, mission: LEVELS[0] });
    expect(restarted.answer).toBeUndefined();
  });

  it('exits any active session without recording a reward', () => {
    const exited = reduceSession(startSession(LEVELS[0]), { type: 'EXIT' });

    expect(exited).toMatchObject({ status: 'exited', mission: LEVELS[0], elapsed: 0 });
    expect(exited.rewarded).toBe(false);
  });
});
