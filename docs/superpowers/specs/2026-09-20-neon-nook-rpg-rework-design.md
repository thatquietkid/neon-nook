# Neon Nook RPG rework design

## Goal

Replace the quiz-first learning flow with an original guided village RPG. The player travels through named village scenes, meets trainers/NPCs, and resolves encounters using Python and AI/ML operations as animated moves. The design borrows the readable exploration and battle rhythm of classic handheld RPGs without using Pokemon names, characters, artwork, audio, or other protected assets.

## Core loop

1. Enter a guided overworld route with a visible next destination, NPC prompt, and locked/unlocked landmarks.
2. Trigger a story encounter. The opponent introduces an AI/ML or Python problem through dialogue and a visual battlefield state.
3. Choose a code-as-move action. For example, `notes.append(4)` becomes an Append Burst; a filtering expression becomes a Cleanse move.
4. Correct code changes health, battlefield state, and story progress. Incorrect code reveals an intelligible consequence and lets the player recover with a hint, retry, or simplified move.
5. Win an encounter to change the village: a bridge repairs, a terminal activates, an NPC joins, or the next route opens.

The first playable vertical slice is a three-scene "Bytebrook Village" route: terminal square, data garden, and model mill. It contains a guide NPC, two Python battles, one ML battle, a boss encounter, a conclusion, and an unlockable next-route teaser.

## Experience and presentation

The app uses a persistent game-stage layout rather than stacked cards. The overworld has scene art, a moving player sprite, an objective marker, NPC hotspots, a short dialogue box, and a compact party/progress HUD. The battle stage has player/companion and opponent sprites, code-move buttons in a controller-like move tray, health bars, battle log, and visible effects for damage, accuracy, buffs, and world-state changes.

Audio is hybrid and opt-in: a small looping chiptune ambience per scene plus short procedural/locally hosted retro-style effects for selection, movement, correct/incorrect code, battle impact, unlock, pause, and dialogue. Audio remains muted until a user interaction enables it; preferences persist locally. `prefers-reduced-motion` disables nonessential camera/sprite effects.

Coach text clears automatically at every new question, retry, restart, route exit, and battle conclusion. A hint is contextual and can only be visible for the active encounter turn.

## Adaptive content

The server asks Cerebras for structured JSON episode candidates, not executable code. Each candidate has an objective, prerequisite skills, scene dialogue, opponent, code moves, expected answer, explanations, difficulty, and variant id. Zod validates the entire shape; unsafe, malformed, duplicate, or overly long output is rejected. The built-in content remains available if Cerebras or the database is unavailable.

The adaptation loop uses player outcomes, hint use, answer time, and direct feedback (`too easy`, `good fit`, `too hard`). It selects the next difficulty within a narrow range around demonstrated skill, offers a simplified version after repeated misses, and increases tactical complexity after repeated easy wins.

## Shared cache and A/B testing

Supabase stores server-approved episode variants, not raw prompts or credentials. Tables cover episodes, variants, player episode attempts, feedback, and aggregate quality scores. Episode retrieval first finds an approved cached variant matching topic, skills, and difficulty; Cerebras is invoked only for cache misses or revision jobs.

Each eligible player is deterministically assigned A or B for an episode family. Variants share the learning objective and expected skill but can vary pacing, dialogue, distractors, and complexity. The server records only pseudonymous player id, variant, outcome, hint use, elapsed time, and direct feedback. Promotion uses a minimum sample threshold and weighted learning score; poor variants are retired rather than served.

Supabase access is server-only. Browser code receives only authenticated application responses. Credentials use Render environment secrets; no passwords, service-role keys, or database connection strings are committed, logged, or returned to the client. The password supplied in chat must be rotated before production use.

## Technical architecture

The React client receives a compact `GameState` from local persistence plus server episode payloads. It owns rendering, animation, input, local audio preferences, and non-sensitive save state. A Node/Express service owns Cerebras calls, content validation, rate limiting, Supabase data access, feedback ingestion, and variant assignment.

The existing Express SPA serving remains the deployment boundary. Render runs the same web service with server-side `CEREBRAS_API_KEY`, Supabase URL, and Supabase service-role key configured as secrets. The frontend does not directly call Supabase for the MVP.

## Acceptance criteria

- New missions play as guided exploration and code-as-move battles, not generic MCQ pages.
- Coach text never survives into a new question or encounter.
- Sound can be enabled after interaction, muted, and persisted without blocking play.
- Built-in Bytebrook route is complete offline; remote generated content is an enhancement.
- All LLM and database credentials are server-only, never logged, bundled, or committed.
- A/B assignment and feedback are stored safely and episode retrieval prefers validated cached content.
- Existing pause, restart, exit, accessibility, reduced-motion, test, and Render-serving guarantees remain intact.
