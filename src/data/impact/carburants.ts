import { INCOME_BANDS } from '../impactCriteria.ts';
import { at, both, clear, isWorking, note, programme, s } from '../impactHelpers.ts';
import type { Effect, Kilometres, Measure, Profile } from '../impactTypes.ts';
import type { SourcedNote } from '../types.ts';

const INSEE_CONSO_2024 = s('autre', '2025-06-11', 'Insee Première n°2056, la consommation des ménages en 2024', 'https://www.insee.fr/fr/statistiques/8582021?sommaire=8071406');
const INSEE_FRANCE = s('autre', '2026-08-27', 'Insee, dossier complet France, recensement 2023 (tableau ACT G2)', 'https://www.insee.fr/fr/statistiques/2011101?geo=FE-1');
const DGEC_PRIX = s('autre', '2026-10-09', 'DGEC, « Cours, prix et marges des produits pétroliers », note du 9 octobre 2026 (prix moyens hebdomadaires TTC)', 'https://www.ecologie.gouv.fr/sites/default/files/documents/NPG-2026.10.09.pdf');
const SDES_CONSO = s('autre', '2025-11-25', 'SDES, Bilan annuel des transports en 2024, tableau G3.b « Consommations unitaires des véhicules » (données arrêtées au 25 novembre 2025)', 'https://www.statistiques.developpement-durable.gouv.fr/media/8867/download?inline');
const CDC_CEE = s('autre', '2024-09-17', 'Cour des comptes, « Les certificats d’économies d’énergie », tableau n°35', 'https://www.ccomptes.fr/sites/default/files/2024-09/20240917-Certificats-economie-energie_0.pdf');
const GRANDS_ROULEURS = s('autre', '2026-09-22', 'Ministère de la Transition écologique, extension des aides carburant (communiqué du 22 septembre 2026)', 'https://www.ecologie.gouv.fr/presse/carburants-extension-dispositifs-soutien-letat-aux-professionnels-aux-francais-cout-450meur');

