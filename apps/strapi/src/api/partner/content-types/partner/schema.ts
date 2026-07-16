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
      visible: false,
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
    projects: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::project.project',
      mappedBy: 'partner',
    },
  },
};
