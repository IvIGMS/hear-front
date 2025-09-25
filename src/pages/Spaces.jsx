import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Spaces.css';

const Spaces = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState({ admin: [], member: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminCollapsed, setAdminCollapsed] = useState(false);
  const [memberCollapsed, setMemberCollapsed] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/v1/spaces', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setSpaces(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchSpaces();
    }
  }, [userToken]);

  const navigateToSpace = (spaceId) => {
    navigate(`/space/${spaceId}`);
  };

  const handleDeleteClick = (space, event) => {
    event.stopPropagation(); // Evitar navegación al space
    setSpaceToDelete(space);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!spaceToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/spaces/${spaceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': '*/*'
        }
      });

      if (response.status === 204) {
        // Actualización optimista - quitar de la lista
        setSpaces(prevSpaces => ({
          admin: prevSpaces.admin.filter(space => space.id !== spaceToDelete.id),
          member: prevSpaces.member.filter(space => space.id !== spaceToDelete.id)
        }));
        setDeleteModalOpen(false);
        setSpaceToDelete(null);
        setDeleteError(null);
      } else if (response.status === 409) {
        // Conflict - leer string del servidor
        try {
          const errorMessage = await response.text();
          setDeleteError(errorMessage || 'No se pudo borrar el space. Error de conflicto.');
        } catch {
          setDeleteError('No se pudo borrar el space. Error de conflicto.');
        }
      } else {
        setDeleteError(`No se pudo borrar el space. Error: ${response.status}`);
      }
    } catch (e) {
      console.error('Error borrando space:', e);
      setDeleteError('Error de conexión. No se pudo borrar el space.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSpaceToDelete(null);
    setDeleteError(null);
  };

  if (loading) return <div className="loading-message">Cargando spaces...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="spaces-container">
      <div className="spaces-header">
        <h1>Spaces</h1>
      </div>
      
      {spaces.admin.length > 0 && (
        <div className="spaces-section">
          <div className="section-header">
            <h2 className="admin-title">Admin Spaces</h2>
            <button 
              className={`collapse-btn ${adminCollapsed ? 'collapsed' : ''}`}
              onClick={() => setAdminCollapsed(!adminCollapsed)}
              aria-label={adminCollapsed ? 'Expandir Admin Spaces' : 'Colapsar Admin Spaces'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 10.5l-4-4h8l-4 4z"/>
              </svg>
            </button>
          </div>
          <div className={`spaces-grid ${adminCollapsed ? 'collapsed' : ''}`}>
            {spaces.admin.map(space => (
              <div 
                key={space.id} 
                className="space-card admin-space"
                onClick={() => navigateToSpace(space.id)}
              >
                <div className="space-header">
                  <h3 className="space-name">{space.name}</h3>
                  <div className="space-header-actions">
                    <span className="space-role-badge admin">Admin</span>
                    <button 
                      className="delete-space-btn"
                      onClick={(e) => handleDeleteClick(space, e)}
                      title="Borrar space"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="space-description">{space.description}</p>
                
                <div className="space-stats">
                  <span className="voice-notes-count">
                    {space.totalVoiceNotes || 0} audios
                  </span>
                </div>
                
                {space.tags && space.tags.length > 0 && (
                  <div className="space-tags">
                    {space.tags.map((tag, index) => (
                      <span key={index} className="space-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {spaces.member.length > 0 && (
        <div className="spaces-section">
          <div className="section-header">
            <h2 className="member-title">Member Spaces</h2>
            <button 
              className={`collapse-btn ${memberCollapsed ? 'collapsed' : ''}`}
              onClick={() => setMemberCollapsed(!memberCollapsed)}
              aria-label={memberCollapsed ? 'Expandir Member Spaces' : 'Colapsar Member Spaces'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 10.5l-4-4h8l-4 4z"/>
              </svg>
            </button>
          </div>
          <div className={`spaces-grid ${memberCollapsed ? 'collapsed' : ''}`}>
            {spaces.member.map(space => (
              <div 
                key={space.id} 
                className="space-card member-space"
                onClick={() => navigateToSpace(space.id)}
              >
                <div className="space-header">
                  <h3 className="space-name">{space.name}</h3>
                  <div className="space-header-actions">
                    <span className="space-role-badge member">Member</span>
                    <button 
                      className="delete-space-btn"
                      onClick={(e) => handleDeleteClick(space, e)}
                      title="Borrar space"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="space-description">{space.description}</p>
                
                <div className="space-stats">
                  <span className="voice-notes-count">
                    {space.totalVoiceNotes || 0} audios
                  </span>
                </div>
                
                {space.tags && space.tags.length > 0 && (
                  <div className="space-tags">
                    {space.tags.map((tag, index) => (
                      <span key={index} className="space-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {spaces.admin.length === 0 && spaces.member.length === 0 && (
        <div className="no-spaces-message">
          <p>No tienes spaces disponibles.</p>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {deleteModalOpen && spaceToDelete && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>¿Borrar space?</h3>
            <p>
              ¿Estás seguro de que quieres eliminar el space <strong>"{spaceToDelete.name}"</strong>?
              <br />
              Esta acción no se puede deshacer y borrará todos los audios del space.
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
                {isDeleting ? 'Borrando...' : 'Borrar Space'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spaces;