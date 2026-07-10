import type { Schema, Struct } from '@strapi/strapi';

export interface ProjectPracticeType extends Struct.ComponentSchema {
  collectionName: 'components_project_practice_types';
  info: {
    description: 'Type de pratique raisonn\u00E9e associ\u00E9 \u00E0 un projet.';
    displayName: 'Type de pratiques raisonn\u00E9es';
  };
  attributes: {
    label: Schema.Attribute.Enumeration<
      [
        'Taille de haies',
        'Tonte tardive',
        'R\u00E9duction de pesticides',
        'Retrait complet de pesticides',
        'R\u00E9duction de l\u2019\u00E9clairage nocturne artificiel',
        'Changement de mat\u00E9riel',
        'Non retournement de prairie',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface ProjectRenaturationType extends Struct.ComponentSchema {
  collectionName: 'components_project_renaturation_types';
  info: {
    description: 'Type de renaturation ou restauration associ\u00E9 \u00E0 un projet.';
    displayName: 'Type de renaturation / restauration';
  };
  attributes: {
    label: Schema.Attribute.Enumeration<
      [
        'Prairie',
        'Lisi\u00E8re',
        'Rang\u00E9e d\u2019arbres',
        'Haies',
        'Bords de routes',
        'Bords de champs',
        'D\u00E9simperm\u00E9abilisation',
      ]
    > &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'project.practice-type': ProjectPracticeType;
      'project.renaturation-type': ProjectRenaturationType;
    }
  }
}
