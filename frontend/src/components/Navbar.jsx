import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="INKA Home">
          <span>INKA</span>
          <span className="navbar-brand-dot" aria-hidden="true"></span>
        </Link>

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
              <Link to="/write" className="btn btn-primary btn-sm" role="button">
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
              <Link to="/register" className="btn btn-soft btn-sm" role="button">
                Register
              </Link>
              <Link to="/write" className="btn btn-primary btn-sm" role="button">
                Write
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
