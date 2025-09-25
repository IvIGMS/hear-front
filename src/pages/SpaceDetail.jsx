import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ColorContext';
import AudioPlayer from '../components/AudioPlayer';
import './SpaceDetail.css';

const SpaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userToken } = useAuth();
  const { colorMap } = useColors();
  
  const [space, setSpace] = useState(null);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los campos de búsqueda
  const [voiceNoteNameQueryParam, setVoiceNoteNameQueryParam] = useState('');

  // Estado para el debouncing
  const [debouncedVoiceNoteName, setDebouncedVoiceNoteName] = useState(voiceNoteNameQueryParam);

  // Efecto para el debouncing del input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVoiceNoteName(voiceNoteNameQueryParam);
      setCurrentPage(1); // Resetear a la primera página en cada búsqueda
    }, 500); // 500ms de delay

    return () => {
      clearTimeout(handler);
    };
  }, [voiceNoteNameQueryParam]);

  useEffect(() => {
    const fetchSpaceData = async () => {
      // Solo mostrar loading en la carga inicial, no en búsquedas
      if (!space) {
        setIsLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams({
        pageNumberQueryParam: currentPage,
        pageSizeQueryParam: pageSize,
        sortByQueryParam: 'id',
      });

      if (debouncedVoiceNoteName) {
        params.append('voiceNoteNameQueryParam', debouncedVoiceNoteName);
      }

      try {
        const response = await fetch(`http://localhost:8080/api/v1/spaces/${id}/voice-notes?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSpace(data.space);
        setVoiceNotes(data.voiceNotes);

        const newPagination = {
          totalCount: parseInt(response.headers.get('X-Total-Count'), 10),
          totalPages: parseInt(response.headers.get('X-Total-Pages'), 10),
          pageNumber: parseInt(response.headers.get('X-Page-Number'), 10),
          pageSize: parseInt(response.headers.get('X-Page-Size'), 10),
        };
        setPagination(newPagination);

      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userToken && id) {
      fetchSpaceData();
    }
  }, [id, userToken, currentPage, pageSize, debouncedVoiceNoteName]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const formatDisplayName = (name, maxLength = 20) => {
    // Eliminar el hash para mostrarlo
    const cleanName = name.split('_')[0];
    if (cleanName.length <= maxLength) {
      return cleanName;
    }
    return `${cleanName.substring(0, maxLength)}...`;
  };

  const goBackToSpaces = () => {
    navigate('/spaces');
  };

  if (isLoading) {
    return <div className="loading-message">Cargando space...</div>;
  }

  if (error) {
    return (
      <div className="space-detail-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={goBackToSpaces} className="back-btn">
          Volver a Spaces
        </button>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="space-detail-container">
        <div className="error-message">Space no encontrado</div>
        <button onClick={goBackToSpaces} className="back-btn">
          Volver a Spaces
        </button>
      </div>
    );
  }

  const spaceColor = colorMap[space.colorCode] || '#ccc';

  return (
    <div className="space-detail-container">
      {/* Header del Space */}
      <div className="space-detail-header">
        <button onClick={goBackToSpaces} className="back-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Volver a Spaces
        </button>

        <div className="space-info">
          <div className="space-title-section">
            <div 
              className="space-color-indicator"
              style={{ backgroundColor: spaceColor }}
            ></div>
            <div className="space-title-content">
              <h1 className="space-title">{space.name}</h1>
              <p className="space-description">{space.description}</p>
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y paginación */}
        <div className="space-controls">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Buscar por nombre de audio..."
              value={voiceNoteNameQueryParam}
              onChange={(e) => setVoiceNoteNameQueryParam(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Lista de Voice Notes */}
      {voiceNotes.length === 0 ? (
        <div className="no-notes-message">
          <p>No hay voice notes en este space.</p>
        </div>
      ) : (
        <>
          <div className="notes-list">
            {voiceNotes.map(note => (
              <div key={note.id} className="note-row">
                <div className="note-card-header">
                  <div className="note-player-section">
                    <AudioPlayer noteId={note.id} />
                    <span className="note-duration">{note.duration}s</span>
                  </div>
                </div>
                
                <div className="note-identity">
                  <div className="note-title-section">
                    <div className="tooltip-container">
                      <h3 className="note-name">
                        {formatDisplayName(note.nombre)}
                      </h3>
                      <span className="tooltip-text">{note.nombre}</span>
                    </div>
                    <span 
                      className="note-space-name"
                      style={{ borderColor: spaceColor }}
                    >
                      {note.spaceName}
                    </span>
                  </div>
                </div>

                {note.description && (
                  <p className="note-description">{note.description}</p>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};

export default SpaceDetail;