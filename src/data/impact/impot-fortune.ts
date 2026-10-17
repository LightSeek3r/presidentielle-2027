import { WEALTH_MATERIAL_BANDS } from '../impactCriteria.ts';
import { at, both, clear, note, programme, s, wealthFloor, wealthMid } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

const ZUCMAN_THRESHOLD = 100_000_000;
const ZUCMAN_RATE = 0.02;
// Former ISF threshold, also the IFI one
const ISF_THRESHOLD = 1_300_000;

// IFI barème 2026 (F138): [lower bound of the slice, rate]
const IFI_SLICES: [number, number][] = [[800_000, 0.005], [1_300_000, 0.007], [2_570_000, 0.01], [5_000_000, 0.0125], [10_000_000, 0.015]];

const ifi = (value: number): number => {
    if (value <= ISF_THRESHOLD) return 0;
    let tax = 0;
    IFI_SLICES.forEach(([from, rate], i) => {
        const to = IFI_SLICES[i + 1]?.[0] ?? Infinity;
        if (value > from) tax += (Math.min(value, to) - from) * rate;
    });
    // Décote between 1,3 and 1,4 M€
    if (value < 1_400_000) tax -= 17_500 - 0.0125 * value;
    return Math.round(tax);
};

// Highest IFI the band allows, as if all the material wealth were taxable property. The 30 %
// allowance on the main home is left out on purpose: its share of the wealth is unknown, so leaving
// it out keeps this an upper bound. The top band is open-ended: its middle is used.
const ifiCeiling = (p: Profile): number => {
    if (p.wealthMaterial === null) return 0;
    const band = WEALTH_MATERIAL_BANDS[p.wealthMaterial];
    return ifi(WEALTH_MATERIAL_BANDS[p.wealthMaterial + 1]?.min ?? band.mid);
};

const VM1 = s('autre', '2026-10-05', 'PLF 2027, Évaluation des voies et moyens, tome I (PDF du 5 octobre 2026)', 'https://www.budget.gouv.fr/documentation/file-download/34339');
const SP_IFI = s('autre', '2026-03-06', 'Service-public, fiche F563 « Impôt sur la fortune immobilière (IFI) » (vérifiée le 6 mars 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F563');
const SP_IFI_CALCUL = s('autre', '2026-03-06', 'Service-public, fiche F138 « Calcul de l’IFI » (vérifiée le 6 mars 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F138');
const AN_ZUCMAN = s('autre', '2025-02-12', 'Assemblée nationale, rapport n° 930 (E. Sas) sur l’impôt plancher de 2 % sur le patrimoine des ultrariches (enregistré le 12 février 2025)', 'https://www.assemblee-nationale.fr/dyn/17/rapports/cion_fin/l17b0930_rapport-fond.pdf');

