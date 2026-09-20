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
