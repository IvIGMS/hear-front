import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const playAudio = (noteId, noteName, spaceName) => {
    // Si es el mismo audio, solo cambiar play/pause
    if (currentAudio && currentAudio.noteId === noteId) {
      togglePlayPause();
      return;
    }

    // Si hay un audio diferente reproduciéndose, pausarlo
    if (currentAudio && currentAudio.noteId !== noteId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    // Configurar el nuevo audio
    setCurrentAudio({
      noteId,
      noteName,
      spaceName,
      src: `/api/v1/voice-notes/${noteId}/stream`
    });

    // Empezar a reproducir el nuevo audio
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Event handlers para el audio
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleCanPlay = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleLoadStart = () => {
    setCurrentTime(0);
  };

  const value = {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    playAudio,
    togglePlayPause,
    stopAudio,
    seekTo,
    audioRef
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      {/* Audio element global */}
      {currentAudio && (
        <audio
          ref={audioRef}
          src={currentAudio.src}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadedMetadata={handleDurationChange}
          onLoadStart={handleLoadStart}
          onEnded={handleEnded}
          onCanPlay={handleCanPlay}
          preload="metadata"
        />
      )}
    </AudioContext.Provider>
  );
};