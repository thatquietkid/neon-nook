import { useState } from 'react';
import type { Track } from '../game/types';

type OnboardingProps = {
  onComplete: (name: string, track: Track) => void;
};

const tracks: Array<{ value: Track; label: string; detail: string }> = [
  { value: 'python', label: 'Python', detail: 'Code with confidence' },
  { value: 'data', label: 'Data', detail: 'Make patterns visible' },
  { value: 'ml', label: 'Machine learning', detail: 'Train a bright idea' },
  { value: 'ai', label: 'AI', detail: 'Build thoughtful prompts' },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [started, setStarted] = useState(false);
  const [name, setName] = useState('');
  const [track, setTrack] = useState<Track>('python');

  if (!started) {
    return (
      <main className="enter-screen app-shell" aria-labelledby="game-title">
        <div className="scanlines" aria-hidden="true" />
        <p className="eyebrow">NEON NOOK // LEARNING ARCADE</p>
        <div className="enter-sprite sprite-player" aria-label="An adventurer waits beside a glowing study desk" role="img" />
        <h1 id="game-title">Your bright idea has a room waiting.</h1>
        <p className="intro">A small, cozy arcade for practicing one useful thing at a time.</p>
        <button className="pixel-button primary enter-button" type="button" onClick={() => setStarted(true)}>
          Press Start
        </button>
        <p className="key-hint">Enter opens the nook · Escape pauses a mission</p>
      </main>
    );
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) onComplete(trimmedName, track);
  };

  return (
    <main className="onboarding app-shell" aria-labelledby="onboarding-title">
      <p className="eyebrow">FIRST VISIT // SET YOUR SIGNAL</p>
      <h1 id="onboarding-title">Name your study nook.</h1>
      <form className="onboarding-card" onSubmit={submit}>
        <label htmlFor="display-name">What should the room call you?</label>
        <input
          id="display-name"
          name="display-name"
          autoComplete="nickname"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          maxLength={24}
          required
        />
        <fieldset>
          <legend>Choose your first signal</legend>
          <div className="track-grid">
            {tracks.map((option) => (
              <label className="track-option" key={option.value}>
                <input
                  type="radio"
                  name="track"
                  value={option.value}
                  checked={track === option.value}
                  onChange={() => setTrack(option.value)}
                />
                <span><strong>{option.label}</strong><small>{option.detail}</small></span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="pixel-button primary" type="submit" disabled={!name.trim()}>
          Begin Nook
        </button>
      </form>
    </main>
  );
};
