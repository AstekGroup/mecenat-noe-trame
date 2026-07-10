# Correspondance du modèle Airtable vers Strapi

Ce document décrit la correspondance entre le formulaire Airtable de référence et le modèle éditorial Strapi. Il distingue les libellés français visibles par les équipes des noms techniques stables consommés par le backend.

## Principe

```text
Formulaire Airtable        Administration Strapi       API publique
libellés et choix FR  ->   libellés et choix FR   ->  clés techniques stables
                                                      frontend <- NestJS <- Strapi
```

Les clés comme `consultationType` restent internes. Les personnes qui saisissent les contenus voient « Type de consultation / concertation ». Renommer les clés casserait inutilement le contrat entre Strapi, NestJS et React.

## Projet

| Formulaire Airtable | Type Airtable | Strapi | Type Strapi | Exposition publique | État |
|---|---|---|---|---|---|
| Vous êtes ? | Choix unique | `Partner.profile`, sélectionné via `Project.partner` | Énumération + relation | `ownerProfile` | Aligné, choix contrôlé |
| Quel est votre adresse e-mail ? | E-mail | `Project.submitterEmail` | E-mail privé | Jamais exposé | Aligné |
| Quel est le nom de votre projet ? | Texte obligatoire | `Project.title` | Texte obligatoire | `title` | Aligné |
| Quel est le type de votre projet ? | Choix unique | `Project.projectType` | Relation vers `ProjectType` | `type` sous forme de slug stable | Aligné |
| Quelle(s) pratiques raisonnées effectuez-vous ? | Choix multiple | `Project.reasonedPracticeTypes` | Composants répétables avec énumération | `reasonedPracticeTypes[]` | Choix contrôlé |
| Sur quoi portent vos actions ? | Choix multiple | `Project.renaturationTypes` | Composants répétables avec énumération | `renaturationTypes[]` | Choix contrôlé |
| Quel est le titre de votre action de sensibilisation ? | Texte | `Project.sensitizationTitle` | Texte | `sensitizationTitle` | Aligné |
| Quel est le titre de votre formation ? | Texte | `Project.trainingTitle` | Texte | `trainingTitle` | Aligné |
| Quel est le type de votre consultation / concertation ? | Choix unique | `Project.consultationType` | Énumération | `consultationType` | Aligné, liste déroulante |
| Quel est le type de votre suivi ? | Choix unique | `Project.followUpType` | Énumération | `followUpType` | Aligné, liste déroulante |
| À quelle fréquence s'effectue votre suivi ? | Texte | `Project.followUpFrequency` | Texte | `followUpFrequency` | Aligné ; ce n'est pas une liste dans Airtable |
| Sur quel milieu s'applique votre projet ? | Choix unique dans le formulaire actuel | `Project.habitatTypes` | Relation vers `HabitatType` | `habitatType[]` | Taxonomie contrôlée ; la relation multiple préserve les anciennes données multiples |
| Décrivez en quelques lignes votre projet | Texte long | `Project.description` | Texte long | `description` | Aligné |
| Afficher un e-mail de contact public ? | Case à cocher | `Project.displayContactEmail` | Booléen | Contrôle l'exposition de `contactEmail` | Aligné |
| E-mail de contact pour votre projet | E-mail | `Project.contactEmail` | E-mail | Exposé seulement avec consentement | Aligné |
| Adresse | Texte | `Project.address` | Texte | `address` | Aligné |
| Code postal | Texte | `Project.postalCode` | Texte | `postalCode` | Aligné |
| Ville | Texte | `Project.city` | Texte | `city` | Aligné |
| Emprise | Texte | `Project.extent` | Texte | `extent` | Aligné |

Les champs `latitude`, `longitude`, `department` et `region` sont enrichis ou structurés pour les besoins de la carte. Les champs historiques `isOngoing`, `contactPhone` et `website` restent disponibles pour les données déjà présentes, même s'ils ne figurent pas dans le formulaire actuel.

## Référentiels liés

| Élément | Représentation Airtable | Représentation Strapi | Raison |
|---|---|---|---|
| Porteur / partenaire | Profil et informations du formulaire | Collection `Partner`, reliée au projet | Éviter de répéter la même structure sur plusieurs projets |
| Département | Déduit de la localisation ou stocké dans les données | Collection `Department`, relation plusieurs-vers-un | Centraliser code, nom et région |
| Type de projet | Choix unique | Collection `ProjectType` à slug et libellé énumérés, relation plusieurs-vers-un | Conserver un slug stable, un libellé français et une couleur |
| Type de milieu | Choix unique dans le formulaire | Collection `HabitatType` à libellé énuméré, relation plusieurs-vers-plusieurs | Préserver les projets historiques pouvant avoir plusieurs milieux |
| Pratique raisonnée | Choix multiple | Composant répétable à valeur énumérée | Garder la forme `string[]` attendue par la carte |
| Renaturation / restauration | Choix multiple | Composant répétable à valeur énumérée | Garder la forme `string[]` attendue par la carte |

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

## Limites et règles de validation

- Les référentiels relationnels doivent contenir les libellés validés avant une migration de données réelle.
- Avant un déploiement sur une base existante, inventorier les valeurs via l'API Strapi en lecture, préparer leur correspondance avec les listes de ce document, puis les corriger dans l'administration Strapi ou par une API Strapi autorisée.
- Les anciennes données qui ne correspondent pas aux nouvelles énumérations doivent être normalisées par Strapi avant déploiement, jamais par insertion ou modification SQL directe.
- Les brouillons restent gérés par Draft/Publish et ne sont pas exposés par l'endpoint public.
- Le frontend continue de passer par NestJS ; il ne contacte pas Strapi directement.
