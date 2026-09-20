# Neon Nook MVP design

## Purpose and scope

Neon Nook is a short-session learning game for AI/ML and Python data science. Its default loop is a 3-, 7-, or 15-minute mission: an interactive visual challenge, a concise explanation, and a reward that updates the player's study room and learning profile. The first release is intentionally a single-player web app; it does not include accounts, multiplayer, payments, or a general-purpose chat screen.

The visual direction is an original cozy pixel RPG study room inspired by the affordances of handheld-era adventure games, without using Pokemon branding or artwork. It uses the approved CC0 character sprite from Fry on OpenGameArt, with attribution in the app's credits/about area.

## Product flow

1. On first launch, the player selects a display name, their familiarity with Python and ML, and a preferred subject track.
2. The home scene presents one adaptive recommended mission plus 3-, 7-, and 15-minute alternatives.
3. A mission has a short setup in RPG dialogue, one interactive learning mechanic, an optional AI hint, an answer explanation, XP, and a concept-card reward.
4. Completing or missing a mission updates skill confidence, recent mistakes, streak, XP, room decorations, and the recommendation for the next session.

The initial mission set covers Python lists/dataframes, train/test splits, classification features, overfitting, and LLM prompting. A deterministic local mission engine supplies all essential missions; AI enriches explanations and produces safe, structured follow-up missions when available.

## UI and interaction design

The React client has three screen states: onboarding, arcade home, and mission scene. The home scene follows the approved mockup: an explorable room, mission-giving arcade machine, licensed animated player sprite, dialogue panel, and stacked action buttons. Pixel display type is used only for titles, labels, and compact actions. Dialogue and explanations use a legible terminal-inspired typeface.

Motion is functional: the sprite idles, an interaction marker bobs, the dialogue types in, and an earned item animates into the room. Keyboard access mirrors pointer actions. `prefers-reduced-motion` disables nonessential animation.

## Architecture

The app is a Vite + React + TypeScript client and a small Node/Express server. The client has independent modules for mission selection/scoring, local profile persistence, and presentation. The server exposes a narrow `/api/coach` endpoint. It receives only a structured learning context (topic, difficulty, answer state, and requested help type), calls Cerebras, validates the returned JSON shape, and returns a short hint, explanation, or generated mission.

`CEREBRAS_API_KEY` is read only from server environment variables. The browser never stores, displays, or sends the key. The model choice defaults to `gpt-oss-120b`, with an environment setting for `qwen-3.8-27b` when a faster/lower-cost option is wanted.

## Personalization model

The local profile contains: display name, preferred track, estimated level per topic (0-100), answers and outcomes for recent missions, streak, XP, room unlocks, and a selected session length. Mission ranking weights chosen time, topic confidence (favoring a productive challenge), recency, and prior incorrect answers. The engine selects a fallback mission entirely locally when AI is unavailable.

## Error handling and safety

If the server is absent, no key is configured, a request times out, or Cerebras returns invalid content, the player sees an in-world "radio static" message and can continue with the built-in explanation. Server prompts request concise instructional JSON, not executable code. Client-provided payloads are schema-validated and rate-limited in-memory for the MVP.

## Testing and verification

Vitest tests the scoring logic, profile updates, duration filtering, and API response validation. React Testing Library checks core flow: onboarding leads to a recommended mission; an answer changes XP/confidence; and a failed coach request preserves a playable local experience. A production build and a manual responsive pass at desktop and mobile widths are required before delivery.
