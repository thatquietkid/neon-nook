import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/base.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Neon Nook root element is missing');
}

createRoot(root).render(
  <StrictMode>
    <main className="app-shell" aria-labelledby="game-title">
      <p className="eyebrow">NEON NOOK // LEARNING ARCADE</p>
      <h1 id="game-title">Build your next bright idea.</h1>
      <p className="intro">A tiny practice space for curious minds.</p>
    </main>
  </StrictMode>,
);
