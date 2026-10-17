import { INCOME_BANDS } from '../impactCriteria.ts';
import { at, both, clear, hasAid, isWorking, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// Context and barème
const SP_AF = s('autre', '2026-06-01', 'Service-public.gouv.fr, fiche F13213 « Allocations familiales » (vérifiée le 1er juin 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F13213');
const DREES_MS = s('autre', '2025-12-04', 'DREES, Minima sociaux et prestations de solidarité, édition 2025, fiche 33 « Les prestations familiales »', 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/Drees-Pano-MS%202025.pdf');

// Parties
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PCF_BASE = s('motion', '2026-07-15', 'Base commune du 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const PCF_ROUSSEL = s('declaration', '2026-07-09', 'Discours de F. Roussel (CommunisteS n°1094)', 'https://assets.nationbuilder.com/pcf/pages/42431/attachments/original/1784125633/document_1094_CommunisteS_40e_Congres.pdf');
const PCF_CAHIER_SECU = s('programme-2027', '2025-12-18', 'PCF, cahier thématique « Sécurité sociale » des Jours heureux (mis en ligne le 18 décembre 2025)', 'https://assets.nationbuilder.com/pcf/pages/36196/attachments/original/1766073347/document_-_cahier_se%CC%81cu_v2.pdf');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const HOR_ANNONCES = s('declaration', '2026-10-08', '« Trois principales annonces d\'Édouard Philippe à l\'Heure de vérité »', 'https://www.edouardphilippe.fr/actualites/trois-principales-annonces-dedouard-philippe-a-lheure-de-verite');
const RETAILLEAU_REVENU_FAMILIAL = s('programme-2027', '2026-09-12', 'Projet Retailleau, mesure 75 « Verser 240 euros par mois par enfant mineur » (mise à jour le 12 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/verser-240-euros-par-mois-par-enfant-mineur');
const LR_DEMO = s('declaration', '2026-04-30', 'Les Républicains, « Sortir de l\'hiver démographique » (entretien de B. Retailleau à l\'AFP)', 'https://republicains.fr/actualites/2026/04/30/sortir-de-lhiver-demographique/');
const UDR_PPL_1412 = s('motion', '2025-05-13', 'Proposition de loi n° 1412 « pour la relance d\'une politique nataliste » (É. Ciotti et le groupe UDR)', 'https://www.assemblee-nationale.fr/dyn/17/textes/l17b1412_proposition-loi');
const REC_TOUTSURMESFINANCES = s('programme-2022', '2021-12-15', 'Toutsurmesfinances, programme d\'É. Zemmour 2022 (propos sur RTL du 15 décembre 2021, page mise à jour le 4 septembre 2025)', 'https://www.toutsurmesfinances.com/argent/a/eric-zemmour-programme');

// Barème F13213 (2026, resources of 2024): monthly amounts by income tranche and annual resource ceilings
interface Scale { full: number; t2: number; t3: number; c1: number; c2: number }
const SCALES: Record<2 | 3 | 4, Scale> = {
    2: { full: 152.25, t2: 76.13, t3: 38.07, c1: 79_980, c2: 106_604 },
    3: { full: 347.32, t2: 173.67, t3: 86.83, c1: 86_644, c2: 113_268 },
    4: { full: 542.39, t2: 271.2, t3: 135.6, c1: 93_308, c2: 119_932 },
};

// Allowances are paid for children under 20: an answer of 18-25 only may mean no eligible child
const hasMinorChild = (p: Profile): boolean => p.childAges.includes('under3') || p.childAges.includes('school');

const bandRange = (index: number): [number, number] => [INCOME_BANDS[index].min, INCOME_BANDS[index + 1]?.min ?? Infinity];

// CAF resources = revenu net catégoriel, approximated as 90 % of twelve months of net income (10 % deduction on wages and pensions)
const yearlyResources = (p: Profile): [number, number] | null => {
    if (p.income === null) return null;
    const [ownMin, ownMax] = bandRange(p.income);
    if (p.household !== 'couple') return [ownMin * 10.8, ownMax * 10.8];
    if (p.partnerIncome === null) return null;
    const [partnerMin, partnerMax] = bandRange(p.partnerIncome);
    return [(ownMin + partnerMin) * 10.8, (ownMax + partnerMax) * 10.8];
};

const tranche = (scale: Scale, resources: number): 1 | 2 | 3 => (resources <= scale.c1 ? 1 : resources <= scale.c2 ? 2 : 3);

const yearlyGain = (scale: Scale, t: 1 | 2 | 3): number => (t === 1 ? 0 : Math.round((scale.full - (t === 2 ? scale.t2 : scale.t3)) * 12));

// "3" in the profile means three or more: the low end uses the 3-child scale, the high end the 4-child one.
// deliberate: 5+ children have higher ceilings and amounts; the range covers 3 and 4 only
const scalesFor = (p: Profile): [Scale, Scale] | null => {
    if (p.children === null || p.children < 2) return null;
    return p.children === 2 ? [SCALES[2], SCALES[2]] : [SCALES[3], SCALES[4]];
};

const fullAmountGain = (p: Profile): [number, number] => {
    const scales = scalesFor(p);
    const resources = yearlyResources(p);
    if (!scales || !resources) return [0, 0];
    const [low, high] = scales;
    // Low end: smallest amounts with the highest ceilings; high end: largest amounts with the lowest ceilings
    return [yearlyGain(low, tranche(high, resources[0])), yearlyGain(high, tranche(low, resources[1]))];
};

const surelyReduced = (p: Profile): boolean => {
    const scales = scalesFor(p);
    const resources = yearlyResources(p);
    return hasMinorChild(p) && scales !== null && resources !== null && resources[0] > scales[1].c1;
};

const maybeReduced = (p: Profile): boolean => {
    const scales = scalesFor(p);
    const resources = yearlyResources(p);
    return hasMinorChild(p) && scales !== null && resources !== null && resources[1] > scales[0].c1;
};

const FULL_AMOUNT_BASIS = note(
    'Écart annuel entre le montant plein et le montant réduit du barème 2026 (2, 3 ou 4 enfants), hors majorations pour âge et complément dégressif ; ressources du foyer estimées à 90 % de douze mois de revenu net.',
    SP_AF,
);

const withMinorChild = (p: Profile): boolean => hasMinorChild(p) && (p.children ?? 0) >= 1;

// Nobody in the household works today; an answer left blank keeps the condition false
const noWorkInHousehold = (p: Profile): boolean =>
    p.status !== null && !isWorking(p)
    && (p.household === 'seul' || (p.household === 'couple' && p.partnerStatus !== null && !['salarie', 'public', 'indep'].includes(p.partnerStatus)));

export const measure: Measure = {
    id: 'allocations-familiales',
    theme: 'Famille',
    title: 'Allocations familiales : premier enfant et modulation selon le revenu',
    context: note(
        'Les allocations familiales sont versées à partir de deux enfants de moins de 20 ans (un seul en Outre-mer) : 152,25 € par mois pour deux enfants, divisés par 2 au-delà de 79 980 € de revenus annuels et par 4 au-delà de 106 604 €, depuis juillet 2015. Environ 5 millions de familles les touchent.',
        SP_AF,
        DREES_MS,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder les allocations à partir de deux enfants (152,25 € pour deux), réduites selon le revenu.',
            explain: 'En métropole, les allocations commencent au deuxième enfant ; en Outre-mer, au premier. Les plafonds de revenus montent avec le nombre d\'enfants.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Verser des allocations dès le premier enfant.',
            explain: 'Une famille avec un seul enfant toucherait aussi des allocations chaque mois. Les propositions ne fixent pas le montant.',
            effects: [
                {
                    when: p => p.children === 1 && hasMinorChild(p) && p.zone !== null && p.zone !== 'outremer',
                    direction: 'gain',
                    weight: 2,
                    why: 'Avec un seul enfant, votre foyer toucherait des allocations familiales, aujourd\'hui réservées aux familles de deux enfants ou plus.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Supprimer la réduction selon le revenu : même montant pour toutes les familles.',
            explain: 'Les familles au-dessus des plafonds de revenus retrouveraient le montant plein, comme avant juillet 2015.',
            effects: [
                {
                    when: surelyReduced,
                    direction: 'gain',
                    weight: 2,
                    why: 'Vos allocations familiales, réduites selon le revenu du foyer, reviendraient au montant plein.',
                    euro: { perYear: fullAmountGain, basis: FULL_AMOUNT_BASIS },
                },
                {
                    when: maybeReduced,
                    direction: 'gain',
                    weight: 1,
                    why: 'Selon le revenu exact du foyer, vos allocations familiales pourraient revenir au montant plein.',
                    euro: { perYear: fullAmountGain, basis: FULL_AMOUNT_BASIS },
                },
            ],
        },
        {
            id: 'd',
            label: 'Remplacer les allocations par 240 € par mois et par enfant mineur, dès le premier, sans condition de ressources.',
            explain: 'Ce revenu familial, doublé au troisième enfant, remplacerait les allocations et d\'autres aides. Il serait réservé aux parents ayant cinq ans d\'activité ; les aides aux parents seuls, au logement et au handicap resteraient.',
            effects: [
                {
                    when: p => withMinorChild(p) && noWorkInHousehold(p),
                    direction: 'mixed',
                    weight: 1,
                    why: 'Ce montant serait réservé aux parents ayant au moins cinq ans d\'activité professionnelle : selon votre parcours, vous pourriez ne pas y avoir droit.',
                },
                {
                    when: withMinorChild,
                    direction: 'gain',
                    weight: 2,
                    why: 'Vous toucheriez 240 € par mois pour chaque enfant mineur, plus que les allocations actuelles ; d\'autres aides familiales seraient fusionnées.',
                },
            ],
        },
        {
            id: 'e',
            label: 'Créer une allocation unique dès le premier enfant : 350 € par enfant pour les plus modestes, moins au-delà.',
            explain: 'Elle fusionnerait une dizaine d\'aides, dont les allocations familiales et la prime de naissance. Le montant baisserait avec le revenu, selon un barème non publié.',
            effects: [
                {
                    when: p => withMinorChild(p) && hasAid(p, 'rsa'),
                    direction: 'gain',
                    weight: 2,
                    why: 'Avec des revenus modestes, vous toucheriez jusqu\'à 350 € par mois pour chaque enfant, plus que les allocations actuelles.',
                },
                {
                    when: p => p.children === 1 && hasMinorChild(p) && p.zone !== null && p.zone !== 'outremer',
                    direction: 'gain',
                    weight: 2,
                    why: 'Avec un seul enfant, vous toucheriez une allocation, aujourd\'hui réservée aux familles de deux enfants ou plus ; elle baisserait avec le revenu.',
                },
                {
                    when: withMinorChild,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Le montant par enfant, jusqu\'à 350 € par mois, baisserait avec le revenu selon un barème non publié : l\'effet dépend de vos revenus.',
                },
            ],
        },
    ],
    programme: programme({
        pcf: both(['b', 'c'], [
            at(PCF_ROUSSEL, 'p.10, loi « sur l\'allocation familiale dès le premier enfant »'),
            at(PCF_CAHIER_SECU, 'p.22, allocations familiales « versées quel que soit le niveau de revenu des ménages »'),
            at(PCF_BASE, 'p.49, « revenant ainsi à une politique familiale universelle »'),
        ], 'b : sans montant ni calendrier ; c : universalité défendue dans le cahier Sécurité sociale'),
        eco: clear('b', [at(ECO_PROGRAMME, 'p.124, chap. 34, proposition 2 « attribuer un même montant dès le premier enfant »')]),
        modem: clear('b', [at(MODEM_BUDGET, 'p.7, « Croissance partagée », allocations familiales dès le 1er enfant')], 'proposition du groupe pour le budget 2026'),
        hor: clear('e', [at(HOR_ANNONCES, '« une allocation familiale unique dès le premier enfant de 350 euros par mois et par enfant », « dégressive avec le revenu »')], 'barème de la dégressivité non publié'),
        lr: clear('d', [RETAILLEAU_REVENU_FAMILIAL, LR_DEMO], 'revenu familial de 240 € par enfant mineur, sans condition de ressources, à la place des allocations, de la majoration pour âge, du complément familial et du quotient familial'),
        udr: both(['b', 'c'], [at(UDR_PPL_1412, 'art. 1er (universalité) et art. 2 (dès le premier enfant)')]),
        rec: clear('c', [at(REC_TOUTSURMESFINANCES, 'politique familiale')], 'faible : propos de 2021 (programme 2022) relayé par la presse, sans confirmation depuis'),
    }),
};
