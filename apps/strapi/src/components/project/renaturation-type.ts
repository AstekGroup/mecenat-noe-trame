export default {
  collectionName: 'components_project_renaturation_types',
  info: {
    displayName: 'Type de renaturation / restauration',
    description: 'Type de renaturation ou restauration associé à un projet.',
  },
  options: {},
  attributes: {
    label: {
      type: 'enumeration',
      enum: [
        'Prairie',
        'Lisière',
        'Rangée d’arbres',
        'Haies',
        'Bords de routes',
        'Bords de champs',
        'Désimperméabilisation',
      ],
      required: true,
    },
  },
};
