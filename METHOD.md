# Méthode

*English summary: [METHOD.en.md](METHOD.en.md).*

Ce document décrit comment le comparateur de [unit42.fr/2027](https://www.unit42.fr/2027)
fabrique ses résultats à partir des données de ce dépôt. Il reprend la page « Méthode » du site
([unit42.fr/2027/methode](https://www.unit42.fr/2027/methode)) et la relie au code qui
l'applique. Chaque nombre cité ici est une constante du code, indiquée entre parenthèses.

Version des données : `2026-10-v1.1` (`DATA_VERSION`), impact : `2026-10-i0` (`IMPACT_VERSION`),
sources datées au plus tard du 15 octobre 2026 (`PUBLISHED_AT`), dans `src/data/meta.ts`.

## 1. Principe

Le comparateur propose des situations du quotidien. Pour chacune, la personne choisit l'option la
plus proche de son avis. Ses choix sont comparés, parti par parti, à deux choses mesurées
séparément :

- **« Ce qu'ils disent »** (`dit`) : ce que dit le programme du parti ou de son candidat ;
- **« Ce qu'ils font »** (`fait`) : la façon dont les députés de son groupe ont voté à
  l'Assemblée nationale.

C'est un indicateur de proximité, construit à partir de positions publiques documentées et
sourcées. Ce n'est ni un sondage, ni une recommandation de vote.

## 2. Les questions

- **20 questions principales** (`tier: 'core'`) réparties à parts égales : 10 économiques et
  10 culturelles (société, sécurité, immigration, écologie, institutions), puis des questions
  « pour affiner » (`tier: 'affiner'`, 14 dans la version 1.1) proposées à la suite.
- Les sujets s'appuient sur un critère extérieur : l'enquête électorale d'avril 2026 d'Ipsos, du
  CEVIPOF, de la Fondation Jean-Jaurès et du Monde, recoupée par cinq autres enquêtes de 2025 et
  2026. Ils ne sont pas choisis selon ce qui avantagerait un parti.
- La liste a été figée le 11 octobre 2026, avant tout calcul de score. Seule exception, décidée
  par l'auteur : trois questions « pour affiner » ajoutées le 15 octobre 2026 (âge de départ à la
  retraite, travail indépendant, entreprises qui grandissent), pour combler des manques notés par
  écrit avant tout calcul de score. Règle pour la suite : aucune question n'est ajoutée, retirée
  ou reformulée après avoir regardé ce qu'elle change au classement.
- Rédaction : une situation fait 35 mots au plus, une option 20 mots au plus, une explication
  « en clair » 40 mots au plus, et chaque question a 3 à 5 options (`src/data/validate.ts`). Les
  options sont des actions, pas des slogans, et la formulation ne suppose ni un statut, ni un
  métier, ni un logement, ni une famille.
- Les exemples d'application d'une mesure (« cas ») sont donnés pour toutes les options d'une
  question ou pour aucune, afin de ne pas faire pencher la question.
- L'ordre des options est mélangé, avec une graine fixe pour toute la session, pour qu'aucune ne
  soit toujours en premier (`src/shuffle.ts`). Les questions principales viennent d'abord, puis
  les questions « pour affiner » si la personne le choisit (`sequenceOf`, `src/quizState.ts`).

## 3. Les réponses

Une réponse (`Answer`) compte une ou deux options (deux = une réponse nuancée), peut être passée,
et peut être marquée « Ce sujet compte beaucoup pour moi ». Au-delà de deux options, seules les
deux premières sont gardées.

## 4. Le calcul du score (`src/scoring.ts`)

Pour chaque question, la réponse et la position d'un parti deviennent des parts réparties entre
les options :

- une option choisie compte pour 100 % ; deux options nuancées, 50 % chacune ;
- un parti qui défend une seule option (`kind: 'clear'`) compte pour 100 % sur elle ; un parti
  partagé entre plusieurs options (`kind: 'split'`) est réparti à parts égales entre elles.

L'accord sur une question est la part commune des deux répartitions :

```text
accord = somme, option par option, de min(votre part ; part du parti)
```

Exemple : l'option A à 100 % face à un parti partagé entre A (50 %) et B (50 %) donne un accord
de 50 %.

Le score d'un parti est la moyenne des accords pondérée par l'importance :

```text
score = somme(poids × accord) ÷ somme(poids)
```

- Le poids vaut 1, et 2 pour une question marquée importante.
- Une question passée n'est pas comptée, ni son poids.
- Une question sur laquelle le parti n'a pas de position n'est pas comptée pour lui.

**Seuils d'affichage.**

- Aucun résultat avant 8 réponses (`MIN_ANSWERED`).
- Le score « dit » d'un parti n'est affiché que s'il repose sur au moins 6 questions
  (`MIN_SCORED`) qui pèsent au moins 50 % du poids des réponses (`MIN_COVERAGE`). Sinon :
  « données insuffisantes ».
- Le score « fait » est affiché dès qu'il repose sur au moins 5 questions ayant un vote
  (`MIN_VOTES`), sans condition de part, et le site indique toujours sur combien de questions
  votées il repose. Il compte des questions, pas des scrutins.
- Un parti dont les positions documentées sont peu nombreuses obtient plus souvent « données
  insuffisantes ». Cela reflète le manque de positions publiées. `npm run validate` affiche le
  nombre de positions documentées par parti.

**Arrondi et égalités.** Les scores sont arrondis à 5 points. Les groupes d'ex aequo se forment
depuis le score le plus haut : un parti rejoint le groupe s'il est à 5 points ou moins du premier
du groupe (`TIE_MARGIN`, `groupTied`, `rankWithTies`). Dans un groupe, l'ordre est alphabétique.
Les partis sans score affichable forment le dernier groupe. Tout ce qui est affiché vient des
scores arrondis.

**Options qu'aucun parti ne défend.** `noPartyShare` donne la part des réponses qui tombent sur
des options qu'aucun parti ne défend, ni dans son programme, ni dans les votes de son groupe.

## 5. « Ce qu'ils disent » : les positions documentées

- Une position vient d'un document ou d'une déclaration du parti ou de son candidat : programme
  de 2027 quand il existe, plateforme des législatives de 2024, motion de congrès, déclaration
  officielle, ou programme de 2022 (indiqué comme tel). Le type de source est noté (`SourceKind`).
- Chaque position non vide porte au moins une source : adresse https, date ISO, et date au plus
  tard égale à `PUBLISHED_AT`. Le libellé de la source précise la page ou le passage utilisé.
- Quand un texte ne traite pas un sujet ou qu'il est ambigu, la position est
  `{ backs: null, reason }` avec la raison (`non-couvert`, `ambigu`, `absent`) : le comparateur
  ne devine jamais.
- Une note qui commence par « faible » signale une position fragile (source de 2022, texte
  commun, livre d'un dirigeant, moitié d'option sourcée…). Les textes communs de 2024 (contrat du
  Nouveau Front populaire, plateforme Ensemble) ne servent qu'en dernier recours, marqués
  « faible », quand le parti n'a aucun document plus récent qui lui soit propre. Une exception,
  décidée par l'auteur et signalée dans la note de la position : l'installation des médecins pour
  La France insoumise.
- Un vote des députés ne change jamais ce qu'un parti dit : les deux sont mesurés séparément.

## 6. « Ce qu'ils font » : les votes à l'Assemblée nationale (`src/data/votes.ts`)

- Les votes viennent des données ouvertes de l'Assemblée nationale pour la 17e législature
  (`scripts/build-votes.mjs` produit `src/data/votes.generated.json` à partir de
  `Scrutins.json.zip`). Les scrutins utilisés sont listés dans `src/data/scrutins.json`.
- Un scrutin n'est retenu que si son sens est sans ambiguïté pour la question. Chaque question
  avec vote indique ses scrutins et la correspondance pour / contre / abstention → option.
  Quand un vote n'est clair que dans un sens, seul ce sens est codé (`null` pour l'autre).
- Pour chaque scrutin, on prend la répartition des votes du groupe, pas seulement le vote de la
  majorité : un groupe partagé à 60 / 40 compte pour 60 % d'un côté et 40 % de l'autre. Les
  absents et non-votants ne sont pas comptés. Si moins de 3 députés du groupe ont exprimé un vote
  utile (`MIN_VOTERS`), le scrutin est ignoré pour ce groupe. Plusieurs scrutins d'une même
  question sont moyennés.
- Un texte adopté par l'article 49.3 n'a pas de scrutin : il n'est pas utilisé.
- Un groupe de députés n'est pas un parti. Correspondance utilisée (`src/data/parties.ts`) :
  PS / Place publique → SOC, PCF → GDR, Les Républicains → DR, Renaissance → EPR, MoDem → Dem,
  Horizons → HOR, La France insoumise → LFI-NFP, Les Écologistes → EcoS, UDR → UDR,
  Rassemblement national → RN. Les votes sont ceux du groupe, jamais présentés comme ceux du
  parti tout entier. Le groupe LIOT n'est rattaché à aucun parti de la liste.
- Lutte ouvrière et Reconquête n'ont pas de députés, donc pas de score « fait ». Sur quelques
  questions, des votes au Parlement européen (`europeanVotes`, données
  [HowTheyVote.eu](https://howtheyvote.eu), licence ODbL) sont montrés à titre d'information,
  sans jamais être comptés dans un score.

## 7. La page « Impact pour moi » (`src/impact.ts`, `src/data/impact/`)

Elle répond à une autre question : « que changerait cette mesure pour quelqu'un dans ma
situation ? ». La personne décrit sa situation (revenus, patrimoine, foyer, logement…) et, liste
par liste, la page montre les mesures qui la concernent.

- Les mesures ont été choisies avant de regarder qui y gagne ou y perd, sur un critère extérieur :
  un levier fixé par la loi nationale, avec un barème public, qui touche au moins un million de
  ménages ou de personnes, ou au moins 2 milliards d'euros par an, ou au moins 3 % de la
  consommation des ménages.
- Règle de publication (`publicationStatus`, `src/data/validateImpact.ts`), appliquée à toutes les
  mesures : au moins 3 options défendues par une position solide (`MIN_BACKED_OPTIONS`), et des
  positions solides dans au moins 2 des 3 ensembles gauche, centre, droite (`MIN_BLOCS`). Les
  positions « faibles » sont affichées mais ne comptent pas pour cette règle. Une mesure qui ne la
  respecte pas n'est pas publiée. Ce dépôt contient les 26 mesures publiées (`IMPACT_MEASURES`).
- Un effet est écrit du point de vue du lecteur et ne nomme jamais de parti. Un montant en euros
  n'existe qu'avec un chiffrage officiel ou un barème documenté comme base, et c'est un ordre de
  grandeur pour une tranche de revenu ; les hypothèses sont écrites avec lui.
- Pour un parti partagé entre plusieurs options, l'effet est « incertain » sauf si toutes vont
  dans le même sens pour cette situation ; un ensemble de mesures proposées ensemble
  (`cumulative`) est jugé sur les options qui concernent la personne.
- Il n'y a ni total, ni score, ni classement entre les listes. Une position non documentée n'est
  jamais comptée comme neutre.

## 8. Le bloc « Et au second tour ? » (`src/secondRound.ts`, `src/data/finalists.ts`)

- Il montre la proximité relative avec deux ou trois forces : jusqu'au premier tour, celles qui
  atteignent les deux premières places dans au moins un scénario d'un sondage national récent
  d'un grand institut (trois au plus) ; après le premier tour, les deux qualifiés
  (`mode: 'qualifies'`).
- Chaque sondage utilisé porte ses mentions légales (institut, commanditaire, dates, échantillon,
  marge d'erreur, notice de la Commission des sondages), conformément à la loi n° 77-808 du
  19 juillet 1977. Aucun chiffre de sondage n'est affiché dans le bloc.
- Le point de la personne est le barycentre des sommets, pondéré par ses scores arrondis : il se
  place plus près des forces avec lesquelles le score est le plus élevé. La position est relative,
  c'est pourquoi les pourcentages absolus restent affichés. Les forces sont dans l'ordre
  alphabétique, jamais dans l'ordre des sondages. Le site signale quand le meilleur score
  « dit » est inférieur à 40 % (`bestBelowThreshold`).
- Silence avant le vote : le bloc est masqué du vendredi 0 h au dimanche 20 h (heure de Paris)
  avant chaque tour (`BLACKOUTS`), car certains territoires d'outre-mer votent le samedi. Quand il
  repose sur des sondages, il reste masqué après le premier silence (`isSecondRoundHidden`).

## 9. Relectures et neutralité

D'après la page Méthode du site, chaque question a été relue pour sa neutralité, puis par neuf
profils de citoyens ; un contrôle contradictoire a été mené avec un « avocat » pour chacun des
12 partis, chargé de chercher ce qui le désavantagerait ; les mesures d'impact ont en plus été
vérifiées chiffre par chiffre et source par source. Une correction n'est retenue que si elle
s'appuie sur un document ou une déclaration du parti ou de son candidat, que l'on peut vérifier.

Les règles vérifiées automatiquement par le code sont listées dans [README.md](README.md)
(section « Vérifier les données ») et appliquées par `npm test` et `npm run validate`.

## 10. Ce que le comparateur ne prétend pas faire

- Il ne prédit pas le résultat de l'élection et ne recommande aucun vote.
- Il ne dit pas ce qu'un parti « pense vraiment » : il compare des positions publiées et des
  votes de groupe, chacun avec ses limites.
- Les questions ne couvrent pas tous les sujets. Par exemple, aucune question ne porte sur
  l'allocation aux adultes handicapés ni sur l'accessibilité, faute de désaccord documenté entre
  les partis, et les situations supposent une vie en France.
- « Position non documentée » ne veut pas dire que le parti est contre : aucun texte trouvé ne dit
  ce qu'il propose.
- Les effets de la page « Impact pour moi » ne sont pas une simulation fiscale et ne tiennent pas
  compte de la façon dont chaque mesure serait financée.

## 11. Corrections

Une position mal rapportée se corrige avec une source : voir [CONTRIBUTING.md](CONTRIBUTING.md).
Le site tient un journal daté des corrections sur sa page Méthode.
