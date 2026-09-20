type PauseMenuProps = {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
};

export const PauseMenu = ({ onResume, onRestart, onExit }: PauseMenuProps) => (
  <section className="pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
    <div className="pause-menu">
      <p className="eyebrow">MISSION PAUSED</p>
      <h2 id="pause-title">Take a breath.</h2>
      <p>Your timer is safely stopped.</p>
      <div className="menu-actions">
        <button className="pixel-button primary" type="button" onClick={onResume}>Resume mission</button>
        <button className="pixel-button" type="button" onClick={onRestart}>Restart level</button>
        <button className="text-button" type="button" onClick={onExit}>Exit to room</button>
      </div>
    </div>
  </section>
);
