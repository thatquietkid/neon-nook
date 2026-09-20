# Neon Nook MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, local-first pixel arcade game that teaches AI/ML and Python through adaptive short missions.

**Architecture:** A Vite React client owns game presentation and local profile persistence. A small Express service keeps the Cerebras key server-side and offers validated coach hints; every mission remains playable through deterministic local content. Level and session state are explicit reducers, so pause, restart, exit, reward, and error states are consistent.

**Tech Stack:** React, TypeScript, Vite, Express, Vitest, React Testing Library, Zod, CSS pixel art.

**Spec:** `docs/superpowers/specs/2026-09-20-neon-nook-design.md`

## Global Constraints

- Use original UI and room art; use the approved CC0 sprite and retain its attribution.
- Read `CEREBRAS_API_KEY` only in the Node server; never bundle it into client code.
- Default to `gpt-oss-120b`; support `qwen-3.8-27b` through `CEREBRAS_MODEL`.
- Local missions must remain playable offline and when coaching fails.
- Respect `prefers-reduced-motion`, keyboard navigation, and mobile layouts.

---

### Task 1: Project shell and profile engine

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/main.tsx`, `src/styles/base.css`
- Create: `src/game/types.ts`, `src/game/profile.ts`, `src/game/profile.test.ts`

**Interfaces:**
- Produces `PlayerProfile`, `createProfile(name, track)`, `saveProfile(profile)`, and `loadProfile()`.

- [ ] **Step 1: Write the failing profile test**

```ts
it('persists a new player with zero XP and an unlocked first mission', () => {
  const profile = createProfile('Nitin', 'ml');
  expect(profile).toMatchObject({ xp: 0, streak: 0, unlockedLevel: 1 });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/game/profile.test.ts`
Expected: FAIL because `createProfile` does not exist.

- [ ] **Step 3: Implement the focused profile module and app bootstrap**

```ts
export type PlayerProfile = { name: string; track: 'python'|'data'|'ml'|'ai'; xp: number; streak: number; unlockedLevel: number; confidence: Record<string, number>; completed: string[] };
export const createProfile = (name: string, track: PlayerProfile['track']): PlayerProfile => ({ name, track, xp: 0, streak: 0, unlockedLevel: 1, confidence: {}, completed: [] });
```

Store profiles under `neon-nook-profile-v1`; mount the React root and add global pixel typography, focus styles, and reduced-motion defaults.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/game/profile.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add package.json vite.config.ts tsconfig.json index.html src && git commit -m "feat: scaffold Neon Nook profile engine"`

### Task 2: Mission, levels, and session state

**Files:**
- Create: `src/game/missions.ts`, `src/game/session.ts`
- Create: `src/game/session.test.ts`

**Interfaces:**
- Consumes: `PlayerProfile`.
- Produces `LEVELS`, `recommendMission(profile, minutes)`, `startSession(mission)`, and `reduceSession(state, event)`.

- [ ] **Step 1: Write failing level/session tests**

```ts
it('unlocks level two after the level-one mission is completed', () => {
  expect(applyReward(profile, LEVELS[0], true).unlockedLevel).toBe(2);
});
it('does not advance elapsed time while paused', () => {
  expect(reduceSession({ status: 'paused', elapsed: 12 }, { type: 'TICK' }).elapsed).toBe(12);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/game/session.test.ts`
Expected: FAIL because mission/session exports are absent.

- [ ] **Step 3: Implement eight handcrafted levels and reducer states**

Create levels 1-8 across Python lists, dataframe cleaning, features, classification, train/test split, overfitting, prompt context, and model evaluation. Implement statuses `intro`, `playing`, `paused`, `result`, `complete`, and `exited`; events `BEGIN`, `ANSWER`, `PAUSE`, `RESUME`, `RESTART`, `EXIT`, and `TICK`. `RESTART` resets only the active attempt; `EXIT` returns to the arcade without reward; completion grants XP and unlocks the next level.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/game/session.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/game && git commit -m "feat: add adaptive levels and session state"`

### Task 3: Arcade screens and interactive mission UI

**Files:**
- Create: `src/components/Onboarding.tsx`, `src/components/ArcadeHome.tsx`, `src/components/MissionScene.tsx`, `src/components/PauseMenu.tsx`, `src/components/EndScreen.tsx`
- Create: `src/styles/arcade.css`
- Create: `src/App.tsx`, `src/App.test.tsx`
- Create: `public/credits.md`

**Interfaces:**
- Consumes: `PlayerProfile`, `Mission`, and `SessionState`.
- Produces: a complete user journey from onboarding to level completion or exit.

- [ ] **Step 1: Write failing screen-flow tests**

```tsx
it('opens pause controls and restarts the current level', async () => {
  render(<App />); await startFirstMission();
  await userEvent.click(screen.getByRole('button', { name: /pause/i }));
  expect(screen.getByRole('button', { name: /restart level/i })).toBeVisible();
});
it('shows level completion and next-level action after a correct answer', async () => {
  render(<App />); await finishFirstMissionCorrectly();
  expect(screen.getByText(/level clear/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the app screens do not exist.

- [ ] **Step 3: Implement the polished game journey**

Build an animated enter screen with `Press Start`, name/track onboarding, the approved study-room home, eight selectable level nodes, mission dialogue, answer mechanics, a pause menu with resume/restart/exit, success and retry result screens, and a final arcade sign-off screen after level eight. Use the CC0 sprite as a CSS-sprite animation, include its source in `public/credits.md`, and use no Pokemon names/assets. Wire keyboard Enter/Escape and visible focus states.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run a production build and commit**

Run: `npm run build && git add src public && git commit -m "feat: build Neon Nook arcade experience"`
Expected: Vite build succeeds.

### Task 4: Cerebras coach and resilient integration

**Files:**
- Create: `server/index.ts`, `server/coach.ts`, `server/coach.test.ts`
- Modify: `package.json`, `src/components/MissionScene.tsx`
- Create: `.env.example`, `README.md`

**Interfaces:**
- Consumes: `{ topic: string; difficulty: number; request: 'hint'|'explain' }`.
- Produces: `POST /api/coach` responses shaped as `{ text: string }`.

- [ ] **Step 1: Write failing coach validation tests**

```ts
it('rejects a malformed coaching payload', async () => {
  const response = await request(app).post('/api/coach').send({ topic: 4 });
  expect(response.status).toBe(400);
});
it('returns the local fallback when the provider throws', async () => {
  await expect(getCoachReply(validRequest, failingClient)).resolves.toMatchObject({ source: 'local' });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- server/coach.test.ts`
Expected: FAIL because the endpoint and coach module are absent.

- [ ] **Step 3: Implement the server-only Cerebras integration**

Use Zod to validate inbound and provider content. Call the Cerebras-compatible chat completion API with `CEREBRAS_API_KEY`, model `process.env.CEREBRAS_MODEL ?? 'gpt-oss-120b'`, a short instructional system prompt, a timeout, and an in-memory per-IP request limit. Show the fallback explanation in the UI when server or provider calls fail. Document `CEREBRAS_API_KEY`, `CEREBRAS_MODEL`, `npm run dev`, and `npm run server` without committing a real key.

- [ ] **Step 4: Run tests and build**

Run: `npm test && npm run build`
Expected: all tests pass and the production bundle succeeds.

- [ ] **Step 5: Manual verification and commit**

Verify desktop and 390px mobile screens; verify onboarding, pause/resume, restart, exit without reward, level unlock, all-level completion, and forced coach failure. Then run: `git add server .env.example README.md package.json src && git commit -m "feat: add resilient Cerebras study coach"`.
