
import { useState, useRef } from 'react';
import './AudioPlayer.css';

const AudioPlayer = ({ noteId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const audioSrc = `/api/v1/voice-notes/${noteId}/stream`;

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Sincroniza el estado si el audio termina por sí solo
  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="audio-player">
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        onEnded={handleEnded}
        preload="none" // No cargar el audio hasta que se le de al play
      />
      <button onClick={togglePlayPause} className="play-pause-btn">
        {isPlaying ? '❚❚' : '▶'}
      </button>
    </div>
  );
};

export default AudioPlayer;
