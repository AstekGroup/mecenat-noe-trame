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
  config: {
    attributes: {
      ownerName: { hidden: true },
      partner: { hidden: true },
      projectType: { hidden: true },
      habitatTypes: { hidden: true },
      extent: { hidden: true },
      reasonedPracticeTypes: { hidden: true },
      renaturationTypes: { hidden: true },
      latitude: { hidden: true },
      longitude: { hidden: true },
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

    /**
     * Champs directs de saisie (Phase 4/4.5).
     * Ils prennent le pas sur les relations/composants historiques pour le contrat public.
     */
    projectTypeSelection: {
      type: 'enumeration',
      enum: [
        'Sensibilisation',
        'Renaturation / Restauration',
        'Pratiques raisonnées',
        'Formation',
        'Consultation / Concertation',
        'Suivi',
      ],
    },
    ownerProfile: {
      type: 'enumeration',
      enum: [
        'Commune',
        'Intercommunalité',
        'Département / DDT',
        'Région / DREAL',
        'Etablissement scolaire',
        'Agriculteur.ices',
        'Coopérative agricole',
        'Syndicat agricole',
        'Association d’agroécologie',
        'Apiculteur.ices',
        'Coopérative apicole',
        'Syndicat apicole',
        'Fédération de chasse / pêche',
        'Association de sensibilisation / préservation de la biodiversité',
        'Association autre',
        'Citoyen.ne',
        'Gestionnaires d’espaces naturels protégés : ENS, CEN, RNF, Natura 2000',
      ],
    },
    ownerName: {
      type: 'string',
    },
    habitatTypeSelection: {
      type: 'enumeration',
      enum: [
        'Jardin public',
        'Jardin privé',
        'Autres espaces urbains publics végétalisés',
        'Exploitation agricole',
        'Espace Naturel Protégé',
        'Forêt privée',
        'Forêt publique',
        'Friche (urbaine, agricole, routières ou ferroviaire)',
        'Cours d’eau et leurs bordures',
      ],
    },
    reasonedPracticeSelections: {
      type: 'customField',
      customField: 'global::checkbox-list',
      options: {
        choices: [
          'Taille de haies',
          'Tonte tardive',
          'Réduction de pesticides',
          'Retrait complet de pesticides',
          'Réduction de l’éclairage nocturne artificiel',
          'Changement de matériel',
          'Non retournement de prairie',
        ],
      },
    },
    renaturationSelections: {
      type: 'customField',
      customField: 'global::checkbox-list',
      options: {
        choices: [
          'Prairie',
          'Lisière',
          'Rangée d’arbres',
          'Haies',
          'Bords de routes',
          'Bords de champs',
          'Désimperméabilisation',
        ],
      },
    },
    extentValue: {
      type: 'decimal',
      min: 0,
    },
    extentUnit: {
      type: 'enumeration',
      enum: ['m²', 'ha'],
    },

    /**
     * Champs historiques : conservés pour compatibilité lecture.
     * Masqués de l'interface d'édition/liste normale du Content Manager.
     */
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
