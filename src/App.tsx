import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcadeHome } from './components/ArcadeHome';
import { MissionScene } from './components/MissionScene';
import { Onboarding } from './components/Onboarding';
import { LEVELS, applyReward, type Mission } from './game/missions';
import { createProfile, loadProfile, saveProfile } from './game/profile';
import { reduceSession, startSession, type SessionEvent, type SessionState } from './game/session';
import type { PlayerProfile, Track } from './game/types';
import './styles/arcade.css';

type View = 'onboarding' | 'home' | 'signoff';

const isFinalClear = (profile: PlayerProfile) => LEVELS.every((mission) => profile.completed.includes(mission.id));

const App = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadProfile());
  const [view, setView] = useState<View>(() => loadProfile() ? 'home' : 'onboarding');
  const [session, setSession] = useState<SessionState | null>(null);
  const rewardedSession = useRef<SessionState | null>(null);

  useEffect(() => {
    if (session?.status !== 'complete') {
      rewardedSession.current = null;
      return;
    }
    if (!session.mission || !session.correct || rewardedSession.current === session) return;

    rewardedSession.current = session;
    setProfile((current) => {
      if (!current) return current;
      const rewarded = applyReward(current, session.mission!, true);
      saveProfile(rewarded);
      return rewarded;
    });
  }, [session]);

  useEffect(() => {
    if (session?.status === 'exited') setSession(null);
  }, [session]);

  const beginProfile = useCallback((name: string, track: Track) => {
    const nextProfile = createProfile(name, track);
    saveProfile(nextProfile);
    setProfile(nextProfile);
    setView('home');
  }, []);

  const selectMission = useCallback((mission: Mission) => {
    setSession(startSession(mission));
  }, []);

  const dispatchSession = useCallback((event: SessionEvent) => {
    setSession((current) => current ? reduceSession(current, event) : current);
  }, []);

  const returnHome = useCallback(() => {
    setSession(null);
    setView('home');
  }, []);

  const finishArcade = useCallback(() => {
    setSession(null);
    setView('signoff');
  }, []);

  if (session) {
    return <MissionScene session={session} onEvent={dispatchSession} onReturnHome={returnHome} onFinishArcade={finishArcade} />;
  }

  if (view === 'signoff' && profile) {
    return (
      <main className="signoff-screen app-shell" aria-labelledby="signoff-title">
        <p className="eyebrow">ALL SIGNALS CLEAR</p>
        <div className="sprite-player signoff-sprite" aria-hidden="true" />
        <h1 id="signoff-title">The nook is glowing because you showed up.</h1>
        <p className="intro">Eight missions complete. Keep the small wins close, {profile.name}.</p>
        <button className="pixel-button primary" type="button" onClick={() => setView('home')}>Return to room</button>
      </main>
    );
  }

  if (!profile || view === 'onboarding') return <Onboarding onComplete={beginProfile} />;

  return <ArcadeHome profile={profile} onSelectMission={selectMission} />;
};

export default App;
