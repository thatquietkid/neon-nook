import { useState } from 'react';
import { LEVELS, recommendMission, type Mission } from '../game/missions';
import type { PlayerProfile } from '../game/types';

type ArcadeHomeProps = {
  profile: PlayerProfile;
  onSelectMission: (mission: Mission) => void;
};

export const ArcadeHome = ({ profile, onSelectMission }: ArcadeHomeProps) => {
  const [minutes, setMinutes] = useState(3);
  const recommended = recommendMission(profile, minutes);

  return (
    <main className="arcade-home app-shell" aria-labelledby="home-title">
      <header className="room-header">
        <div>
          <p className="eyebrow">NEON NOOK // {profile.track.toUpperCase()} TRACK</p>
          <h1 id="home-title">Welcome back, {profile.name}.</h1>
        </div>
        <dl className="player-stats" aria-label="Player progress">
          <div><dt>XP</dt><dd>{profile.xp}</dd></div>
          <div><dt>STREAK</dt><dd>{profile.streak}</dd></div>
          <div><dt>UNLOCKED</dt><dd>{profile.unlockedLevel}/8</dd></div>
        </dl>
      </header>

      <section className="study-room" aria-label="Your cozy pixel study room">
        <div className="room-window" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="room-shelf" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="room-desk" aria-hidden="true"><b>▣</b><span /></div>
        <div className="arcade-machine" aria-hidden="true"><span>MISSION<br />TERMINAL</span></div>
        <div className="sprite-player room-player" aria-label="Your player character idles beside the mission terminal" role="img" />
        <p className="room-caption">The terminal is ready for a short, useful quest.</p>
      </section>

      <section className="mission-console" aria-labelledby="mission-title">
        <div className="console-copy">
          <p className="eyebrow">RECOMMENDED QUEST</p>
          <h2 id="mission-title">{recommended.title}</h2>
          <p>{recommended.minutes}-minute {recommended.track} mission · {recommended.topic.replaceAll('-', ' ')}</p>
          <button className="pixel-button primary" type="button" onClick={() => onSelectMission(recommended)}>
            Start recommended mission
          </button>
        </div>
        <div className="duration-buttons" aria-label="Preferred mission length">
          {[3, 7, 15].map((duration) => (
            <button
              className={minutes === duration ? 'pixel-button selected' : 'pixel-button'}
              key={duration}
              type="button"
              aria-pressed={minutes === duration}
              onClick={() => setMinutes(duration)}
            >
              {duration} min
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="levels-title">
        <div className="section-heading"><p className="eyebrow">MISSION MAP</p><h2 id="levels-title">Eight small wins.</h2></div>
        <ol className="level-map">
          {LEVELS.map((mission) => {
            const unlocked = mission.level <= profile.unlockedLevel;
            const complete = profile.completed.includes(mission.id);
            return (
              <li key={mission.id} className={complete ? 'complete' : ''}>
                <button
                  type="button"
                  disabled={!unlocked}
                  aria-label={`Level ${mission.level}: ${unlocked ? mission.title : 'locked'}`}
                  onClick={() => onSelectMission(mission)}
                >
                  <span>{complete ? '✓' : mission.level}</span>
                  <strong>{unlocked ? mission.title : 'Locked signal'}</strong>
                  <small>{unlocked ? `${mission.minutes} min · ${mission.xp} XP` : `Clear level ${mission.level - 1}`}</small>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
};
