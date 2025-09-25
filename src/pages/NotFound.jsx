import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <div className="llama-icon">🦙</div>
        <h1 className="error-message">Esta no es la llama que buscas</h1>
        <p className="error-description">
          La página que intentas alcanzar se ha perdido en la tormenta.
        </p>
        <button onClick={goHome} className="home-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z"/>
          </svg>
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;