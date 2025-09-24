
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadAudioModal from './UploadAudioModal';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false); // Cerrar menú al hacer logout
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const openUploadModal = () => {
    setUploadModalOpen(true);
    setMobileMenuOpen(false); // Cerrar menú móvil si está abierto
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUploadSuccess = () => {
    // Recargar la página para mostrar el nuevo audio
    window.location.reload();
  };

  return (
    <header className="navbar-header">
      <nav className="navbar-container">
        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="navbar-brand">
            <a href="/">Inicio</a>
            {isAuthenticated && <a href="/spaces">Spaces</a>}
          </div>
          <div className="navbar-actions">
            {isAuthenticated && (
              <button className="upload-btn" onClick={openUploadModal}>
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
        </div>

        {/* Mobile Navigation */}
        <div className="navbar-mobile">
          {/* Hamburger Button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
            </svg>
          </button>

          {/* Home Link */}
          <a href="/" className="mobile-home">Inicio</a>

          {/* Upload Button - Icon Only */}
          {isAuthenticated && (
            <button className="mobile-upload-btn" onClick={openUploadModal}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0l4 4h-3v8h-2V4H4l4-4z"/>
                <path d="M1 12h14v2H1z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Sidebar Menu */}
        <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-content">
            <a href="/" onClick={closeMobileMenu}>Inicio</a>
            {isAuthenticated && <a href="/spaces" onClick={closeMobileMenu}>Spaces</a>}
            {isAuthenticated && (
              <button className="mobile-upload-full" onClick={openUploadModal}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0l4 4h-3v8h-2V4H4l4-4z"/>
                  <path d="M1 12h14v2H1z"/>
                </svg>
                Subir Audio
              </button>
            )}
            <div className="mobile-auth">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="mobile-logout-btn">Log out</button>
              ) : (
                <a href="/login" onClick={closeMobileMenu}>Login</a>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </nav>
      
      {/* Upload Modal */}
      <UploadAudioModal
        isOpen={uploadModalOpen}
        onClose={closeUploadModal}
        onSuccess={handleUploadSuccess}
      />
    </header>
  );
};

export default Navbar;
