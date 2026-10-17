import { INCOME_BANDS } from '../impactCriteria.ts';
import { at, clear, note, programme, s, split, NC } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// ── Official sources ──────────────────────────────────────────────────────────────────────

const VM2 = s('autre', '2026-10-03', 'PLF 2027, Évaluation des voies et moyens, tome II (dépenses fiscales)', 'https://www.budget.gouv.fr/documentation/file-download/34342');
const EP27 = s('autre', '2026-10-01', 'PLF 2027, Évaluations préalables des articles', 'https://www.budget.gouv.fr/documentation/file-download/33505');
const ABAT_AN = s('autre', '2026-10-15', 'franceinfo, « Budget 2027 : les députés rejettent le plafonnement d\'un abattement fiscal pour les retraités »', 'https://www.franceinfo.fr/economie/budget/budget-2027-les-deputes-rejettent-le-plafonnement-d-un-abattement-fiscal-pour-les-retraites_8238589.html');

// ── Party sources ─────────────────────────────────────────────────────────────────────────

const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const MODEM_FESNEAU_BUDGET = s('declaration', '2026-10-15', 'MoDem, M. Fesneau (président du groupe Les Démocrates), « Rien ne serait pire que de ne pas avoir de budget »', 'https://www.mouvementdemocrate.fr/nos-parlementaires/marc-fesneau-rien-ne-serait-pire-que-de-ne-pas-avoir-de-budget-image-8524-image');
const AN_SEANCE_2026_10_15 = s('declaration', '2026-10-15', 'Assemblée nationale, 1re séance du 15 octobre 2026 (PLF 2027, article 3), L. Marcangeli, président du groupe Horizons & indépendants', 'https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2026-2027/premiere-seance-du-jeudi-15-octobre-2026');
const FRANCEINFO_HOR_BUDGET = s('declaration', '2026-10-13', 'franceinfo (AFP), « Horizons propose un "budget alternatif" avec 10 milliards d\'économies supplémentaires »', 'https://www.franceinfo.fr/economie/budget/horizons-propose-un-budget-alternatif-avec-10-milliards-d-economies-supplementaires_8234875.html');

// ── Profile helpers ───────────────────────────────────────────────────────────────────────

const retired = (p: Profile): boolean => p.status === 'retraite';
const partnerRetired = (p: Profile): boolean => p.household === 'couple' && p.partnerStatus === 'retraite';

// Monthly pensions of the household as a [low, high] range, from the income bands of whoever is retired
const bandRange = (band: number | null): [number, number] => {
    if (band === null) return [0, 0];
    const high = band < INCOME_BANDS.length - 1 ? INCOME_BANDS[band + 1].min : Infinity;
    return [INCOME_BANDS[band].min, high];
};
const householdPensions = (p: Profile): [number, number] => {
    const own = retired(p) ? bandRange(p.income) : [0, 0];
    const partner = partnerRetired(p) ? bandRange(p.partnerIncome) : [0, 0];
    return [own[0] + partner[0], own[1] + partner[1]];
};

// EP27 art. 3: no effect, or none that matters, below about 30 000 € of pensions a year per tax household.
// Those 30 000 € are taxable pensions (after deductible CSG, about 94,1 % of gross); a net pension is about
// 90,9 % of gross, so the threshold is about 2 415 € net a month.
const CAP_THRESHOLD = 2415;

