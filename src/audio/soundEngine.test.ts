import { afterEach, expect, it, vi } from 'vitest';
import { SoundEngine } from './soundEngine';

afterEach(() => vi.restoreAllMocks());

it('does not create an AudioContext before the player enables sound', () => {
  const createContext = vi.fn();
  const engine = new SoundEngine(createContext);

  engine.play('step');

  expect(createContext).not.toHaveBeenCalled();
});

it('creates audio only after sound is enabled', () => {
  const createContext = vi.fn(() => ({ state: 'running' }));
  const engine = new SoundEngine(createContext as never);
  engine.setEnabled(true);
  expect(createContext).toHaveBeenCalledTimes(1);
});
