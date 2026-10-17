import type { Blackout, FinalistsConfig } from './types.ts';

// Second-round block. In 'sondages' mode the parties come from published polls (every poll must
// carry its full legal mentions, loi du 19 juillet 1977 art. 2: institut, commanditaire, dates de
// terrain, taille de l'échantillon, marge d'erreur, notice déposée auprès de la Commission des
// sondages); in 'qualifies' mode they are the two qualified candidates.
//
// Selection rule ("les forces les mieux placées pour le second tour"): a force is listed if it
// reaches the top 2 of the first round in at least one scenario of a recent national poll from a
// major pollster, with a maximum of 3 forces. If more than 3 qualify, keep the 3 that reach the
// top 2 most often. Candidates of the same party family are merged under the party id.
//
// Review cadence: monthly until the end of February 2027, weekly from March 2027, after every
// new first-round poll once the campaign is official. Update `parties`, `asOf` and `polls`
// together (asOf = latest field end date). On the evening of 2027-04-18, once the first-round
// results are known, switch to mode 'qualifies' with the 2 actual finalists and drop the polls.
//
// Review of 2026-10-12 (field dates 15 Sep to 8 Oct 2026, no poll fielded after the PS-PP primary
// of 2026-10-11 had been published yet):
// - rn: first in every scenario of every poll.
// - lfi: second in all 5 Toluna Harris Interactive scenarios and all 3 Cluster17 scenarios, and
//   tied for second with ren in 2 of the 10 Ifop scenarios.
// - hor: second in 8 of the 10 Ifop scenarios (15 to 24 %), a close third in Cluster17 (within
//   0.3 point of lfi) and third in Harris.
// - ren (Attal): only ties for second with lfi in 2 Ifop scenarios where Horizons has no
//   candidate; left out, the maximum being 3 forces and ren reaching the top 2 less often.
// - ps (Glucksmann): never above third (10 to 14 %), so not listed. To re-check as soon as a poll
//   fielded after the primary is published.
export const FINALISTS: FinalistsConfig = {
    mode: 'sondages',
    parties: ['rn', 'hor', 'lfi'],
    asOf: '2026-10-08',
    polls: [
        {
            institut: 'Toluna Harris Interactive',
            commanditaire: 'M6 et RTL',
            dates: 'du 5 au 8 octobre 2026',
            echantillon: 2004,
            marge: '± 1,4 à 3,1 points selon le score',
            noticeUrl: 'https://www.commission-des-sondages.fr/notices/files/notices/2026/octobre/10305-pres-iv-toluna-harris-interactive-12-octobre.pdf',
            url: 'https://tolunacorporate.com/wp-content/uploads/2026/10/Rapport-Toluna-Barometre-Presidentielle-2027-Vague-7-M6-RTL-12-octobre-2026.pdf',
        },
        {
            institut: 'Ifop-Fiducial',
            commanditaire: 'LCI, Le Figaro et Sud Radio',
            dates: 'du 25 au 29 septembre 2026',
            echantillon: 1393,
            marge: '± 1,1 à 2,6 points selon le score',
            noticeUrl: 'https://www.commission-des-sondages.fr/notices/files/notices/2026/septembre/10284-pres-barometre-election-v6-ifop-30-septembre.pdf',
            url: 'https://www.sudradio.fr/sud-radio/presidentielle-2027-marine-le-pen-inebranlable-malgre-laffaire-bardella',
        },
        {
            institut: 'Cluster17',
            commanditaire: 'Politico',
            dates: 'du 15 au 16 septembre 2026',
            echantillon: 1943,
            marge: '± 1,0 à 2,7 points selon le score et l\'effectif',
            noticeUrl: 'https://www.commission-des-sondages.fr/notices/files/notices/2026/septembre/10273-pres-iv-cluster17-politico-24-septembre.pdf',
            url: 'https://cluster17.com/presidentielle-2027-le-pen-largement-en-tete-melenchon-et-philippe-au-coude-a-coude/',
        },
    ],
};

// Electoral-silence windows during which no poll-based content may be shown (UTC).
// They start Friday 00:00 Paris, a day earlier than the metropolitan rule, because some overseas
// territories vote on Saturday, and end Sunday 20:00 Paris when the last polling stations close.
export const BLACKOUTS: Blackout[] = [
    { start: '2027-04-15T22:00:00Z', end: '2027-04-18T18:00:00Z' },
    { start: '2027-04-29T22:00:00Z', end: '2027-05-02T18:00:00Z' },
];