// Parties
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE_6 = s('programme-2027', '2026-07-17', 'Synthèse des contributions, chapitre 6, « déjà présentes dans le programme actuel »', 'https://melenchon2027.fr/programme/synthese-des-contributions/chapitre-6-partage-des-richesses/');
const LCP_CONTRE_BUDGET_LFI = s('declaration', '2026-10-14', 'LCP, contre-budget de LFI pour 2027', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const PCF_HUMA = s('declaration', '2026-09-15', 'PCF, discours de Fabien Roussel à la Fête de l’Humanité 2026 (publié le 15 septembre 2026)', 'https://www.pcf.fr/fete_de_lhumanite_2026_discours_de_fabien_roussel');
const PCF_2022_MOYEN_1 = s('programme-2022', '2022-01-01', 'Programme du PCF, « moyen 1 » (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/moyen_1');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société »', 'https://projet-socialiste.fr/projet/refaire-societe/');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const ATTAL_REF = s('declaration', '2026-08-27', 'Site de campagne de G. Attal, « À La REF : Gabriel Attal, grand gagnant du premier débat de la présidentielle 2027 »', 'https://attalpresident.fr/actualites/a-la-ref-gabriel-attal-grand-gagnant-du-premier-debat-de-la-presidentielle-2027');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const BV_CIOTTI = s('declaration', '2026-06-24', 'Boulevard Voltaire, « Mettre fin à l’impôt sur la mort : Éric Ciotti muscle son programme économique » (mis à jour le 26 août 2026)', 'https://www.bvoltaire.fr/mettre-fin-a-limpot-sur-la-mort-eric-ciotti-muscle-son-programme-economique/');
const CONTREPOINTS_UDR = s('declaration', '2026-06-25', 'Contrepoints, « L’UDR d’Éric Ciotti veut libérer l’économie »', 'https://contrepoints.org/ludr-deric-ciotti-veut-liberer-leconomie/');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');

export const measure: Measure = {
    id: 'impot-fortune',
    theme: 'Patrimoine',
    title: 'Impôt annuel sur les grands patrimoines',
    context: note(
        'Depuis 2018, l’impôt sur la fortune immobilière (IFI) ne taxe chaque année que le patrimoine immobilier net de plus de 1,3 million d’euros, de 0,5 % à 1,5 % : il a rapporté 2 771 millions d’euros en 2025. Environ 1 800 foyers auraient plus de 100 millions d’euros de patrimoine.',
        at(VM1, 'p. 27, impôt sur la fortune immobilière'), SP_IFI, at(AN_ZUCMAN, 'estimation de G. Zucman, p. 14 du PDF'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder l’impôt sur la fortune immobilière, au-delà de 1,3 M€ d’immobilier.',
            explain: 'Seul l’immobilier est taxé, au-delà de 1,3 million d’euros nets, avec un abattement de 30 % sur la résidence principale. L’épargne et les placements financiers ne le sont pas.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Remplacer l’IFI par un impôt sur la fortune financière ou improductive.',
            explain: 'L’immobilier ne serait plus taxé à ce titre. Un nouvel impôt viserait, selon les propositions, les placements financiers ou les biens qui ne financent aucune activité. Seuil et taux ne sont pas fixés.',
            effects: [
                { when: p => p.status !== 'patron' && (p.wealthImmaterial ?? 0) >= 4 && (p.wealthMaterial ?? 0) < 4, direction: 'loss', weight: 1, why: 'Vos placements, plus de 5 millions d’euros, pourraient être taxés chaque année, selon la définition retenue ; seuil et taux ne sont pas fixés.' },
                { when: p => (p.wealthMaterial ?? 0) >= 5, direction: 'mixed', weight: 2, why: 'Votre immobilier ne paierait plus l’IFI, mais votre épargne et vos placements pourraient être taxés, selon le seuil retenu.' },
                { when: p => (p.wealthMaterial ?? 0) === 4, direction: 'mixed', weight: 1, why: 'Si votre immobilier dépasse 1,3 million d’euros, il ne paierait plus l’IFI ; votre épargne pourrait être taxée, selon le seuil.' },
            ],
        },
        {
            id: 'c',
            label: 'Rétablir un impôt sur la fortune portant sur tout le patrimoine.',
            explain: 'Comme l’ISF supprimé en 2018, tout le patrimoine net au-delà d’un seuil, immobilier et placements, serait taxé chaque année. Certains y ajoutent un volet climatique.',
            effects: [
                { when: p => p.status === 'patron' && (p.wealthImmaterial ?? 0) >= 3 && (p.wealthMaterial ?? 0) < 5, direction: 'mixed', weight: 2, why: 'Selon que vos parts d’entreprise seraient exonérées comme biens professionnels, comme dans l’ancien ISF, votre patrimoine serait taxé ou non.' },
                { when: p => wealthFloor(p).total >= 2_000_000, direction: 'loss', weight: 3, why: 'Tout votre patrimoine, placements compris, serait taxé chaque année, et non plus votre seul immobilier.' },
                { when: p => wealthMid(p) >= ISF_THRESHOLD, direction: 'loss', weight: 1, why: 'Si votre patrimoine total dépasse le seuil retenu (1,3 million d’euros pour l’ancien ISF), il serait taxé chaque année.' },
            ],
        },
        {
            id: 'd',
            label: 'Créer un impôt minimal de 2 % sur les patrimoines de plus de 100 M€.',
            explain: 'Les foyers dont le patrimoine dépasse 100 millions d’euros paieraient chaque année au moins 2 % de leur patrimoine, impôts déjà payés déduits.',
            effects: [
                {
                    when: p => wealthFloor(p).total >= ZUCMAN_THRESHOLD,
                    direction: 'loss', weight: 3,
                    why: 'Votre patrimoine dépasse 100 millions d’euros : vous paieriez au moins 2 % par an, impôts déjà payés déduits.',
                    euro: {
                        perYear: p => [-Math.round(ZUCMAN_RATE * Math.max(wealthMid(p), wealthFloor(p).total)), 0],
                        basis: note(
                            '2 % du patrimoine net (milieu de vos tranches), moins l’impôt sur le revenu, l’IFI, la CSG, la CRDS et la contribution sur les hauts revenus déjà payés : de 0 si ces impôts dépassent 2 %, à 2 % du patrimoine s’ils sont nuls.',
                            at(AN_ZUCMAN, 'présentation de l’article unique, p. 8 du PDF'),
                        ),
                    },
                },
                { when: p => wealthMid(p) >= ZUCMAN_THRESHOLD, direction: 'loss', weight: 2, why: 'Si votre patrimoine dépasse 100 millions d’euros, vous paieriez au moins 2 % par an, impôts déjà payés déduits.' },
            ],
        },
        {
            id: 'e',
            label: 'Supprimer l’impôt sur la fortune immobilière, sans le remplacer.',
            explain: 'L’impôt annuel sur le patrimoine immobilier disparaîtrait, sans impôt de remplacement. Les propriétaires de plus de 1,3 million d’euros d’immobilier net ne paieraient plus l’IFI.',
            effects: [
                {
                    when: p => (p.wealthMaterial ?? 0) >= 5,
                    direction: 'gain', weight: 2,
                    why: 'Si votre immobilier dépasse 1,3 million d’euros nets, vous ne paieriez plus l’IFI.',
                    euro: {
                        perYear: p => [0, ifiCeiling(p)],
                        basis: note(
                            'IFI évité : de 0 si votre immobilier reste sous 1,3 million d’euros, jusqu’au barème appliqué au haut de votre tranche de patrimoine matériel s’il était entièrement immobilier, sans l’abattement de 30 % sur la résidence principale (0,5 % à 1,5 %, décote comprise).',
                            SP_IFI_CALCUL, at(SP_IFI, 'abattement de 30 % sur la résidence principale'),
                        ),
                    },
                },
                // 500 k€ to 2 M€: most of the band is under the 1,3 M€ threshold, so no amount is shown
                { when: p => p.wealthMaterial === 4, direction: 'gain', weight: 1, why: 'Si votre immobilier dépasse 1,3 million d’euros nets, ce que votre tranche ne dit pas, vous ne paieriez plus l’IFI.' },
            ],
        },
    ],
    programme: programme({
        lfi: both(['c', 'd'], [at(LFI_SYNTHESE_6, '« Rétablir et renforcer l’impôt sur la fortune avec un volet climatique » ; « Instaurer une taxe Zucman ou un impôt plancher sur le patrimoine des milliardaires »'), at(LCP_CONTRE_BUDGET_LFI, '« ISF climatique » et taxe Zucman, dans le même contre-budget'), at(NFP, 'p. 13')]),
        pcf: clear('c', [at(PCF_HUMA, '« Oui, nous rétablirons l’impôt de solidarité sur la fortune. »'), at(PCF_2022_MOYEN_1, 'proposition 127, impôt sur la fortune rétabli, « Son montant sera triplé »'), at(NFP, 'p. 13')]),
        eco: both(['c', 'd'], [at(ECO_PROGRAMME, 'ch. 17-1, p. 66, taxe Zucman de 2 % au-delà de 100 millions d’euros et rétablissement de l’ISF avec une composante climatique')]),
        ps: clear('d', [at(PS_REFAIRE_SOCIETE, '« Rétablir la justice dans la fiscalité du patrimoine », lu via archive.org (6 octobre 2026)')]),
        ren: clear('a', [at(ATTAL_REF, '« flat tax et suppression de l’ISF […] refuse tout retour en arrière »'), at(REN_NOUVELLE_DONNE, 'p. 12, suppression de l’ISF présentée comme une avancée')], 'faible : le candidat refuse tout retour sur la suppression de l’ISF sans citer l’IFI'),
        modem: clear('b', [at(MODEM_BUDGET, '« Remplacer l’IFI par un impôt sur la fortune improductive »')], 'vise la fortune « improductive », sans seuil ni taux'),
        rn: clear('b', [at(RN_CONTRE_BUDGET, '« IFF à la place de la taxe sur les holdings et de l’IFI »'), at(RN_PROJET_2024, '« Enraciner les familles françaises », impôt sur la fortune financière (IFF)')]),
        udr: clear('e', [at(UDR_ACTE_II, 'p. 6 et 33, « Supprimer totalement l’Impôt sur la Fortune Immobilière (IFI) »'), at(BV_CIOTTI, 'suppression de l’IFI'), at(CONTREPOINTS_UDR, 'programme économique de l’UDR')], 'texte du groupe (2025), repris par la presse en juin 2026'),
    }),
};
