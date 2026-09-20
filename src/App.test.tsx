import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import App from './App';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
const click = async (name: RegExp): Promise<void> => { const button = [...container.querySelectorAll<HTMLButtonElement>('button')].find((candidate) => name.test(candidate.textContent ?? '') && !candidate.disabled); if (!button) throw new Error(`Missing button ${name}`); await act(async () => button.click()); };
const enterVillage = async (): Promise<void> => { await click(/press start/i); const name = container.querySelector<HTMLInputElement>('input[name="display-name"]'); if (!name) throw new Error('Missing display name'); await act(async () => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; setter?.call(name, 'Nitin'); name.dispatchEvent(new Event('input', { bubbles: true })); }); await click(/begin nook/i); };
beforeEach(async () => { localStorage.clear(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); await act(async () => root.render(<App />)); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
it('starts an original code-move battle from Terminal Square', async () => { await enterVillage(); await click(/Terminal Square/i); expect(container.textContent).toMatch(/List Wisp/); expect(container.textContent).toMatch(/notes\.append\(4\)/); });
it('clears coach text when the player makes a move', async () => { await enterVillage(); await click(/Terminal Square/i); await click(/^hint$/i); expect(container.textContent).toMatch(/append adds/); await click(/notes\.remove\(4\)/i); expect(container.textContent).not.toMatch(/Look at what each list method changes/); });
it('unlocks Data Garden after calming the Terminal Square encounter', async () => { await enterVillage(); await click(/Terminal Square/i); await click(/notes\.append\(4\)/i); await click(/notes\.append\(4\)/i); await click(/notes\.append\(4\)/i); await click(/return to bytebrook/i); expect(container.textContent).toMatch(/Data Garden/); });