const FRANCEINFO_CANDIDATS = s('declaration', '2026-09-18', 'franceinfo, « Baisse des taxes, blocage des prix, hausse des aides ciblées… que proposent les candidats à la présidentielle ? »', 'https://www.franceinfo.fr/economie/automobile/essence/baisse-des-taxes-blocage-des-prix-hausse-des-aides-ciblees-face-a-la-nouvelle-flambee-des-carburants-que-proposent-les-candidats-a-la-presidentielle_8198603.html');
const LFI_1ER_MAI = s('declaration', '2026-04-23', 'La France insoumise, « Bloquer les prix, libérer nos vies : le 1er mai dans la rue »', 'https://lafranceinsoumise.fr/2026/04/23/bloquer-les-prix-liberer-nos-vies-le-1er-mai-dans-la-rue/');
const PCF_URGENCE = s('declaration', '2026-04-08', 'PCF, « Face à l’explosion des prix, le Gouvernement doit déclarer l’état d’urgence énergétique ! » (F. Roussel)', 'https://www.pcf.fr/face_explosion_des_prix_le_gouvernement_doit_declarer_l_etat_d_urgence_energetique');
const PCF_TRACT = s('declaration', '2026-09-17', 'PCF, tract « Carburant » avec F. Roussel (non daté, date du fichier PDF)', 'https://oise.pcf.fr/sites/default/files/tract_carburant.pdf');
const ECO_TONDELIER = s('declaration', '2026-03-28', 'franceinfo, M. Tondelier sur France Inter', 'https://www.franceinfo.fr/economie/automobile/essence/prix-des-carburants-la-patronne-des-ecologistes-marine-tondelier-reclame-une-aide-ciblee-selon-les-revenus-pour-aider-les-particuliers_7900238.html');
const ATTAL_BFM = s('declaration', '2026-09-21', 'Site de campagne de G. Attal, « Sur BFM TV : “Le plus juste, c’est d’accompagner ceux qui travaillent” »', 'https://attalpresident.fr/actualites/gabriel-attal-sur-bfm-tv-le-plus-juste-c-est-d-accompagner-ceux-qui-travaillent');
const ATTAL_MESSMER = s('declaration', '2026-09-23', 'Site de campagne de G. Attal, « Gabriel Attal présente un plan de désendettement et un “Messmer II” pour sortir des dépendances françaises »', 'https://attalpresident.fr/actualites/gabriel-attal-presente-un-plan-de-desendettement-et-un-messmer-ii-pour-sortir-des-dependances-francaises');
const MODEM_FESNEAU = s('declaration', '2026-05-03', 'MoDem, M. Fesneau, « Le 1er mai n’est pas un jour comme les autres »', 'https://www.mouvementdemocrate.fr/actualites/marc-fesneau-le-1er-mai-nest-pas-un-jour-comme-les-autres-video-8307-video');
const FRANCEINFO_RETAILLEAU = s('declaration', '2026-09-18', 'franceinfo, « Supprimer les certificats d’économie d’énergie ferait-il réaliser une économie de 8,5 euros par plein ? » (message de B. Retailleau du 16 septembre 2026)', 'https://www.franceinfo.fr/vrai-ou-fake/vrai-ou-faux-supprimer-les-certificats-d-economie-d-energie-ferait-il-realiser-une-economie-de-8-5-euros-par-plein-comme-l-affirme-bruno-retailleau_8195534.html');
const LR_COMPTES_PUBLICS = s('programme-2027', '2026-10-12', 'Projet Retailleau, fiches presse « Rétablir l’ordre dans les comptes publics » (12 octobre 2026)', 'https://www.avecretailleau.fr/api/media/file/20261011_Fiches_presse_comptes_publics_mise_en_page%20(1).pdf');
const RN_AMENDEMENT_TVA = s('motion', '2025-10-21', 'Amendement n°I-792 de M. Le Pen au projet de loi de finances pour 2026', 'https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/792');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');
const REC_BFMTV = s('declaration', '2026-09-18', 'BFMTV, entretien d’É. Zemmour (« Face à BFM », 17 septembre 2026, article du 18)', 'https://www.bfmtv.com/politique/elections/presidentielle/presidentielle-immigration-voile-marine-le-pen-ce-qu-il-faut-retenir-de-l-interview-d-eric-zemmour-sur-bfmtv_AV-202609170966.html');

const driver = (p: Profile): boolean => p.car === 'quotidien' || p.car === 'occasionnel';

// deliberate: "more than 15 000 km" is capped at 30 000 km a year to give the band an upper bound
const KM: Record<Kilometres, [number, number]> = { low: [0, 8000], mid: [8000, 15000], high: [15000, 30000] };

// Euros saved per km: diesel car (5,93 L/100 km, gazole 2,328 €/L) to petrol car (6,72 L/100 km, SP95-E10 2,138 €/L)
const TVA_PER_KM: [number, number] = [0.0593 * 2.328 * (1 - 1.055 / 1.2), 0.0672 * 2.138 * (1 - 1.055 / 1.2)];
// CEE cost in the litre price: 15 to 17 centimes in 2026 (Ufip, quoted by franceinfo), 7,3 in 2023 (Cour des comptes)
const CEE_PER_KM: [number, number] = [0.0593 * 0.15, 0.0672 * 0.17];
// Price capped at 1,50 to 1,70 € a litre: at most diesel (2,328 €) capped at 1,50 €; the low end is 0 because
// a cap stated for petrol only leaves diesel unchanged, and a cap above the pump price changes nothing
const CAP_PER_KM: [number, number] = [0, 0.0593 * (2.328 - 1.5)];

const perYear = (cost: [number, number]) => (p: Profile): [number, number] => {
    const [low, high] = KM[p.kilometres ?? 'low'];
    return [Math.round(low * cost[0]), Math.round(high * cost[1])];
};

