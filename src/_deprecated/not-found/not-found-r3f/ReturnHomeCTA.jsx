import { Link } from 'react-router-dom';

export default function ReturnHomeCTA() {
  return (
    <Link to="/" className="nf-cta" data-clickable="true" aria-label="Return to home page">
      RETURN HOME
    </Link>
  );
}
