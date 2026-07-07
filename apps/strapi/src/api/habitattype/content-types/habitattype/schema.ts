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
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    },
  },
  attributes: {
    label: {
      type: 'string',
      required: true,
      minLength: 1,
    },
    projects: {
      type: 'relation',
      relation: 'manyToMany',
      target: 'api::project.project',
      mappedBy: 'habitatTypes',
    },
  },
};
