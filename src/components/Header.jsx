import { useState } from 'react';
import './Header.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header className="header">
        <div className="menu-icon" onClick={toggleMenu}>
          <span className={isOpen ? 'line line1 open' : 'line line1'}></span>
          <span className={isOpen ? 'line line2 open' : 'line line2'}></span>
        </div>
        <div className="logo">YIDA</div>
      </header>
      <nav className={isOpen ? 'overlay open' : 'overlay'}>
        <ul>
          <li><a href="/">HOME</a></li>
          <li><a href="/about">ABOUT</a></li>
          <li><a href="/projects">WORK</a></li>
        </ul>
      </nav>
    </>
  );
}