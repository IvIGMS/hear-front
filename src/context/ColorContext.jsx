
import { createContext, useState, useEffect, useContext } from 'react';

const ColorContext = createContext(null);

export const ColorProvider = ({ children }) => {
  const [colorMap, setColorMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await fetch('/api/v1/colors');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const colors = await response.json();
        
        // Transformar el array en un mapa para búsqueda O(1)
        const newColorMap = colors.reduce((acc, color) => {
          acc[color.code] = color.hexCode;
          return acc;
        }, {});

        setColorMap(newColorMap);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColors();
  }, []); // El array vacío asegura que se ejecute solo una vez

  const value = { colorMap, isLoading, error };

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => {
  const context = useContext(ColorContext);
  if (context === null) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
};
