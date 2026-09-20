import { useEffect } from 'react';

type Direction = 'left' | 'right' | 'up' | 'down';

type RpgOverworldProps = {
  unlockedSceneIds: string[];
  activeSceneId?: string;
  player?: { x: number; y: number };
  onMove?: (direction: Direction) => void;
  onEnter: (sceneId: string) => void;
  onStep?: () => void;
};

const landmarks = [
  { id: 'terminal-square', name: 'Terminal Square', detail: 'A rogue list is clogging the signal.', kind: 'terminal' },
  { id: 'data-garden', name: 'Data Garden', detail: 'Sort the glowing seeds into a clean pattern.', kind: 'garden' },
  { id: 'model-mill', name: 'Model Mill', detail: 'The windmill wakes after the garden is clear.', kind: 'mill' },
];

export const RpgOverworld = ({ unlockedSceneIds, activeSceneId, player = { x: 0, y: 0 }, onMove = () => undefined, onEnter, onStep }: RpgOverworldProps) => {
  useEffect(() => {
    const directions: Record<string, Direction> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
    const move = (event: KeyboardEvent) => {
      const direction = directions[event.key];
      if (direction) { event.preventDefault(); onMove(direction); }
    };
    window.addEventListener('keydown', move);
    return () => window.removeEventListener('keydown', move);
  }, [onMove]);

  return (
    <section className="bytebrook-stage" aria-label="Bytebrook village">
      <div className="bytebrook-sky" aria-hidden="true"><i /><i /><i /></div><div className="bytebrook-hills" aria-hidden="true" /><div className="bytebrook-path" aria-hidden="true" /><div className="bytebrook-water" aria-hidden="true" />
      <div className="bytebrook-player" style={{ transform: `translate(${player.x * 28}px, ${player.y * 18}px)` }} role="img" aria-label="Your explorer moves through Bytebrook" /><div className="bytebrook-guide" aria-hidden="true"><span>!</span></div>
      <aside className="guide-bubble"><strong>Nova</strong><br />Follow the lanterns. Your code moves are how you help Bytebrook.</aside>
      {landmarks.map((landmark) => {
        const unlocked = unlockedSceneIds.includes(landmark.id);
        if (!unlocked) return <div className={`landmark ${landmark.kind} locked`} key={landmark.id} aria-label="Locked route"><span>?</span></div>;
        return <button className={`landmark ${landmark.kind} ${activeSceneId === landmark.id ? 'active' : ''}`} key={landmark.id} type="button" onMouseEnter={onStep} onFocus={onStep} onClick={() => onEnter(landmark.id)}><span className="landmark-name">{landmark.name}</span><small>{landmark.detail}</small><b>Enter</b></button>;
      })}
      <p className="overworld-prompt">Use arrows or WASD to walk Bytebrook. Choose a lantern-lit destination when ready.</p>
    </section>
  );
};
