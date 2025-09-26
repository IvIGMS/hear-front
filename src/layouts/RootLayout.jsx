
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import GlobalAudioPlayer from '../components/GlobalAudioPlayer';
import { useAudio } from '../context/AudioContext';

const RootLayout = () => {
  const { currentAudio } = useAudio();

  // Añadir clase al body cuando hay un reproductor activo
  useEffect(() => {
    if (currentAudio) {
      document.body.classList.add('audio-player-active');
    } else {
      document.body.classList.remove('audio-player-active');
    }

    // Cleanup
    return () => {
      document.body.classList.remove('audio-player-active');
    };
  }, [currentAudio]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <GlobalAudioPlayer />
    </>
  );
};

export default RootLayout;
