import GlitchScene   from './not-found/GlitchScene';
import CursorTrail   from './not-found/CursorTrail';
import GlitchOverlay from './not-found/GlitchOverlay';
import GlitchDOM     from './not-found/GlitchDOM';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="nf-page" role="main" aria-label="404 – Page not found">
      {/* Layer 1 — Three.js / R3F canvas */}
      <GlitchScene />

      {/* Layer 2 — 2-D cursor trail */}
      <CursorTrail />

      {/* Layer 3 — CSS scanlines / vignette / flicker */}
      <GlitchOverlay />

      {/* Layer 4 — internal scroll track + CTA */}
      <GlitchDOM />
    </div>
  );
}
