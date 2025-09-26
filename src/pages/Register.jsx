
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname,
          role: 'USER' // Hardcoded como pediste
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al crear la cuenta');
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        login(token); // Guardar token en el contexto
        navigate('/'); // Redirigir al home
      } else {
        throw new Error('No se recibió un token del servidor');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Crear Cuenta</h2>
          
          <div className="form-group">
            <label htmlFor="firstname">Nombre</label>
            <input 
              type="text" 
              id="firstname" 
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastname">Apellidos</label>
            <input 
              type="text" 
              id="lastname" 
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required 
              className={confirmPassword && password !== confirmPassword ? 'password-mismatch' : ''}
            />
            {confirmPassword && password !== confirmPassword && (
              <span className="password-error">Las contraseñas no coinciden</span>
            )}
          </div>
          
          {error && <p className="error-message-form">{error}</p>}
          
          <button type="submit" className="register-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
          
          <div className="form-links">
            <Link to="/login" className="login-link">¿Ya tienes cuenta? Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
