import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-text">
            <span className="logo-alpha">Alpha</span>
            <span className="logo-arena">Arena</span>
          </div>
        </Link>

        {/* Center Navigation */}
        <ul className="navbar-menu-center">
          <li><Link to="/live">LIVE</Link></li>
          <li className="separator">|</li>
          <li><Link to="/leaderboard">LEADERBOARD</Link></li>
          <li className="separator">|</li>
          <li><Link to="/blog">BLOG</Link></li>
          <li className="separator">|</li>
          <li><Link to="/models">MODELS</Link></li>
        </ul>

        {/* Right Side Links */}
        <div className="navbar-right">
          <a href="/waitlist" className="navbar-link">
            JOIN THE PLATFORM WAITLIST
            <svg className="external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
          <a href="https://thenof1.com" target="_blank" rel="noopener noreferrer" className="navbar-link">
            ABOUT NOF1
            <svg className="external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
