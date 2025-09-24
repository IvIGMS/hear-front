import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ColorContext';
import './UploadAudioModal.css';

const UploadAudioModal = ({ isOpen, onClose, onSuccess }) => {
  const { userToken } = useAuth();
  const { colorMap } = useColors();
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [nombre, setNombre] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [spacesOpen, setSpacesOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Cargar spaces cuando se abre el modal
  useEffect(() => {
    if (isOpen && userToken) {
      fetchSpaces();
    }
  }, [isOpen, userToken]);


  const fetchSpaces = async () => {
    setLoadingSpaces(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/spaces', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Combinar admin y member spaces sin distinción
        const allSpaces = [...data.admin, ...data.member];
        setSpaces(allSpaces);
      } else {
        setError('Error al cargar los spaces');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoadingSpaces(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      // Validar que sea un archivo de audio MP3
      if (file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.name.toLowerCase().endsWith('.mp3')) {
        setAudioFile(file);
        setError('');
      } else {
        setError('Por favor selecciona un archivo MP3 válido');
        setAudioFile(null);
      }
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!selectedSpace) {
      setError('Por favor selecciona un space');
      return;
    }
    if (!nombre.trim()) {
      setError('Por favor ingresa un nombre para el audio');
      return;
    }
    if (!description.trim()) {
      setError('Por favor ingresa una descripción');
      return;
    }
    if (!audioFile) {
      setError('Por favor selecciona un archivo de audio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const params = new URLSearchParams({
        spaceId: selectedSpace.id,
        nombre: nombre.trim(),
        description: description.trim()
      });

      const response = await fetch(`http://localhost:8080/api/v1/voice-notes?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'accept': '*/*'
        },
        body: formData
      });

      if (response.status === 204) {
        // Éxito
        onSuccess && onSuccess();
        handleClose();
      } else {
        setError('Error al subir el audio');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedSpace(null);
    setNombre('');
    setDescription('');
    setAudioFile(null);
    setError('');
    setIsDragging(false);
    setSpacesOpen(false);
    onClose();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay" onClick={handleClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="error-message">{error}</div>}

          {/* Selección de Space */}
          <div className="form-group">
            {loadingSpaces ? (
              <div className="space-selector-placeholder">Cargando spaces...</div>
            ) : (
              <div className="space-dropdown">
                <div className="selected-space" onClick={() => setSpacesOpen(!spacesOpen)}>
                  <div className="selected-space-content">
                    {selectedSpace && (
                      <div 
                        className="space-color-dot"
                        style={{ backgroundColor: colorMap[selectedSpace.colorCode] || '#ccc' }}
                      ></div>
                    )}
                    <span>{selectedSpace ? selectedSpace.name : "Seleccionar space"}</span>
                  </div>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="currentColor"
                    className={`dropdown-arrow ${spacesOpen ? 'open' : ''}`}
                  >
                    <path d="M8 10.5l-4-4h8l-4 4z"/>
                  </svg>
                </div>
                {spacesOpen && (
                  <div className="spaces-dropdown-list">
                    {spaces.map(space => (
                      <div
                        key={space.id}
                        className="space-dropdown-option"
                        onClick={() => {
                          setSelectedSpace(space);
                          setSpacesOpen(false);
                        }}
                      >
                        <div 
                          className="space-color-dot"
                          style={{ backgroundColor: colorMap[space.colorCode] || '#ccc' }}
                        ></div>
                        <span>{space.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nombre del audio */}
          <div className="form-group">
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del audio"
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del audio"
              rows="3"
            />
          </div>

          {/* Selección de archivo */}
          <div className="form-group">
            <div
              ref={dropZoneRef}
              className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${audioFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,audio/mpeg,audio/mp3"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              {audioFile ? (
                <div className="file-info">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <div>
                    <div className="file-name">{audioFile.name}</div>
                    <div className="file-size">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                  </svg>
                  <p>Arrastra tu archivo MP3 aquí o haz clic para seleccionar</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button type="button" onClick={handleClose} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Subiendo...' : 'Subir Audio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadAudioModal;