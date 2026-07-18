# THETIS v2.2.5 — panneau mobile +0,5 cm

Cette version est construite directement à partir de la v2.2.4 validée.

Modification unique : sur téléphone, le panneau « Recherche & filtres » est remonté d'environ 0,5 cm supplémentaire. Le bas du panneau reste inchangé.

## Évolution principale

La PWA lit directement le classeur :

`database/THETIS_Database_MASTER.xlsx`

Feuille utilisée : `Base_THETIS_MASTER` (183 fiches).

## Interface conservée

Carte, filtres, favoris, géolocalisation, mode nuit, panneau mobile, installation PWA et cache hors connexion.

## Publication

Déposer le contenu de ce dossier directement dans le dossier `PWA` du dépôt GitHub, puis valider le commit.

Une connexion Internet est nécessaire à la première ouverture pour charger Leaflet, SheetJS et les premières tuiles cartographiques. Ces ressources sont ensuite mises en cache.

## v2.2.0
Fiche nautique remise au format convenu : coordonnées degrés/minutes, tableau de protection, mouillage/amarrage, services, gasoil, note et avertissement.


## Version 2.2.0
Fiche THETIS reconstruite fidèlement selon la maquette validée : présentation claire, protections par secteur, caractéristiques, services, informations à terre, notes et alertes.


## Correctif v2.2.1

- Sur téléphone, l’ouverture du panneau des filtres ne place plus automatiquement le curseur dans le champ Recherche. Le clavier ne s’ouvre que lorsque l’utilisateur touche volontairement ce champ.


## Modification v2.2.4
Le panneau Recherche & filtres sur mobile est remonté d’environ 1 cm supplémentaire à partir de la v2.2.3. Aucune autre fonctionnalité n’est modifiée.
