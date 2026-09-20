type DialogueBoxProps = { speaker: string; children: React.ReactNode; actions?: React.ReactNode };
export const DialogueBox = ({ speaker, children, actions }: DialogueBoxProps) => (
  <section className="rpg-dialogue" aria-live="polite"><div className="dialogue-portrait" aria-hidden="true">✦</div><div><p className="dialogue-speaker">{speaker}</p><div className="dialogue-copy">{children}</div>{actions && <div className="dialogue-actions">{actions}</div>}</div></section>
);
