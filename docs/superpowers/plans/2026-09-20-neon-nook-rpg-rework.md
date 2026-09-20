# Neon Nook RPG Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Neon Nook as a guided village RPG where Python and AI/ML operations are battle moves, supported by adaptive, cacheable learning content.

**Architecture:** React owns a persistent overworld/battle stage, local saves, animation state, and user-enabled audio. Express owns generated content validation, Supabase caching/experimentation, Cerebras calls, and server-only secrets. Built-in Bytebrook content remains the playable fallback.

**Tech Stack:** React, TypeScript, Vite, Express, Zod, Vitest, React Testing Library, Supabase server client, Web Audio API.

**Spec:** `docs/superpowers/specs/2026-09-20-neon-nook-rpg-rework-design.md`

## Global Constraints

- Use original village/monster art and audio; do not use Pokemon assets, names, or music.
- Store all Cerebras and Supabase credentials only as server-side Render secrets.
- Never log, commit, return, or bundle credentials.
- Built-in Bytebrook content must play without Cerebras or Supabase.
- Clear coach output when the active encounter turn changes, restarts, exits, or ends.
- Audio starts only after a user gesture and respects mute/reduced-motion preferences.

---

### Task 1: RPG domain and built-in Bytebrook route

**Files:**
- Create: `src/rpg/types.ts`, `src/rpg/bytebrook.ts`, `src/rpg/gameReducer.ts`, `src/rpg/gameReducer.test.ts`

**Interfaces:**
- Produces `RouteScene`, `Encounter`, `CodeMove`, `RpgState`, `createRpgState()`, and `reduceRpg(state, event)`.

- [ ] **Step 1: Write failing route tests**

```ts
it('unlocks Data Garden only after terminal-square encounter victory', () => {
  expect(reduceRpg(wonSquare, { type: 'CONTINUE' }).unlockedScenes).toContain('data-garden');
});
it('clears coach content when a new turn begins', () => {
  expect(reduceRpg(stateWithHint, { type: 'NEXT_TURN' }).coachText).toBeNull();
});
```

- [ ] **Step 2: Run red tests**

Run: `npm test -- src/rpg/gameReducer.test.ts`
Expected: FAIL because RPG modules do not exist.

- [ ] **Step 3: Implement Bytebrook data and pure game state**

Create terminal square, data garden, model mill, guide NPC, two Python encounters, one ML encounter, boss, route completion, world unlock changes, and code-as-move metadata. Implement events for scene selection, encounter begin, move selection, retry, next turn, pause, restart, exit, and continue.

- [ ] **Step 4: Run green tests and commit**

Run: `npm test -- src/rpg/gameReducer.test.ts && git add src/rpg && git commit -m "feat: add Bytebrook RPG route engine"`
Expected: PASS.

### Task 2: Persistent overworld, battle stage, and audio

**Files:**
- Create: `src/components/RpgOverworld.tsx`, `src/components/BattleStage.tsx`, `src/components/DialogueBox.tsx`, `src/audio/soundEngine.ts`, `src/audio/soundEngine.test.ts`
- Modify: `src/App.tsx`, `src/styles/arcade.css`, `src/App.test.tsx`

**Interfaces:**
- Consumes: `RpgState`, `RouteScene`, `Encounter`, and reducer events.
- Produces: an explorable guided route and code-as-move battle flow.

- [ ] **Step 1: Write failing UI/audio tests**

```tsx
it('renders the Data Garden destination only after route unlock', () => { /* assert landmark appears */ });
it('does not create an AudioContext before the player enables sound', () => { /* assert no construction */ });
```

- [ ] **Step 2: Run red tests**

Run: `npm test -- src/App.test.tsx src/audio/soundEngine.test.ts`
Expected: FAIL because stage components and audio engine do not exist.

- [ ] **Step 3: Implement the game-first experience**

Replace stacked home and quiz presentation with a persistent scene, moving player, landmarks, objective marker, NPC dialogue, battle tray, health/state bars, and visible success/failure world changes. Create opt-in chiptune ambience and procedural effects for movement, selection, impact, win, and error; persist mute preference.

- [ ] **Step 4: Run green tests, build, and commit**

Run: `npm test && npm run build && git add src && git commit -m "feat: build guided village battles and audio"`
Expected: all tests and build pass.

### Task 3: Secure episode cache, feedback, and A/B assignment

**Files:**
- Create: `server/episodes.ts`, `server/supabase.ts`, `server/episodes.test.ts`, `supabase/migrations/001_rpg_episodes.sql`
- Modify: `server/index.ts`, `.env.example`, `README.md`

**Interfaces:**
- Produces `GET /api/episodes/next`, `POST /api/episodes/:id/feedback`, `EpisodeVariant`, and `assignVariant(playerId, familyId)`.

- [ ] **Step 1: Write failing cache tests**

```ts
it('serves an approved cached variant before requesting the generator', async () => { /* assert generator not called */ });
it('assigns the same player and episode family to the same A/B variant', () => { /* deterministic assignment */ });
```

- [ ] **Step 2: Run red tests**

Run: `npm test -- server/episodes.test.ts`
Expected: FAIL because episode service does not exist.

- [ ] **Step 3: Implement server-only persistence and validation**

Add Supabase server client only when server secrets exist. Create schema for episodes, variants, attempts, feedback, and aggregates with no public write policies. Validate generated JSON with Zod, prefer approved cache, assign deterministic A/B variants, record pseudonymous outcomes/feedback, and return built-in fallback on any dependency failure.

- [ ] **Step 4: Run green tests and commit**

Run: `npm test && git add server supabase .env.example README.md package.json && git commit -m "feat: cache adaptive RPG episodes securely"`
Expected: PASS.

### Task 4: Adaptive coach integration and deployment verification

**Files:**
- Modify: `src/components/BattleStage.tsx`, `server/coach.ts`, `server/index.ts`, `README.md`
- Create: `src/rpg/adaptation.test.ts`

**Interfaces:**
- Consumes: feedback events and validated episode variants.
- Produces: turn-scoped hints/explanations and difficulty recommendations.

- [ ] **Step 1: Write failing adaptation tests**

```ts
it('returns a simplified encounter after two incorrect moves', () => { /* expect easier difficulty */ });
it('clears coach text when the battle advances', () => { /* expect no old hint */ });
```

- [ ] **Step 2: Run red tests**

Run: `npm test -- src/rpg/adaptation.test.ts`
Expected: FAIL because adaptation helper does not exist.

- [ ] **Step 3: Implement scoped coach behavior and deployment checks**

Use the existing coach endpoint only for the active encounter; clear output on every lifecycle transition. Record `too easy`, `good fit`, and `too hard` feedback, use the result in next-episode selection, document Render secrets (`CEREBRAS_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), and preserve SPA/API serving behavior.

- [ ] **Step 4: Verify and commit**

Run: `npm test && npm run build && git add src server README.md && git commit -m "feat: adapt RPG encounters to player feedback"`
Expected: PASS.