// One effect per mileage band, then a fallback when the mileage is not answered
const byMileage = (why: string, cost: [number, number], basis: SourcedNote, fallback: string): Effect[] => [
    { when: p => driver(p) && p.kilometres === 'high', direction: 'gain', weight: 3, why, euro: { perYear: perYear(cost), basis } },
    { when: p => driver(p) && p.kilometres === 'mid', direction: 'gain', weight: 2, why, euro: { perYear: perYear(cost), basis } },
    { when: p => driver(p) && p.kilometres === 'low', direction: 'gain', weight: 1, why, euro: { perYear: perYear(cost), basis } },
    { when: p => p.car === 'quotidien', direction: 'gain', weight: 2, why: fallback },
    { when: p => p.car === 'occasionnel', direction: 'gain', weight: 1, why: fallback },
];

// Ceilings of the 2026 "grands rouleurs" aid, net monthly income of the household; the communiqué gives
// no other household size, so a single parent keeps 2 050 € and a couple with one child 4 070 €
const aidCeiling = (p: Profile): number => (p.household === 'couple' ? ((p.children ?? 0) >= 2 ? 6100 : 4070) : 2050);
const householdMonthly = (p: Profile): [number, number] | null => {
    if (p.income === null || p.household === null) return null;
    const band = (i: number): [number, number] => [INCOME_BANDS[i].min, INCOME_BANDS[i + 1]?.min ?? Infinity];
    const own = band(p.income);
    if (p.household === 'seul') return own;
    const partner = p.partnerIncome === null ? [0, Infinity] : band(p.partnerIncome);
    return [own[0] + partner[0], own[1] + partner[1]];
};
const eligibleDriver = (p: Profile): boolean => isWorking(p) && (p.car === 'quotidien' || (driver(p) && (p.kilometres === 'mid' || p.kilometres === 'high')));
const surelyUnderCeiling = (p: Profile): boolean => {
    const income = householdMonthly(p);
    return income !== null && p.household !== null && income[1] <= aidCeiling(p);
};
const maybeUnderCeiling = (p: Profile): boolean => {
    const income = householdMonthly(p);
    return income !== null && p.household !== null && income[0] < aidCeiling(p);
};

const TVA_BASIS = note(
    'Kilomètres par an × consommation moyenne (5,93 L/100 km en diesel, 6,72 en essence, 2024) × prix TTC du 9 octobre 2026 (2,33 € le gazole, 2,14 € le SP95-E10) × (1 − 1,055 / 1,20).',
    SDES_CONSO,
    DGEC_PRIX,
);
const CEE_BASIS = note(
    'Kilomètres par an × consommation moyenne (5,93 à 6,72 L/100 km, 2024) × coût des certificats d’économies d’énergie dans le prix du litre : 15 à 17 centimes en 2026 selon la filière pétrolière (Ufip), contre 7,3 centimes en 2023 selon la Cour des comptes.',
    SDES_CONSO,
    at(FRANCEINFO_RETAILLEAU, 'chiffres de l’Ufip, « entre 15 et 17 centimes d’euros par litre »'),
    at(CDC_CEE, 'annexe 13'),
);
const CAP_BASIS = note(
    'Kilomètres par an × consommation moyenne (5,93 L/100 km en diesel, 2024) × écart entre le prix TTC du 9 octobre 2026 (2,33 € le gazole) et un plafond de 1,50 € ; borne basse nulle (plafond fixé pour l’essence seulement, ou au-dessus du prix).',
    SDES_CONSO,
    DGEC_PRIX,
    at(FRANCEINFO_CANDIDATS, 'blocage à 1,70 € le litre d’essence'),
    at(PCF_URGENCE, '« bloquer les prix à 1,60 € le litre pour l’essence sans plomb, à 1,50 € pour le gazole »'),
);

