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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [spaceToInvite, setSpaceToInvite] = useState(null);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [isInviting, setIsInviting] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [spaceToRemoveFrom, setSpaceToRemoveFrom] = useState(null);
  const [availableUsersToRemove, setAvailableUsersToRemove] = useState([]);
  const [filteredUsersToRemove, setFilteredUsersToRemove] = useState([]);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState(null);
  const [userRemoveSearch, setUserRemoveSearch] = useState('');
  const [loadingUsersToRemove, setLoadingUsersToRemove] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActionsSpace, setMobileActionsSpace] = useState(null);
  const [mobileModalClosing, setMobileModalClosing] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuOpen && !event.target.closest('.space-actions-container')) {
        setActionsMenuOpen(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [actionsMenuOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleCreateClick = () => {
    setCreateModalOpen(true);
    setCreateError(null);
    setNewSpaceName('');
    setNewSpaceDescription('');
  };

  const handleCreateConfirm = async () => {
    if (!newSpaceName.trim()) {
      setCreateError('El nombre del space es obligatorio');
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const response = await fetch('http://localhost:8080/api/v1/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newSpaceName.trim(),
          description: newSpaceDescription.trim() || undefined
        })
      });

      if (response.status === 201) {
        const newSpace = await response.json();
        setSpaces(prevSpaces => ({
          admin: [newSpace, ...prevSpaces.admin],
          member: prevSpaces.member
        }));
        setCreateModalOpen(false);
        setNewSpaceName('');
        setNewSpaceDescription('');
        setCreateError(null);
      } else {
        const errorMessage = await response.text();
        setCreateError(errorMessage || `Error creando space: ${response.status}`);
      }
    } catch (e) {
      console.error('Error creando space:', e);
      setCreateError('Error de conexión. No se pudo crear el space.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setCreateModalOpen(false);
    setNewSpaceName('');
    setNewSpaceDescription('');
    setCreateError(null);
  };

  const handleActionsClick = (spaceId, event) => {
    event.stopPropagation();
    if (isMobile) {
      const space = [...spaces.admin, ...spaces.member].find(s => s.id === spaceId);
      setMobileActionsSpace(space);
    } else {
      setActionsMenuOpen(actionsMenuOpen === spaceId ? null : spaceId);
    }
  };

  const handleMobileActionsCancel = () => {
    setMobileModalClosing(true);
    setTimeout(() => {
      setMobileActionsSpace(null);
      setMobileModalClosing(false);
    }, 300); // Duración de la animación
  };

  const handleInviteClick = (space, event) => {
    event.stopPropagation();
    setSpaceToInvite(space);
    setInviteModalOpen(true);
    setActionsMenuOpen(null);
    if (isMobile && mobileActionsSpace) {
      handleMobileActionsCancel();
    } else {
      setMobileActionsSpace(null);
    }
    fetchAvailableUsers(space.id);
  };

  const fetchAvailableUsers = async (spaceId) => {
    setLoadingUsers(true);
    setInviteError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/users/${spaceId}/can-be-invited`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setAvailableUsers(users);
        setFilteredUsers(users);
      } else {
        const errorMessage = await response.text();
        setInviteError(errorMessage || `Error al cargar usuarios: ${response.status}`);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setInviteError('Error de conexión. No se pudieron cargar los usuarios.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!userSearch.trim()) {
        setFilteredUsers(availableUsers);
      } else {
        const filtered = availableUsers.filter(user => 
          user.firstname.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.lastname.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearch, availableUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!userRemoveSearch.trim()) {
        setFilteredUsersToRemove(availableUsersToRemove);
      } else {
        const filtered = availableUsersToRemove.filter(user => 
          user.firstname.toLowerCase().includes(userRemoveSearch.toLowerCase()) ||
          user.lastname.toLowerCase().includes(userRemoveSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userRemoveSearch.toLowerCase())
        );
        setFilteredUsersToRemove(filtered);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userRemoveSearch, availableUsersToRemove]);

  const handleInviteCancel = () => {
    setInviteModalOpen(false);
    setSpaceToInvite(null);
    setSelectedUser(null);
    setSelectedRole('MEMBER');
    setUserSearch('');
    setAvailableUsers([]);
    setFilteredUsers([]);
    setInviteError(null);
  };

  const handleInviteConfirm = async () => {
    if (!selectedUser) {
      setInviteError('Por favor selecciona un usuario');
      return;
    }

    setIsInviting(true);
    setInviteError(null);
    try {
      const response = await fetch('http://localhost:8080/api/v1/spaces/invitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          spaceId: spaceToInvite.id,
          role: selectedRole
        })
      });

      if (response.ok) {
        const invitation = await response.json();
        console.log('Invitación enviada:', invitation);
        handleInviteCancel();
        // TODO: Mostrar mensaje de éxito o actualizar lista
      } else {
        const errorMessage = await response.text();
        setInviteError(errorMessage || `Error enviando invitación: ${response.status}`);
      }
    } catch (err) {
      console.error('Error enviando invitación:', err);
      setInviteError('Error de conexión. No se pudo enviar la invitación.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteClickFromMenu = (space, event) => {
    event.stopPropagation();
    setSpaceToDelete(space);
    setDeleteModalOpen(true);
    setDeleteError(null);
    setActionsMenuOpen(null);
    if (isMobile && mobileActionsSpace) {
      handleMobileActionsCancel();
    } else {
      setMobileActionsSpace(null);
    }
  };

  const handleRemoveUserClick = (space, event) => {
    event.stopPropagation();
    setSpaceToRemoveFrom(space);
    setRemoveModalOpen(true);
    setActionsMenuOpen(null);
    if (isMobile && mobileActionsSpace) {
      handleMobileActionsCancel();
    } else {
      setMobileActionsSpace(null);
    }
    fetchUsersToRemove(space.id);
  };

  const fetchUsersToRemove = async (spaceId) => {
    setLoadingUsersToRemove(true);
    setRemoveError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/users/${spaceId}/can-be-deleted`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setAvailableUsersToRemove(users);
        setFilteredUsersToRemove(users);
      } else {
        const errorMessage = await response.text();
        setRemoveError(errorMessage || `Error al cargar usuarios: ${response.status}`);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setRemoveError('Error de conexión. No se pudieron cargar los usuarios.');
    } finally {
      setLoadingUsersToRemove(false);
    }
  };

  const handleRemoveCancel = () => {
    setRemoveModalOpen(false);
    setSpaceToRemoveFrom(null);
    setSelectedUserToRemove(null);
    setUserRemoveSearch('');
    setAvailableUsersToRemove([]);
    setFilteredUsersToRemove([]);
    setRemoveError(null);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedUserToRemove) {
      setRemoveError('Por favor selecciona un usuario');
      return;
    }

    setIsRemoving(true);
    setRemoveError(null);
    try {
      const response = await fetch('http://localhost:8080/api/v1/spaces/user-space-role', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUserToRemove.id,
          spaceId: spaceToRemoveFrom.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Usuario eliminado del space:', result);
        handleRemoveCancel();
        // TODO: Actualizar la lista de spaces o mostrar mensaje de éxito
      } else {
        const errorMessage = await response.text();
        setRemoveError(errorMessage || `Error eliminando usuario: ${response.status}`);
      }
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      setRemoveError('Error de conexión. No se pudo eliminar el usuario.');
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading) return <div className="loading-message">Cargando spaces...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="spaces-container">
      <div className="spaces-header">
        <h1>Spaces</h1>
      </div>
      
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
                    <div className="space-actions-container">
                      <button 
                        className="space-actions-btn"
                        onClick={(e) => handleActionsClick(space.id, e)}
                        title="Acciones del space"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                        </svg>
                      </button>
                      
                      {actionsMenuOpen === space.id && !isMobile && (
                        <div className="space-actions-menu">
                          <div 
                            className="space-action-item"
                            onClick={(e) => handleDeleteClickFromMenu(space, e)}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                            Eliminar space
                          </div>
                          <div 
                            className="space-action-item"
                            onClick={(e) => handleInviteClick(space, e)}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/>
                              <path d="M14 6a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 14 6Zm0-3a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 14 3Zm0 6a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5Z"/>
                            </svg>
                            Añadir usuario
                          </div>
                          <div 
                            className="space-action-item"
                            onClick={(e) => handleRemoveUserClick(space, e)}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                              <path d="M9.854 6.146a.5.5 0 0 1 0 .708L8.707 8l1.147 1.146a.5.5 0 0 1-.708.708L8 8.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 8 6.146 6.854a.5.5 0 1 1 .708-.708L8 7.293l1.146-1.147a.5.5 0 0 1 .708 0z"/>
                            </svg>
                            Eliminar usuario
                          </div>
                        </div>
                      )}
                    </div>
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
            <div 
              className="space-card create-space-card"
              onClick={handleCreateClick}
            >
              <div className="create-space-content">
                <div className="create-space-icon">
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </div>
                <h3 className="create-space-title">Crear Space</h3>
              </div>
            </div>
          </div>
        </div>

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
          <p>Aún no tienes spaces. ¡Crea tu primer space usando el botón de arriba!</p>
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

      {/* Modal de creación de space */}
      {createModalOpen && (
        <div className="delete-modal-overlay" onClick={handleCreateCancel}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Crear nuevo Space</h3>
            <div className="create-space-form">
              <div className="form-group">
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="Nombre del space *"
                  className="create-space-input"
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <textarea
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  placeholder="Descripción del space (opcional)"
                  className="create-space-textarea"
                  maxLength={200}
                  rows={3}
                />
              </div>
            </div>
            {createError && (
              <div className="delete-error-message">
                {createError}
              </div>
            )}
            <div className="delete-modal-actions">
              <button 
                className="delete-cancel-btn" 
                onClick={handleCreateCancel}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button 
                className="create-confirm-btn" 
                onClick={handleCreateConfirm}
                disabled={isCreating || !newSpaceName.trim()}
              >
                {isCreating ? 'Creando...' : 'Crear Space'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de invitación de usuario */}
      {inviteModalOpen && spaceToInvite && (
        <div className="delete-modal-overlay" onClick={handleInviteCancel}>
          <div className="delete-modal-content invite-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Invitar usuario a "{spaceToInvite.name}"</h3>
            
            <div className="invite-form">
              {/* Buscador de usuarios */}
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="user-search-input"
                />
              </div>

              {/* Usuario seleccionado o Lista de usuarios */}
              {selectedUser ? (
                <div className="selected-user-container">
                  <div className="selected-user-item">
                    <div className="user-info">
                      <div className="user-name">{selectedUser.firstname} {selectedUser.lastname}</div>
                      <div className="user-email">{selectedUser.email}</div>
                    </div>
                    <button
                      type="button"
                      className="change-user-btn"
                      onClick={() => setSelectedUser(null)}
                      title="Cambiar usuario"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="users-list-container">
                  {loadingUsers ? (
                    <div className="loading-users">Cargando usuarios...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="no-users">
                      {userSearch ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios disponibles para invitar'}
                    </div>
                  ) : (
                    <div className="users-list">
                      {filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className="user-item"
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="user-info">
                            <div className="user-name">{user.firstname} {user.lastname}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selector de rol */}
              {selectedUser && (
                <div className="form-group">
                  <label>Rol en el space:</label>
                  <div className="role-toggle-container">
                    <button
                      type="button"
                      className={`role-toggle-btn ${selectedRole === 'MEMBER' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('MEMBER')}
                    >
                      Miembro
                    </button>
                    <button
                      type="button"
                      className={`role-toggle-btn ${selectedRole === 'ADMIN' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('ADMIN')}
                    >
                      Administrador
                    </button>
                  </div>
                </div>
              )}
            </div>

            {inviteError && <div className="delete-error-message">{inviteError}</div>}
            
            <div className="delete-modal-actions">
              <button 
                className="delete-cancel-btn" 
                onClick={handleInviteCancel}
                disabled={isInviting}
              >
                Cancelar
              </button>
              <button 
                className="create-confirm-btn" 
                onClick={handleInviteConfirm}
                disabled={isInviting || !selectedUser}
              >
                {isInviting ? 'Enviando...' : 'Enviar Invitación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminar usuario */}
      {removeModalOpen && spaceToRemoveFrom && (
        <div className="delete-modal-overlay" onClick={handleRemoveCancel}>
          <div className="delete-modal-content invite-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar usuario de "{spaceToRemoveFrom.name}"</h3>
            
            <div className="invite-form">
              {/* Buscador de usuarios - solo si hay usuarios disponibles */}
              {!loadingUsersToRemove && availableUsersToRemove.length > 0 && (
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre o email..."
                    value={userRemoveSearch}
                    onChange={(e) => setUserRemoveSearch(e.target.value)}
                    className="user-search-input"
                  />
                </div>
              )}

              {/* Usuario seleccionado o Lista de usuarios */}
              {selectedUserToRemove ? (
                <div className="selected-user-container">
                  <div className="selected-user-item">
                    <div className="user-info">
                      <div className="user-name">{selectedUserToRemove.firstname} {selectedUserToRemove.lastname}</div>
                      <div className="user-email">{selectedUserToRemove.email}</div>
                    </div>
                    <button
                      type="button"
                      className="change-user-btn"
                      onClick={() => setSelectedUserToRemove(null)}
                      title="Cambiar usuario"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="users-list-container">
                  {loadingUsersToRemove ? (
                    <div className="loading-users">Cargando usuarios...</div>
                  ) : filteredUsersToRemove.length === 0 ? (
                    <div className="no-users">
                      {userRemoveSearch ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios disponibles para eliminar'}
                    </div>
                  ) : (
                    <div className="users-list">
                      {filteredUsersToRemove.map(user => (
                        <div
                          key={user.id}
                          className="user-item"
                          onClick={() => setSelectedUserToRemove(user)}
                        >
                          <div className="user-info">
                            <div className="user-name">{user.firstname} {user.lastname}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {removeError && <div className="delete-error-message">{removeError}</div>}
            
            <div className="delete-modal-actions">
              <button 
                className="delete-cancel-btn" 
                onClick={handleRemoveCancel}
                disabled={isRemoving}
              >
                Cancelar
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={handleRemoveConfirm}
                disabled={isRemoving || !selectedUserToRemove}
              >
                {isRemoving ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de acciones para móvil */}
      {mobileActionsSpace && isMobile && (
        <div className="mobile-modal-overlay" onClick={handleMobileActionsCancel}>
          <div className={`mobile-actions-modal ${mobileModalClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <h3>Acciones para "{mobileActionsSpace.name}"</h3>
            
            <div className="mobile-actions-list">
              <button 
                className="mobile-action-btn delete-action"
                onClick={(e) => handleDeleteClickFromMenu(mobileActionsSpace, e)}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
                Eliminar space
              </button>
              
              <button 
                className="mobile-action-btn invite-action"
                onClick={(e) => handleInviteClick(mobileActionsSpace, e)}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/>
                  <path d="M14 6a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 14 6Zm0-3a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 14 3Zm0 6a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5Z"/>
                </svg>
                Añadir usuario
              </button>
              
              <button 
                className="mobile-action-btn remove-action"
                onClick={(e) => handleRemoveUserClick(mobileActionsSpace, e)}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                  <path d="M9.854 6.146a.5.5 0 0 1 0 .708L8.707 8l1.147 1.146a.5.5 0 0 1-.708.708L8 8.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 8 6.146 6.854a.5.5 0 1 1 .708-.708L8 7.293l1.146-1.147a.5.5 0 0 1 .708 0z"/>
                </svg>
                Eliminar usuario
              </button>
            </div>
            
            <button 
              className="mobile-actions-cancel"
              onClick={handleMobileActionsCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spaces;