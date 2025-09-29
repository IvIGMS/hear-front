import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import './NotificationsModal.css';

const NotificationsModal = ({ isOpen, onClose }) => {
  const { invitations, loading, acceptInvitation, rejectInvitation } = useNotifications();
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const handleAccept = async (invitation) => {
    setProcessingId(invitation.id);
    setError(null);
    
    try {
      const result = await acceptInvitation(invitation.id);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Error inesperado al aceptar la invitación');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitation) => {
    setProcessingId(invitation.id);
    setError(null);
    
    try {
      const result = await rejectInvitation(invitation.id);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Error inesperado al rechazar la invitación');
    } finally {
      setProcessingId(null);
    }
  };

  const formatRole = (role) => {
    return role === 'ADMIN' ? 'Administrador' : 'Miembro';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay solo en mobile */}
      <div className="notifications-mobile-overlay" onClick={onClose}></div>
      <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h3>Invitaciones de Spaces</h3>
          <button className="notifications-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
            </svg>
          </button>
        </div>

        <div className="notifications-content">
          {error && (
            <div className="notifications-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="notifications-loading">
              Cargando invitaciones...
            </div>
          ) : invitations.length === 0 ? (
            <div className="notifications-empty">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              <p>No tienes invitaciones pendientes</p>
            </div>
          ) : (
            <div className="notifications-list">
              {invitations.map(invitation => (
                <div key={invitation.id} className="notification-item">
                  <div className="notification-info">
                    <div className="notification-title">
                      Invitación a Space
                    </div>
                    <div className="notification-details">
                      <span className="notification-space">{invitation.spaceName}</span>
                      <span className="notification-role">
                        como {formatRole(invitation.role)}
                      </span>
                    </div>
                    <div className="notification-sender">
                      De: {invitation.senderName} {invitation.senderLastname}
                    </div>
                  </div>

                  <div className="notification-actions">
                    <button
                      className="notification-btn accept"
                      onClick={() => handleAccept(invitation)}
                      disabled={processingId === invitation.id}
                    >
                      {processingId === invitation.id ? (
                        <span>Aceptando...</span>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                          Aceptar
                        </>
                      )}
                    </button>
                    
                    <button
                      className="notification-btn reject"
                      onClick={() => handleReject(invitation)}
                      disabled={processingId === invitation.id}
                    >
                      {processingId === invitation.id ? (
                        <span>Rechazando...</span>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                          </svg>
                          Rechazar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsModal;