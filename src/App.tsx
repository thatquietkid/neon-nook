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

const App = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadProfile());
  const [view, setView] = useState<View>(() => loadProfile() ? 'home' : 'onboarding');
  const [session, setSession] = useState<SessionState | null>(null);
  const rewardedCompletionKey = useRef<string | null>(null);
  const profileRef = useRef(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (session?.status !== 'complete') {
      rewardedCompletionKey.current = null;
      return;
    }
    const completionKey = session.mission ? `${session.mission.id}:${session.elapsed}:${session.answer ?? ''}` : null;
    if (!session.mission || !session.correct || !completionKey || rewardedCompletionKey.current === completionKey) return;

    const currentProfile = profileRef.current;
    if (!currentProfile) return;

    rewardedCompletionKey.current = completionKey;
    const rewarded = applyReward(currentProfile, session.mission, true);
    profileRef.current = rewarded;
    saveProfile(rewarded);
    setProfile(rewarded);
  }, [session]);

  useEffect(() => {
    if (session?.status === 'exited') setSession(null);
  }, [session]);

  const beginProfile = useCallback((name: string, track: Track) => {
    const nextProfile = createProfile(name, track);
    profileRef.current = nextProfile;
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

  const startNextMission = useCallback((completedMission: Mission) => {
    const nextMission = LEVELS.find((mission) => mission.level === completedMission.level + 1);
    if (nextMission) setSession(startSession(nextMission));
  }, []);

  const finishArcade = useCallback(() => {
    setSession(null);
    setView('signoff');
  }, []);

  if (session) {
    return <MissionScene session={session} onEvent={dispatchSession} onReturnHome={returnHome} onNextMission={startNextMission} onFinishArcade={finishArcade} />;
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
