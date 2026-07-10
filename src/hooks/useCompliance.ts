import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

export const useCompliance = (selectedNormativaId: string | null) => {
  const [normativas, setNormativas] = useState<any[]>([]);
  const [detalleNormativa, setDetalleNormativa] = useState<any | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de normativas
  useEffect(() => {
    const loadNormativas = async () => {
      try {
        setIsLoading(true);
        const data = await mockApi.getNormativas();
        setNormativas(data);
      } catch (err) {
        setError('Error al cargar normativas');
      } finally {
        setIsLoading(false);
      }
    };

    if (!selectedNormativaId) {
      loadNormativas();
    }
  }, [selectedNormativaId]);

  // Cargar detalle cuando se selecciona una
  useEffect(() => {
    const loadDetalle = async () => {
      if (!selectedNormativaId) return;
      
      try {
        setIsLoadingDetalle(true);
        const data = await mockApi.getNormativaDetalle(selectedNormativaId);
        setDetalleNormativa(data);
      } catch (err) {
        setError('Error al cargar el detalle');
      } finally {
        setIsLoadingDetalle(false);
      }
    };

    loadDetalle();
  }, [selectedNormativaId]);

  return {
    normativas,
    detalleNormativa,
    isLoading,
    isLoadingDetalle,
    error
  };
};
