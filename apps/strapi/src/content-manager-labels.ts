import type { Core } from '@strapi/strapi';

type FieldLabels = Record<string, string>;

interface FieldMetadata {
  edit?: Record<string, unknown>;
  list?: Record<string, unknown>;
}

interface LayoutField {
  name: string;
  size: number;
}

interface ContentManagerLayouts {
  edit: LayoutField[][];
  list: string[];
}

interface ContentManagerConfiguration {
  settings: Record<string, unknown>;
  metadatas: Record<string, FieldMetadata>;
  layouts: ContentManagerLayouts;
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
    partner: 'Porteur du projet (historique)',
    projectType: 'Type de projet (historique)',
    projectTypeSelection: "Type d'action",
    habitatTypes: 'Type de milieu (historique)',
    habitatTypeSelection: 'Type de milieu',
    extent: 'Emprise (historique)',
    extentValue: 'Emprise (valeur)',
    extentUnit: 'Unité de l’emprise',
    reasonedPracticeTypes: 'Pratiques raisonnées (historique)',
    reasonedPracticeSelections: 'Type de pratiques raisonnées',
    renaturationTypes: 'Renaturation / restauration (historique)',
    renaturationSelections: 'Type de renaturation',
    ownerName: 'Nom du porteur',
    ownerProfile: 'Profil du porteur de projet',
    sensitizationTitle: 'Titre de la sensibilisation',
    trainingTitle: 'Titre de la formation',
    consultationType: 'Type de consultation',
    followUpType: 'Type de suivi',
    followUpFrequency: 'Fréquence de suivi',
    isOngoing: 'Projet en cours',
    submitterEmail: 'Email porteur',
    displayContactEmail: 'Autorisation email public',
    contactEmail: 'Email de contact',
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

const SIDE_BY_SIDE_EDIT_FIELDS: Record<string, [string, string]> = {
  'api::project.project': [
    'reasonedPracticeSelections',
    'renaturationSelections',
  ],
};

function placeFieldsSideBySide(
  editLayout: LayoutField[][],
  fieldNames: [string, string],
): LayoutField[][] {
  const fieldsToPair = new Set(fieldNames);
  const cleanedLayout: LayoutField[][] = [];
  let insertionIndex: number | undefined;

  for (const row of editLayout) {
    const containsPairedField = row.some((field) => fieldsToPair.has(field.name));
    if (containsPairedField && insertionIndex === undefined) {
      insertionIndex = cleanedLayout.length;
    }

    const remainingFields = row.filter((field) => !fieldsToPair.has(field.name));
    if (remainingFields.length > 0) {
      cleanedLayout.push(remainingFields);
    }
  }

  if (insertionIndex === undefined) {
    return editLayout;
  }

  cleanedLayout.splice(
    insertionIndex,
    0,
    fieldNames.map((name) => ({ name, size: 6 })),
  );

  return cleanedLayout;
}

function withFrenchLabels(
  configuration: ContentManagerConfiguration,
  labels: FieldLabels,
  uid: string,
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
    layouts: SIDE_BY_SIDE_EDIT_FIELDS[uid]
      ? {
          ...configuration.layouts,
          edit: placeFieldsSideBySide(
            configuration.layouts.edit,
            SIDE_BY_SIDE_EDIT_FIELDS[uid],
          ),
        }
      : configuration.layouts,
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
    await service.updateConfiguration(
      model,
      withFrenchLabels(configuration, labels, uid),
    );
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
