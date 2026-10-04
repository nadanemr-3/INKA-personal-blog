import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Close the mobile menu when a navigation item (or action) is activated
  const handleMenuClick = (e) => {
    if (e.target.closest('a,button')) {
      closeMenu();
    }
  };

  // Subtle scrolled state (single passive listener, rAF-throttled)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on Escape (and return focus to the toggle)
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={`navbar${scrolled ? ' navbar-scrolled' : ''}`} role="banner">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="INKA Home" onClick={closeMenu}>
          <img src="/inka-logo.png" alt="INKA" className="navbar-logo" />
        </Link>

        <button
          type="button"
          ref={toggleRef}
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="navbar-toggle-bar" aria-hidden="true"></span>
          <span className="navbar-toggle-bar" aria-hidden="true"></span>
          <span className="navbar-toggle-bar" aria-hidden="true"></span>
        </button>

        <div
          id="primary-navigation"
          className={`navbar-collapsible${menuOpen ? ' open' : ''}`}
          onClick={handleMenuClick}
        >
        <nav className="navbar-nav" aria-label="Main Navigation">
          <ul className="navbar-links">
            <li>
              <NavLink
                to="/journal"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Journal
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                About
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink
                  to="/my-stories"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  My Stories
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="navbar-user" title={user?.email}>
                Hi, <span className="navbar-user-name">{user?.name?.split(' ')[0] || 'Storyteller'}</span>
              </span>
              <Link to="/write" className="btn btn-primary btn-sm">
                Write
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                aria-label="Log Out"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" style={{ textTransform: 'uppercase' }}>
                Log In
              </NavLink>
              <Link to="/register" className="btn btn-soft btn-sm">
                Register
              </Link>
              <Link to="/write" className="btn btn-primary btn-sm">
                Write
              </Link>
            </>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
