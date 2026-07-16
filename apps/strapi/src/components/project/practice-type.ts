export default {
  collectionName: 'components_project_practice_types',
  info: {
    displayName: 'Type de pratiques raisonnées',
    description: 'Type de pratique raisonnée associé à un projet.',
  },
  options: {},
  attributes: {
    label: {
      type: 'enumeration',
      enum: [
        'Taille de haies',
        'Tonte tardive',
        'Réduction de pesticides',
        'Retrait complet de pesticides',
        'Réduction de l’éclairage nocturne artificiel',
        'Changement de matériel',
        'Non retournement de prairie',
      ],
      required: true,
    },
  },
};
