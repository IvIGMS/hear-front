
import './Register.css';

const Register = () => {
  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <form className="register-form">
          <h2>Crear Cuenta</h2>
          
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input type="text" id="name" name="name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" required />
          </div>
          
          <button type="submit" className="register-btn">
            Crear Cuenta
          </button>
          
          <div className="form-links">
            <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
