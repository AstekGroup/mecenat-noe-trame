export default {
  kind: 'collectionType',
  collectionName: 'project_types',
  info: {
    singularName: 'projecttype',
    pluralName: 'projecttypes',
    displayName: 'Type de projet',
    description: 'Typologie metier des projets. 6 valeurs : pratiques-raisonnees, renaturation-restauration, sensibilisation, formation, consultation, suivis.',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: true,
    },
  },
  attributes: {
    slug: {
      type: 'enumeration',
      enum: [
        'pratiques-raisonnees',
        'renaturation-restauration',
        'sensibilisation',
        'formation',
        'consultation',
        'suivis',
      ],
      required: true,
      unique: true,
    },
    label: {
      type: 'enumeration',
      enum: [
        'Pratiques raisonnées',
        'Renaturation / Restauration',
        'Sensibilisation',
        'Formation',
        'Consultation / Concertation',
        'Suivi',
      ],
      required: true,
    },
    color: {
      type: 'string',
    },
    projects: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::project.project',
      mappedBy: 'projectType',
    },
  },
};
