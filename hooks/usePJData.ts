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
        // Se não houver dados, inicializa com um array vazio para não apagar os dados do usuário.
        // O usuário pode importar dados ou começar do zero.
        const initialData: FormData[] = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        setData(initialData);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Em caso de erro, carrega um array vazio como fallback
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPJ = useCallback((newPJ: FormData) => {
    const updatedData = [...(data || []), newPJ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    setData(updatedData);
  }, [data]);

  const updatePJ = useCallback((updatedPJ: FormData) => {
     const updatedData = (data || []).map(pj => 
       pj.cnpj === updatedPJ.cnpj ? updatedPJ : pj
     );
     localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
     setData(updatedData);
  }, [data]);

  const importData = useCallback((importedData: FormData[]) => {
    setData(importedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
  }, []);

  return { data, loading, addPJ, updatePJ, importData };
};