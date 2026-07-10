export default {
  kind: 'collectionType',
  collectionName: 'projects',
  info: {
    singularName: 'project',
    pluralName: 'projects',
    displayName: 'Projet',
    description: 'Projet de renaturation, restauration ou sensibilisation de la Trame pollinisateur. Reproduit les champs de la table Airtable PROJETS.',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
      minLength: 1,
    },
    description: {
      type: 'text',
    },
    address: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    postalCode: {
      type: 'string',
    },
    latitude: {
      type: 'float',
    },
    longitude: {
      type: 'float',
    },
    department: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::department.department',
      inversedBy: 'projects',
    },
    partner: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::partner.partner',
      inversedBy: 'projects',
    },
    projectType: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::projecttype.projecttype',
      inversedBy: 'projects',
    },
    habitatTypes: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::habitattype.habitattype',
      inversedBy: 'projects',
    },
    extent: {
      type: 'string',
    },
    reasonedPracticeTypes: {
      type: 'component',
      repeatable: true,
      component: 'project.practice-type',
    },
    renaturationTypes: {
      type: 'component',
      repeatable: true,
      component: 'project.renaturation-type',
    },
    sensitizationTitle: {
      type: 'string',
    },
    trainingTitle: {
      type: 'string',
    },
    consultationType: {
      type: 'enumeration',
      enum: [
        'Atelier',
        'Réunion de concertation',
        'Consultation',
        'Comité de pilotage de projet',
        "Réunion d’information",
        'Prise en compte des pollinisateurs dans un PLU / PLUi / SCOT',
      ],
    },
    followUpType: {
      type: 'enumeration',
      enum: [
        'Suivi photographique',
        'Suivi entomologique en sciences participatives',
        "Suivi entomologique par inventaire d’experts",
      ],
    },
    followUpFrequency: {
      type: 'string',
    },
    isOngoing: {
      type: 'boolean',
      default: false,
    },
    submitterEmail: {
      type: 'email',
      private: true,
    },
    displayContactEmail: {
      type: 'boolean',
      default: false,
    },
    contactEmail: {
      type: 'email',
    },
    contactPhone: {
      type: 'string',
    },
    website: {
      type: 'string',
    },
  },
};
