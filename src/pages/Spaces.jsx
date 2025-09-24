import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Spaces.css';

const Spaces = () => {
  const { userToken } = useAuth();
  const [spaces, setSpaces] = useState({ admin: [], member: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="loading-message">Cargando spaces...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="spaces-container">
      <div className="spaces-header">
        <h1>Spaces</h1>
      </div>
      
      {spaces.admin.length > 0 && (
        <div className="spaces-section">
          <h2 className="admin-title">Admin Spaces</h2>
          <div className="spaces-grid">
            {spaces.admin.map(space => (
              <div key={space.id} className="space-card admin-space">
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
          <h2 className="member-title">Member Spaces</h2>
          <div className="spaces-grid">
            {spaces.member.map(space => (
              <div key={space.id} className="space-card member-space">
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