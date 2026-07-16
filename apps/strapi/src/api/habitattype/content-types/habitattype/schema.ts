export default {
  kind: 'collectionType',
  collectionName: 'habitat_types',
  info: {
    singularName: 'habitattype',
    pluralName: 'habitattypes',
    displayName: 'Type de milieu',
    description: "Type de milieu (habitat) d'un projet. Peut etre multiple par projet.",
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
    label: {
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
      required: true,
    },
    projects: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::project.project',
      mappedBy: 'habitatTypes',
    },
  },
};
