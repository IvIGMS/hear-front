
import { useState, useEffect } from 'react';
import { useColors } from '../context/ColorContext'; // Importar el hook de colores
import AudioPlayer from '../components/AudioPlayer';
import Pagination from '../components/Pagination';
import PageSizeSelector from '../components/PageSizeSelector';
import './Home.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);

  const { colorMap } = useColors(); // Usar el contexto de colores

  // Estados para los campos de búsqueda
  const [voiceNoteNameQueryParam, setVoiceNoteNameQueryParam] = useState('');
  const [spaceNameQueryParam, setSpaceNameQueryParam] = useState('');

  // Estados para el debouncing
  const [debouncedVoiceNoteName, setDebouncedVoiceNoteName] = useState(voiceNoteNameQueryParam);
  const [debouncedSpaceName, setDebouncedSpaceName] = useState(spaceNameQueryParam);

  // Efecto para el debouncing de los inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVoiceNoteName(voiceNoteNameQueryParam);
      setDebouncedSpaceName(spaceNameQueryParam);
      setCurrentPage(1); // Resetear a la primera página en cada búsqueda
    }, 500); // 500ms de delay

    return () => {
      clearTimeout(handler);
    };
  }, [voiceNoteNameQueryParam, spaceNameQueryParam]);


  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        pageNumberQueryParam: currentPage,
        pageSizeQueryParam: pageSize,
        sortByQueryParam: 'id',
      });

      if (debouncedVoiceNoteName) {
        params.append('voiceNoteNameQueryParam', debouncedVoiceNoteName);
      }
      if (debouncedSpaceName) {
        params.append('spaceNameQueryParam', debouncedSpaceName);
      }

      try {
        const response = await fetch(`/api/v1/voice-notes?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setNotes(data);

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

    fetchNotes();
  }, [currentPage, pageSize, debouncedVoiceNoteName, debouncedSpaceName]);

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

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Mis Notas de Voz</h1>
        <PageSizeSelector 
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          options={[5, 10, 25]}
        />
      </div>

      {/* Controles de filtros - cabecera de las tarjetas */}
      <div className="notes-controls">
        <div className="filters-section">
          <div className="filters-header" onClick={() => setFiltersCollapsed(!filtersCollapsed)}>
            <h3 className="filters-title">Filtros</h3>
            <button 
              className={`filters-collapse-btn ${filtersCollapsed ? 'collapsed' : ''}`}
              aria-label={filtersCollapsed ? 'Expandir filtros' : 'Colapsar filtros'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 10.5l-4-4h8l-4 4z"/>
              </svg>
            </button>
          </div>
          <div className={`filters-content ${filtersCollapsed ? 'collapsed' : ''}`}>
            <div className="search-controls">
              <input
                type="text"
                placeholder="Buscar por nombre de audio..."
                value={voiceNoteNameQueryParam}
                onChange={(e) => setVoiceNoteNameQueryParam(e.target.value)}
                className="search-input"
              />
              <input
                type="text"
                placeholder="Buscar por nombre de espacio..."
                value={spaceNameQueryParam}
                onChange={(e) => setSpaceNameQueryParam(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-message">Cargando notas de voz...</div>
      ) : error ? (
        <div className="error-message">Error al cargar los datos: {error}</div>
      ) : (
        <>
          <div className="notes-list">
            {notes.map(note => {
              const spaceColor = colorMap[note.codeSpaceColor] || '#ccc'; // Color por defecto

              return (
                <div key={note.id} className="note-row">
                  <div className="note-card-header">
                    <div className="note-player-section">
                      <AudioPlayer 
                        noteId={note.id}
                        noteName={note.nombre}
                        spaceName={note.spaceName}
                      />
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
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
