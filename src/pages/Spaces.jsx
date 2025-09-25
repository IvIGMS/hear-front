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
                  <span className="space-role-badge admin">Admin</span>
                </div>
                <p className="space-description">{space.description}</p>
                <div className="space-id">ID: {space.id}</div>
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
                  <span className="space-role-badge member">Member</span>
                </div>
                <p className="space-description">{space.description}</p>
                <div className="space-id">ID: {space.id}</div>
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
    </div>
  );
};

export default Spaces;