export const measure: Measure = {
    id: 'retraites-fiscalite',
    theme: 'Retraites, impôts',
    title: 'Impôt sur le revenu des retraités : abattement de 10 % sur les pensions',
    context: note(
        'L\'abattement de 10 % sur les pensions a coûté 5 347 M€ en 2025 à 15,3 millions de ménages bénéficiaires ; il est plafonné à 4 439 € par foyer (revenus 2025). Le PLF 2027 proposait 3 000 € pour les retraites (4,6 millions de foyers touchés) ; l\'Assemblée a supprimé cet article le 15 octobre 2026.',
        at(VM2, 'fiche 120401'),
        at(EP27, 'article 3'),
        ABAT_AN,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder l\'abattement de 10 % sur les pensions, plafonné à 4 439 € par foyer.',
            explain: 'Rien ne changerait : 10 % des pensions sont retirés du revenu imposable, au moins 454 € par retraité et au plus 4 439 € par foyer (revenus 2025).',
            effects: [],
        },
        {
            id: 'b',
            label: 'Limiter à 3 000 € par foyer l\'abattement sur les pensions de retraite.',
            explain: 'L\'abattement resterait de 10 %, mais au plus 3 000 € par foyer pour les retraites. Seuls les foyers imposables touchant plus d\'environ 30 000 € de pensions par an paieraient plus.',
            effects: [
                {
                    when: p => retired(p) && householdPensions(p)[0] >= CAP_THRESHOLD,
                    direction: 'loss',
                    weight: 2,
                    why: 'L\'abattement sur les pensions de votre foyer serait plafonné à 3 000 € au lieu de 4 439 € : votre impôt augmenterait.',
                },
                {
                    when: p => retired(p) && householdPensions(p)[1] > CAP_THRESHOLD,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Votre impôt augmenterait si les pensions de votre foyer dépassent environ 30 000 € par an ; en dessous, rien ne change.',
                },
                {
                    when: p => !retired(p) && partnerRetired(p) && householdPensions(p)[0] >= CAP_THRESHOLD,
                    direction: 'loss',
                    weight: 1,
                    why: 'Si vous déclarez ensemble, l\'abattement sur la pension de votre conjoint serait limité à 3 000 €.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Remplacer l\'abattement de 10 % par un abattement forfaitaire de 2 000 € par retraité.',
            explain: 'Chaque retraité déduirait 2 000 € de ses pensions, quel que soit leur montant. Les petites pensions imposables y gagneraient, les plus élevées y perdraient.',
            effects: [
                {
                    when: p => retired(p) && (p.income ?? 0) >= 3,
                    direction: 'loss',
                    weight: 2,
                    why: 'Vous déduiriez 2 000 € de vos pensions au lieu de 10 % : votre revenu imposable augmenterait.',
                },
                {
                    when: p => retired(p) && p.income === 2,
                    direction: 'loss',
                    weight: 1,
                    why: 'Vous déduiriez 2 000 € de vos pensions au lieu de 10 % : votre revenu imposable augmenterait un peu.',
                },
                {
                    when: p => retired(p) && p.income === 1,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Si vous êtes imposable : gain si vos pensions restent sous environ 1 667 € par mois, perte au-dessus.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Supprimer l\'abattement de 10 % sur les pensions de retraite.',
            explain: 'Les pensions seraient imposées sans abattement. Seuls les retraités imposables paieraient plus d\'impôt.',
            effects: [
                {
                    when: p => retired(p) && (p.income ?? 0) >= 3,
                    direction: 'loss',
                    weight: 3,
                    why: 'Vos pensions seraient imposées sans abattement : jusqu\'à 4 439 € de revenu imposable en plus par foyer.',
                },
                {
                    when: p => retired(p) && (p.income === 1 || p.income === 2),
                    direction: 'loss',
                    weight: 2,
                    why: 'Votre revenu imposable augmenterait de 10 % de vos pensions ; votre impôt monterait si vous êtes imposable.',
                },
                {
                    when: p => partnerRetired(p) && (p.partnerIncome ?? 0) >= 1,
                    direction: 'loss',
                    weight: 1,
                    why: 'Si vous déclarez ensemble, la pension de votre conjoint serait imposée sans abattement.',
                },
            ],
        },
    ],
    programme: programme({
        rn: clear('a', [at(RN_CONTRE_BUDGET, 'tableau des recettes, « Suppression de l\'abattement forfaitaire retraités (garder l\'abattement 10%) »')]),
        modem: split(['b', 'c'], [
            at(MODEM_FESNEAU_BUDGET, '« la révision de l\'abattement sur les frais professionnels des retraités nous paraît la plus lisible et juste »'),
            at(MODEM_BUDGET, 'p.6 « abattement forfaitaire unique de 2000€ »'),
        ], 'b : le 15 octobre 2026, préfère la révision de l\'abattement prévue au PLF 2027, sans citer le plafond ; c : proposition pour le budget 2026, sans dire si les 2 000 € sont par retraité ou par foyer'),
        hor: clear('b', [
            at(AN_SEANCE_2026_10_15, '« aller chercher des efforts sur un segment bien précis, puisque seulement un quart des retraités sont concernés »'),
            at(FRANCEINFO_HOR_BUDGET, '« légitime que les retraités qui le peuvent contribuent à l\'effort »'),
        ], 'faible : défend l\'article 3 du PLF 2027 en séance sans citer le plafond de 3 000 € ; la presse rapporte un amendement de suppression du groupe en commission le 7 octobre'),
        eco: clear('d', [at(ECO_PROGRAMME, 'p.67, chap. 17, mesure 7 « Supprimer l\'abattement fiscal de 10 % pour les retraités »')]),
        // LO (brève 2026-09-22) and PCF (communiqué 2026-09-18) denounce the PLF 2027 cut without defending
        // the current rule: no demand, so not coded.
        lo: NC,
        pcf: NC,
        lfi: NC,
        ps: NC,
        ren: NC,
        lr: NC,
        udr: NC,
        rec: NC,
    }),
};
