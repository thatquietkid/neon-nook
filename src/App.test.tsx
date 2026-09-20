import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import App from './App';

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

beforeEach(async () => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});

afterEach(async () => {
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
