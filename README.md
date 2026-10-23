<h1 align="center">Présidentielle 2027 : données et méthode</h1>

<p align="center"><strong>Les positions documentées des partis, leurs votes à l'Assemblée et le moteur qui les compare à vos réponses.</strong><br>
<em>Documented party positions, Assemblée nationale votes, and the engine that compares them with your answers.</em></p>

<p align="center">
  <a href="https://github.com/LightSeek3r/presidentielle-2027/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/LightSeek3r/presidentielle-2027/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="Code: MIT" src="https://img.shields.io/badge/code-MIT-1d5bbf"></a>
  <a href="LICENSE-DATA.md"><img alt="Data: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-1d5bbf"></a>
  <a href="CHANGELOG.md"><img alt="Version 0.1.1" src="https://img.shields.io/badge/version-0.1.1-1d5bbf"></a>
</p>

<p align="center">
  <a href="https://www.unit42.fr/2027"><strong>Ouvrir le comparateur</strong></a> ·
  <a href="https://www.unit42.fr/2027/methode">Page Méthode</a> ·
  <a href="METHOD.md">METHOD.md</a> ·
  <a href="CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/LightSeek3r/presidentielle-2027/issues/new/choose">Signaler une erreur</a>
</p>

**[Français](#français)** · **[English](#english)**

---

## Français

Ce dépôt publie les **données**, la **méthode** et le **moteur de calcul** du comparateur
d'affinités pour l'élection présidentielle de 2027 de [unit42.fr/2027](https://www.unit42.fr/2027).
Chaque position d'un parti est reliée à sa source, chaque vote à son scrutin officiel, et chaque
règle de calcul au code qui l'applique : tout le monde peut relire, vérifier, réutiliser et
proposer une correction sourcée.

**Partie de [Unit42](https://www.unit42.fr).** Le comparateur est conçu et maintenu par
[LightSeek3r](https://github.com/LightSeek3r). L'interface du site reste dans le dépôt du site ;
ce dépôt-ci contient tout ce qui détermine un résultat.

- [Ce que contient ce dépôt](#ce-que-contient-ce-dépôt) · [Comment se calcule un score](#comment-se-calcule-un-score)
- [Démarrer](#démarrer) · [Structure](#structure) · [Vérifier les données](#vérifier-les-données)
- [Ajouter ou vérifier une source](#ajouter-ou-vérifier-une-source)
- [Contribuer](#contribuer) · [Sécurité](#sécurité) · [Versions](#versions) · [Licences](#licences)

### Ce que contient ce dépôt

- **34 questions** (20 principales, 14 « pour affiner ») et les positions de **12 partis**, de
  Lutte ouvrière à Reconquête, chacune avec sa ou ses sources datées, ou avec la raison de son
  absence (non couvert, ambigu).
- **14 scrutins de l'Assemblée nationale** (17e législature), compilés depuis les données
  ouvertes officielles, reliés à 14 questions dont 11 principales.
- Les **26 mesures publiées** de la page « Impact pour moi », retenues selon une règle de
  publication uniforme.
- Le **moteur de calcul** en TypeScript pur : scores « ce qu'ils disent » et « ce qu'ils font »,
  égalités, bloc du second tour, page d'impact.
- Les **tests** et les **contrôles éditoriaux** que le site applique avant chaque publication.

C'est un **indicateur de proximité** construit à partir de positions publiques documentées, à
lire question par question. Ce n'est pas une recommandation de vote, ni un sondage : le résultat
montre des proximités, et le choix reste celui de chacun.

### Comment se calcule un score

Pour chaque question, votre réponse et la position d'un parti deviennent des parts réparties
entre les options. L'accord est la part commune ; le score est la moyenne des accords, pondérée
par l'importance que vous donnez à chaque question. Le détail est dans [METHOD.md](METHOD.md).

| Règle | Valeur | Constante |
| --- | --- | --- |
| Réponses avant d'afficher un résultat | 8 | `MIN_ANSWERED` |
| Questions minimum pour un score « dit » | 6, couvrant au moins 50 % du poids | `MIN_SCORED`, `MIN_COVERAGE` |
| Questions votées minimum pour un score « fait » | 5 | `MIN_VOTES` |
| Poids d'une question marquée importante | 2 (sinon 1) | `scoreDimension` |
| Écart maximal entre ex aequo | 5 points (scores arrondis à 5) | `TIE_MARGIN` |
| Députés minimum pour qu'un scrutin compte pour un groupe | 3 | `MIN_VOTERS` |

« Ce qu'ils disent » vient des programmes et déclarations ; « ce qu'ils font » vient des votes du
groupe de députés. Les deux sont calculés et affichés séparément, et un vote ne modifie jamais ce
qu'un parti dit.

### Démarrer

Il faut Node.js 24 (voir `.nvmrc`).

```bash
git clone https://github.com/LightSeek3r/presidentielle-2027.git
cd presidentielle-2027
npm ci
npm test            # tests unitaires (vitest)
npm run typecheck   # tsc --noEmit
npm run validate    # contrôles éditoriaux et rapport sur les données réelles
```

Autres scripts :

```bash
npm run robustness                     # fragilité du classement « dit » question par question
npm run build-votes -- --dir <dossier> # régénère src/data/votes.generated.json
```

`build-votes` lit le fichier `Scrutins.json.zip` des
[données ouvertes de l'Assemblée nationale](https://data.assemblee-nationale.fr/travaux-parlementaires/votes),
téléchargé et décompressé à la main dans `<dossier>` ; le script lui-même n'accède pas au réseau.

### Structure

```text
src/
  scoring.ts        scores « dit » et « fait », seuils, arrondi, égalités
  secondRound.ts    bloc du second tour : barycentre, ordre, silence avant le vote
  impact.ts         page « Impact pour moi » : effets d'une mesure pour une situation
  quizState.ts      déroulé du questionnaire (ordre des questions, réponses nuancées)
  impactState.ts    déroulé des critères de la page d'impact
  shuffle.ts        mélange des options, stable pour une session
  data/
    questions.ts    les questions, leurs options et les positions sourcées des partis
    parties.ts      les 12 partis et leur groupe à l'Assemblée
    finalists.ts    forces du second tour, sondages et mentions légales, périodes de silence
    scrutins.json   scrutins retenus
    votes.generated.json  décomptes par groupe (généré par build-votes)
    votes.ts        répartition des votes d'un groupe sur les options
    impact.ts       liste des mesures publiées ; impact/*.ts une mesure par fichier
    impactCriteria.ts, impactHelpers.ts, impactTypes.ts   critères et vocabulaire du profil
    validate.ts, validateImpact.ts   règles éditoriales vérifiées par le code
    types.ts, meta.ts, index.ts      modèle de données, versions, jeu de données complet
  __tests__/        tests vitest
test/
  fixtures/         données de test entièrement fictives (partis « Parti A » à « Parti L »)
scripts/
  validate.ts       npm run validate
  robustness.mjs    npm run robustness
  build-votes.mjs   npm run build-votes
METHOD.md, METHOD.en.md   la méthode, en français et en résumé anglais
```

Le moteur n'importe que des fichiers de ce dépôt et n'utilise ni réseau ni stockage du
navigateur ; un test le vérifie (`src/__tests__/privacyGuard.test.ts`).

### Vérifier les données

`npm test` et `npm run validate` appliquent les mêmes règles que le site :

- chaque position porte au moins une source en https, datée (AAAA-MM-JJ) et pas après la date de
  publication (`PUBLISHED_AT`) ; une position sans source documentée est `{ backs: null, reason }` ;
- une position « claire » défend exactement une option, une position « partagée » au moins deux,
  et toutes les options citées existent ;
- 3 à 5 options par question, des limites de mots pour les situations, options et explications,
  une explication « en clair » pour chaque option, des « cas » pour toutes les options ou aucune ;
- 18 à 22 questions principales, dont au moins 11 avec un vote, et chaque scrutin cité présent
  dans les décomptes ;
- les sondages du second tour portent toutes leurs mentions légales ;
- chaque mesure d'impact est valide et publiée, avec au moins 3 options défendues par une
  position solide, dans au moins 2 des 3 ensembles gauche, centre, droite.

`npm run validate` affiche aussi le nombre de positions documentées par parti, les positions
marquées « faible » et, pour chaque mesure, le nombre d'options et les ensembles qui la qualifient.

### Ajouter ou vérifier une source

1. Trouvez la question dans `src/data/questions.ts` (ou la mesure dans `src/data/impact/`) et le
   parti dans son bloc `programme`.
2. Ouvrez chaque URL de `sources` et vérifiez que le passage cité (le libellé indique la page ou
   la section) dit bien ce que code la position.
3. Pour corriger, citez un document ou une déclaration **du parti ou de son candidat** : une
   source `s(kind, date, label, url)` avec le type (`programme-2027`, `plateforme-2024`,
   `programme-2022`, `motion`, `declaration`, `autre`), la date ISO de publication et le passage
   utilisé. Une source plus fragile (2022, texte commun, presse) se signale par une note qui
   commence par « faible ».
4. Lancez `npm test` et `npm run validate`.

### Contribuer

Les corrections sont bienvenues, en particulier sur les positions. **Une correction de position
doit venir avec une source** vérifiable du parti ou de son candidat : utilisez le modèle
d'issue « Correction : position fausse ou non sourcée ». Lisez [CONTRIBUTING.md](CONTRIBUTING.md)
avant d'ouvrir une pull request. Le projet suit un [code de conduite](CODE_OF_CONDUCT.md).

### Sécurité

Merci de ne pas ouvrir d'issue publique pour une vulnérabilité : [SECURITY.md](SECURITY.md)
explique comment la signaler en privé. Le dépôt ne contient aucun secret.

### Versions

La version de `package.json` et les tags `vX.Y.Z` suivent [Semantic Versioning](https://semver.org)
de façon souple tant que le projet est en 0.x. Les changements notables sont dans
[CHANGELOG.md](CHANGELOG.md), chaque tag a sa [release](https://github.com/LightSeek3r/presidentielle-2027/releases).
Les données ont leur propre version (`DATA_VERSION`, `IMPACT_VERSION` dans `src/data/meta.ts`).

### Licences

- **Code** : [MIT](LICENSE).
- **Données et textes** (questions, positions, références des sources, mesures, `METHOD.md`) :
  [CC BY 4.0](LICENSE-DATA.md). Pour créditer : *Source : LightSeek3r, presidentielle-2027,
  https://github.com/LightSeek3r/presidentielle-2027*.
- Les noms et logos des partis et les propos cités restent la propriété de leurs auteurs ; aucun
  logo n'est inclus, et les sources sont citées par un lien. Les décomptes de votes viennent des
  données ouvertes de l'Assemblée nationale (Licence Ouverte d'Etalab), les votes européens de
  [HowTheyVote.eu](https://howtheyvote.eu) (ODbL).

---

## English

This repository publishes the **data**, the **method** and the **scoring engine** of the 2027
French presidential election affinity quiz at [unit42.fr/2027](https://www.unit42.fr/2027). Every
party position links to its source, every vote to its official roll call, and every scoring rule
to the code that applies it, so anyone can read, check, reuse and propose a sourced correction.

**Part of [Unit42](https://www.unit42.fr).** The quiz is built and maintained by
[LightSeek3r](https://github.com/LightSeek3r). The website's interface lives in the site's own
repository; this one holds everything that decides a result. The quiz and its data are in French.

### What is in this repository

- **34 questions** (20 core, 14 optional) and the positions of **12 parties**, each with dated
  sources or the reason it has none (not covered, ambiguous).
- **14 Assemblée nationale roll calls** (17th legislature), compiled from the official open data
  and linked to 14 questions, 11 of them core.
- The **26 published measures** of the "Impact pour moi" page, selected under one uniform rule.
- The pure TypeScript **engine**: "what they say" and "what they do" scores, ties, the
  second-round block, the impact page.
- The **tests** and **editorial checks** the website runs before publishing.

It is an **affinity indicator** built from documented public positions, meant to be read question
by question. It is not a voting recommendation or a poll: it shows closeness, and the choice
stays with each voter.

### How scoring works

For each question, your answer and a party's position become shares over the options. Agreement
is the shared part; the score is the mean agreement, weighted by how important you marked each
question. "What they say" (`dit`) comes from programmes and statements, "what they do" (`fait`)
from the votes of the party's group of deputies; both are computed and shown separately. The
thresholds are in the table above; the full method is in [METHOD.md](METHOD.md) (French) and
[METHOD.en.md](METHOD.en.md) (English summary).

### Getting started

Requires Node.js 24 (see `.nvmrc`).

```bash
git clone https://github.com/LightSeek3r/presidentielle-2027.git
cd presidentielle-2027
npm ci
npm test            # unit tests (vitest)
npm run typecheck   # tsc --noEmit
npm run validate    # editorial checks and a report on the real data
```

`npm run robustness` prints how fragile the "dit" ranking is to removing each question.
`npm run build-votes -- --dir <folder>` rebuilds `src/data/votes.generated.json` from the
Assemblée nationale `Scrutins.json.zip`, downloaded and unzipped by hand; the script itself makes
no network request.

### Repository layout

See [Structure](#structure) above: the engine sits in `src/*.ts`, the data and its validation in
`src/data/`, the tests in `src/__tests__/` with fictional test data in `test/fixtures/`, the scripts
in `scripts/`. The engine imports nothing
outside this repository and uses no network or browser storage, which a test checks.

### Checking and adding sources

`npm test` and `npm run validate` apply the website's rules: every position has at least one
https source dated no later than `PUBLISHED_AT`, positions only reference existing options, word
limits and option counts hold, enough core questions have a vote, polls carry their legal
mentions, and published impact measures meet the publication rule. To add or correct a source,
edit the party's entry in `src/data/questions.ts` (or `src/data/impact/*.ts`) with a document or
statement **from the party or its candidate**, its ISO date and the passage used, then run the
checks.

### Contributing

Corrections are welcome. **A correction of a position must come with a source** from the party or
its candidate: please use the "Correction: wrong or unsourced position" issue template, and read
[CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. This project follows a
[code of conduct](CODE_OF_CONDUCT.md).

### Security

Please do not open a public issue for a vulnerability; [SECURITY.md](SECURITY.md) explains how to
report one privately. The repository holds no secrets.

### Versions

`package.json` and the `vX.Y.Z` tags follow [Semantic Versioning](https://semver.org) loosely
while the project is 0.x; see [CHANGELOG.md](CHANGELOG.md) and the
[releases](https://github.com/LightSeek3r/presidentielle-2027/releases). The data carries its own
versions (`DATA_VERSION`, `IMPACT_VERSION` in `src/data/meta.ts`).

### Licence

- **Code**: [MIT](LICENSE).
- **Data and texts** (questions, positions, source references, measures, method documents):
  [CC BY 4.0](LICENSE-DATA.md). Credit: *Source: LightSeek3r, presidentielle-2027,
  https://github.com/LightSeek3r/presidentielle-2027*.
- Party names, logos and quoted statements remain their owners' property; no logo is included and
  sources are linked rather than reproduced. Vote counts come from the Assemblée nationale open
  data (Etalab Open Licence), European votes from [HowTheyVote.eu](https://howtheyvote.eu) (ODbL).
