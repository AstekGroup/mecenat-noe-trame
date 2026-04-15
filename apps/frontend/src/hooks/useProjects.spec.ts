import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';
import * as api from '@/services/api';
import type { Project, ProjectType } from '@/types/project';

vi.mock('@/services/api');

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'rec1',
    title: 'Projet Nature',
    description: 'Description',
    address: '1 rue Test',
    city: 'Paris',
    region: 'Île-de-France',
    department: 'Paris',
    postalCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    type: 'renaturation-restauration' as ProjectType,
    owner: 'Org Test',
    ...overrides,
  };
}

describe('useProjects', () => {
  beforeEach(() => {
    vi.mocked(api.fetchProjects).mockResolvedValue([]);
    vi.mocked(api.projectsToGeoJSON).mockReturnValue({ type: 'FeatureCollection', features: [] });
  });

  it('charge les projets au montage', async () => {
    const projects = [makeProject()];
    vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.fetchProjects).toHaveBeenCalledWith(false);
    expect(result.current.allProjects).toEqual(projects);
  });

  it('gère les erreurs de chargement', async () => {
    vi.mocked(api.fetchProjects).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Network error');
  });

  describe('filtres', () => {
    it('filtre par recherche textuelle (titre)', async () => {
      const projects = [
        makeProject({ id: 'a', title: 'Restauration Haies' }),
        makeProject({ id: 'b', title: 'Jardin Partagé' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.updateFilters({ search: 'Haies' });
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe('Restauration Haies');
    });

    it('filtre par recherche textuelle (ville)', async () => {
      const projects = [
        makeProject({ id: 'a', city: 'Paris' }),
        makeProject({ id: 'b', city: 'Lyon' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.updateFilters({ search: 'Lyon' });
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].city).toBe('Lyon');
    });

    it('filtre par région via toggleRegion', async () => {
      const projects = [
        makeProject({ id: 'a', region: 'Île-de-France' }),
        makeProject({ id: 'b', region: 'Bretagne' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.toggleRegion('Bretagne');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].region).toBe('Bretagne');
    });

    it('toggleRegion déselectionne une région déjà sélectionnée', async () => {
      const projects = [
        makeProject({ id: 'a', region: 'Île-de-France' }),
        makeProject({ id: 'b', region: 'Bretagne' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => { result.current.toggleRegion('Bretagne'); });
      act(() => { result.current.toggleRegion('Bretagne'); });

      expect(result.current.projects).toHaveLength(2);
    });

    it('filtre par type via toggleType', async () => {
      const projects = [
        makeProject({ id: 'a', type: 'renaturation-restauration' }),
        makeProject({ id: 'b', type: 'sensibilisation' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.toggleType('sensibilisation');
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].type).toBe('sensibilisation');
    });

    it('filtre par code postal', async () => {
      const projects = [
        makeProject({ id: 'a', postalCode: '75001' }),
        makeProject({ id: 'b', postalCode: '69001' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.updateFilters({ postalCode: '75' });
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].postalCode).toBe('75001');
    });

    it('resetFilters réinitialise tous les filtres', async () => {
      const projects = [
        makeProject({ id: 'a', type: 'renaturation-restauration' }),
        makeProject({ id: 'b', type: 'sensibilisation' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => { result.current.toggleType('sensibilisation'); });
      expect(result.current.projects).toHaveLength(1);

      act(() => { result.current.resetFilters(); });
      expect(result.current.projects).toHaveLength(2);
    });
  });

  describe('stats', () => {
    it('calcule les stats totales et filtrées', async () => {
      const projects = [
        makeProject({ id: 'a', type: 'renaturation-restauration' }),
        makeProject({ id: 'b', type: 'sensibilisation' }),
        makeProject({ id: 'c', type: 'renaturation-restauration' }),
      ];
      vi.mocked(api.fetchProjects).mockResolvedValueOnce(projects);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.stats.total).toBe(3);
      expect(result.current.stats.filtered).toBe(3);
      expect(result.current.stats.byType['renaturation-restauration']).toBe(2);
      expect(result.current.stats.byType['sensibilisation']).toBe(1);
    });
  });

  describe('devMode', () => {
    it('toggleDevMode change l\'état et recharge les projets', async () => {
      vi.mocked(api.fetchProjects).mockResolvedValue([]);

      const { result } = renderHook(() => useProjects());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => { result.current.toggleDevMode(); });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(api.fetchProjects).toHaveBeenCalledWith(true);
    });
  });
});
