import { INCOME_BANDS } from '../impactCriteria.ts';
import { at, both, clear, householdMonthlyIncome, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// ── Income tax engine, shared with quotient-familial.ts, csg-salaires.ts and revenus-capital-pfu.ts ──
// Barème, quotient familial ceilings and décote of the CGI (art. 197), 10 % deduction (art. 83 and
// 158), allowance of the 65+ (art. 157 bis), no tax under 61 €. Simplifications, stated in every euro
// basis: taxable income = net income + 3,6 % (non-deductible CSG and CRDS of a wage), no invalidity
// half-shares or allowance, the 65+ allowance for the visitor only (the partner's age is not asked),
// `children` 3 read as exactly 3. The profile does not say whether a couple is married, so every
// couple is computed both ways (joint return, or two returns).

export interface Bareme {
    // Lower bound of each taxed bracket and its rate; below the first bound the rate is 0
    brackets: [number, number][];
    // Ceiling of the advantage per extra half-share, and of the first share of a single parent
    qf: number;
    isolatedFirst: number;
    decote: { seul: number; couple: number };
    // 10 % deduction: on wages, floor and ceiling per person; on pensions, floor per pensioner and
    // ceiling per return
    wages: [number, number];
    pensions: [number, number];
    // Allowance of each taxpayer aged 65 or more: full below the first limit of the return's net
    // income, the second amount up to the second limit
    elderly: { limits: [number, number]; amounts: [number, number] };
}

// Revenus 2025, loi de finances pour 2026
export const BAREME_2026: Bareme = {
    brackets: [[11_600, 0.11], [29_579, 0.30], [84_577, 0.41], [181_917, 0.45]],
    qf: 1807, isolatedFirst: 4262, decote: { seul: 897, couple: 1483 },
    wages: [509, 14_555], pensions: [454, 4439],
    elderly: { limits: [17_670, 28_430], amounts: [2822, 1411] },
};

// Revenus 2026 as proposed by article 2 of the PLF 2027 (+2,1 %). The article also indexes the 10 %
// deductions and the 65+ allowance like the first bracket (11 600 to 11 844 €): those are that ratio,
// rounded to the euro.
export const BAREME_PLF2027: Bareme = {
    brackets: [[11_844, 0.11], [30_200, 0.30], [86_353, 0.41], [185_737, 0.45]],
    qf: 1845, isolatedFirst: 4352, decote: { seul: 915, couple: 1513 },
    wages: [520, 14_861], pensions: [464, 4532],
    elderly: { limits: [18_042, 29_028], amounts: [2881, 1441] },
};

const DECOTE_RATE = 0.4525;
// Below this amount (after décote) the tax is not collected
const MIN_COLLECTED = 61;

// Taxable wage ≈ net + non-deductible CSG and CRDS (2,9 % of 98,25 % of the gross ≈ 3,6 % of the net)
export const TAXABLE_UPLIFT = 1.036;

export interface Foyer {
    // Annual taxable income (revenu net imposable)
    income: number;
    adults: 1 | 2;
    children: number;
    // Single parent (case T): extra half-share
    isolated: boolean;
}

export interface TaxOptions {
    // Ceiling per half-share, when a measure changes it
    qf?: number;
    // A full share for the second child instead of a half-share
    fullSecondChild?: boolean;
}

const perPart = (q: number, b: Bareme): number =>
    b.brackets.reduce((tax, [lo, rate], i) => {
        const hi = b.brackets[i + 1]?.[0] ?? Infinity;
        return q > lo ? tax + (Math.min(q, hi) - lo) * rate : tax;
    }, 0);

const childParts = (n: number, fullSecond: boolean): number => {
    if (n <= 0) return 0;
    if (n === 1) return 0.5;
    return (fullSecond ? 1.5 : 1) + (n - 2);
};

export const irTax = (f: Foyer, b: Bareme, o: TaxOptions = {}): number => {
    const qf = o.qf ?? b.qf;
    const parts = f.adults + childParts(f.children, o.fullSecondChild ?? false) + (f.isolated ? 0.5 : 0);
    const withChildren = parts * perPart(f.income / parts, b);
    const without = f.adults * perPart(f.income / f.adults, b);
    const halfShares = (parts - f.adults) * 2;
    const maxAdvantage = f.isolated ? b.isolatedFirst + (halfShares - 2) * qf : halfShares * qf;
    const gross = Math.max(withChildren, without - maxAdvantage);
    const seuil = f.adults === 2 ? b.decote.couple : b.decote.seul;
    const net = gross < seuil / DECOTE_RATE ? gross - (seuil - DECOTE_RATE * gross) : gross;
    return net < MIN_COLLECTED ? 0 : net;
};

export const taxOf = (foyers: Foyer[], b: Bareme, o: TaxOptions = {}): number =>
    foyers.reduce((sum, f) => sum + irTax(f, b, o), 0);

interface Earner {
    monthly: number;
    pension: boolean;
    elderly: boolean;
}

// Net taxable income of one return: 10 % deduction, then the allowance of the 65+
const returnIncome = (earners: Earner[], b: Bareme): number => {
    let total = 0;
    let pensionDeduction = 0;
    for (const e of earners) {
        const y = Math.max(0, e.monthly * 12 * TAXABLE_UPLIFT);
        total += y;
        if (e.pension) pensionDeduction += Math.min(y, Math.max(b.pensions[0], 0.1 * y));
        else total -= Math.min(y, b.wages[1], Math.max(b.wages[0], 0.1 * y));
    }
    const net = total - Math.min(pensionDeduction, b.pensions[1]);
    const [full, reduced] = b.elderly.amounts;
    const allowance = net < b.elderly.limits[0] ? full : net <= b.elderly.limits[1] ? reduced : 0;
    return Math.max(0, net - earners.filter(e => e.elderly).length * allowance);
};

/**
 * Ways the household can file: alone; or, for a couple, one joint return (married or pacsed) or two
 * returns, the children declared by the higher income (the usual and most favourable choice).
 * `b` gives the deductions and allowances of the year.
 */
export const foyerSets = (p: Profile, own: number, partner: number, b: Bareme = BAREME_2026): Foyer[][] => {
    const ch = p.children ?? 0;
    const me: Earner = { monthly: own, pension: p.status === 'retraite', elderly: p.age === 'a65' };
    if (p.household !== 'couple') return [[{ income: returnIncome([me], b), adults: 1, children: ch, isolated: ch > 0 }]];
    const other: Earner = { monthly: partner, pension: p.partnerStatus === 'retraite', elderly: false };
    const ownHasChildren = own >= partner;
    return [
        [{ income: returnIncome([me, other], b), adults: 2, children: ch, isolated: false }],
        [
            { income: returnIncome([me], b), adults: 1, children: ownHasChildren ? ch : 0, isolated: false },
            { income: returnIncome([other], b), adults: 1, children: ownHasChildren ? 0 : ch, isolated: false },
        ],
    ];
};

/** Bottom, middle and top of an income band (the open top band stops at its representative value). */
export const incomeSamples = (band: number): number[] => {
    const lo = INCOME_BANDS[band].min;
    const hi = band + 1 < INCOME_BANDS.length ? INCOME_BANDS[band + 1].min : INCOME_BANDS[band].mid;
    return [lo, (lo + hi) / 2, hi];
};

/** Income and household known, and the partner's income when in a couple. */
export const householdKnown = (p: Profile): boolean =>
    p.income !== null && p.household !== null && (p.household === 'seul' || p.partnerIncome !== null);

/**
 * Euros are computed for metropolitan France only (overseas, the tax is cut by 30 or 40 % under a
 * ceiling, and some territories have no income tax), and not for micro-entrepreneurs, taxed on
 * their turnover minus a flat allowance.
 */
export const taxEstimable = (p: Profile): boolean => householdKnown(p) && p.zone !== 'outremer' && p.indepRegime !== 'micro';

/**
 * Income and household answered but no euro: partner's income missing, overseas or micro-entrepreneur.
 * The metropolitan estimate on net income is an upper bound there, so a zero still rules the effect out.
 */
export const taxQualitative = (p: Profile, upper: (p: Profile) => number): boolean =>
    p.income !== null && p.household !== null && !taxEstimable(p) && (!householdKnown(p) || upper(p) > 0);

/** Min and max of `f` over the income bands of the household, rounded to 10 €. */
export const householdRange = (p: Profile, f: (own: number, partner: number) => number[]): [number, number] => {
    const partners = p.household === 'couple' && p.partnerIncome !== null ? incomeSamples(p.partnerIncome) : [0];
    const values: number[] = [];
    for (const own of incomeSamples(p.income ?? 0)) for (const partner of partners) values.push(...f(own, partner));
    const r10 = (x: number) => Math.round(x / 10) * 10;
    return [r10(Math.min(...values)), r10(Math.max(...values))];
};

// ── Sources ────────────────────────────────────────────────────────────────────────────────

export const SP_BAREME = s('autre', '2026-04-15', 'Service-public, fiche F1419 « Barème de l’impôt sur le revenu » (vérifiée le 15 avril 2026, revenus 2025)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419');
export const SP_CALCUL = s('autre', '2026-04-15', 'Service-public, fiche F34328 « Impôt sur le revenu - Calcul de l’impôt » (décote, parent isolé, abattement des 65 ans et plus, seuil de 61 € ; vérifiée le 15 avril 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34328');
export const SP_FRAIS = s('autre', '2026-04-15', 'Service-public, fiche F1989 « Frais professionnels : forfait ou frais réels » (déduction de 10 % : 509 à 14 555 € ; vérifiée le 15 avril 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1989');
export const SP_PENSIONS = s('autre', '2026-04-15', 'Service-public, fiche F415 « Déclarer les pensions de retraite » (abattement de 10 % : 454 € par retraité à 4 439 € par foyer ; vérifiée le 15 avril 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F415');
export const SP_CSG = s('autre', '2026-06-01', 'Service-public, fiche F2971 « CSG et CRDS sur les revenus d’activité et de remplacement » (vérifiée le 1er juin 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2971');
export const EP27 = s('autre', '2026-10-01', 'PLF 2027, Évaluations préalables des articles', 'https://www.budget.gouv.fr/documentation/file-download/33505');
const VM1 = s('autre', '2026-10-05', 'PLF 2027, Évaluation des voies et moyens, tome I (PDF du 5 octobre 2026)', 'https://www.budget.gouv.fr/documentation/file-download/34339');
const DGFIP_41 = s('autre', '2025-11-01', 'DGFiP Statistiques n°41, impôt sur le revenu 2024 (novembre 2025, le 1er du mois est utilisé)', 'https://www.impots.gouv.fr/sites/default/files/media/9_statistiques/0_etudes_et_stats/0_publications/dgfip_statistiques/2025/num41_11/dgfip_stat_41.pdf');

/** Sources of the engine, to cite in every euro basis that uses it. */
export const ENGINE_SOURCES = [SP_BAREME, SP_CALCUL, SP_FRAIS, SP_PENSIONS, SP_CSG];

// Parties
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const LCP_RN = s('declaration', '2026-10-06', 'LCP, propositions budgétaires du RN présentées par M. Le Pen', 'https://lcp.fr/actualites/permis-de-conduire-gratuit-exoneration-d-impot-jusqu-a-30-ans-comment-le-rn-veut');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const MODEM_FESNEAU_BUDGET = s('declaration', '2026-10-15', 'MoDem, M. Fesneau (président du groupe Les Démocrates), « Rien ne serait pire que de ne pas avoir de budget », entretien aux Échos relayé par le MoDem', 'https://www.mouvementdemocrate.fr/nos-parlementaires/marc-fesneau-rien-ne-serait-pire-que-de-ne-pas-avoir-de-budget-image-8524-image');
const LFI_SYNTHESE_6 = s('programme-2027', '2026-07-17', 'Synthèse des contributions, chapitre 6 « Partage des richesses », mesures « déjà présentes dans le programme actuel »', 'https://melenchon2027.fr/programme/synthese-des-contributions/chapitre-6-partage-des-richesses/');
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const PCF_2022_MOYEN_1 = s('programme-2022', '2022-01-01', 'Programme du PCF, « moyen 1 » (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/moyen_1');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société »', 'https://projet-socialiste.fr/projet/refaire-societe/');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const CONTREPOINTS_UDR = s('declaration', '2026-06-25', 'Contrepoints, « L’UDR d’Éric Ciotti veut libérer l’économie »', 'https://contrepoints.org/ludr-deric-ciotti-veut-liberer-leconomie/');

// ── Effects ────────────────────────────────────────────────────────────────────────────────

const rangeOf = (p: Profile, f: (set2026: Foyer[], set2027: Foyer[]) => number): [number, number] =>
    householdRange(p, (own, partner) => {
        const sets2027 = foyerSets(p, own, partner, BAREME_PLF2027);
        return foyerSets(p, own, partner, BAREME_2026).map((set, i) => f(set, sets2027[i]));
    });

// Extra tax on revenus 2026 if the 2026 barème (and its indexed amounts) is kept instead of the PLF 2027 one
const freezeRange = (p: Profile): [number, number] =>
    rangeOf(p, (frozen, indexed) => taxOf(frozen, BAREME_2026) - taxOf(indexed, BAREME_PLF2027));

// Tax due on revenus 2026 under the PLF 2027 barème
const taxRange = (p: Profile): [number, number] => rangeOf(p, (_, set) => taxOf(set, BAREME_PLF2027));
const paysTax = (p: Profile): boolean => householdKnown(p) && taxRange(p)[1] > 0;

const SMIC_NET = 1477.93;

// Tax no longer paid on the visitor's own income (eligible up to 4 SMIC)
const youthRange = (p: Profile): [number, number] =>
    householdRange(p, (own, partner) => {
        if (own > 4 * SMIC_NET) return [0];
        const before = foyerSets(p, own, partner, BAREME_PLF2027);
        const after = foyerSets(p, 0, partner, BAREME_PLF2027);
        return before.map((set, i) => taxOf(set, BAREME_PLF2027) - taxOf(after[i], BAREME_PLF2027));
    });

// Three rates at the thresholds of the first two brackets (option e)
const BAREME_3_TAUX: Bareme = { ...BAREME_PLF2027, brackets: [[11_844, 0.05], [30_200, 0.20]] };

const threeRatesRange = (p: Profile): [number, number] =>
    rangeOf(p, (_, set) => taxOf(set, BAREME_PLF2027) - taxOf(set, BAREME_3_TAUX));

const perAdultIncome = (p: Profile): number | null => {
    const total = householdMonthlyIncome(p);
    return total === null || !householdKnown(p) ? null : total / (p.household === 'couple' ? 2 : 1);
};

export const ENGINE = 'revenu imposable estimé au revenu net + 3,6 % (CSG non déductible et CRDS d’un salaire), moins la déduction de 10 % (salaires : 509 à 14 555 € par personne ; pensions : 454 € par retraité à 4 439 € par foyer ; revenus 2025, relevés de 2,1 % pour 2026) et l’abattement des 65 ans et plus (pour vous seul) ; pour un couple, imposition commune ou séparée (enfants déclarés par le revenu le plus élevé) ; impôt non perçu sous 61 € ; sans demi-part ni abattement d’invalidité ; pas d’euro en outre-mer ni pour un micro-entrepreneur';

export const measure: Measure = {
    id: 'ir-bareme',
    theme: 'Impôts',
    title: 'Barème de l’impôt sur le revenu : tranches et taux',
    context: note(
        'En 2025, l’impôt sur le revenu a rapporté 94,9 milliards d’euros. Sur les revenus de 2024, 19,6 millions de foyers sur 41,5 millions (47 %) en ont payé.',
        at(VM1, 'p. 17'), at(DGFIP_41, 'p. 1'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder 5 tranches (0 à 45 %), revalorisées chaque année sur les prix (+2,1 % proposé pour 2027).',
            explain: 'Les seuils des tranches montent comme les prix : si votre revenu suit les prix, votre impôt ne change pas. Le budget 2027 propose de les relever de 2,1 %.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Geler le barème un an : les seuils des tranches ne suivent pas la hausse des prix.',
            explain: 'Les seuils restent ceux de 2026. Si votre revenu suit les prix, votre impôt augmente un peu, et certains foyers deviennent imposables.',
            effects: [
                {
                    when: p => taxEstimable(p) && freezeRange(p)[1] > 0,
                    direction: 'loss', weight: 1,
                    why: 'Sans revalorisation, votre impôt sur le revenu augmente un peu, même si votre revenu ne fait que suivre les prix.',
                    euro: {
                        perYear: p => {
                            const [min, max] = freezeRange(p);
                            return [-max, -min];
                        },
                        basis: note(
                            `Écart entre l’impôt calculé avec le barème 2026 gelé et avec le barème relevé de 2,1 % (PLF 2027, art. 2), décote, plafonds du quotient familial et déductions compris ; ${ENGINE}.`,
                            ...ENGINE_SOURCES, at(EP27, 'article 2, p. 10 et 26'),
                        ),
                    },
                },
                {
                    when: p => taxQualitative(p, q => freezeRange(q)[1]),
                    direction: 'loss', weight: 1,
                    why: 'Si votre foyer paie l’impôt sur le revenu, il augmente un peu, même si vos revenus ne font que suivre les prix.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Ajouter des tranches au barème : impôt plus bas pour les revenus modestes, plus haut pour les plus élevés.',
            explain: 'Le barème compterait plus de tranches, par exemple 14, avec des taux plus bas en bas et plus hauts en haut. Les seuils et les taux exacts ne sont pas fixés.',
            effects: [
                {
                    when: p => { const m = perAdultIncome(p); return m !== null && m < 2500 && paysTax(p); },
                    direction: 'gain', weight: 1,
                    why: 'Les tranches basses baisseraient : votre impôt sur le revenu diminuerait.',
                },
                {
                    when: p => { const m = perAdultIncome(p); return m !== null && m >= 8000; },
                    direction: 'mixed', weight: 2,
                    why: 'Des tranches plus hautes pourraient augmenter votre impôt sur le revenu ; leurs seuils et leurs taux ne sont pas fixés.',
                },
                {
                    when: p => perAdultIncome(p) !== null && paysTax(p),
                    direction: 'mixed', weight: 1,
                    why: 'Votre impôt peut baisser ou monter : cela dépend des seuils des nouvelles tranches, qui ne sont pas fixés.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Exonérer d’impôt sur le revenu les jeunes de moins de 30 ans, jusqu’à 4 SMIC de revenu.',
            explain: 'Les moins de 30 ans ne paieraient plus d’impôt sur le revenu sur leurs propres revenus, tant qu’ils ne dépassent pas quatre fois le SMIC.',
            effects: [
                {
                    when: p => p.age === 'a18' && taxEstimable(p) && youthRange(p)[1] > 0,
                    direction: 'gain', weight: 3,
                    why: 'Vous avez moins de 25 ans : votre revenu ne serait plus soumis à l’impôt sur le revenu.',
                    euro: {
                        perYear: youthRange,
                        basis: note(
                            `Impôt dû sur votre revenu (barème proposé pour les revenus 2026), qui ne serait plus payé ; rien au-delà de 4 SMIC (la source ne précise ni brut ou net, ni le calcul au-delà : 4 SMIC net retenus, 5 912 € par mois) ; ${ENGINE}.`,
                            ...ENGINE_SOURCES, at(EP27, 'article 2, p. 10'), at(LCP_RN, 'plafond de quatre SMIC'),
                        ),
                    },
                },
                {
                    when: p => p.age === 'a18' && taxQualitative(p, q => youthRange(q)[1]),
                    direction: 'gain', weight: 2,
                    why: 'Vous avez moins de 25 ans : si vous payez l’impôt sur le revenu, votre revenu n’y serait plus soumis.',
                },
                {
                    when: p => p.age === 'a25' && p.income !== null && p.household !== null && (!householdKnown(p) || youthRange(p)[1] > 0),
                    direction: 'gain', weight: 1,
                    why: 'Si vous avez moins de 30 ans et payez l’impôt sur le revenu, votre revenu n’y serait plus soumis.',
                },
            ],
        },
        {
            id: 'e',
            label: 'Ramener le barème à trois tranches, taxées à 0 %, 5 % et 20 %, aux seuils actuels.',
            explain: 'Les tranches à 30, 41 et 45 % disparaîtraient : au-delà du seuil actuel de la tranche à 30 %, le taux serait de 20 %. La tranche à 11 % passerait à 5 %.',
            effects: [
                {
                    when: p => taxEstimable(p) && threeRatesRange(p)[1] > 0,
                    direction: 'gain', weight: 2,
                    why: 'Votre impôt sur le revenu baisserait : les taux de 11, 30, 41 et 45 % seraient remplacés par 5 et 20 %.',
                    euro: {
                        perYear: threeRatesRange,
                        basis: note(
                            `Écart entre l’impôt au barème proposé pour 2027 et à un barème à 0, 5 et 20 % aux mêmes seuils (11 844 et 30 200 €), décote et plafonds du quotient familial conservés ; ${ENGINE}.`,
                            ...ENGINE_SOURCES, at(EP27, 'article 2, p. 10'), at(UDR_ACTE_II, 'p. 17, barème à trois tranches'),
                        ),
                    },
                },
                {
                    when: p => taxQualitative(p, q => threeRatesRange(q)[1]),
                    direction: 'gain', weight: 1,
                    why: 'Si votre foyer paie l’impôt sur le revenu, il baisserait.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('c', [at(LFI_SYNTHESE_6, '« Faire la révolution fiscale »'), at(NFP, 'p. 13, 14 tranches')]),
        pcf: clear('c', [at(NFP, 'p. 13, 14 tranches'), at(PCF_2022_MOYEN_1, 'proposition 126, « en portant le nombre de tranches à 15 »')], 'faible : NFP 2024 et programme 2022, non confirmés en 2025 ou 2026'),
        eco: clear('c', [at(ECO_PROGRAMME, 'p. 68, proposition 17.12')]),
        ps: clear('c', [at(PS_REFAIRE_SOCIETE, '« Imposer la justice fiscale »')]),
        modem: clear('b', [
            at(MODEM_FESNEAU_BUDGET, '« Une année blanche générale - y compris pour le barème de l’impôt sur le revenu qui ne serait pas indexé »'),
            at(MODEM_BUDGET, 'p. 6, « Geler le barème de l’impôt sur le revenu »'),
        ]),
        udr: clear('e', [
            at(UDR_ACTE_II, 'p. 17, « 0 % jusqu’à 11 497 € », « 5 % de 11 498 € à 29 315 € », « 20 % au-delà »'),
            at(CONTREPOINTS_UDR, '« trois taux (0 %, 5 % et 20 %) d’impôt sur le revenu »'),
        ], 'le résumé du livret (p. 6) écrit 0, 11 et 20 % ; le corps du texte (p. 17) et la presse de juin 2026 écrivent 0, 5 et 20 %'),
        rn: both(['a', 'd'], [
            at(RN_CONTRE_BUDGET, '« Indexation du barème de l’IR et CSG sur l’inflation »'),
            at(RN_PROJET_2024, 'p. 10 du PDF, « Supprimer l’impôt sur le revenu des jeunes de moins de 30 ans »'),
            at(LCP_RN, 'exonération des moins de 30 ans « jusqu’à quatre fois le Smic »'),
        ], 'les deux ensemble : barème indexé et exonération des moins de 30 ans ; le plafond de 4 SMIC est connu par LCP (6 octobre 2026)'),
    }),
};
