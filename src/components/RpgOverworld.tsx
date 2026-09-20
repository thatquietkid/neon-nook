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

const locations = [
  { id: 'terminal-square', name: 'Terminal Square', detail: 'The mission terminal is waiting.', kind: 'terminal' },
  { id: 'data-garden', name: 'Data Garden', detail: 'Glowing seeds need sorting.', kind: 'garden' },
  { id: 'model-mill', name: 'Model Mill', detail: 'The mill wakes after the garden.', kind: 'mill' },
];

export const RpgOverworld = ({ unlockedSceneIds, activeSceneId, player = { x: 0, y: 0 }, onMove = () => undefined, onEnter, onStep }: RpgOverworldProps) => {
  useEffect(() => {
    const directions: Record<string, Direction> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
    const move = (event: KeyboardEvent) => {
      const direction = directions[event.key.toLowerCase()] ?? directions[event.key];
      if (direction) { event.preventDefault(); onMove(direction); }
    };
    window.addEventListener('keydown', move);
    return () => window.removeEventListener('keydown', move);
  }, [onMove]);

  const activeLocation = locations.find((location) => location.id === activeSceneId) ?? locations[0];

  return (
    <section className="bytebrook-console" aria-label="Bytebrook village">
      <div className="bytebrook-stage">
        <div className="world-sky" aria-hidden="true"><i /><i /><i /></div>
        <div className="world-tree-line" aria-hidden="true" />
        <div className="world-water" aria-hidden="true" />
        <div className="world-path" aria-hidden="true" />
        <div className="world-tree tree-one" aria-hidden="true" /><div className="world-tree tree-two" aria-hidden="true" /><div className="world-lantern lantern-one" aria-hidden="true" /><div className="world-lantern lantern-two" aria-hidden="true" />
        <div className="bytebrook-guide" aria-hidden="true"><span>!</span></div>
        <div className="bytebrook-player" style={{ left: `calc(47% + ${player.x * 28}px)`, bottom: `calc(17% - ${player.y * 18}px)` }} role="img" aria-label="Your explorer moves through Bytebrook" />
        {locations.map((location) => {
          const unlocked = unlockedSceneIds.includes(location.id);
          const className = `village-location world-${location.kind} ${activeSceneId === location.id ? 'active' : ''} ${unlocked ? '' : 'locked'}`;
          if (!unlocked) return <div className={className} key={location.id} aria-label={`${location.name} locked`}><span>LOCKED</span></div>;
          return <button className={className} key={location.id} type="button" onMouseEnter={onStep} onFocus={onStep} onClick={() => onEnter(location.id)} aria-label={`Enter ${location.name}`}><span className="location-plaque">{location.name}</span></button>;
        })}
      </div>
      <aside className="guide-bubble"><div className="nova-portrait" aria-hidden="true">N</div><div><strong>Nova</strong><p>{activeLocation.detail}</p></div><b className="action-hint">A / click: interact</b></aside>
      <p className="overworld-prompt">Arrow keys or WASD to explore</p>
    </section>
  );
};
