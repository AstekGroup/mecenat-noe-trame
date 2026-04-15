import { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, ProjectType, ProjectsGeoJSON } from '@/types/project';
import { fetchProjects, fetchNatura2000, projectsToGeoJSON } from '@/services/api';

export interface ProjectFilters {
  search: string;
  regions: string[];
  types: ProjectType[];
  postalCode: string;
  showNatura2000: boolean;
  showRegions: boolean;
  showDepartments: boolean;
  showEPCI: boolean;
  showCommunes: boolean;
}

const initialFilters: ProjectFilters = {
  search: '',
  regions: [],
  types: [],
  postalCode: '',
  showNatura2000: false,
  showRegions: false,
  showDepartments: false,
  showEPCI: false,
  showCommunes: false,
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [natura2000Data, setNatura2000Data] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters);
  const [devMode, setDevMode] = useState(false);

  // Charger les projets depuis le backend
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProjects(devMode);
        setProjects(data);
      } catch (err) {
        console.error('[useProjects] Erreur lors du chargement:', err);
        setError(err instanceof Error ? err : new Error('Erreur lors du chargement des projets'));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [devMode]);

  // Charger les données Natura 2000 si le filtre est activé et qu'on ne les a pas encore
  useEffect(() => {
    if (filters.showNatura2000 && !natura2000Data) {
      const loadNatura2000 = async () => {
        try {
          const data = await fetchNatura2000();
          setNatura2000Data(data);
        } catch (err) {
          console.error('[useProjects] Erreur lors du chargement Natura 2000:', err);
        }
      };
      loadNatura2000();
    }
  }, [filters.showNatura2000, natura2000Data]);

  // Filtrer les projets
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filtre recherche
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.city.toLowerCase().includes(searchLower) ||
          project.owner.toLowerCase().includes(searchLower) ||
          project.region.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtre modalité - si applicable aux projets
      // On le garde pour compatibilité ou l'enlever s'il n'est plus pertinent
      // Pour l'instant on omet si la propriété n'est pas sur Project
      // Wait, let's just comment it out if 'modality' is not in Project definition
      

      // Filtre régions
      if (filters.regions.length > 0 && !filters.regions.includes(project.region)) return false;

      // Filtre types
      if (filters.types.length > 0 && !filters.types.includes(project.type)) return false;

      // Filtre code postal
      if (filters.postalCode) {
        const postalCodeFilter = filters.postalCode.trim();
        if (!project.postalCode.startsWith(postalCodeFilter)) return false;
      }

      return true;
    });
  }, [projects, filters]);

  // Convertir en GeoJSON (exclut automatiquement les projets sans coordonnées)
  const geojson: ProjectsGeoJSON = useMemo(() => {
    return projectsToGeoJSON(filteredProjects);
  }, [filteredProjects]);

  // Actions sur les filtres
  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const toggleRegion = (region: string) => {
    setFilters(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }));
  };

  const toggleType = (type: ProjectType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  };

  // Toggle mode dev (afficher tous les projets vs validés seulement)
  const toggleDevMode = useCallback(() => {
    setDevMode(prev => !prev);
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: projects.length,
    filtered: filteredProjects.length,
    byType: Object.fromEntries(
      ([
        'pratiques-raisonnees',
        'renaturation-restauration',
        'sensibilisation',
        'formation',
        'consultation',
        'suivis',
      ] as ProjectType[]).map(type => [
        type,
        filteredProjects.filter(e => e.type === type).length,
      ])
    ) as Record<ProjectType, number>,
    byRegion: Object.fromEntries(
      [...new Set(projects.map(e => e.region))].map(region => [
        region,
        filteredProjects.filter(e => e.region === region).length,
      ])
    ) as Record<string, number>,
  }), [projects, filteredProjects]);

  return {
    projects: filteredProjects,
    allProjects: projects,
    geojson,
    natura2000Data,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    toggleRegion,
    toggleType,
    stats,
    devMode,
    toggleDevMode,
  };
}
