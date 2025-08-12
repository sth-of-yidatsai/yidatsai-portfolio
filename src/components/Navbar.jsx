import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">HOME</Link> | <Link to="/about">ABOUT</Link> | <Link to="/projects">WORK</Link>
    </nav>
  );
}