# Contributing

Merci de votre intérêt. *English below.*

## En français

Ce projet est maintenu par une seule personne : le processus est léger, mais les règles sur les
sources sont strictes, car elles garantissent la neutralité du comparateur.

### Signaler un problème

- **Une position fausse ou non sourcée** : ouvrez une issue avec le modèle *Correction: wrong or
  unsourced position*. Indiquez la question (son `id`), le parti, ce qui est codé aujourd'hui, ce
  qui devrait l'être, et **la source** : un document ou une déclaration du parti ou de son
  candidat, avec son lien, sa date et le passage exact. Sans source vérifiable, la position ne
  change pas.
- **Une erreur dans le calcul, les votes ou un script** : modèle *Bug report*.
- **Un problème de sécurité** : pas d'issue publique, voir [SECURITY.md](SECURITY.md).

### Règles éditoriales

- Une position ne vient que de textes et déclarations du parti ou de son candidat. Un vote des
  députés ne change jamais ce qu'un parti dit : les deux sont mesurés séparément.
- Pas de position devinée : un sujet non traité ou ambigu reste `{ backs: null, reason }`.
- Une source fragile (programme de 2022, texte commun, presse, livre d'un dirigeant) se signale
  par une note qui commence par « faible ».
- Aucune question n'est ajoutée, retirée ou reformulée après avoir regardé son effet sur le
  classement. Une proposition de nouvelle question doit dire sur quel critère extérieur elle
  s'appuie (importance du sujet dans les enquêtes, part de la population concernée).
- Les formulations ne supposent aucun statut (emploi, logement, revenu, enfants, voiture), et
  aucune option n'a de justification qui lui soit propre.

### Envoyer une pull request

1. Ouvrez d'abord une issue pour tout changement plus large qu'une correction.
2. Partez de `main`, gardez le changement petit et ciblé.
3. Lancez les contrôles de la CI :

   ```bash
   npm ci
   npm run typecheck
   npm test
   npm run validate
   ```

4. Expliquez la raison dans la description, avec les sources pour tout changement de données.

## In English

This is a one-person project with a light process and strict sourcing rules.

- **Wrong or unsourced position:** open an issue with the *Correction: wrong or unsourced
  position* template, giving the question `id`, the party, what is coded today, what it should
  be, and **the source**: a document or statement from the party or its candidate, with its link,
  date and the exact passage. Without a verifiable source, the position does not change.
- **Bug in the engine, the votes or a script:** use the *Bug report* template.
- **Security problem:** see [SECURITY.md](SECURITY.md), not a public issue.
- **Editorial rules:** positions come only from the party or its candidate; votes never change
  what a party says; no guessing (`{ backs: null, reason }`); fragile sources are flagged with a
  note starting with "faible"; no question is added, removed or reworded after looking at its
  effect on the ranking.
- **Pull requests:** open an issue first for anything larger than a fix, branch from `main`, run
  `npm run typecheck`, `npm test` and `npm run validate`, and give the reason (and the sources)
  in the description.

By contributing you agree that code contributions are released under the [MIT licence](LICENSE)
and data or text contributions under [CC BY 4.0](LICENSE-DATA.md). This project follows the
[Code of Conduct](CODE_OF_CONDUCT.md).
