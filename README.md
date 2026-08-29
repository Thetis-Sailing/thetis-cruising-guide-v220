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

## v2.5.1 — Section MÉTÉO

Une section **MÉTÉO** est insérée après **Localisation**. Elle utilise les coordonnées déjà présentes dans la fiche et interroge Open‑Meteo uniquement lorsque la fiche est ouverte et qu’une connexion Internet est disponible.

Affichage : vent en nœuds, rafales, direction, pression/température de l’air, hauteur et direction des vagues, période et température de la mer. Aucune nouvelle colonne Excel n’est requise.

Les données météo sont indicatives et ne remplacent pas les prévisions marines officielles ni les outils habituels du navigateur. Attribution Open‑Meteo intégrée à l’interface.

Le cache de la PWA est `thetis-v2.5.1`; les réponses Open‑Meteo ne sont pas mises en cache par le Service Worker afin d’éviter d’afficher une météo ancienne.

## v2.5.2 — Présentation MÉTÉO harmonisée

Les six informations météo sont désormais présentées dans une grille de trois cartes par ligne, avec les mêmes dimensions, bordures et icônes de 20 px que les sections **Services** et **À terre**. La présentation reste identique sur ordinateur et téléphone et s’adapte au mode nuit.

L’avertissement météo a été retiré de la section **MÉTÉO** et regroupé dans l’encadré **IMPORTANT** en bas de la fiche. Le cache de la PWA est `thetis-v2.5.2`.


## v2.5.3
- conserve la présentation MÉTÉO harmonisée avec SERVICES et À TERRE ;
- conserve les grandes icônes météo validées ;
- ajoute deux raccourcis par icônes vers Météo Consult Marine et Windy ;
- les raccourcis restent visibles indépendamment du chargement Open-Meteo ;
- ajoute un versionnage explicite de app.js et styles.css pour limiter les problèmes de cache PWA.

## v2.5.4
- conserve la présentation MÉTÉO harmonisée et ses 6 grandes icônes ;
- regroupe Open-Meteo, Actualiser, Météo Consult Marine et Windy sur une seule ligne ;
- Météo Consult Marine et Windy sont alignés à droite ;
- mise en page compacte adaptée au téléphone.

## v2.5.6 — CAMPAGNE PILOTE NAVILY PORTS / MARINAS
- base : v2.5.4 stable et validée ;
- bouton Navily ajouté uniquement à 15 ports / marinas vérifiés ;
- aucun mouillage ajouté dans cette campagne ;
- aucune donnée Navily n'est copiée dans THETIS : seuls les liens publics directs sont utilisés ;
- aucune modification de la base Excel.

### Correspondances pilotes
- S001 — Çeşme Marina — https://www.navily.com/port/ic-cesme-marina/1627
- S013 — Kuşadası Marina — https://www.navily.com/port/setur-kusadasi-marina/1630
- S017 — Didim Marina — https://www.navily.com/port/didim-marina/1631
- S025 — Bodrum Marina — https://www.navily.com/port/milta-bodrum-marina/1639
- S032 — Turgutreis Marina — https://www.navily.com/port/d-marin-turgutreis-marina/1637
- S034 — Yalıkavak Marina — https://www.navily.com/port/yal-kavak-marina/1636
- S073 — Göcek Marina — https://www.navily.com/port/mucev-marina/12223
- S083 — Fethiye Marina — https://www.navily.com/port/ece-saray-marina/1656
- S087 — Kaş Marina — https://www.navily.com/port/setur-kas-marina/1645
- S109 — Mandraki – Rhodes — https://www.navily.com/port/mandraki/1536
- S121 — Yialos – Symi Public Port — https://www.navily.com/port/symi-public-port/1550
- S145 — Pali – Nisyros — https://www.navily.com/port/port-of-palon/1549
- S150 — Kos Marina — https://www.navily.com/port/kos-marina/1423
- S157 — Pothia – Kalymnos Marina — https://www.navily.com/port/kalymnos-marina/18946
- S169 — Lakki Marina — https://www.navily.com/port/lakki-town-marina/9748

