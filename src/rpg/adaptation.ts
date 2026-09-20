export type DifficultyFeedback = 'too-easy' | 'good-fit' | 'too-hard';
export const nextDifficulty = (current: number, incorrectMoves: number, feedback: DifficultyFeedback): number => {
  if (incorrectMoves >= 2 || feedback === 'too-hard') return Math.max(1, current - 1);
  if (feedback === 'too-easy') return Math.min(8, current + 1);
  return current;
};
