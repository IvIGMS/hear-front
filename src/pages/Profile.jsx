import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { userToken } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userToken) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8080/api/v1/users', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        } else {
          setError(`Error al cargar información del usuario: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Error de conexión. No se pudo cargar la información del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userToken]);

  if (loading) return <div className="loading-message">Cargando información del usuario...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!userInfo) return <div className="error-message">No se encontró información del usuario</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Perfil</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor" className="profile-avatar-icon">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
          </div>
          
          <div className="profile-info">
            <div className="profile-field">
              <label>Nombre</label>
              <p>{userInfo.firstname}</p>
            </div>
            
            <div className="profile-field">
              <label>Apellido</label>
              <p>{userInfo.lastname}</p>
            </div>
            
            <div className="profile-field">
              <label>Email</label>
              <p>{userInfo.email}</p>
            </div>
            
            <div className="profile-field">
              <label>Tipo de cuenta *</label>
              <p className={`tier-badge ${userInfo.tier.toLowerCase()}`}>
                {userInfo.tier === 'FREE' ? 'Gratuita' : userInfo.tier}
              </p>
            </div>
          </div>
          
          <div className="profile-note">
            <p>* El tipo de cuenta determina las funcionalidades y límites disponibles en la plataforma.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;