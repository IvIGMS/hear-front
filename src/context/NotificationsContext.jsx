import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { userToken } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);
  const isPollingRef = useRef(false);
  
  const API_BASE_URL = 'http://localhost:8080/api/v1';

  // Función para obtener invitaciones
  const fetchInvitations = async () => {
    if (!userToken || loading) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/space-invitations`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        console.error('Error fetching invitations:', response.status);
        setError(`Error al cargar invitaciones: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Error de conexión al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar polling
  const startPolling = () => {
    if (isPollingRef.current || !userToken) return;
    
    isPollingRef.current = true;
    
    // Fetch inmediato
    fetchInvitations();
    
    // Configurar intervalo
    pollingIntervalRef.current = setInterval(() => {
      fetchInvitations();
    }, 60000); // 60 segundos
  };

  // Función para pausar polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
  };

  // Detectar cambios de visibilidad de la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pestaña no visible - pausar polling
        stopPolling();
      } else {
        // Pestaña visible - reanudar polling y fetch inmediato
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userToken]);

  // Iniciar polling cuando hay token
  useEffect(() => {
    if (userToken && !document.hidden) {
      startPolling();
    } else if (!userToken) {
      stopPolling();
      setInvitations([]);
    }

    return () => {
      stopPolling();
    };
  }, [userToken]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Función para aceptar invitación
  const acceptInvitation = async (invitationId) => {
    try {
      // Encontrar la invitación para obtener userId y spaceId
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        return { success: false, error: 'Invitación no encontrada' };
      }

      console.log('Accepting invitation:', invitation);
      
      const requestBody = {
        userId: invitation.senderUserId,
        spaceId: invitation.spaceId,
        answer: 'ACCEPTED'
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/space-invitations`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (response.status === 204 || response.ok) {
        // Actualizar lista local - remover la invitación aceptada
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        return { success: true };
      } else {
        const errorMessage = await response.text();
        console.error('Response error:', errorMessage);
        return { 
          success: false, 
          error: errorMessage || `Error aceptando invitación: ${response.status}` 
        };
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return { 
        success: false, 
        error: 'Error de conexión al aceptar invitación' 
      };
    }
  };

  // Función para rechazar invitación
  const rejectInvitation = async (invitationId) => {
    try {
      // Encontrar la invitación para obtener userId y spaceId
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) {
        return { success: false, error: 'Invitación no encontrada' };
      }

      const response = await fetch(`${API_BASE_URL}/space-invitations`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({
          userId: invitation.senderUserId,
          spaceId: invitation.spaceId,
          answer: 'REJECTED'
        })
      });

      if (response.status === 204 || response.ok) {
        // Actualizar lista local - remover la invitación rechazada
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        return { success: true };
      } else {
        const errorMessage = await response.text();
        return { 
          success: false, 
          error: errorMessage || `Error rechazando invitación: ${response.status}` 
        };
      }
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      return { 
        success: false, 
        error: 'Error de conexión al rechazar invitación' 
      };
    }
  };

  // Calcular número de invitaciones pendientes
  const pendingCount = invitations.filter(inv => inv.invitationStatus === 'PENDING').length;

  const value = {
    invitations,
    loading,
    error,
    pendingCount,
    acceptInvitation,
    rejectInvitation,
    refreshInvitations: fetchInvitations
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};