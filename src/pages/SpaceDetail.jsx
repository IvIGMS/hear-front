import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ColorContext';
import AudioPlayer from '../components/AudioPlayer';
import NotFound from './NotFound';
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
          if (response.status === 404) {
            throw new Error('SPACE_NOT_FOUND');
          }
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

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
    setDeleteError(null); // Limpiar error previo
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/voice-notes/${noteToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': '*/*'
        }
      });

      if (response.status === 204) {
        // Actualización optimista - quitar de la lista
        setVoiceNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
        setDeleteModalOpen(false);
        setNoteToDelete(null);
        setDeleteError(null);
      } else if (response.status === 409) {
        // Conflict - leer string del servidor
        try {
          const errorMessage = await response.text();
          setDeleteError(errorMessage || 'No se pudo borrar el audio. Error de conflicto.');
        } catch {
          setDeleteError('No se pudo borrar el audio. Error de conflicto.');
        }
      } else {
        setDeleteError(`No se pudo borrar el audio. Error: ${response.status}`);
      }
    } catch (e) {
      console.error('Error borrando audio:', e);
      setDeleteError('Error de conexión. No se pudo borrar el audio.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setNoteToDelete(null);
    setDeleteError(null);
  };

  if (isLoading) {
    return <div className="loading-message">Cargando space...</div>;
  }

  if (error) {
    if (error === 'SPACE_NOT_FOUND') {
      return <NotFound />;
    }
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
                  <button 
                    className="delete-note-btn"
                    onClick={() => handleDeleteClick(note)}
                    title="Borrar audio"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
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

      {/* Modal de confirmación de borrado */}
      {deleteModalOpen && noteToDelete && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Borrar audio?</h3>
            <p>
              ¿Estás seguro de que quieres eliminar <strong>"{formatDisplayName(noteToDelete.nombre)}"</strong>?
              <br />
              Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <div className="delete-error-message">
                {deleteError}
              </div>
            )}
            <div className="delete-modal-actions">
              <button 
                className="delete-cancel-btn" 
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Borrando...' : 'Borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceDetail;