
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setUserToken(storedToken);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    setUserToken(token);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUserToken(null);
  };

  const isAuthenticated = !!userToken;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
