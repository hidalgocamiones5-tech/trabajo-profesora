import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DashboardMetrics } from '../services/api';
import type { TareaPendiente } from '../types';

export const useDashboard = (filters: { responsable: string, prioridad: string, estado: string }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tareas, setTareas] = useState<TareaPendiente[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingTareas, setIsLoadingTareas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar KPIs generales y lista de responsables una sola vez
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingMetrics(true);
        const [metricsData, assigneesData] = await Promise.all([
          api.getDashboardMetrics(),
          api.getAssignees()
        ]);
        setMetrics(metricsData);
        setAssignees(assigneesData);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadInitialData();
  }, []);

  const loadTareas = async () => {
    try {
      setIsLoadingTareas(true);
      const tareasData = await api.getTareas(filters);
      setTareas(tareasData);
    } catch (err) {
      setError('Error al cargar las tareas');
    } finally {
      setIsLoadingTareas(false);
    }
  };

  // Recargar tareas cada vez que cambien los filtros
  useEffect(() => {
    loadTareas();
  }, [filters.responsable, filters.prioridad, filters.estado]);

  return {
    metrics,
    tareas,
    assignees,
    isLoadingMetrics,
    isLoadingTareas,
    error,
    refreshTareas: loadTareas
  };
};
