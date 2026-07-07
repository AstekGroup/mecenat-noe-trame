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
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    },
  },
  attributes: {
    slug: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 1,
    },
    label: {
      type: 'string',
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
