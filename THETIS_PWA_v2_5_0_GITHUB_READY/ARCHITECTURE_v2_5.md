# Architecture THETIS v2.5

## Chargement

1. `app.js` télécharge une seule fois `database/THETIS_Database_MASTER.xlsx`.
2. SheetJS lit `Base_THETIS_MASTER` selon le mécanisme historique.
3. SheetJS recherche facultativement `Approches`.
4. La ligne d'en-tête d'`Approches` est repérée par `ID_Approche`.
5. Les approches sont indexées dans une `Map` JavaScript par `ID_Site`.

## Liaison

`Base_THETIS_MASTER.ID` = `Approches.ID_Site`

La relation est de type **un site vers plusieurs approches**.

## Affichage

La fiche détaillée appelle `approachHtml(r.id)` :

- aucune approche exploitable : aucun changement visuel ;
- une ou plusieurs approches : ajout conditionnel d'une section `Approche` ;
- les données historiques ne sont pas modifiées.

## Tolérance aux erreurs

- onglet `Approches` absent : tableau vide ;
- onglet vide : tableau vide ;
- ligne de titre avant les en-têtes : acceptée ;
- ligne sans `ID_Site` : ignorée ;
- statut archivé : ignoré ;
- plusieurs approches pour un site : toutes affichées.

## Principe d'évolution

Ce mécanisme pourra être réutilisé pour `Amarrages`, `Services`, `Medias` et les autres tables, sans modifier le modèle historique de `Base_THETIS_MASTER`.
