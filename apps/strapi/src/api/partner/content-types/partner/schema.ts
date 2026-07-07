export default {
  kind: 'collectionType',
  collectionName: 'partners',
  info: {
    singularName: 'partner',
    pluralName: 'partners',
    displayName: 'Partenaire',
    description: "Acteur ou structure porteuse d'un projet. Remplace les champs Airtable 'Acteur porteur' et 'Profil du porteur de projet'.",
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
    name: {
      type: 'string',
      required: true,
      minLength: 1,
    },
    profile: {
      type: 'string',
    },
    projects: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::project.project',
      mappedBy: 'partner',
    },
  },
};
