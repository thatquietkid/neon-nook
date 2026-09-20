export type EncounterStatus = 'exploring' | 'battle' | 'victory' | 'defeat';
export type Direction = 'left' | 'right' | 'up' | 'down';
export type RpgState = { activeSceneId: string; unlockedSceneIds: string[]; encounterStatus: EncounterStatus; coachText: string | null; player: { x: number; y: number } };
export type RpgEvent = { type: 'NEXT_TURN' } | { type: 'CONTINUE' } | { type: 'MOVE'; direction: Direction } | { type: 'SET_COACH_TEXT'; text: string };
export const createRpgState = (): RpgState => ({ activeSceneId: 'terminal-square', unlockedSceneIds: ['terminal-square'], encounterStatus: 'exploring', coachText: null, player: { x: 0, y: 0 } });
export const reduceRpg = (state: RpgState, event: RpgEvent): RpgState => {
  if (event.type === 'MOVE') { const [dx, dy] = event.direction === 'left' ? [-1, 0] : event.direction === 'right' ? [1, 0] : event.direction === 'up' ? [0, -1] : [0, 1]; return { ...state, player: { x: Math.max(0, Math.min(8, state.player.x + dx)), y: Math.max(0, Math.min(5, state.player.y + dy)) } }; }
  if (event.type === 'NEXT_TURN') return { ...state, coachText: null };
  if (event.type === 'SET_COACH_TEXT') return { ...state, coachText: event.text };
  if (event.type === 'CONTINUE' && state.activeSceneId === 'terminal-square' && state.encounterStatus === 'victory') return { ...state, activeSceneId: 'data-garden', unlockedSceneIds: [...new Set([...state.unlockedSceneIds, 'data-garden'])], encounterStatus: 'exploring', coachText: null };
  return state;
};