## v2.5.7 — NAVILY PORTS / MARINAS

- conserve intégralement la présentation et les fonctions de la v2.5.6 ;
- 15 correspondances Navily pilotes conservées ;
- 28 nouvelles correspondances Navily ajoutées ;
- total : 43 fiches THETIS disposant d'un accès Navily direct ;
- certaines fiches THETIS classées « Port / quai » correspondent chez Navily à un mouillage avec quai ou à une baie : le lien vise le lieu exact, sans recopier de données Navily ;
- S005 — Paşalimanı (Çeşme) reste volontairement sans lien : la fiche THETIS est classée « Port / quai », mais aucune fiche Navily exacte de ce lieu n'a pu être identifiée avec une confiance suffisante. Aucun lien approximatif n'a été ajouté ;
- aucune modification de la base Excel.

## v2.5.8 — FILTRE NAVILY

- conserve intégralement la v2.5.7 ;
- dans « Recherche & Filtres », le filtre « Supermarché » est remplacé par « Navily » ;
- lorsque « Navily » est coché, seules les fiches disposant d'un lien Navily direct sont affichées ;
- les informations Supermarché restent présentes dans les fiches et dans la base ; seul le filtre est remplacé.

## v2.5.9 — CAMPAGNE PILOTE NAVILY MOUILLAGES

- conserve intégralement la v2.5.8 ;
- ajoute 15 mouillages disposant d'un accès direct vers leur fiche Navily ;
- conserve les 43 liens existants vers ports / marinas / lieux déjà validés ;
- total : 58 fiches THETIS avec accès Navily direct ;
- le filtre « Navily » affiche désormais toutes les fiches liées, ports comme mouillages ;
- aucune donnée Navily n'est copiée dans THETIS : seuls les liens directs publics sont utilisés ;
- aucune modification de la base Excel.

### 15 mouillages pilotes
- S068 — Bozukkale — https://www.navily.com/fr/mouillage/bozukkale/44046
- S069 — Ekincik — https://www.navily.com/mouillage/700fe688ff2970d633ff04c9b7f7cdd4/14507
- S076 — Boynuzbükü — https://www.navily.com/fr/mouillage/boynuz-buku/43112
- S078 — Tersane Adası — https://www.navily.com/fr/mouillage/tersane-island/16733
- S112 — Faliraki — https://www.navily.com/fr/mouillage/faliraki-beach/56944
- S113 — Ladiko — https://www.navily.com/mouillage/ladiko-bay/17097
- S114 — Anthony Quinn Bay — https://www.navily.com/fr/mouillage/anthony-quinns-bay/39902
- S115 — Lindos — https://www.navily.com/fr/mouillage/5c0b052354b12706b6f833c28de43a4e/16150
- S116 — St Paul’s Bay — https://www.navily.com/mouillage/saint-pauls-bay/19825
- S122 — Pedi — https://www.navily.com/fr/mouillage/pedi/22008
- S123 — Nanou — https://www.navily.com/fr/mouillage/f047f42631dfe5b29465d5ae905a3bb9/16275
- S125 — Panormitis — https://www.navily.com/mouillage/8022185c08ce8455893a9b989e1dcff6/15248
- S128 — Agios Georgios Dysalonas — https://www.navily.com/fr/mouillage/agios-georgios/16148
- S134 — Eristos — https://www.navily.com/fr/mouillage/tilos/31939
- S137 — Lethra — https://www.navily.com/fr/mouillage/a2cc8a7637313777cd4d0cd9d4603580/66582


## v2.5.10 — MÉTÉO : WINDY FORECAST

Évolution d'affichage uniquement :

- suppression du raccourci **Météo Consult Marine** ;
- conservation du raccourci Windy avec le libellé **Windy Forecast** à côté de l’icône ;
- maintien des fonctionnalités et liens Navily de la v2.5.9 ;
- nouveau cache PWA `thetis-v2.5.10` pour forcer la mise à jour après publication.
