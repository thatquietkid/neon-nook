import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import type { PlayerProfile } from './game/types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const click = async (name: RegExp): Promise<void> => {
  const button = [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find((candidate) => name.test(candidate.textContent ?? '') && !candidate.disabled);
  if (!button) throw new Error(`Unable to find enabled button matching ${name}`);
  await act(async () => button.click());
};

const startFirstMission = async (): Promise<void> => {
  await click(/press start/i);
  const name = container.querySelector<HTMLInputElement>('input[name="display-name"]');
  if (!name) throw new Error('Display-name input is missing');
  await act(async () => {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(name, 'Nitin');
    name.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await click(/begin nook/i);
  await click(/list lift-off/i);
  await click(/begin mission/i);
};

const finishFirstMissionCorrectly = async (): Promise<void> => {
  await startFirstMission();
  await click(/notes\.append\(4\)/i);
};

const remount = async (app: React.ReactNode = <App />): Promise<void> => {
  await act(async () => root.unmount());
  container.remove();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(app));
};

beforeEach(async () => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await act(async () => root.unmount());
  container.remove();
});

it('opens pause controls after starting a mission', async () => {
  await startFirstMission();
  await click(/pause/i);

  expect(container.textContent).toMatch(/restart level/i);
});

it('shows level completion after a correct answer', async () => {
  await finishFirstMissionCorrectly();

  expect(container.textContent).toMatch(/level clear/i);
  expect(container.textContent).toMatch(/next level/i);
});

it('persists one completion reward when Strict Mode replays state updaters', async () => {
  await remount(<StrictMode><App /></StrictMode>);
  const setItem = vi.spyOn(Storage.prototype, 'setItem');

  await finishFirstMissionCorrectly();

  expect(setItem).toHaveBeenCalledTimes(2);
  expect(JSON.parse(localStorage.getItem('neon-nook-profile-v1') ?? '{}')).toMatchObject({ xp: 40, unlockedLevel: 2 });
});

it('begins the newly unlocked mission from Next level', async () => {
  await finishFirstMissionCorrectly();
  await click(/next level/i);

  expect(container.textContent).toMatch(/level 2/i);
  expect(container.textContent).toMatch(/data dust-off/i);
  expect(container.textContent).toMatch(/a quick signal from the terminal/i);
});

it('starts the duration-selected recommended mission from the home card', async () => {
  const returningPlayer: PlayerProfile = {
    name: 'Nitin', track: 'python', xp: 40, streak: 1, unlockedLevel: 2,
    confidence: { 'python-lists': 10 }, completed: ['python-lists'],
  };
  localStorage.setItem('neon-nook-profile-v1', JSON.stringify(returningPlayer));
  await remount();

  await click(/^7 min$/i);
  expect(container.textContent).toMatch(/data dust-off/i);
  await click(/start recommended mission/i);

  expect(container.textContent).toMatch(/level 2/i);
  expect(container.textContent).toMatch(/data dust-off/i);
});
