import type { PlayerProfile, Track } from './types';

export type Mission = {
  id: string;
  level: number;
  title: string;
  topic: string;
  track: Track;
  minutes: 3 | 7 | 15;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
  xp: number;
};

export const LEVELS: Mission[] = [
  {
    id: 'python-lists', level: 1, title: 'List Lift-Off', topic: 'python-lists', track: 'python', minutes: 3,
    prompt: 'Which expression adds 4 to the end of a Python list called notes?',
    choices: ['notes.append(4)', 'notes.add(4)', 'append(notes, 4)'], answer: 'notes.append(4)',
    explanation: 'append places one value at the end of a Python list.', xp: 40,
  },
  {
    id: 'dataframe-cleaning', level: 2, title: 'Data Dust-Off', topic: 'dataframe-cleaning', track: 'data', minutes: 7,
    prompt: 'Which pandas call removes rows with missing values?',
    choices: ['df.dropna()', 'df.clean()', 'df.remove_nulls()'], answer: 'df.dropna()',
    explanation: 'dropna returns a dataframe with missing-value rows removed.', xp: 55,
  },
  {
    id: 'feature-selection', level: 3, title: 'Signal Search', topic: 'feature-selection', track: 'ml', minutes: 3,
    prompt: 'What is a feature in a prediction model?',
    choices: ['An input used to make a prediction', 'The model output', 'A chart title'], answer: 'An input used to make a prediction',
    explanation: 'Features are the measurable inputs a model learns from.', xp: 55,
  },
  {
    id: 'classification', level: 4, title: 'Class Act', topic: 'classification', track: 'ml', minutes: 7,
    prompt: 'Which task is classification?',
    choices: ['Marking emails as spam or not spam', 'Predicting a house price', 'Sorting a list alphabetically'], answer: 'Marking emails as spam or not spam',
    explanation: 'Classification assigns an input to one of a fixed set of labels.', xp: 65,
  },
  {
    id: 'train-test-split', level: 5, title: 'Fair Trial', topic: 'train-test-split', track: 'ml', minutes: 3,
    prompt: 'Why keep a test set separate from training data?',
    choices: ['To evaluate unseen-data performance', 'To make training slower', 'To add more features'], answer: 'To evaluate unseen-data performance',
    explanation: 'A held-out test set estimates how the model performs on new examples.', xp: 65,
  },
  {
    id: 'overfitting', level: 6, title: 'Pattern Patrol', topic: 'overfitting', track: 'ml', minutes: 7,
    prompt: 'What suggests that a model is overfitting?',
    choices: ['High training accuracy but poor test accuracy', 'Similar high training and test accuracy', 'Low training and test accuracy'], answer: 'High training accuracy but poor test accuracy',
    explanation: 'Overfit models memorize training details that do not generalize.', xp: 75,
  },
  {
    id: 'prompt-context', level: 7, title: 'Context Cache', topic: 'prompt-context', track: 'ai', minutes: 15,
    prompt: 'What context most helps an assistant format a useful study plan?',
    choices: ['Your goal, level, and time available', 'Only the word “help”', 'A random unrelated paragraph'], answer: 'Your goal, level, and time available',
    explanation: 'Specific context lets a model tailor its response to the actual task.', xp: 85,
  },
  {
    id: 'model-evaluation', level: 8, title: 'Final Score', topic: 'model-evaluation', track: 'ml', minutes: 15,
    prompt: 'Which metric is especially useful when false positives and false negatives both matter?',
    choices: ['Precision and recall', 'File size', 'Number of notebook cells'], answer: 'Precision and recall',
    explanation: 'Precision and recall reveal different kinds of classification mistakes.', xp: 100,
  },
];

export const recommendMission = (profile: PlayerProfile, minutes: number): Mission => {
  const unlocked = LEVELS.filter((mission) => mission.level <= profile.unlockedLevel);
  const durationMatches = unlocked.filter((mission) => mission.minutes === minutes);
  const candidates = durationMatches.length > 0 ? durationMatches : unlocked;

  return [...(candidates.length > 0 ? candidates : [LEVELS[0]])].sort((left, right) => {
    const leftScore = (profile.confidence[left.topic] ?? 0) + (profile.completed.includes(left.id) ? 20 : 0) + (left.track === profile.track ? -5 : 0);
    const rightScore = (profile.confidence[right.topic] ?? 0) + (profile.completed.includes(right.id) ? 20 : 0) + (right.track === profile.track ? -5 : 0);
    return leftScore - rightScore || left.level - right.level;
  })[0];
};

export const applyReward = (profile: PlayerProfile, mission: Mission, correct: boolean): PlayerProfile => {
  const previousConfidence = profile.confidence[mission.topic] ?? 0;
  const confidence = Math.max(0, Math.min(100, previousConfidence + (correct ? 10 : -5)));
  const firstCompletion = correct && !profile.completed.includes(mission.id);

  return {
    ...profile,
    xp: profile.xp + (firstCompletion ? mission.xp : 0),
    streak: correct ? profile.streak + 1 : 0,
    unlockedLevel: firstCompletion ? Math.max(profile.unlockedLevel, Math.min(LEVELS.length, mission.level + 1)) : profile.unlockedLevel,
    confidence: { ...profile.confidence, [mission.topic]: confidence },
    completed: firstCompletion ? [...profile.completed, mission.id] : profile.completed,
  };
};
