import { mapProjectType, transformProjectRecord } from './airtable-projects-mapping.util';
import type { AirtableProjectRecord } from './airtable-projects.types';

describe('airtable-projects-mapping.util', () => {
  describe('mapProjectType', () => {
    it('should return renaturation-restauration by default', () => {
      expect(mapProjectType(undefined)).toBe('renaturation-restauration');
      expect(mapProjectType([])).toBe('renaturation-restauration');
      expect(mapProjectType('unknown type')).toBe('renaturation-restauration');
    });

    it('should map various labels to ProjectType', () => {
      expect(mapProjectType('Pratiques Raisonnées')).toBe('pratiques-raisonnees');
      expect(mapProjectType('agriculture raisonnée')).toBe('pratiques-raisonnees');
      expect(mapProjectType('renaturation-restauration des sols')).toBe('renaturation-restauration');
      expect(mapProjectType('renaturation-restauration écologique')).toBe('renaturation-restauration');
      expect(mapProjectType('Sensibilisation')).toBe('sensibilisation');
      expect(mapProjectType('Formation')).toBe('formation');
      expect(mapProjectType('Consultation du public')).toBe('consultation');
      expect(mapProjectType('Concertation')).toBe('consultation');
      expect(mapProjectType('Suivis de biodiversité')).toBe('suivis');
      expect(mapProjectType('Monitoring')).toBe('suivis');
    });

    it('should handle array inputs from Airtable', () => {
      expect(mapProjectType(['renaturation-restauration'])).toBe('renaturation-restauration');
    });
  });

  describe('transformProjectRecord', () => {
    const mockRecord: AirtableProjectRecord = {
      id: 'rec123',
      fields: {
        'Nom du projet': 'Test Project',
        'Description': 'Test Description',
        'Adresse': '123 Main St',
        'Ville': 'Test City',
        'Code postal': '75001',
        'Département': 'Paris',
        "Type d'action": 'renaturation-restauration',
        'Acteur porteur': 'Test Owner',
        'Profil du porteur de projet': 'Collectivité',
        'Email de contact': 'test@example.com',
        'Téléphone de contact': '0123456789',
        'Site web': 'https://example.com',
        'Projet en cours ?': 'Oui',
        'Type de milieu': 'Urbain',
        'Emprise': 'Locale',
      }
    };

    const mockFallbackRegion = jest.fn().mockReturnValue('Île-de-France');

    it('should transform an Airtable record into a Project object', () => {
      const result = transformProjectRecord(mockRecord, mockFallbackRegion);

      expect(result).toEqual({
        id: 'rec123',
        title: 'Test Project',
        description: 'Test Description',
        address: '123 Main St',
        city: 'Test City',
        region: 'Île-de-France',
        department: 'Paris',
        postalCode: '75001',
        latitude: 0,
        longitude: 0,
        type: 'renaturation-restauration',
        owner: 'Test Owner',
        ownerProfile: 'Collectivité',
        contactEmail: 'test@example.com',
        contactPhone: '0123456789',
        website: 'https://example.com',
        habitatType: 'Urbain',
        extent: 'Locale',
        isOngoing: true,
      });
      expect(mockFallbackRegion).toHaveBeenCalledWith('75001');
    });

    it('should handle missing fields with defaults', () => {
      const emptyRecord: AirtableProjectRecord = {
        id: 'rec456',
        fields: {}
      };
      const result = transformProjectRecord(emptyRecord, () => undefined);

      expect(result.title).toBe('Projet sans titre');
      expect(result.region).toBe('Île-de-France');
      expect(result.type).toBe('renaturation-restauration');
      expect(result.isOngoing).toBeUndefined();
    });

    it('should handle boolean and string values for isOngoing', () => {
      const recordWithBool: AirtableProjectRecord = {
        id: 'rec1',
        fields: { 'Projet en cours ?': true }
      };
      expect(transformProjectRecord(recordWithBool, () => undefined).isOngoing).toBe(true);

      const recordWithNo: AirtableProjectRecord = {
        id: 'rec2',
        fields: { 'Projet en cours ?': 'Non' }
      };
      expect(transformProjectRecord(recordWithNo, () => undefined).isOngoing).toBe(false);
    });

    it('should prioritize fallback region over Airtable region if provided', () => {
        const record: AirtableProjectRecord = {
            id: 'rec1',
            fields: { 'Région': 'Bretagne', 'Code postal': '75001' }
        };
        const result = transformProjectRecord(record, () => 'Île-de-France');
        expect(result.region).toBe('Île-de-France');
    });
  });
});
