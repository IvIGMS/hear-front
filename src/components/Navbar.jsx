
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <nav className="navbar-container">
        <div className="navbar-brand">
          <a href="/">Inicio</a>
          {isAuthenticated && <a href="/spaces">Spaces</a>}
        </div>
        <div className="navbar-actions">
          {isAuthenticated && (
            <button className="upload-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0l4 4h-3v8h-2V4H4l4-4z"/>
                <path d="M1 12h14v2H1z"/>
              </svg>
              Subir Audio
            </button>
          )}
          <div className="navbar-logout">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="logout-btn">Log out</button>
            ) : (
              <a href="/login">Login</a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
