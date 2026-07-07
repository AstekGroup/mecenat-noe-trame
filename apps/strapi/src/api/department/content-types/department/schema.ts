export default {
  kind: 'collectionType',
  collectionName: 'departments',
  info: {
    singularName: 'department',
    pluralName: 'departments',
    displayName: 'Departement',
    description: 'Departement francais. La region est derivee du code departement (table DEPT_TO_REGION du backend).',
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
    code: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 1,
    },
    name: {
      type: 'string',
      required: true,
    },
    region: {
      type: 'string',
      required: true,
    },
    projects: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::project.project',
      mappedBy: 'department',
    },
  },
};
