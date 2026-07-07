import type { Schema, Struct } from '@strapi/strapi';

export interface ProjectPracticeType extends Struct.ComponentSchema {
  collectionName: 'components_project_practice_types';
  info: {
    description: 'Type de pratique raisonnee associe a un projet.';
    displayName: 'Type de pratiques raisonnees';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProjectRenaturationType extends Struct.ComponentSchema {
  collectionName: 'components_project_renaturation_types';
  info: {
    description: 'Type de renaturation associe a un projet.';
    displayName: 'Type de renaturation';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
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
