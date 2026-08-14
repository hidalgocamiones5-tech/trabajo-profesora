import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useCompliance = (selectedNormativaId: string | null) => {
  const [normativas, setNormativas] = useState<any[]>([]);
  const [detalleNormativa, setDetalleNormativa] = useState<any | null>(null);
  const [empresas, setEmpresas] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de empresas
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const data = await api.getEmpresas();
        setEmpresas(data);
      } catch (err) {
        console.error('Error cargando empresas');
      }
    };
    loadEmpresas();
  }, []);

  // Cargar lista de normativas
  useEffect(() => {
    const loadNormativas = async () => {
      try {
        setIsLoading(true);
        const compliances = await api.getEmpresaCompliance();
        if (compliances && compliances.length > 0) {
          const mapped = compliances.map((c: any) => ({
            id: c.normativa?.id || c.id,
            compliance_id: c.id,
            nombre: c.normativa?.titulo || c.normativa?.nombre,
            resumen: c.normativa?.resumen || c.justificacion_ia,
            criticidad: c.normativa?.criticidad || 'media',
            estado: c.estado === 'ASIGNADA' ? 'en_tiempo' : c.estado === 'SUGERIDA_IA' ? 'en_riesgo' : 'en_tiempo',
            estado_compliance: c.estado,
            origen: c.origen === 'SMART_DISCOVERY_IA' ? 'Sugerencia Normativa' : 'Motor de Reglas (BCN)',
            origen_tipo: c.origen,
            progreso: c.porcentaje_progreso || 0,
            fechaInicio: c.normativa?.fecha_inicio || '2024-01-01',
            fechaTermino: c.normativa?.fecha_termino || '2026-12-31',
            justificacion_ia: c.justificacion_ia,
            es_sugerida_ia: c.origen === 'SMART_DISCOVERY_IA'
          }));
          setNormativas(mapped);
        } else {
          const data = await api.getNormativas();
          setNormativas(data);
        }
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
      
      // If we select a locally added mock normativa, mock its details
      if (selectedNormativaId.startsWith('mock_')) {
        const localNorm = normativas.find(n => n.id === selectedNormativaId);
        if (localNorm) {
          setDetalleNormativa({
            ...localNorm,
            checklist: [
              { id: 'c1', categoria: 'Fase Inicial', nombre: 'Revisión documental', estado: 'pendiente', responsable: 'Sin asignar' },
              { id: 'c2', categoria: 'Fase Inicial', nombre: 'Análisis de brechas', estado: 'pendiente', responsable: 'Sin asignar' }
            ],
            rat: [],
            documentos: []
          });
          return;
        }
      }

      try {
        setIsLoadingDetalle(true);
        const data = await api.getNormativaDetalle(selectedNormativaId);
        setDetalleNormativa(data);
      } catch (err) {
        setError('Error al cargar el detalle');
      } finally {
        setIsLoadingDetalle(false);
      }
    };

    loadDetalle();
  }, [selectedNormativaId]);

  const addNormativaLocal = (nuevaNormativa: any) => {
    setNormativas(prev => [nuevaNormativa, ...prev]);
  };

  const updateDetalle = (newDetalle: any) => {
    setDetalleNormativa(newDetalle);
    // Also update in list if progress changes
    if (newDetalle.progreso !== undefined) {
      setNormativas(prev => prev.map(n => n.id === newDetalle.id ? { ...n, progreso: newDetalle.progreso } : n));
    }
  };

  return {
    normativas,
    detalleNormativa,
    empresas,
    isLoading,
    isLoadingDetalle,
    error,
    addNormativaLocal,
    updateDetalle
  };
};
