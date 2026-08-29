# THETIS PWA v2.5.0 — lecture multi-onglets

Cette version est construite directement à partir des fichiers de la PWA v2.4.3 transmis le 28 juillet 2026.

## Évolution unique

La PWA lit désormais deux onglets du même classeur :

- `Base_THETIS_MASTER` : fonctionnement historique inchangé ;
- `Approches` : nouvelles données reliées aux fiches par `ID_Site` = `ID`.

L'onglet `Approches` peut rester vide ou même être absent : la PWA continue alors à fonctionner exactement comme la v2.4.3.

Lorsqu'une ligne d'approche contient une description, des repères visuels ou des dangers, une section **Approche** apparaît dans la fiche concernée.

## Structure attendue de l'onglet Approches

La ligne d'en-tête est détectée automatiquement grâce à la colonne `ID_Approche`, même si une ligne de titre la précède.

Colonnes prises en charge :

`ID_Approche`, `ID_Site`, `Type_approche`, `Direction_arrivée`, `Description`, `Repères_visuels`, `Dangers`, `Profondeur_entrée_m`, `Difficulté`, `Navigation_nuit`, `Vent_traversier`, `Source`, `Date_vérification`, `Niveau_confiance`, `Statut`.

Les lignes dont le statut contient `Archivé` sont ignorées.

## Compatibilité

Toutes les fonctions de la v2.4.3 sont conservées : carte, filtres, favoris, géolocalisation, mode nuit, installation, services, téléphone, Commentaire THETIS et avertissement final.

## Publication

Remplacer le contenu du dossier `PWA` du dépôt GitHub par le contenu de ce dossier, puis valider le commit. Netlify publiera automatiquement la v2.5.0.

Après publication, tester d'abord sur ordinateur, puis actualiser la PWA installée sur téléphone. Le nouveau cache porte le nom `thetis-v2.5.0`.

## v2.5.2 — Section MÉTÉO + accès externes

Une section **MÉTÉO** est insérée après **Localisation**. Elle utilise les coordonnées déjà présentes dans la fiche et interroge Open‑Meteo uniquement lorsque la fiche est ouverte et qu’une connexion Internet est disponible.

La v2.5.2 ajoute deux boutons icônes sous les données Open‑Meteo : **Météo Consult Marine** et **Windy**. Le bouton Windy ouvre la carte sur les coordonnées de la fiche sélectionnée.

Affichage : vent en nœuds, rafales, direction, pression/température de l’air, hauteur et direction des vagues, période et température de la mer. Aucune nouvelle colonne Excel n’est requise.

Les données météo sont indicatives et ne remplacent pas les prévisions marines officielles ni les outils habituels du navigateur. Attribution Open‑Meteo intégrée à l’interface.

Le cache de la PWA est `thetis-v2.5.2`; les réponses Open‑Meteo ne sont pas mises en cache par le Service Worker afin d’éviter d’afficher une météo ancienne.
