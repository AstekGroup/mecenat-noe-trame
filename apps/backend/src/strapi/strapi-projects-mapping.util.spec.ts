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
    projectTypeSelection: null,
    ownerProfile: null,
    ownerName: null,
    habitatTypeSelection: null,
    reasonedPracticeSelections: null,
    renaturationSelections: null,
    extentValue: null,
    extentUnit: null,
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

  it("n'expose rien quand le consentement est actif mais l'adresse est absente", () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      displayContactEmail: true,
      contactEmail: null,
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

  it('un enregistrement uniquement direct produit les mêmes valeurs canoniques qu’un enregistrement historique équivalent', () => {
    const directItem: StrapiProjectItem = {
      ...baseItem,
      projectType: {
        slug: 'formation',
        label: 'Formation',
        color: null,
      },
      projectTypeSelection: 'Formation',
      partner: {
        name: 'Ancien partenaire',
        profile: 'Ancien profil',
      },
      ownerName: 'Noé',
      ownerProfile: 'Association autre',
      habitatTypes: [{ label: 'Forêt publique' }],
      habitatTypeSelection: 'Prairie',
      reasonedPracticeTypes: [{ label: 'Tonte tardive' }],
      reasonedPracticeSelections: ['Tonte tardive'],
      renaturationTypes: [{ label: 'Haies' }],
      renaturationSelections: ['Haies'],
      extent: '500 m2',
      extentValue: 1.5,
      extentUnit: 'ha',
    };

    const legacyItem: StrapiProjectItem = {
      ...baseItem,
      projectType: {
        slug: 'formation',
        label: 'Formation',
        color: null,
      },
      projectTypeSelection: null,
      partner: {
        name: 'Noé',
        profile: 'Association autre',
      },
      ownerName: null,
      ownerProfile: null,
      habitatTypes: [{ label: 'Prairie' }],
      habitatTypeSelection: null,
      reasonedPracticeTypes: [{ label: 'Tonte tardive' }],
      reasonedPracticeSelections: null,
      renaturationTypes: [{ label: 'Haies' }],
      renaturationSelections: null,
      extent: '1.5 ha',
      extentValue: null,
      extentUnit: null,
    };

    const directProject = strapiProjectToDomain(directItem);
    const legacyProject = strapiProjectToDomain(legacyItem);

    expect(directProject.type).toBe('formation');
    expect(directProject).toMatchObject({
      type: legacyProject.type,
      owner: legacyProject.owner,
      ownerProfile: legacyProject.ownerProfile,
      habitatType: legacyProject.habitatType,
      reasonedPracticeTypes: legacyProject.reasonedPracticeTypes,
      renaturationTypes: legacyProject.renaturationTypes,
      extent: legacyProject.extent,
    });
  });

  it('privilégie les champs directs aux champs historiques', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      projectType: {
        slug: 'sensibilisation',
        label: 'Sensibilisation',
        color: null,
      },
      projectTypeSelection: 'Pratiques raisonnées',
      partner: {
        name: 'Partenaire historique',
        profile: 'Profil historique',
      },
      ownerName: 'Porteur direct',
      ownerProfile: 'Commune',
      habitatTypes: [{ label: 'Forêt publique' }],
      habitatTypeSelection: 'Jardin public',
      reasonedPracticeTypes: [{ label: 'Taille de haies' }],
      reasonedPracticeSelections: ['Tonte tardive'],
      renaturationTypes: [{ label: 'Prairie' }],
      renaturationSelections: ['Désimperméabilisation'],
      extent: '999 m2',
      extentValue: 42,
      extentUnit: 'ha',
    });

    expect(project).toMatchObject({
      type: 'pratiques-raisonnees',
      owner: 'Porteur direct',
      ownerProfile: 'Commune',
      habitatType: ['Jardin public'],
      reasonedPracticeTypes: ['Tonte tardive'],
      renaturationTypes: ['Désimperméabilisation'],
      extent: '42 ha',
    });
  });

  it('utilise ownerName même quand il s’agit d’une chaîne vide', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      ownerName: '',
      partner: {
        name: 'Partenaire',
        profile: null,
      },
    });

    expect(project.owner).toBe('');
  });

  it('remplace le type de projet historique par la sélection directe pour les 6 libellés français', () => {
    const cases: Array<[string, string]> = [
      ['Sensibilisation', 'sensibilisation'],
      ['Renaturation / Restauration', 'renaturation-restauration'],
      ['Pratiques raisonnées', 'pratiques-raisonnees'],
      ['Formation', 'formation'],
      ['Consultation / Concertation', 'consultation'],
      ['Suivi', 'suivis'],
    ];

    for (const [label, slug] of cases) {
      const project = strapiProjectToDomain({
        ...baseItem,
        projectTypeSelection: label,
        projectType: null,
      });
      expect(project.type).toBe(slug);
    }
  });

  it('retombe sur le type historique quand la sélection directe est inconnue', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      projectTypeSelection: 'Type inconnu',
      projectType: {
        slug: 'formation',
        label: 'Formation',
        color: null,
      },
    });

    expect(project.type).toBe('formation');
  });

  it('utilise le type sûr par défaut quand les deux sources sont absentes', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      projectTypeSelection: null,
      projectType: null,
    });

    expect(project.type).toBe('renaturation-restauration');
  });

  it('retombe sur les tableaux historiques quand les sélections directes sont null', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      reasonedPracticeSelections: null,
      renaturationSelections: null,
    });

    expect(project.reasonedPracticeTypes).toEqual(['Tonte tardive']);
    expect(project.renaturationTypes).toEqual(['Prairie']);
  });

  it('considère un tableau vide comme une sélection intentionnellement vide', () => {
    const project = strapiProjectToDomain({
      ...baseItem,
      reasonedPracticeSelections: [],
      renaturationSelections: [],
    });

    expect(project.reasonedPracticeTypes).toEqual([]);
    expect(project.renaturationTypes).toEqual([]);
  });

  describe('emprise', () => {
    it('compose la valeur et l’unité m²', () => {
      const project = strapiProjectToDomain({
        ...baseItem,
        extentValue: 250,
        extentUnit: 'm²',
        extent: 'ancienne emprise',
      });

      expect(project.extent).toBe('250 m²');
    });

    it('compose la valeur et l’unité ha', () => {
      const project = strapiProjectToDomain({
        ...baseItem,
        extentValue: 3.5,
        extentUnit: 'ha',
        extent: 'ancienne emprise',
      });

      expect(project.extent).toBe('3.5 ha');
    });

    it('affiche la valeur seule quand l’unité est absente', () => {
      const project = strapiProjectToDomain({
        ...baseItem,
        extentValue: 100,
        extentUnit: null,
        extent: 'ancienne emprise',
      });

      expect(project.extent).toBe('100');
    });

    it('accepte une valeur nulle et conserve l’unité', () => {
      const project = strapiProjectToDomain({
        ...baseItem,
        extentValue: 0,
        extentUnit: 'm²',
        extent: 'ancienne emprise',
      });

      expect(project.extent).toBe('0 m²');
    });

    it('retombe sur l’emprise historique quand extentValue est null', () => {
      const project = strapiProjectToDomain({
        ...baseItem,
        extentValue: null,
        extentUnit: null,
        extent: '75 m²',
      });

      expect(project.extent).toBe('75 m²');
    });
  });
});
