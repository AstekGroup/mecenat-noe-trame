import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types/project';
import { useProjects } from '@/hooks';
import { ProjectDetailPage } from './ProjectDetailPage';

vi.mock('@/hooks', () => ({
  useProjects: vi.fn(),
}));

describe('ProjectDetailPage', () => {
  it('affiche le téléphone de contact avec un lien tel:', () => {
    const project: Project = {
      id: 'project-phone',
      title: 'Projet téléphone',
      description: 'Description',
      address: '1 rue Test',
      city: 'Paris',
      region: 'Île-de-France',
      department: 'Paris',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
      type: 'formation',
      owner: 'Porteur test',
      contactPhone: '+33 1 02 03 04 05',
    };

    vi.mocked(useProjects).mockReturnValue({
      allProjects: [project],
      loading: false,
      error: null,
    } as ReturnType<typeof useProjects>);

    render(
      <MemoryRouter initialEntries={['/projet/project-phone']}>
        <Routes>
          <Route path="/projet/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: /\+33 1 02 03 04 05/ }),
    ).toHaveAttribute('href', 'tel:+33 1 02 03 04 05');
  });
});
