import React from 'react';
import { useAudio } from '../context/AudioContext';
import './GlobalAudioPlayer.css';

const GlobalAudioPlayer = () => {
  const { currentAudio, isPlaying, currentTime, duration, togglePlayPause, stopAudio, seekTo } = useAudio();

  if (!currentAudio) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seekTo(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="global-audio-player">
      <div className="global-player-content">
        {/* Info del audio - Solo desktop */}
        <div className="audio-info">
          <h4 className="audio-title">
            {currentAudio.noteName ? currentAudio.noteName.split('_')[0] : 'Audio sin nombre'}
          </h4>
          <p className="audio-space">{currentAudio.spaceName || 'Sin espacio'}</p>
        </div>

        {/* Controles centrales */}
        <div className="audio-controls">
          <button 
            className="control-btn play-pause-btn" 
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.5 3.5A1.5 1.5 0 0 1 6 2h.5A1.5 1.5 0 0 1 8 3.5v9A1.5 1.5 0 0 1 6.5 14H6A1.5 1.5 0 0 1 4.5 12.5v-9zm5 0A1.5 1.5 0 0 1 11 2h.5A1.5 1.5 0 0 1 13 3.5v9A1.5 1.5 0 0 1 11.5 14H11A1.5 1.5 0 0 1 9.5 12.5v-9z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
              </svg>
            )}
          </button>

          {/* Barra de progreso y tiempo */}
          <div className="progress-section">
            <span className="time-current">{formatTime(currentTime)}</span>
            <div 
              className="progress-bar" 
              onClick={handleProgressClick}
            >
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
              <div 
                className="progress-handle" 
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="time-total">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="audio-close">
          <button 
            className="control-btn close-btn" 
            onClick={stopAudio}
            title="Cerrar reproductor"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;