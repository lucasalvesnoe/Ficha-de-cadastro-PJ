import { useState, useEffect, useCallback } from 'react';
import { FormData } from '../types';
import { mockPJData } from '../utils/mockData';

const STORAGE_KEY = 'pj_cadastros';

export const usePJData = () => {
  const [data, setData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        // Se não houver dados, inicializa com os dados mockados
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPJData));
        setData(mockPJData);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Em caso de erro, carrega os dados mockados como fallback
      setData(mockPJData);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPJ = useCallback((newPJ: FormData) => {
    const updatedData = [...data, newPJ];
    setData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  }, [data]);

  const updatePJ = useCallback((updatedPJ: FormData) => {
    const updatedData = data.map(pj => 
      pj.cnpj === updatedPJ.cnpj ? updatedPJ : pj
    );
    setData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  }, [data]);

  return { data, loading, addPJ, updatePJ };
};
