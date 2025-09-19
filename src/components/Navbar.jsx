
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar-header">
      <nav className="navbar-container">
        <div className="navbar-brand">
          <a href="/">Inicio</a>
        </div>
        <div className="navbar-logout">
          <a href="#">Log out</a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
