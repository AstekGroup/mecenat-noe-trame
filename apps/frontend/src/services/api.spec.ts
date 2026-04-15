import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProjects, fetchProjectById, projectsToGeoJSON } from './api';
import type { Project } from '@/types/project';

const mockProject: Project = {
  id: 'rec1',
  title: 'Projet Nature',
  description: 'Description test',
  address: '1 rue Test',
  city: 'Paris',
  region: 'Île-de-France',
  department: 'Paris',
  postalCode: '75001',
  latitude: 48.8566,
  longitude: 2.3522,
  type: 'renaturation-restauration',
  owner: 'Org Test',
};

describe('fetchProjects', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('retourne les projets en cas de succès', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [mockProject],
    } as Response);

    const result = await fetchProjects();
    expect(result).toEqual([mockProject]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/projects'));
  });

  it('ajoute ?devMode=true si devMode est activé', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await fetchProjects(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('?devMode=true'));
  });

  it('ne passe pas le paramètre devMode si false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await fetchProjects(false);
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).not.toContain('devMode');
  });

  it('lève une erreur si la réponse n\'est pas ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(fetchProjects()).rejects.toThrow('Erreur API: 500');
  });
});

describe('fetchProjectById', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('retourne le projet en cas de succès', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProject,
    } as Response);

    const result = await fetchProjectById('rec1');
    expect(result).toEqual(mockProject);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/projects/rec1'));
  });

  it('lève une erreur si le projet n\'existe pas', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(fetchProjectById('inexistant')).rejects.toThrow('Erreur API: 404');
  });
});

describe('projectsToGeoJSON', () => {
  it('convertit les projets en FeatureCollection GeoJSON', () => {
    const result = projectsToGeoJSON([mockProject]);
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.coordinates).toEqual([2.3522, 48.8566]);
  });

  it('exclut les projets avec latitude et longitude à 0', () => {
    const projectSansCoords = { ...mockProject, latitude: 0, longitude: 0 };
    const result = projectsToGeoJSON([mockProject, projectSansCoords]);
    expect(result.features).toHaveLength(1);
  });

  it('retourne une FeatureCollection vide si tous les projets sont à 0,0', () => {
    const project = { ...mockProject, latitude: 0, longitude: 0 };
    const result = projectsToGeoJSON([project]);
    expect(result.features).toHaveLength(0);
  });

  it('place les coordonnées en [longitude, latitude]', () => {
    const result = projectsToGeoJSON([mockProject]);
    const [lon, lat] = result.features[0].geometry.coordinates;
    expect(lon).toBe(mockProject.longitude);
    expect(lat).toBe(mockProject.latitude);
  });

  it('retourne une FeatureCollection vide pour un tableau vide', () => {
    const result = projectsToGeoJSON([]);
    expect(result.features).toHaveLength(0);
  });
});
