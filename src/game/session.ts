import type { Mission } from './missions';

export type SessionStatus = 'intro' | 'playing' | 'paused' | 'result' | 'complete' | 'exited';

export type SessionState = {
  status: SessionStatus;
  elapsed: number;
  mission?: Mission;
  answer?: string;
  correct?: boolean;
  rewarded?: boolean;
};

export type SessionEvent =
  | { type: 'BEGIN' }
  | { type: 'ANSWER'; answer: string }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'EXIT' }
  | { type: 'TICK'; seconds?: number };

export const startSession = (mission: Mission): SessionState => ({
  status: 'intro',
  elapsed: 0,
  mission,
  rewarded: false,
});

const restartAttempt = (state: SessionState): SessionState => ({
  status: 'intro',
  elapsed: 0,
  mission: state.mission,
  rewarded: false,
});

export const reduceSession = (state: SessionState, event: SessionEvent): SessionState => {
  if (event.type === 'EXIT') return { ...state, status: 'exited', rewarded: false };

  switch (event.type) {
    case 'BEGIN':
      return state.status === 'intro' ? { ...state, status: 'playing' } : state;
    case 'ANSWER': {
      if (state.status !== 'playing' || !state.mission) return state;
      const correct = state.mission.answer === event.answer;
      return { ...state, status: correct ? 'complete' : 'result', answer: event.answer, correct, rewarded: correct };
    }
    case 'PAUSE':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;
    case 'RESUME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;
    case 'RESTART':
      return state.status === 'exited' ? state : restartAttempt(state);
    case 'TICK':
      return state.status === 'playing' ? { ...state, elapsed: state.elapsed + (event.seconds ?? 1) } : state;
  }
};
