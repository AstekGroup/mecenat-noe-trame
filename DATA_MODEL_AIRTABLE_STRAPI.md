# Correspondance du modèle Airtable vers Strapi

Ce document décrit la correspondance entre la table Airtable `Projets` de référence et le modèle éditorial Strapi. Le schéma courant de la table, ses 21 champs et ses sept listes contrôlées ont été vérifiés en lecture. Airtable expose aussi un formulaire autonome `Nouveau projet`, mais son ordre visuel et ses éventuelles règles conditionnelles ne sont pas fournis par l'API de schéma.

## Principe

```text
Table/formulaire Airtable  Administration Strapi       API publique
libellés et choix FR  ->   libellés et choix FR   ->  clés techniques stables
                                                       frontend <- NestJS <- Strapi
```

Les clés comme `consultationType` restent internes. Les personnes qui saisissent les contenus voient « Type de consultation », conformément au champ Airtable courant. Renommer les clés casserait inutilement le contrat entre Strapi, NestJS et React.

## Projet

| Champ Airtable | Type Airtable | Strapi | Type Strapi | Exposition publique | État |
|---|---|---|---|---|---|
| Nom du projet | Texte | `Project.title` | Texte obligatoire | `title` | Aligné |
| Type d'action | Choix unique | `Project.projectTypeSelection` | Énumération | `type` sous forme de slug stable | Aligné, choix contrôlé |
| Description | Texte long | `Project.description` | Texte long | `description` | Aligné |
| Adresse | Texte | `Project.address` | Texte | `address` | Aligné |
| Code postal | Texte | `Project.postalCode` | Texte | `postalCode` | Aligné |
| Ville | Texte | `Project.city` | Texte | `city` | Aligné |
| Email de contact | E-mail | `Project.contactEmail` | E-mail | Exposé seulement avec consentement | Aligné |
| Téléphone de contact | Téléphone | `Project.contactPhone` | Texte | `contactPhone` | Aligné |
| Site web | URL | `Project.website` | Texte | `website` | Aligné |
| Emprise | Texte | `Project.extentValue` + `Project.extentUnit` | Décimal + énumération | `extent` | Normalisation intentionnelle ; l'API recompose une chaîne, l’unité peut être `m²` ou `ha` |
| Type de milieu | Choix unique | `Project.habitatTypeSelection` | Énumération | `habitatType[]` | Aligné, choix contrôlé |
| Profil du porteur de projet | Choix unique | `Project.ownerProfile` | Énumération | `ownerProfile` | Aligné, choix contrôlé |
| Type de pratiques raisonnées | Choix multiple | `Project.reasonedPracticeSelections` | Champ personnalisé JSON (liste de cases à cocher) | `reasonedPracticeTypes[]` | Aligné, choix contrôlé |
| Type de renaturation | Choix multiple | `Project.renaturationSelections` | Champ personnalisé JSON (liste de cases à cocher) | `renaturationTypes[]` | Aligné, choix contrôlé |
| Titre de la sensibilisation | Texte | `Project.sensitizationTitle` | Texte | `sensitizationTitle` | Aligné |
| Titre de la formation | Texte | `Project.trainingTitle` | Texte | `trainingTitle` | Aligné |
| Type de consultation | Choix unique | `Project.consultationType` | Énumération | `consultationType` | Aligné, choix contrôlé |
| Type de suivi | Choix unique | `Project.followUpType` | Énumération | `followUpType` | Aligné, choix contrôlé |
| Fréquence de suivi | Texte | `Project.followUpFrequency` | Texte | `followUpFrequency` | Aligné |
| Email porteur | E-mail | `Project.submitterEmail` | E-mail privé | Jamais exposé | Aligné |
| Autorisation email public | Case à cocher | `Project.displayContactEmail` | Booléen | Contrôle l'exposition de `contactEmail` | Aligné |

Le champ technique `ownerName` ne correspond à aucun champ de la table Airtable courante. Il reste dans le schéma et l'API, mais il est masqué de la saisie normale pour préserver le contrat historique `owner` et le repli vers `Partner`. Les champs `department` et `region` sont structurés pour les besoins de la carte. Les champs `latitude` et `longitude` sont calculés et enrichis à la volée par NestJS pour le contrat public `Project` à partir de l'adresse, de la ville et du code postal, sans réécrire les valeurs calculées dans Strapi ; ils restent dans le schéma, la persistance, l'API REST, le mapper et le contrat carte, mais ils sont masqués de la saisie et de la liste normales du Content Manager. Le champ historique `isOngoing` reste disponible pour les données déjà présentes.

## Champs historiques conservés pour compatibilité

Les champs suivants restent dans le schéma et dans l’API REST avec `populate=*`, mais ils sont masqués de l’interface d’édition/liste normale du Content Manager. Le backend les utilise comme valeur de repli quand les champs directs ne sont pas renseignés.

| Champ historique | Type historique | Champ direct préféré |
|---|---|---|
| `Project.projectType` | Relation vers `ProjectType` | `projectTypeSelection` |
| `Project.partner` | Relation vers `Partner` | `ownerProfile`; `ownerName` reste un champ de compatibilité masqué |
| `Project.habitatTypes` | Relation plusieurs-à-plusieurs vers `HabitatType` | `habitatTypeSelection` |
| `Project.reasonedPracticeTypes` | Composant répétable | `reasonedPracticeSelections` |
| `Project.renaturationTypes` | Composant répétable | `renaturationSelections` |
| `Project.extent` | Texte libre | `extentValue` + `extentUnit` |

La suppression ou la mutation de ces champs historiques est bloquée jusqu’à validation humaine d’une migration de données complète.

## Référentiels liés

