
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false); // Cerrar menú al hacer logout
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Cerrar menú de perfil si está abierto
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
    }
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

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    // Cerrar menú hamburguesa si está abierto
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsOpen && !event.target.closest('.notifications-btn') && 
          !event.target.closest('.mobile-notifications-btn') && 
          !event.target.closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
      
      if (profileMenuOpen && !event.target.closest('.profile-btn') && 
          !event.target.closest('.mobile-profile-btn') && 
          !event.target.closest('.profile-dropdown')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notificationsOpen, profileMenuOpen]);

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
                <div style={{ position: 'relative' }}>
                  <button className="profile-btn" onClick={toggleProfileMenu}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                  </button>
                  {profileMenuOpen && (
                    <div className="profile-dropdown">
                      <div className="profile-menu-content">
                        <a href="/profile" className="profile-menu-item">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                          </svg>
                          Perfil
                        </a>
                        <button onClick={handleLogout} className="profile-menu-item profile-logout">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
                            <path d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/>
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="navbar-logout">
              {!isAuthenticated && (
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
              <button className="mobile-upload-btn" onClick={openUploadModal}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0l4 4h-3v8h-2V4H4l4-4z"/>
                  <path d="M1 12h14v2H1z"/>
                </svg>
              </button>
              <div style={{ position: 'relative' }}>
                <button className="mobile-profile-btn" onClick={toggleProfileMenu}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  {pendingCount > 0 && (
                    <span className="mobile-profile-badge">{pendingCount}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Menu */}
        <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-content">
            <a href="/" onClick={closeMobileMenu}>Inicio</a>
            {isAuthenticated && <a href="/spaces" onClick={closeMobileMenu}>Spaces</a>}
            <div className="mobile-auth">
              {!isAuthenticated && (
                <a href="/login" onClick={closeMobileMenu}>Login</a>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Profile Sidebar */}
        <div className={`profile-sidebar ${profileMenuOpen ? 'open' : ''}`}>
          <div className="profile-sidebar-content">
            <a href="/profile" onClick={() => setProfileMenuOpen(false)} className="profile-sidebar-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              Perfil
            </a>
            <button 
              onClick={() => {
                setNotificationsOpen(true);
                setProfileMenuOpen(false);
              }} 
              className="profile-sidebar-item"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              Notificaciones
              {pendingCount > 0 && (
                <span className="profile-sidebar-badge">{pendingCount}</span>
              )}
            </button>
            <button onClick={handleLogout} className="profile-sidebar-item profile-sidebar-logout">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z"/>
                <path d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/>
              </svg>
              Log out
            </button>
          </div>
        </div>

        {/* Notifications Modal para mobile */}
        {notificationsOpen && (
          <>
            <div className="notifications-mobile-overlay" onClick={() => setNotificationsOpen(false)}></div>
            <NotificationsModal
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </>
        )}

        {/* Mobile Overlays */}
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
        {profileMenuOpen && (
          <div className="profile-overlay" onClick={() => setProfileMenuOpen(false)}></div>
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
