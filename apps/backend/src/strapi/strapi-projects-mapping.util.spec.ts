import type { StrapiProjectItem } from './strapi-projects-mapping.util';
import { strapiProjectToDomain } from './strapi-projects-mapping.util';

describe('strapiProjectToDomain', () => {
  const baseItem: StrapiProjectItem = {
    id: 1,
    documentId: 'project-doc-1',
    title: 'Projet Strapi',
    description: 'Description Strapi',
    address: '1 rue Test',
    city: 'Paris',
    postalCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    extent: '100 m2',
    isOngoing: true,
    displayContactEmail: true,
    contactEmail: 'contact@example.org',
    contactPhone: '0102030405',
    website: 'https://example.org',
    sensitizationTitle: null,
    trainingTitle: null,
    consultationType: null,
    followUpType: null,
    followUpFrequency: null,
    publishedAt: '2026-07-09T00:00:00.000Z',
    department: {
      code: '75',
      name: 'Paris',
      region: 'Île-de-France',
    },
    partner: {
      name: 'Noé',
      profile: 'Association autre',
    },
    projectType: {
      slug: 'sensibilisation',
      label: 'Sensibilisation',
      color: '#F57C00',
    },
    habitatTypes: [{ label: 'Prairie' }],
    reasonedPracticeTypes: [{ label: 'Tonte tardive' }],
    renaturationTypes: [{ label: 'Prairie' }],
  };

  it('mappe la forme REST Strapi vers le contrat Project', () => {
    const project = strapiProjectToDomain(baseItem);

    expect(project).toMatchObject({
      id: 'project-doc-1',
      title: 'Projet Strapi',
      region: 'Île-de-France',
      department: 'Paris',
      type: 'sensibilisation',
      owner: 'Noé',
      ownerProfile: 'Association autre',
      contactEmail: 'contact@example.org',
      habitatType: ['Prairie'],
      reasonedPracticeTypes: ['Tonte tardive'],
      renaturationTypes: ['Prairie'],
    });
  });

  it("masque l'adresse de contact sans consentement explicite", () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      displayContactEmail: false,
    });

    expect(project.contactEmail).toBeUndefined();
  });

  it("masque aussi l'adresse de contact quand le consentement est absent", () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      displayContactEmail: null,
    });

    expect(project.contactEmail).toBeUndefined();
  });

  it('replie les valeurs métier invalides vers les défauts sûrs', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      department: {
        code: '00',
        name: 'Département inconnu',
        region: 'Region invalide',
      },
      projectType: {
        slug: 'type-invalide',
        label: 'Type invalide',
        color: null,
      },
    });

    expect(project.region).toBe('Île-de-France');
    expect(project.type).toBe('renaturation-restauration');
  });
});
