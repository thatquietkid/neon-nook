import type { Mission } from '../game/missions';

type EndScreenProps = {
  mission: Mission;
  correct: boolean;
  finalMission?: boolean;
  onRetry: () => void;
  onContinue: () => void;
};

export const EndScreen = ({ mission, correct, finalMission = false, onRetry, onContinue }: EndScreenProps) => (
  <section className={correct ? 'result-card success' : 'result-card retry'} aria-live="polite" aria-labelledby="result-title">
    <p className="eyebrow">{correct ? 'SIGNAL CAPTURED' : 'SIGNAL NEEDS A TUNE-UP'}</p>
    <h2 id="result-title">{correct ? 'Level Clear!' : 'Try that one again.'}</h2>
    <p>{mission.explanation}</p>
    {correct && <p className="reward-line">+{mission.xp} XP · {mission.topic.replaceAll('-', ' ')} confidence up</p>}
    <div className="menu-actions">
      {correct ? (
        <button className="pixel-button primary" type="button" onClick={onContinue}>
          {finalMission ? 'Finish arcade' : 'Next level'}
        </button>
      ) : (
        <button className="pixel-button primary" type="button" onClick={onRetry}>Try again</button>
      )}
      {!correct && <button className="text-button" type="button" onClick={onContinue}>Back to room</button>}
    </div>
  </section>
);
