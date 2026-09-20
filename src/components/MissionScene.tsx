import { useEffect, useState } from 'react';
import type { SessionEvent, SessionState } from '../game/session';
import type { Mission } from '../game/missions';
import { PauseMenu } from './PauseMenu';
import { EndScreen } from './EndScreen';

type MissionSceneProps = {
  session: SessionState;
  onEvent: (event: SessionEvent) => void;
  onReturnHome: () => void;
  onNextMission: (mission: Mission) => void;
  onFinishArcade: () => void;
};

export const MissionScene = ({ session, onEvent, onReturnHome, onNextMission, onFinishArcade }: MissionSceneProps) => {
  const mission = session.mission;
  const [coachText, setCoachText] = useState<string | null>(null);
  const [coachPending, setCoachPending] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && session.status === 'playing') {
        event.preventDefault();
        onEvent({ type: 'PAUSE' });
      }
      if (event.key === 'Escape' && session.status === 'paused') {
        event.preventDefault();
        onEvent({ type: 'RESUME' });
      }
      if (event.key === 'Enter' && session.status === 'intro') {
        event.preventDefault();
        onEvent({ type: 'BEGIN' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onEvent, session.status]);

  if (!mission) return null;

  const requestCoach = async (request: 'hint' | 'explain') => {
    setCoachPending(true);
    setCoachText(null);
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: mission.topic, difficulty: mission.level, request }),
      });
      const reply: unknown = await response.json();
      if (!response.ok || typeof reply !== 'object' || reply === null || typeof (reply as { text?: unknown }).text !== 'string') {
        throw new Error('Coach response was unavailable');
      }
      setCoachText((reply as { text: string }).text);
    } catch {
      setCoachText(mission.explanation);
    } finally {
      setCoachPending(false);
    }
  };

  if (session.status === 'result') {
    return (
      <main className="mission-scene app-shell">
        <EndScreen mission={mission} correct={false} onRetry={() => onEvent({ type: 'RESTART' })} onContinue={onReturnHome} />
      </main>
    );
  }

  if (session.status === 'complete') {
    return (
      <main className="mission-scene app-shell">
        <EndScreen
          mission={mission}
          correct
          finalMission={mission.level === 8}
          onRetry={() => onEvent({ type: 'RESTART' })}
          onContinue={mission.level === 8 ? onFinishArcade : () => onNextMission(mission)}
        />
      </main>
    );
  }

  return (
    <main className="mission-scene app-shell" aria-labelledby="mission-heading">
      <header className="mission-topline">
        <p className="eyebrow">LEVEL {mission.level} // {mission.minutes}-MINUTE QUEST</p>
        {session.status === 'playing' && <button className="pixel-button compact" type="button" onClick={() => onEvent({ type: 'PAUSE' })}>Pause</button>}
      </header>
      <section className="terminal-scene">
        <div className="terminal-glow" aria-hidden="true">✦</div>
        <div className="sprite-player mission-player" aria-label="Your player character studies the mission terminal" role="img" />
        <div className="dialogue-box">
          <p className="eyebrow">{mission.title.toUpperCase()}</p>
          {session.status === 'intro' ? (
            <>
              <h1 id="mission-heading">A quick signal from the terminal.</h1>
              <p>One focused answer will light the next tile in your room.</p>
              <button className="pixel-button primary" type="button" onClick={() => onEvent({ type: 'BEGIN' })}>Begin mission</button>
            </>
          ) : (
            <>
              <h1 id="mission-heading">{mission.prompt}</h1>
              <div className="answer-grid" aria-label="Answer choices">
                {mission.choices.map((choice) => (
                  <button className="answer-button" type="button" key={choice} onClick={() => onEvent({ type: 'ANSWER', answer: choice })}>
                    {choice}
                  </button>
                ))}
              </div>
              <div className="mission-console" aria-label="Study coach">
                <div>
                  <p className="eyebrow">STUDY COACH</p>
                  <p aria-live="polite">{coachText ?? 'Ask for a nudge without leaving your mission.'}</p>
                </div>
                <div className="duration-buttons">
                  <button className="pixel-button compact" type="button" disabled={coachPending} onClick={() => void requestCoach('hint')}>
                    {coachPending ? 'Thinking…' : 'Need a hint'}
                  </button>
                  <button className="pixel-button compact" type="button" disabled={coachPending} onClick={() => void requestCoach('explain')}>
                    Explain it
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      {session.status === 'paused' && <PauseMenu onResume={() => onEvent({ type: 'RESUME' })} onRestart={() => onEvent({ type: 'RESTART' })} onExit={() => onEvent({ type: 'EXIT' })} />}
    </main>
  );
};
