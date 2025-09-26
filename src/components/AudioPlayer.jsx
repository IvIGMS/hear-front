
import React from 'react';
import { useAudio } from '../context/AudioContext';
import './AudioPlayer.css';

const AudioPlayer = ({ noteId, noteName, spaceName }) => {
  const { currentAudio, isPlaying, playAudio } = useAudio();

  const handleClick = () => {
    playAudio(noteId, noteName, spaceName);
  };

  const isCurrentlyPlaying = currentAudio?.noteId === noteId && isPlaying;

  return (
    <div className="audio-player">
      <button onClick={handleClick} className="play-pause-btn">
        {isCurrentlyPlaying ? (
          <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.5 3.5A1.5 1.5 0 0 1 6 2h.5A1.5 1.5 0 0 1 8 3.5v9A1.5 1.5 0 0 1 6.5 14H6A1.5 1.5 0 0 1 4.5 12.5v-9zm5 0A1.5 1.5 0 0 1 11 2h.5A1.5 1.5 0 0 1 13 3.5v9A1.5 1.5 0 0 1 11.5 14H11A1.5 1.5 0 0 1 9.5 12.5v-9z"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;
