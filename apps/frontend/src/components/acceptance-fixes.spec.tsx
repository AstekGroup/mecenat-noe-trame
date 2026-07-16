import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types/project';
import type { ProjectFilters } from '@/hooks';
import { SearchOverlay } from './Map/SearchOverlay';
import { ProjectPopup } from './Map/ProjectPopup';
import { ProjectFiltersBar } from './Projects/ProjectFiltersBar';
import { FilterPanel } from './Filters/FilterPanel';

const project: Project = {
  id: 'project-test',
  title: 'Projet test',
  description: 'Description',
  address: '1 rue Test',
  city: 'Paris',
  region: 'Île-de-France',
  department: 'Paris',
  postalCode: '75001',
  latitude: 48.8566,
  longitude: 2.3522,
  type: 'renaturation-restauration',
  owner: 'Porteur test',
  contactPhone: '01 02 03 04 05',
};

const filters: ProjectFilters = {
  search: '',
  regions: [],
  types: [],
  postalCode: '',
  showNatura2000: false,
  showCorridors: true,
  showParcsNationaux: false,
  showParcsNaturelsRegionaux: false,
  showReservesNaturelles: false,
  showRegions: false,
  showDepartments: false,
  showEPCI: false,
  showCommunes: false,
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('correctifs d’acceptation frontend', () => {
  it('synchronise la recherche de la carte avec la valeur externe et son reset', () => {
    const { rerender } = render(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={vi.fn()}
        searchValue="Paris"
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('Paris');

    rerender(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={vi.fn()}
        searchValue=""
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('annule la recherche BAN en vol lors d’un reset externe', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal as AbortSignal | undefined;
          requestSignal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={vi.fn()}
        searchValue=""
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Pa' },
    });
    rerender(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={vi.fn()}
        searchValue="Pa"
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestSignal?.aborted).toBe(false);

    rerender(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={vi.fn()}
        searchValue=""
      />,
    );

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(requestSignal?.aborted).toBe(true);
  });

  it('annule la recherche BAN en vol après géolocalisation', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal as AbortSignal | undefined;
          requestSignal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({
            coords: { latitude: 48.8566, longitude: 2.3522 },
          } as GeolocationPosition),
        ),
      },
    });

    const onSearchFilter = vi.fn();
    const { rerender } = render(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={onSearchFilter}
        searchValue=""
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Pa' },
    });
    rerender(
      <SearchOverlay
        onFlyTo={vi.fn()}
        onSearchFilter={onSearchFilter}
        searchValue="Pa"
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Me localiser' }));

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(requestSignal?.aborted).toBe(true);
    expect(onSearchFilter).toHaveBeenLastCalledWith('');
  });

  it('affiche le téléphone cliquable dans la popup', () => {
    render(
      <ProjectPopup project={project} onClose={vi.fn()} onViewDetails={vi.fn()} />,
    );

    expect(screen.getByRole('link', { name: /01 02 03 04 05/ })).toHaveAttribute(
      'href',
      'tel:01 02 03 04 05',
    );
  });

  it('propose les cinq régions ultramarines dans le filtre de la liste', async () => {
    const user = userEvent.setup();
    render(
      <ProjectFiltersBar
        filters={filters}
        onUpdateFilters={vi.fn()}
        onToggleRegion={vi.fn()}
        onToggleType={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Région' }));

    for (const region of [
      'Guadeloupe',
      'Martinique',
      'Guyane',
      'La Réunion',
      'Mayotte',
    ]) {
      expect(screen.getByText(region)).toBeInTheDocument();
    }
  });

  it('inclut les parcs et réserves dans le reset et explicite le calque indisponible', async () => {
    const user = userEvent.setup();
    const onResetFilters = vi.fn();

    render(
      <FilterPanel
        filters={{ ...filters, showParcsNationaux: true }}
        onUpdateFilters={vi.fn()}
        onToggleRegion={vi.fn()}
        onToggleType={vi.fn()}
        onResetFilters={onResetFilters}
        stats={{ total: 0, filtered: 0, byType: {}, byRegion: {} }}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /Réinitialiser les filtres/ }),
    );

    expect(onResetFilters).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Données non disponibles')).toBeInTheDocument();
    expect(
      screen
        .getByText('Données non disponibles')
        .closest('[aria-disabled="true"]'),
    ).not.toBeNull();
  });
});
