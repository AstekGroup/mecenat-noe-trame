/**
 * Types Airtable pour la table PROJETS
 * (les noms de champs devront être alignés avec la configuration réelle de la base).
 */

export interface AirtableProjectRecord {
  id: string;
  fields: {
    'Nom du projet'?: string;
    'Description'?: string;
    'Adresse'?: string;
    'Code postal'?: string;
    'Ville'?: string;
    'Région'?: string;
    'Département'?: string;
    'Type de projet'?: string | string[];
    'Acteur porteur'?: string;
    'Email de contact'?: string;
    'Téléphone de contact'?: string;
    'Site web'?: string;
    'Date de début'?: string;
    'Date de fin'?: string;
    'Projet en cours ?'?: string | boolean;
    'Mots-clés'?: string[];
  };
  createdTime?: string;
}

export interface AirtableProjectsResponse {
  records: AirtableProjectRecord[];
  offset?: string;
}

