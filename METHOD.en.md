# Method (English summary)

*The reference text is in French: [METHOD.md](METHOD.md). This summary follows the same sections.*

**Principle.** The quiz at [unit42.fr/2027](https://www.unit42.fr/2027) offers everyday
situations; for each one the user picks the closest option. Their choices are compared, party by
party, with two things measured separately: what the party's programme **says** (`dit`) and how
the deputies of its Assemblée nationale group **voted** (`fait`). It is an affinity indicator
built from documented, sourced public positions: neither a poll nor a voting recommendation.

**Questions.** 20 core questions, 10 economic and 10 cultural, chosen from an external measure of
what matters to voters (the April 2026 Ipsos / CEVIPOF / Fondation Jean-Jaurès / Le Monde
election survey, cross-checked with five other surveys), plus optional "affiner" questions (14 in
version 1.1). The list was frozen on 2026-10-11 before any score was computed; three optional
questions were added on 2026-10-15 to fill gaps written down beforehand. No question is added,
removed or reworded after looking at its effect on the ranking. Option order is shuffled per
session. Word limits, 3 to 5 options per question and all-or-none "cases" are enforced by
`src/data/validate.ts`.

**Score** (`src/scoring.ts`). An answer and a party position become shares over the options (one
pick = 100 %, two picks = 50 % each; a party split between n options = 1/n each). Agreement on a
question is the shared mass: the sum over options of min(user share, party share). A party's
score is the weighted mean of agreements, weight 1, or 2 for a question marked important; skipped
questions and questions where the party has no position are left out. Thresholds: results after
8 answers (`MIN_ANSWERED`); a `dit` score needs at least 6 questions (`MIN_SCORED`) covering at
least 50 % of the answered weight (`MIN_COVERAGE`); a `fait` score needs at least 5 questions with
a vote (`MIN_VOTES`). Scores are rounded to 5 points; parties within 5 points of a group's leader
are shown as tied (`TIE_MARGIN`), alphabetically.

**What they say.** Positions come only from documents or statements of the party or its
candidate, each with at least one https source dated no later than `PUBLISHED_AT`
(2026-10-15). No guessing: an uncovered or ambiguous topic is `{ backs: null, reason }`. Notes
starting with "faible" flag fragile positions (2022 source, joint 2024 text used only as a last
resort, etc.).

**What they do** (`src/data/votes.ts`). Assemblée nationale roll-call votes of the 17th
legislature, compiled from the official open data by `scripts/build-votes.mjs`. Only votes whose
meaning is unambiguous for the question are used. Each group counts with its full split of
votes (60/40 counts 60/40), non-voters are ignored, and a scrutin is ignored for a group when
fewer than 3 of its deputies cast a mapped vote (`MIN_VOTERS`). A group is not a party, and the
votes are always presented as the group's. Parties without deputies (Lutte ouvrière,
Reconquête) have no `fait` score; European Parliament votes may be shown for information only,
never scored.

**Impact page** (`src/impact.ts`). Shows what each list's measures would change for a described
situation. Measures were selected on external criteria (national law lever, public scale, size
thresholds) before looking at winners or losers. A measure is published only when at least 3
options are backed by a solid position and solid positions exist in at least 2 of the 3 blocs
(left, centre, right); this repository holds the 26 published measures. No total, no score, no
ranking across lists; an undocumented position is never counted as neutral.

**Second round** (`src/secondRound.ts`). Relative closeness to 2 or 3 forces: from published
polls (with full legal mentions, French law of 19 July 1977) until the first round, then the two
qualified candidates. The user's point is the barycentre of the forces weighted by rounded
scores; forces are in alphabetical order. The block is hidden during the electoral silence
before each round (Friday 00:00 to Sunday 20:00 Paris time) and, while it rests on polls, from
the first silence onwards.

**Reviews.** According to the website's method page, every question had a neutrality review,
nine citizen-profile readings and an adversarial review by one "advocate" per party; a correction
is accepted only with a verifiable document or statement from the party or its candidate.

**Not claimed.** No prediction, no recommendation, no claim about what a party "really" thinks,
no full coverage of every topic, no tax simulation; "no documented position" never means
"against".