| Élément | Représentation Airtable | Représentation Strapi | Raison |
|---|---|---|---|
| Porteur / partenaire | `Profil du porteur de projet`; aucun nom de porteur dans la table courante | `ownerProfile` visible; `ownerName` et collection `Partner` conservés pour l’historique | Aligner la saisie courante sans perdre le contrat `owner` ni les anciennes relations |
| Département | Déduit de la localisation ou stocké dans les données | Collection `Department`, relation plusieurs-vers-un | Centraliser code, nom et région |
| Type de projet | Choix unique | Énumération directe `projectTypeSelection`; collection `ProjectType` conservée pour l’historique | Conserver un slug API stable tout en simplifiant la saisie |
| Type de milieu | Choix unique dans le formulaire | Énumération directe `habitatTypeSelection`; collection `HabitatType` conservée pour l’historique | Respecter le formulaire actuel et préserver les anciennes données multiples |
| Pratique raisonnée | Choix multiple | Champ personnalisé JSON `checkbox-list` | Garder la forme `string[]` attendue par la carte avec une interface de cases à cocher |
| Renaturation / restauration | Choix multiple | Champ personnalisé JSON `checkbox-list` | Garder la forme `string[]` attendue par la carte avec une interface de cases à cocher |

Les collections `Partner`, `ProjectType` et `HabitatType` restent exposées par l’API REST et le Content-Type Builder, mais elles sont masquées de la navigation normale du Content Manager pour éviter que les éditeurs y créent des entrées. La collection `Department` reste visible et inchangée.

## Règles de précédence (backend NestJS)

Le mapper `strapi-projects-mapping.util.ts` applique la précédence directe sur historique :

- `type` : `projectTypeSelection` mappé du libellé français vers le slug stable ; sinon `projectType.slug`.
- `owner` : `ownerName` dès qu’il est défini, y compris une chaîne vide ; sinon `partner.name`.
- `ownerProfile` : `ownerProfile` direct ; sinon `partner.profile`.
- `habitatType` : `[habitatTypeSelection]` dès qu’il est défini ; sinon les libellés de `habitatTypes`.
- `reasonedPracticeTypes` : `reasonedPracticeSelections` dès que c’est un tableau, y compris `[]` ; sinon les composants historiques.
- `renaturationTypes` : `renaturationSelections` dès que c’est un tableau, y compris `[]` ; sinon les composants historiques.
- `extent` : `"{extentValue} {extentUnit}"` dès que `extentValue` est défini ; sinon `extent` historique.
- `contactEmail` : exposé uniquement si `displayContactEmail` vaut `true`.

`null` signifie « jamais saisi » et déclenche le repli. `[]` signifie « sélectionné explicitement aucune valeur » et est conservé.

## Valeurs contrôlées

### Types de projet

| Libellé français | Slug API stable |
|---|---|
| Sensibilisation | `sensibilisation` |
| Renaturation / Restauration | `renaturation-restauration` |
| Pratiques raisonnées | `pratiques-raisonnees` |
| Formation | `formation` |
| Consultation / Concertation | `consultation` |
| Suivi | `suivis` |

### Profils du porteur

- Commune
- Intercommunalité
- Département / DDT
- Région / DREAL
- Etablissement scolaire
- Agriculteur.ices
- Coopérative agricole
- Syndicat agricole
- Association d’agroécologie
- Apiculteur.ices
- Coopérative apicole
- Syndicat apicole
- Fédération de chasse / pêche
- Association de sensibilisation / préservation de la biodiversité
- Association autre
- Citoyen.ne
- Gestionnaires d’espaces naturels protégés : ENS, CEN, RNF, Natura 2000

### Types de consultation / concertation

- Atelier
- Réunion de concertation
- Consultation
- Comité de pilotage de projet
- Réunion d’information
- Prise en compte des pollinisateurs dans un PLU / PLUi / SCOT

### Types de suivi

- Suivi photographique
- Suivi entomologique en sciences participatives
- Suivi entomologique par inventaire d’experts

### Pratiques raisonnées

- Taille de haies
- Tonte tardive
- Réduction de pesticides
- Retrait complet de pesticides
- Réduction de l’éclairage nocturne artificiel
- Changement de matériel
- Non retournement de prairie

### Renaturation / restauration

- Prairie
- Lisière
- Rangée d’arbres
- Haies
- Bords de routes
- Bords de champs
- Désimperméabilisation

### Types de milieu

- Jardin public
- Jardin privé
- Autres espaces urbains publics végétalisés
- Exploitation agricole
- Espace Naturel Protégé
- Forêt privée
- Forêt publique
- Friche (urbaine, agricole, routières ou ferroviaire)
- Cours d’eau et leurs bordures

### Unités d’emprise

- `m²`
- `ha`

## Limites et règles de validation

- La vérification API confirme le schéma de la table et ses listes contrôlées. La présentation et les règles conditionnelles du formulaire autonome Airtable doivent être revues visuellement si une reproduction à l'identique est demandée.
- Les référentiels relationnels doivent contenir les libellés validés avant une migration de données réelle.
- Avant un déploiement sur une base existante, inventorier les valeurs via l'API Strapi en lecture, préparer leur correspondance avec les listes de ce document, puis les corriger dans l'administration Strapi ou par une API Strapi autorisée.
- Les anciennes données qui ne correspondent pas aux nouvelles énumérations doivent être normalisées par Strapi avant déploiement, jamais par insertion ou modification SQL directe.
- Les brouillons restent gérés par Draft/Publish et ne sont pas exposés par l'endpoint public.
- Le frontend continue de passer par NestJS ; il ne contacte pas Strapi directement.
- Les champs historiques `projectType`, `partner`, `habitatTypes`, `reasonedPracticeTypes`, `renaturationTypes` et `extent` ne doivent pas être supprimés ni modifiés avant une décision explicite de migration.
