
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import UploadAudioModal from './UploadAudioModal';
import NotificationsModal from './NotificationsModal';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { pendingCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsOpen && !event.target.closest('.notifications-btn') && 
          !event.target.closest('.mobile-notifications-btn') && 
          !event.target.closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notificationsOpen]);

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
              <>
                <button className="upload-btn" onClick={openUploadModal}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0l4 4h-3v8h-2V4H4l4-4z"/>
                    <path d="M1 12h14v2H1z"/>
                  </svg>
                  Subir Audio
                </button>
                <div style={{ position: 'relative' }}>
                  <button className="notifications-btn" onClick={toggleNotifications}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                    </svg>
                    {pendingCount > 0 && (
                      <span className="notifications-badge">{pendingCount}</span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <NotificationsModal
                      isOpen={notificationsOpen}
                      onClose={() => setNotificationsOpen(false)}
                    />
                  )}
                </div>
              </>
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

          {/* Action Buttons */}
          {isAuthenticated && (
            <div className="mobile-action-buttons">
              <div style={{ position: 'relative' }}>
                <button className="mobile-notifications-btn" onClick={toggleNotifications}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                  </svg>
                  {pendingCount > 0 && (
                    <span className="mobile-notifications-badge">{pendingCount}</span>
                  )}
                </button>
                {notificationsOpen && (
                  <NotificationsModal
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                  />
                )}
              </div>
              <button className="mobile-upload-btn" onClick={openUploadModal}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0l4 4h-3v8h-2V4H4l4-4z"/>
                  <path d="M1 12h14v2H1z"/>
                </svg>
              </button>
            </div>
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
