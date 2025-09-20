
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
        </div>
        <div className="navbar-logout">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">Log out</button>
          ) : (
            <a href="/login">Login</a>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
