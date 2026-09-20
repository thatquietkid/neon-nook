import type { BattleEncounter } from '../components/BattleStage';
export const BYTEBROOK_ENCOUNTERS: Record<string, BattleEncounter> = {
  'terminal-square': { id: 'terminal-square', name: 'Terminal Square', foe: 'List Wisp', prompt: 'The wisp swallowed the number 4. Which move adds it to the end of notes?', reward: 40, moves: [
    { code: 'notes.append(4)', label: 'Append beam', correct: true, explanation: 'append adds one item at the end of a list.' }, { code: 'notes[0] = 4', label: 'Overwrite spark', correct: false, explanation: 'This replaces the first item instead of adding a new one.' }, { code: 'notes.remove(4)', label: 'Remove gust', correct: false, explanation: 'remove deletes a matching item.' },
  ] },
  'data-garden': { id: 'data-garden', name: 'Data Garden', foe: 'Scatter Sprout', prompt: 'The seeds need a predictable order. Which move sorts readings in place?', reward: 55, moves: [
    { code: 'readings.sort()', label: 'Sort pulse', correct: true, explanation: 'sort rearranges a list in ascending order.' }, { code: 'readings.append()', label: 'Append beam', correct: false, explanation: 'append needs an item and does not sort.' }, { code: 'readings.clear()', label: 'Clear mist', correct: false, explanation: 'clear removes every reading.' },
  ] },
};
