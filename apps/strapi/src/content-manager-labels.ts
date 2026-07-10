import type { Core } from '@strapi/strapi';

type FieldLabels = Record<string, string>;

interface FieldMetadata {
  edit?: Record<string, unknown>;
  list?: Record<string, unknown>;
}

interface ContentManagerConfiguration {
  settings: Record<string, unknown>;
  metadatas: Record<string, FieldMetadata>;
  layouts: Record<string, unknown>;
  options?: Record<string, unknown>;
}

interface ContentManagerModelService {
  findContentType?(uid: string): unknown;
  findComponent?(uid: string): unknown;
  findConfiguration(model: unknown): Promise<ContentManagerConfiguration>;
  updateConfiguration(
    model: unknown,
    configuration: ContentManagerConfiguration,
  ): Promise<unknown>;
}

const CONTENT_TYPE_LABELS: Record<string, FieldLabels> = {
  'api::project.project': {
    title: 'Nom du projet',
    description: 'Description',
    address: 'Adresse',
    city: 'Ville',
    postalCode: 'Code postal',
    latitude: 'Latitude',
    longitude: 'Longitude',
    department: 'Département',
    partner: 'Porteur du projet',
    projectType: 'Type de projet',
    habitatTypes: 'Type de milieu',
    extent: 'Emprise',
    reasonedPracticeTypes: 'Types de pratiques raisonnées',
    renaturationTypes: 'Types de renaturation / restauration',
    sensitizationTitle: 'Titre de l’action de sensibilisation',
    trainingTitle: 'Titre de la formation',
    consultationType: 'Type de consultation / concertation',
    followUpType: 'Type de suivi',
    followUpFrequency: 'Fréquence du suivi',
    isOngoing: 'Projet en cours',
    submitterEmail: 'Adresse e-mail du déclarant',
    displayContactEmail: 'Afficher un e-mail de contact public',
    contactEmail: 'Adresse e-mail de contact',
    contactPhone: 'Téléphone de contact',
    website: 'Site web',
  },
  'api::partner.partner': {
    name: 'Nom du porteur / partenaire',
    profile: 'Profil du porteur',
    projects: 'Projets',
  },
  'api::department.department': {
    code: 'Code du département',
    name: 'Nom du département',
    region: 'Région',
    projects: 'Projets',
  },
  'api::projecttype.projecttype': {
    slug: 'Identifiant technique',
    label: 'Libellé',
    color: 'Couleur',
    projects: 'Projets',
  },
  'api::habitattype.habitattype': {
    label: 'Libellé',
    projects: 'Projets',
  },
};

const COMPONENT_LABELS: Record<string, FieldLabels> = {
  'project.practice-type': {
    label: 'Type de pratique raisonnée',
  },
  'project.renaturation-type': {
    label: 'Type de renaturation / restauration',
  },
};

function withFrenchLabels(
  configuration: ContentManagerConfiguration,
  labels: FieldLabels,
): ContentManagerConfiguration {
  const metadatas = { ...configuration.metadatas };

  for (const [fieldName, label] of Object.entries(labels)) {
    const metadata = metadatas[fieldName] ?? {};
    metadatas[fieldName] = {
      ...metadata,
      edit: { ...metadata.edit, label },
      list: { ...metadata.list, label },
    };
  }

  return {
    settings: configuration.settings,
    metadatas,
    layouts: configuration.layouts,
    ...(configuration.options ? { options: configuration.options } : {}),
  };
}

async function configureModels(
  service: ContentManagerModelService,
  labelsByUid: Record<string, FieldLabels>,
  findModel: (uid: string) => unknown,
): Promise<void> {
  for (const [uid, labels] of Object.entries(labelsByUid)) {
    const model = findModel(uid);
    if (!model) {
      continue;
    }

    const configuration = await service.findConfiguration(model);
    await service.updateConfiguration(model, withFrenchLabels(configuration, labels));
  }
}

export async function configureFrenchContentManager(strapi: Core.Strapi): Promise<void> {
  const plugin = strapi.plugin('content-manager');
  const contentTypes = plugin.service('content-types') as ContentManagerModelService;
  const components = plugin.service('components') as ContentManagerModelService;

  await configureModels(
    contentTypes,
    CONTENT_TYPE_LABELS,
    (uid) => contentTypes.findContentType?.(uid),
  );
  await configureModels(
    components,
    COMPONENT_LABELS,
    (uid) => components.findComponent?.(uid),
  );
}