export const measure: Measure = {
    id: 'carburants',
    theme: 'Énergie, transport',
    title: 'Taxes sur les carburants et aide aux trajets en voiture',
    context: note(
        'En 2024, les ménages ont dépensé 52,7 Md€ en carburants, et 69,1 % des actifs vont travailler en voiture. Le 9 octobre 2026, le gazole coûtait en moyenne 2,33 € le litre ; une aide temporaire de 100 € est versée à 5,5 millions d’actifs modestes qui roulent beaucoup.',
        INSEE_CONSO_2024,
        INSEE_FRANCE,
        DGEC_PRIX,
        at(GRANDS_ROULEURS, 'octobre à décembre 2026'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder l’accise et la TVA à 20 % sur les carburants.',
            explain: 'Les taxes sur les carburants restent les mêmes. Une aide de 100 € pour les actifs modestes qui roulent beaucoup est prévue d’octobre à décembre 2026.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Baisser la TVA sur les carburants à 5,5 %.',
            explain: 'La TVA sur l’essence et le gazole passerait de 20 % à 5,5 %. Le prix à la pompe baisserait d’environ 12 %, si la baisse est répercutée.',
            effects: [
                { when: p => driver(p) && p.zone === 'outremer', direction: 'mixed', weight: 1, why: 'Outre-mer, les carburants suivent des règles fiscales et des prix propres à chaque territoire : l’effet dépend du vôtre.' },
                ...byMileage('Votre litre de carburant coûterait environ 12 % de moins à la pompe.', TVA_PER_KM, TVA_BASIS, 'Votre litre de carburant coûterait environ 12 % de moins à la pompe.'),
            ],
        },
        {
            id: 'c',
            label: 'Supprimer le coût des certificats d’économie d’énergie répercuté à la pompe.',
            explain: 'Les vendeurs de carburant doivent financer des économies d’énergie (isolation, chaudières). Ce coût, estimé à 15 à 17 centimes par litre en 2026, est inclus dans le prix et disparaîtrait.',
            effects: [
                { when: p => driver(p) && p.zone === 'outremer', direction: 'mixed', weight: 1, why: 'Outre-mer, les carburants suivent des règles fiscales et des prix propres à chaque territoire : l’effet dépend du vôtre.' },
                ...byMileage(
                    'Votre litre de carburant coûterait environ 15 à 17 centimes de moins, selon l’estimation de la filière pétrolière.',
                    CEE_PER_KM, CEE_BASIS,
                    'Votre litre de carburant coûterait environ 15 à 17 centimes de moins, selon l’estimation de la filière pétrolière.',
                ),
            ],
        },
        {
            id: 'd',
            label: 'Verser une aide carburant ciblée aux actifs modestes qui roulent.',
            explain: 'L’État verserait une aide aux personnes qui travaillent, utilisent leur voiture et ont de petits revenus. L’aide actuelle est de 100 € ; le montant et le plafond de revenus seraient fixés par la loi.',
            effects: [
                { when: p => eligibleDriver(p) && surelyUnderCeiling(p), direction: 'gain', weight: 2, why: 'Vous pourriez toucher l’aide carburant, si vos revenus restent sous le plafond retenu.' },
                { when: p => eligibleDriver(p) && maybeUnderCeiling(p), direction: 'gain', weight: 1, why: 'Selon le plafond de revenus retenu, vous pourriez toucher une aide carburant.' },
            ],
        },
        {
            id: 'e',
            label: 'Bloquer par la loi le prix des carburants, à 1,50 à 1,70 € le litre selon les projets.',
            explain: 'Un prix maximum du litre serait fixé par l’État, de 1,50 à 1,70 € selon les projets. Les stations ne pourraient pas vendre plus cher, même si le prix du pétrole augmente.',
            effects: [
                { when: p => driver(p) && p.zone === 'outremer', direction: 'mixed', weight: 1, why: 'Outre-mer, les carburants suivent des règles fiscales et des prix propres à chaque territoire : l’effet dépend du vôtre.' },
                ...byMileage(
                    'Le prix de votre litre de carburant ne pourrait plus dépasser le plafond fixé par la loi.',
                    CAP_PER_KM, CAP_BASIS,
                    'Le prix de votre litre de carburant ne pourrait plus dépasser le plafond fixé par la loi.',
                ),
            ],
        },
    ],
    programme: programme({
        // LO: its paper of 2026-04-01 calls tax cuts "une piste trompeuse" and its editorial of 2026-03-30 accepts a
        // price freeze only if oil companies pay for it: it rejects each option rather than backing one, so non-couvert
        lfi: clear('e', [at(LFI_1ER_MAI, '« Pour le blocage des prix des carburants et de l’énergie »'), at(FRANCEINFO_CANDIDATS, 'blocage à 1,70 € le litre')]),
        pcf: both(['c', 'e'], [
            at(PCF_TRACT, 'blocage à 1,60 € le litre, baisse des taxes'),
            at(PCF_URGENCE, 'blocage à 1,60 € l’essence et 1,50 € le gazole, « annuler l’augmentation des certificats d’économies d’énergie »'),
            at(FRANCEINFO_CANDIDATS, 'F. Roussel, suppression des CEE et baisse de la TVA'),
        ], 'blocage des prix et suppression des CEE proposés ensemble ; la baisse de TVA demandée n’a pas de taux, alors que l’option b fixe 5,5 %'),
        eco: clear('d', [ECO_TONDELIER, at(FRANCEINFO_CANDIDATS, 'aides ciblées')]),
        ps: clear('d', [at(FRANCEINFO_CANDIDATS, 'R. Glucksmann favorable à des aides ciblées ; O. Faure, aides ciblées doublées ; A. Ouizille, chèque carburant à 500 €')], 'faible : presse seulement (franceinfo, 18 septembre 2026)'),
        ren: clear('d', [
            at(ATTAL_BFM, '« le plus juste est d’accompagner ceux qui travaillent avec des aides ciblées »'),
            at(ATTAL_MESSMER, '« Il soutient également l’élargissement des aides aux gros rouleurs »'),
            at(FRANCEINFO_CANDIDATS, 'G. Attal, « dispositifs ciblés »'),
        ]),
        modem: clear('d', [at(MODEM_FESNEAU, 'dispositif « ciblé » pour « les gros rouleurs »')]),
        hor: clear('d', [at(FRANCEINFO_CANDIDATS, 'É. Philippe, « doublement » des aides ciblées')], 'faible : presse seulement'),
        lr: clear('c', [
            FRANCEINFO_RETAILLEAU,
            at(LR_COMPTES_PUBLICS, 'fiche 14, « l’effet net de la fin des certificats d’économies d’énergie (4 Md) »'),
            at(FRANCEINFO_CANDIDATS, 'suppression des CEE « sans toucher à la TVA »'),
        ]),
        rn: both(['b', 'c'], [
            at(RN_AMENDEMENT_TVA, 'TVA à 5,5 % sur le gaz, l’électricité, le fioul et les carburants'),
            at(RN_BARDELLA_FETE, '« Nous mettrons fin à ces fameux certificats d’économie d’énergie »'),
        ], 'propose aussi de « supprimer les hausses des accises » (franceinfo, 18 septembre 2026), sans option ici'),
        rec: clear('c', [
            at(REC_BFMTV, '« supprimer les certificats d’économie d’énergie »'),
            at(FRANCEINFO_CANDIDATS, 'É. Zemmour, accise réduite d’un tiers, opposé aux aides ciblées'),
        ], 'faible : propos du candidat rapportés par la presse ; sa mesure principale, une baisse de l’accise d’un tiers, n’a pas d’option ici'),
    }),
};
