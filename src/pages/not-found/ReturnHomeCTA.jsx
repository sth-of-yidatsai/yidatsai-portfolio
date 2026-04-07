import { Link } from 'react-router-dom';

// Revealed by GSAP in scroll Phase 3 (nf-cta class targeted by timeline).
export default function ReturnHomeCTA() {
  return (
    <Link to="/" className="nf-cta" data-clickable="true" aria-label="Return to home page">
      <span className="nf-cta-line" aria-hidden="true" />
      <span className="nf-cta-label">← Return Home</span>
      <span className="nf-cta-line" aria-hidden="true" />
    </Link>
  );
}
