type RpgOverworldProps = { unlockedSceneIds: string[]; activeSceneId?: string; onEnter: (sceneId: string) => void; onStep?: () => void };
const landmarks = [
  { id: 'terminal-square', name: 'Terminal Square', detail: 'A rogue list is clogging the signal.', kind: 'terminal' },
  { id: 'data-garden', name: 'Data Garden', detail: 'Sort the glowing seeds into a clean pattern.', kind: 'garden' },
  { id: 'model-mill', name: 'Model Mill', detail: 'The windmill wakes after the garden is clear.', kind: 'mill' },
];
export const RpgOverworld = ({ unlockedSceneIds, activeSceneId, onEnter, onStep }: RpgOverworldProps) => (
  <section className="bytebrook-stage" aria-label="Bytebrook village">
    <div className="bytebrook-sky" aria-hidden="true"><i /><i /><i /></div><div className="bytebrook-hills" aria-hidden="true" /><div className="bytebrook-path" aria-hidden="true" /><div className="bytebrook-water" aria-hidden="true" />
    <div className="bytebrook-player" role="img" aria-label="Your explorer waits on the village path" /><div className="bytebrook-guide" aria-hidden="true"><span>!</span></div>
    <aside className="guide-bubble"><strong>Nova</strong><br />Follow the lanterns. Your code moves are how you help Bytebrook.</aside>
    {landmarks.map((landmark) => { const unlocked = unlockedSceneIds.includes(landmark.id); if (!unlocked) return <div className={`landmark ${landmark.kind} locked`} key={landmark.id} aria-label="Locked route"><span>?</span></div>; return <button className={`landmark ${landmark.kind} ${activeSceneId === landmark.id ? 'active' : ''}`} key={landmark.id} type="button" onMouseEnter={onStep} onFocus={onStep} onClick={() => onEnter(landmark.id)}><span className="landmark-name">{landmark.name}</span><small>{landmark.detail}</small><b>Enter</b></button>; })}
    <p className="overworld-prompt">Choose a lantern-lit destination to explore Bytebrook.</p>
  </section>
);
