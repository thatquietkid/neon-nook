import { useEffect } from 'react';

type Direction = 'left' | 'right' | 'up' | 'down';
type Point = { x: number; y: number };
type RpgOverworldProps = { unlockedSceneIds: string[]; activeSceneId?: string; player?: Point; onMove?: (direction: Direction) => void; onEnter: (sceneId: string) => void; onInteract?: (sceneId: string) => void; onStep?: () => void };
const locations = [
  { id: 'terminal-square', name: 'Terminal Square', detail: 'The mission terminal is waiting.', kind: 'terminal', tile: { x: 1, y: 3 } },
  { id: 'data-garden', name: 'Data Garden', detail: 'Glowing seeds need sorting.', kind: 'garden', tile: { x: 7, y: 1 } },
  { id: 'model-mill', name: 'Model Mill', detail: 'The mill wakes after the garden.', kind: 'mill', tile: { x: 7, y: 4 } },
];
const isNearby = (player: Point, tile: Point) => Math.abs(player.x - tile.x) + Math.abs(player.y - tile.y) <= 1;

export const RpgOverworld = ({ unlockedSceneIds, activeSceneId, player = { x: 4, y: 3 }, onMove = () => undefined, onEnter, onInteract = () => undefined, onStep }: RpgOverworldProps) => {
  const nearbyLocation = locations.find((location) => isNearby(player, location.tile));
  useEffect(() => {
    const directions: Record<string, Direction> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
    const move = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') { if (nearbyLocation && unlockedSceneIds.includes(nearbyLocation.id)) { event.preventDefault(); onInteract(nearbyLocation.id); } return; }
      const direction = directions[event.key.toLowerCase()] ?? directions[event.key];
      if (direction) { event.preventDefault(); onMove(direction); }
    };
    window.addEventListener('keydown', move);
    return () => window.removeEventListener('keydown', move);
  }, [nearbyLocation, onInteract, onMove, unlockedSceneIds]);
  const dialogue = nearbyLocation ? nearbyLocation.detail : 'Walk up to a landmark, then press Enter to explore.';
  return <section className="bytebrook-console" aria-label="Bytebrook village"><div className="bytebrook-stage"><div className="world-sky" aria-hidden="true"><i /><i /><i /></div><div className="world-tree-line" aria-hidden="true" /><div className="world-water" aria-hidden="true" /><div className="world-path" aria-hidden="true" /><div className="world-tree tree-one" aria-hidden="true" /><div className="world-tree tree-two" aria-hidden="true" /><div className="world-lantern lantern-one" aria-hidden="true" /><div className="world-lantern lantern-two" aria-hidden="true" /><div className="bytebrook-guide" aria-hidden="true"><span>!</span></div><div className="bytebrook-player" style={{ left: `calc(47% + ${(player.x - 4) * 28}px)`, bottom: `calc(17% - ${(player.y - 3) * 18}px)` }} role="img" aria-label={`Explorer at village tile ${player.x}, ${player.y}`} />{locations.map((location) => { const unlocked = unlockedSceneIds.includes(location.id); const className = `village-location world-${location.kind} ${nearbyLocation?.id === location.id ? 'active' : ''} ${unlocked ? '' : 'locked'}`; if (!unlocked) return <div className={className} key={location.id} aria-label={`${location.name} locked`}><span>LOCKED</span></div>; return <button className={className} key={location.id} type="button" onMouseEnter={onStep} onFocus={onStep} onClick={() => onEnter(location.id)} aria-label={`Enter ${location.name}`}><span className="location-plaque">{location.name}</span></button>; })}</div><aside className="guide-bubble"><div className="nova-portrait" aria-hidden="true">N</div><div><strong>Nova</strong><p>{dialogue}</p></div><b className="action-hint">{nearbyLocation ? 'Enter / click: interact' : 'Arrows / WASD: walk'}</b></aside><p className="overworld-prompt">{nearbyLocation ? `Press Enter for ${nearbyLocation.name}` : 'Find a landmark to explore'}</p></section>;
};
