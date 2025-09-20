
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/v1/voice-notes?pageNumberQueryParam=${currentPage}&pageSizeQueryParam=${pageSize}&sortByQueryParam=id`);
        
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
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
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

      {isLoading ? (
        <div className="loading-message">Cargando notas de voz...</div>
      ) : error ? (
        <div className="error-message">Error al cargar los datos: {error}</div>
      ) : (
        <>
          <div className="notes-list">
            {notes.map(note => (
              <div key={note.id} className="note-row">
                <AudioPlayer noteId={note.id} />
                <span className="note-name">{note.nombre}</span>
                <span className="note-space-name">{note.spaceName}</span>
                <p className="note-description">{note.description}</p>
                <span className="note-duration">{note.duration}s</span>
              </div>
            ))}
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
