import { at, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';
import { BAREME_2026, ENGINE_SOURCES, EP27, foyerSets, householdRange, taxEstimable, taxOf, taxQualitative } from './ir-bareme.ts';
import type { TaxOptions } from './ir-bareme.ts';

const SP_QF = s('autre', '2026-04-15', 'Service-public, fiche F2705 « Quotient familial d’un couple marié ou pacsé » (vérifiée le 15 avril 2026, revenus 2025)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2705');

// Parties
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const LCP_RN = s('declaration', '2026-10-06', 'LCP, propositions budgétaires du RN présentées par M. Le Pen', 'https://lcp.fr/actualites/permis-de-conduire-gratuit-exoneration-d-impot-jusqu-a-30-ans-comment-le-rn-veut');
const HOR_ANNONCES = s('declaration', '2026-10-08', '« Trois principales annonces d\'Édouard Philippe à l\'Heure de vérité »', 'https://www.edouardphilippe.fr/actualites/trois-principales-annonces-dedouard-philippe-a-lheure-de-verite');
const HOR_ENFANTS = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus attentive à ses enfants » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-attentive-a-ses-enfants');
const FRANCEINFO_PHILIPPE = s('declaration', '2026-10-08', 'franceinfo, « Édouard Philippe veut aider les familles dès le premier enfant et via une réduction d’impôt »', 'https://www.franceinfo.fr/elections/presidentielle/edouard-philippe-veut-aider-les-familles-des-le-premier-enfant-et-via-une-reduction-d-impot_8229028.html');
const LFI_SYNTHESE_6 = s('programme-2027', '2026-07-17', 'Synthèse des contributions, chapitre 6 « Partage des richesses », mesures « déjà présentes dans le programme actuel »', 'https://melenchon2027.fr/programme/synthese-des-contributions/chapitre-6-partage-des-richesses/');
const UDR_PPL_1412 = s('motion', '2025-05-13', 'Proposition de loi n° 1412 « pour la relance d\'une politique nataliste » (É. Ciotti et le groupe UDR)', 'https://www.assemblee-nationale.fr/dyn/17/textes/l17b1412_proposition-loi');
const REC_TOUTSURMESFINANCES = s('programme-2022', '2022-01-01', 'Toutsurmesfinances, programme d\'É. Zemmour 2022 (mis à jour en septembre 2025)', 'https://www.toutsurmesfinances.com/argent/a/eric-zemmour-programme');
const REC_PUBLICSENAT_2022 = s('programme-2022', '2022-03-23', 'Public Sénat, programme d\'É. Zemmour 2022', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2022-eric-zemmour-detaille-son-programme-et-assume-le-terme');

const ENGINE = 'barème des revenus 2025 ; revenu imposable estimé au revenu net + 3,6 % (CSG non déductible et CRDS d’un salaire), moins la déduction de 10 % (salaires : 509 à 14 555 € par personne ; pensions : 454 € par retraité à 4 439 € par foyer) et l’abattement des 65 ans et plus (pour vous seul) ; pour un couple, imposition commune ou séparée (enfants déclarés par le revenu le plus élevé) ; impôt non perçu sous 61 € ; « 3 enfants ou plus » compté comme 3 ; pas d’euro en outre-mer ni pour un micro-entrepreneur';

// Tax saved when the rules change from `o`, over every way the household can file
const savedBy = (p: Profile, o: TaxOptions): [number, number] =>
    householdRange(p, (own, partner) => foyerSets(p, own, partner).map(set => taxOf(set, BAREME_2026) - taxOf(set, BAREME_2026, o)));

const secondChildRange = (p: Profile) => savedBy(p, { fullSecondChild: true });

// Ceilings proposed for option c: 2 841 € (from 1 791 €, revenus 2024) and the double of 1 807 €
const CEILING_LOW = 2841;
const CEILING_HIGH = 2 * BAREME_2026.qf;
const ceilingRange = (p: Profile): [number, number] => [savedBy(p, { qf: CEILING_LOW })[0], savedBy(p, { qf: CEILING_HIGH })[1]];

// Tax of the returns that carry the children, capped at 3 000 €
const birthRange = (p: Profile): [number, number] =>
    householdRange(p, (own, partner) => foyerSets(p, own, partner).map(set =>
        set.filter(f => f.children > 0).reduce((sum, f) => sum + Math.min(taxOf([f], BAREME_2026), 3000), 0)));

// Change when a married couple files two returns instead of one (negative = more tax). Unmarried
// couples already file separately, hence the 0.
const conjugalRange = (p: Profile): [number, number] =>
    householdRange(p, (own, partner) => {
        const [joint, ...separate] = foyerSets(p, own, partner);
        const jointTax = taxOf(joint, BAREME_2026);
        return [0, ...separate.map(set => jointTax - taxOf(set, BAREME_2026))];
    });

const coupleEstimable = (p: Profile): boolean => p.household === 'couple' && taxEstimable(p);

const CONJUGAL_BASIS = note(`Impôt de deux déclarations séparées, enfants déclarés par le revenu le plus élevé, moins l’impôt commun ; 0 pour un couple non marié ni pacsé ; ${ENGINE}.`, ...ENGINE_SOURCES, SP_QF);

export const measure: Measure = {
    id: 'quotient-familial',
    theme: 'Impôts, famille',
    title: 'Impôt sur le revenu des familles et des couples : quotients familial et conjugal',
    context: note(
        'Un couple marié ou pacsé compte 2 parts ; chacun des deux premiers enfants ajoute une demi-part, puis chaque enfant une part entière. La baisse d’impôt par demi-part est plafonnée à 1 807 € (revenus 2025) ; le budget 2027 propose 1 845 €.',
        SP_QF, at(EP27, 'article 2, p. 10'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder le quotient familial, plafonné à 1 807 € par demi-part, et l’imposition commune des couples mariés ou pacsés.',
            explain: 'Le revenu du foyer est divisé en parts avant le calcul de l’impôt. Les enfants ajoutent des parts ; un couple marié ou pacsé déclare ses revenus ensemble.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Donner une part fiscale entière dès le deuxième enfant, au lieu d’une demi-part.',
            explain: 'Le deuxième enfant compterait comme le troisième : une part entière. Les familles imposables d’au moins deux enfants paieraient moins, jusqu’à 1 807 € par an.',
            effects: [
                {
                    when: p => (p.children ?? 0) >= 2 && taxEstimable(p) && secondChildRange(p)[1] > 0,
                    direction: 'gain', weight: 2,
                    why: 'Votre deuxième enfant compterait pour une part entière : l’impôt sur le revenu de votre foyer baisse.',
                    euro: {
                        perYear: secondChildRange,
                        basis: note(`Impôt avec et sans la demi-part supplémentaire, plafonnée à 1 807 € ; ${ENGINE}.`, SP_QF, ...ENGINE_SOURCES),
                    },
                },
                {
                    when: p => (p.children ?? 0) >= 2 && taxQualitative(p, q => secondChildRange(q)[1]),
                    direction: 'gain', weight: 2,
                    why: 'Si votre foyer paie l’impôt sur le revenu, votre deuxième enfant le ferait baisser davantage.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Relever le plafond du quotient familial de 1 807 € à environ 2 800 à 3 600 € par demi-part.',
            explain: 'Seules les familles dont l’avantage lié aux enfants dépasse déjà le plafond paieraient moins. Selon les propositions, le plafond monterait d’environ 60 % ou doublerait.',
            effects: [
                {
                    when: p => (p.children ?? 0) > 0 && taxEstimable(p) && ceilingRange(p)[1] > 0,
                    direction: 'gain', weight: 2,
                    why: 'L’avantage fiscal lié à vos enfants atteint le plafond actuel : votre impôt sur le revenu baisserait.',
                    euro: {
                        perYear: ceilingRange,
                        basis: note(`Impôt avec un plafond de 1 807 € puis de 2 841 € (borne basse) ou 3 614 € (borne haute) par demi-part ; celui de la part d’un parent isolé, 4 262 €, est gardé ; ${ENGINE}.`, SP_QF, ...ENGINE_SOURCES, at(UDR_PPL_1412, 'art. 3, 2 841 €')),
                    },
                },
                {
                    when: p => (p.children ?? 0) > 0 && taxQualitative(p, q => ceilingRange(q)[1]),
                    direction: 'gain', weight: 1,
                    why: 'Si l’avantage fiscal lié à vos enfants atteint le plafond actuel, votre impôt sur le revenu baisserait.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Pendant 3 ans après une naissance, exonérer d’impôt sur le revenu jusqu’à 3 000 € par an.',
            explain: 'Un foyer qui paie moins de 3 000 € d’impôt sur le revenu n’en paierait plus pendant les trois premières années de l’enfant ; au-delà, l’impôt baisserait de 3 000 €.',
            effects: [
                {
                    when: p => p.childAges.includes('under3') && taxEstimable(p) && birthRange(p)[1] > 0,
                    direction: 'gain', weight: 3,
                    why: 'Vous avez un enfant de moins de 3 ans : l’impôt sur le revenu de votre foyer baisserait jusqu’à 3 000 € par an.',
                    euro: {
                        perYear: birthRange,
                        basis: note(`Impôt sur le revenu du foyer qui déclare les enfants, dans la limite de 3 000 € ; ${ENGINE}.`, ...ENGINE_SOURCES, at(HOR_ANNONCES, 'montant et durée')),
                    },
                },
                {
                    when: p => p.childAges.includes('under3') && taxQualitative(p, q => birthRange(q)[1]),
                    direction: 'gain', weight: 2,
                    why: 'Si votre foyer paie l’impôt sur le revenu, il baisserait jusqu’à 3 000 € par an pendant trois ans.',
                },
            ],
        },
        {
            id: 'e',
            label: 'Supprimer le quotient conjugal : chaque membre d’un couple marié ou pacsé serait imposé séparément.',
            explain: 'Chacun paierait l’impôt sur ses propres revenus. Les couples mariés ou pacsés aux revenus inégaux paieraient souvent plus ; pour des revenus proches, l’écart est faible.',
            effects: [
                {
                    when: p => coupleEstimable(p) && Math.abs((p.income ?? 0) - (p.partnerIncome ?? 0)) >= 2 && conjugalRange(p)[0] < 0 && conjugalRange(p)[1] <= 0,
                    direction: 'loss', weight: 2,
                    why: 'Si vous êtes mariés ou pacsés, vos revenus inégaux ne seraient plus additionnés : l’impôt de votre couple augmente.',
                    euro: { perYear: conjugalRange, basis: CONJUGAL_BASIS },
                },
                {
                    when: coupleEstimable,
                    direction: 'mixed', weight: 1,
                    why: 'Si vous êtes mariés ou pacsés, votre impôt changerait, à la hausse ou à la baisse selon vos revenus et la décote.',
                    euro: { perYear: conjugalRange, basis: CONJUGAL_BASIS },
                },
                {
                    when: p => p.household === 'couple' && taxQualitative(p, () => 1),
                    direction: 'mixed', weight: 1,
                    why: 'Si vous êtes mariés ou pacsés, chacun serait imposé seul : l’impôt de votre couple changerait selon l’écart de vos revenus.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('e', [at(LFI_SYNTHESE_6, '« Faire la révolution fiscale »')]),
        hor: clear('d', [HOR_ANNONCES, FRANCEINFO_PHILIPPE, at(HOR_ENFANTS, 'supprimer l’impôt sur le revenu pendant les trois premières années de l’enfant')], 'la page des priorités réserve la réduction de 3 000 € aux familles plus aisées « qui travaillent » ; l’annonce du 8 octobre 2026 ne pose pas cette condition'),
        rn: clear('b', [at(RN_CONTRE_BUDGET, 'part fiscale pleine dès le 2e enfant'), at(RN_PROJET_2024, 'p. 9 du PDF, « Instituer une part fiscale complète dès le deuxième enfant »'), LCP_RN]),
        udr: clear('c', [at(UDR_PPL_1412, 'art. 3, plafond de la demi-part porté de 1 791 à 2 841 €')], 'faible : proposition de loi déposée le 13 mai 2025, non confirmée en 2026 ; plafond relevé d’environ 60 %, moins que le doublement'),
        rec: clear('c', [REC_TOUTSURMESFINANCES, REC_PUBLICSENAT_2022], 'faible : programme 2022, doublement du plafond'),
    }),
};
