import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { expect, it } from 'vitest';
import { RpgOverworld } from './RpgOverworld';

it('renders the Data Garden destination only after route unlock', async () => {
  const locked = document.createElement('div');
  const unlocked = document.createElement('div');
  await act(async () => createRoot(locked).render(<RpgOverworld unlockedSceneIds={['terminal-square']} onEnter={() => undefined} />));
  await act(async () => createRoot(unlocked).render(<RpgOverworld unlockedSceneIds={['terminal-square', 'data-garden']} onEnter={() => undefined} />));
  expect(locked.textContent).not.toMatch(/Data Garden/);
  expect(unlocked.textContent).toMatch(/Data Garden/);
});

it('sends an arrow-key movement direction to the overworld controller', async () => {
  const root = document.createElement('div');
  const moves: string[] = [];
  await act(async () => createRoot(root).render(<RpgOverworld unlockedSceneIds={['terminal-square']} onEnter={() => undefined} onMove={(direction) => moves.push(direction)} />));
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  expect(moves).toEqual(['right']);
});

it('sends Enter to the overworld interaction controller instead of treating A as interaction', async () => {
  const root = document.createElement('div');
  const interactions: string[] = [];
  await act(async () => createRoot(root).render(<RpgOverworld unlockedSceneIds={['terminal-square']} player={{ x: 1, y: 2 }} onEnter={() => undefined} onInteract={() => interactions.push('interact')} />));
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(interactions).toEqual(['interact']);
});
