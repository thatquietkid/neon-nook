export type EncounterStatus = 'exploring' | 'battle' | 'victory' | 'defeat';

export type RpgState = {
  activeSceneId: string;
  unlockedSceneIds: string[];
  encounterStatus: EncounterStatus;
  coachText: string | null;
};

export type RpgEvent =
  | { type: 'NEXT_TURN' }
  | { type: 'CONTINUE' }
  | { type: 'SET_COACH_TEXT'; text: string };

export const createRpgState = (): RpgState => ({
  activeSceneId: 'terminal-square',
  unlockedSceneIds: ['terminal-square'],
  encounterStatus: 'exploring',
  coachText: null,
});

export const reduceRpg = (state: RpgState, event: RpgEvent): RpgState => {
  if (event.type === 'NEXT_TURN') return { ...state, coachText: null };
  if (event.type === 'SET_COACH_TEXT') return { ...state, coachText: event.text };
  if (event.type === 'CONTINUE' && state.activeSceneId === 'terminal-square' && state.encounterStatus === 'victory') {
    return {
      ...state,
      activeSceneId: 'data-garden',
      unlockedSceneIds: [...new Set([...state.unlockedSceneIds, 'data-garden'])],
      encounterStatus: 'exploring',
      coachText: null,
    };
  }
  return state;
};
