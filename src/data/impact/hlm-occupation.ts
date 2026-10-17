import { INCOME_BANDS } from '../impactCriteria.ts';
import { at, both, clear, note, programme, s, AMB } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

const SDES_HLM = s('autre', '2026-01-20', 'SDES, « 5,4 millions de logements locatifs sociaux en France au 1er janvier 2025 »', 'https://www.statistiques.developpement-durable.gouv.fr/54-millions-de-logements-locatifs-sociaux-en-france-au-1er-janvier-2025');
const SP_SURLOYER = s('autre', '2026-01-01', 'Service-public.gouv.fr, fiche F21051 « Supplément de loyer de solidarité » (vérifiée le 1er janvier 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F21051');
const SP_MAINTIEN = s('autre', '2026-01-01', 'Service-public.gouv.fr, fiche F31601 « Peut-on conserver son logement social en cas d’augmentation de revenus ? » (vérifiée le 1er janvier 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F31601');

const AN_RAPPORT_1177 = s('declaration', '2025-03-25', 'Assemblée nationale, rapport n°1177 sur la proposition de loi « fin du maintien à vie dans le logement social », compte rendu de la commission des affaires économiques', 'https://www.assemblee-nationale.fr/dyn/opendata/RAPPANR5L17B1177.html');
const AN_RAPPORT_3197 = s('declaration', '2026-09-29', 'Assemblée nationale, rapport n°3197 sur la proposition de loi n°3109 (logement social), compte rendu de la commission des affaires économiques', 'https://www.assemblee-nationale.fr/dyn/opendata/RAPPANR5L17B3197.html');
const PJL_LOGEMENT_2024 = s('motion', '2024-05-06', 'Projet de loi relatif au développement de l’offre de logements abordables, signé G. Attal (Sénat, n°573)', 'https://www.senat.fr/leg/pjl23-573.html');
const ATTAL_REF = s('declaration', '2026-08-27', 'Site de campagne de G. Attal, « À La REF : Gabriel Attal, grand gagnant du premier débat de la présidentielle 2027 »', 'https://attalpresident.fr/actualites/a-la-ref-gabriel-attal-grand-gagnant-du-premier-debat-de-la-presidentielle-2027');
const RETAILLEAU_LOGEMENT = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème logement (page non datée, publiée de mai à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/logement');
const RETAILLEAU_VENTE_HLM = s('programme-2027', '2026-09-24', 'Projet Retailleau, mesure 64 « Vendre leur logement aux locataires HLM qui le souhaitent » (mise à jour du 24 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/vendre-leur-logement-aux-locataires-hlm-qui-le-souhaitent');
const LO_KASBARIAN = s('declaration', '2025-03-19', 'Lutte ouvrière n°2955, « Logement social : ex-ministre mais toujours nuisible »', 'https://www.lutte-ouvriere.org/portail/journal/logement-social-ex-ministre-toujours-nuisible-182789.html');
const LO_HLM_2024 = s('declaration', '2024-04-17', 'Lutte ouvrière n°2907, « HLM : le gouvernement s’en prend aux locataires »', 'https://www.lutte-ouvriere.org/portail/journal/hlm-gouvernement-sen-prend-locataires-165996.html');

// Ceilings for a PLS home by household category (1 to 6), in revenu fiscal de référence (F31601).
// The PLUS ceiling, which triggers the surloyer, is the PLS one / 1.3.
const PLS_CEILING = {
    province: [30_424, 40_630, 48_859, 58_986, 69_389, 78_203],
    paris: [34_996, 52_303, 68_562, 81_858, 97_395, 109_595],
    outremer: [27_382, 36_567, 43_973, 53_088, 62_450, 70_383],
};

// Household category of F21051 / F31601: a single parent counts one category higher than the number
// of people ("1 personne + 1 à charge" is category 3). Not modelled: disability (+1 category).
const category = (p: Profile): number | null => {
    if (p.household === null || p.children === null) return null;
    if (p.household === 'couple') return Math.min(6, 2 + p.children);
    return p.children === 0 ? 1 : Math.min(6, 2 + p.children);
};

// A "jeune couple" (ages adding up to 55 at most) is category 3: possible only for the youngest bands
const mayBeYoungCouple = (p: Profile): boolean =>
    p.household === 'couple' && p.children === 0 && (p.age === 'a18' || p.age === 'a25');

// Lowest and highest PLS ceiling that may apply: a "tendue" zone can be Paris or a big provincial city
const plsCeiling = (p: Profile): [number, number] | null => {
    const n = category(p);
    if (n === null || p.zone === null) return null;
    const high = mayBeYoungCouple(p) ? 3 : n;
    if (p.zone === 'outremer') return [PLS_CEILING.outremer[n - 1], PLS_CEILING.outremer[high - 1]];
    if (p.zone === 'tendue') return [PLS_CEILING.province[n - 1], PLS_CEILING.paris[high - 1]];
    return [PLS_CEILING.province[n - 1], PLS_CEILING.province[high - 1]];
};

// deliberate: revenu fiscal de référence taken as 90 % of 12 months of net income (10 % abattement),
// on the whole band; coarse, so the effects below only fire when the whole band is on one side
const bandRange = (index: number): [number, number] => [INCOME_BANDS[index].min, INCOME_BANDS[index + 1]?.min ?? Infinity];
const householdRfr = (p: Profile): [number, number] | null => {
    if (p.income === null) return null;
    const own = bandRange(p.income);
    if (p.household !== 'couple') return [own[0] * 10.8, own[1] * 10.8];
    if (p.partnerIncome === null) return null;
    const partner = bandRange(p.partnerIncome);
    return [(own[0] + partner[0]) * 10.8, (own[1] + partner[1]) * 10.8];
};

/** The whole income band is above `share` of the highest ceiling that may apply. */
const surelyAbove = (p: Profile, share: number): boolean => {
    const rfr = householdRfr(p);
    const ceiling = plsCeiling(p);
    return rfr !== null && ceiling !== null && rfr[0] > share * ceiling[1];
};

/** Part of the income band is above `share` of the lowest ceiling that may apply. */
const maybeAbove = (p: Profile, share: number): boolean => {
    const rfr = householdRfr(p);
    const ceiling = plsCeiling(p);
    return rfr !== null && ceiling !== null && rfr[1] > share * ceiling[0];
};

const PLUS = 1 / 1.3;
const hlm = (p: Profile): boolean => p.housing === 'loc-social';
// Disability in the household or reaching 65 keeps the right to stay (F31601)
const keepsRightToStay = (p: Profile): boolean => p.disability.length > 0 || p.age === 'a65';
// The loss of the right to stay applies in tight housing areas only (rapport n°3197, article 3)
const mayLoseRightToStay = (p: Profile): boolean => hlm(p) && p.zone === 'tendue' && !keepsRightToStay(p);

export const measure: Measure = {
    id: 'hlm-occupation',
    theme: 'Logement',
    title: 'Logement social : surloyer et départ des locataires dont le revenu augmente',
    context: note(
        'La France compte 5,4 millions de logements sociaux au 1er janvier 2025. Un surloyer est dû quand les revenus du foyer dépassent d’au moins 20 % le plafond ; au-delà de 150 % du plafond PLS deux ans de suite, en zone tendue, le locataire doit partir.',
        SDES_HLM,
        SP_SURLOYER,
        SP_MAINTIEN,
        at(AN_RAPPORT_3197, 'commentaire de l’article 3 : « dans les zones tendues, les locataires du parc social perdent leur droit au maintien dans les lieux »'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder le surloyer au-delà de 20 % du plafond de ressources, et les règles de maintien actuelles.',
            explain: 'Le locataire HLM paie un supplément de loyer si ses revenus dépassent nettement le plafond. En zone tendue, il doit partir seulement s’ils dépassent 150 % du plafond le plus haut pendant deux ans.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Mettre fin au droit au maintien dans les lieux au-delà de 120 % du plafond PLS.',
            explain: 'En zone tendue, le locataire dont les revenus dépassent 120 % du plafond le plus haut (PLS) deux ans de suite perdrait son droit de rester, contre 150 % aujourd’hui.',
            effects: [
                {
                    when: p => mayLoseRightToStay(p) && surelyAbove(p, 1.2),
                    direction: 'loss', weight: 3,
                    why: 'Avec ces revenus, votre foyer pourrait devoir quitter son HLM après deux ans, sauf en quartier prioritaire.',
                },
                {
                    when: p => mayLoseRightToStay(p) && maybeAbove(p, 1.2),
                    direction: 'loss', weight: 1,
                    why: 'Si les revenus de votre foyer dépassent 120 % du plafond PLS deux ans de suite, vous pourriez devoir quitter votre HLM.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Appliquer le surloyer dès le premier euro au-dessus du plafond de ressources, sans marge de 20 %.',
            explain: 'Le supplément de loyer serait dû dès que les revenus du foyer dépassent le plafond HLM, et non plus à partir de 20 % au-dessus.',
            effects: [
                {
                    when: p => hlm(p) && p.zone !== 'rural' && surelyAbove(p, PLUS),
                    direction: 'loss', weight: 2,
                    why: 'Votre foyer paierait un surloyer dès le premier euro au-dessus du plafond, ou un surloyer plus élevé.',
                },
                {
                    when: p => hlm(p) && maybeAbove(p, PLUS),
                    direction: 'loss', weight: 1,
                    why: 'Si les revenus de votre foyer dépassent le plafond HLM, vous paieriez un surloyer dès le premier euro.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Réserver l’accès au logement social aux ménages dont les revenus sont sous le revenu médian.',
            explain: 'Seuls les ménages des cinq premiers déciles de revenus, c’est-à-dire sous le revenu médian, pourraient obtenir un logement social.',
            effects: [
                {
                    when: p => (p.housing === 'loc-prive' || p.housing === 'heberge') && p.income !== null,
                    direction: 'mixed', weight: 1,
                    why: 'Le logement social serait réservé aux revenus sous la médiane : selon vos revenus, vous y auriez droit ou non.',
                },
            ],
        },
        {
            id: 'e',
            label: 'Vendre davantage de logements HLM aux locataires qui souhaitent les acheter.',
            explain: 'Les bailleurs sociaux vendraient plus de logements à leurs occupants qui veulent devenir propriétaires. Les logements concernés (maisons seulement, ou aussi appartements) varient selon les projets.',
            effects: [
                {
                    when: p => hlm(p),
                    direction: 'mixed', weight: 1,
                    why: 'Si votre logement HLM est mis en vente, vous pourriez l’acheter ; les logements vendus varient selon les projets.',
                },
            ],
        },
    ],
    programme: programme({
        lo: clear('a', [
            at(LO_KASBARIAN, 'contre le surloyer « dès le premier euro de dépassement » et le départ à 120 %, « alors qu’aujourd’hui il faut le dépasser de plus de 150 % »'),
            at(LO_HLM_2024, '« ces contrôles existent déjà et les sanctions aussi »'),
        ], 'faible : journal du parti, qui rejette les deux changements sans défendre expressément les seuils actuels'),
        lfi: clear('a', [
            at(AN_RAPPORT_1177, 'T. Portes (LFI-NFP), « surloyer en cas de dépassement des plafonds »'),
            at(AN_RAPPORT_3197, 'F. Piquemal (LFI-NFP)'),
        ]),
        pcf: clear('a', [at(AN_RAPPORT_1177, 'S. Peu (GDR), « un bail qui équivaut à un CDI »')], 'faible : rejet du texte par le groupe, sans défense explicite des seuils actuels'),
        eco: clear('a', [
            at(AN_RAPPORT_1177, 'C. Chatelain (EcoS)'),
            at(AN_RAPPORT_3197, 'A. Corbière (EcoS), contre le seuil de 120 %'),
        ]),
        ps: clear('a', [
            at(AN_RAPPORT_1177, 'I. Echaniz (SOC), plafonds « suffisant[s] », contre le surloyer précoce'),
            at(AN_RAPPORT_3197, 'V. Rossi (SOC), contre l’abaissement de 150 % à 120 %'),
        ]),
        ren: both(['b', 'c', 'e'], [
            at(AN_RAPPORT_1177, 'A. Armand (EPR), « Le groupe Ensemble pour la République le soutiendra »'),
            at(PJL_LOGEMENT_2024, 'art. 11 et 12, seuil de 150 % à 120 % et surloyer sans marge de 20 %'),
            at(ATTAL_REF, '« faciliter l’accession à la propriété », notamment pour les locataires du parc social'),
        ], 'faible : b et c reposent sur le projet de loi du gouvernement Attal (2024) et le soutien du groupe EPR en 2025 (abstention sur l’article 3 en septembre 2026) ; e, sur le site du candidat'),
        modem: clear('a', [
            at(AN_RAPPORT_1177, 'M. Cosson (Dem), « des dispositifs de surloyer et de résiliation du bail existent déjà »'),
            at(AN_RAPPORT_3197, 'M. Cosson (Dem), contre le seuil de 120 %'),
        ]),
        // Horizons: "notre groupe devrait voter en sa faveur" on the 120 % text (rapport n°1177, 2025), then
        // "La diminution du seuil [...] accroîtrait les risques d'éviction" and an abstention on article 3 (n°3197, 2026)
        hor: AMB,
        lr: both(['d', 'e'], [
            at(RETAILLEAU_LOGEMENT, 'FAQ, accès « aux ménages dont les ressources sont inférieures au cinquième décile »'),
            at(RETAILLEAU_VENTE_HLM, '« 10 % des pavillons HLM, soit près de 86 000 logements », décote de 20 % après dix ans d’occupation'),
        ], 'la vente vise les seuls pavillons (maisons individuelles) du parc social'),
        rn: clear('b', [
            at(AN_RAPPORT_3197, 'L. Tivoli (RN), rapporteur de la proposition de loi n°3109 du groupe RN, « l’article 3 abaisse de 150 % à 120 % le seuil »'),
            at(AN_RAPPORT_1177, 'F. Falcon (RN), contre le texte de 2025 qui abaissait déjà ce seuil'),
        ], 'le groupe s’opposait en mars 2025 à un texte qui abaissait déjà le seuil à 120 % ; sa proposition de loi de septembre 2026 le reprend, sans toucher au surloyer'),
    }),
};
