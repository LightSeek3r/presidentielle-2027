import { at, clear, note, programme, s, split, NC } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// Positions reused from the quiz question `retraites-pensions` (questions.ts), sources reopened on
// 2026-10-16. Option letters differ: quiz a/b/c/d = here d/a/b/c.

// ── Official sources ──────────────────────────────────────────────────────────────────────

const DREES_MASSES = s('autre', '2026-10-14', 'DREES, Les retraités et les retraites, édition 2026, fiche 10 « Les masses financières relatives aux pensions de retraite »', 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-10/RR2026%20-%20Fiche%2010%20-%20Les%20masses%20financi%C3%A8res%20relatives%20aux%20pensions%20de%20retraite.pdf');
const PLFSS_2027 = s('autre', '2026-10-01', 'Projet de loi de financement de la sécurité sociale pour 2027, n°3211 (enregistré le 1er octobre 2026)', 'https://www.assemblee-nationale.fr/dyn/17/textes/l17b3211_projet-loi.pdf');

// ── Party sources (same constants as questions.ts) ────────────────────────────────────────

const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const PCF_BASE = s('motion', '2026-07-15', 'Base commune du 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const PCF_ROUSSEL = s('declaration', '2026-07-09', 'Discours de F. Roussel (CommunisteS n°1094)', 'https://assets.nationbuilder.com/pcf/pages/42431/attachments/original/1784125633/document_1094_CommunisteS_40e_Congres.pdf');
const PCF_BUDGET = s('declaration', '2026-09-18', 'PCF, « Budget 2027 : Lecornu annonce une saignée sociale au service du capital »', 'https://www.pcf.fr/budget_2027_lecornu_annonce_une_saignee_sociale_au_service_du_capital');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const LCP_PS_BUDGET = s('declaration', '2026-09-16', 'LCP, « Budget : à l\'Assemblée, les socialistes présentent leurs propositions »', 'https://lcp.fr/actualites/budget-a-l-assemblee-les-socialistes-presentent-leurs-propositions-et-previennent-qu-ils');
const FRANCEINFO_ZERO_DEFICIT = s('declaration', '2026-07-03', 'franceinfo, « Zéro déficit en 2037 » (G. Attal)', 'https://www.franceinfo.fr/politique/gabriel-attal/zero-deficit-en-2037-gabriel-attal-devoile-une-serie-de-mesures-pour-retablir-les-finances-publiques-en-vue-de-la-presidentielle_8091860.html');
const ATTAL_PARISIEN = s('declaration', '2026-07-03', 'Site de campagne de G. Attal, « Dans Le Parisien : Gabriel Attal vise le zéro déficit en 2037 »', 'https://attalpresident.fr/actualites/dans-le-parisien-gabriel-attal-vise-le-zero-deficit-en-2037');
const MODEM_FESNEAU_BUDGET = s('declaration', '2026-10-15', 'MoDem, M. Fesneau (président du groupe Les Démocrates), « Rien ne serait pire que de ne pas avoir de budget »', 'https://www.mouvementdemocrate.fr/nos-parlementaires/marc-fesneau-rien-ne-serait-pire-que-de-ne-pas-avoir-de-budget-image-8524-image');
const MODEM_BAYROU_LCI = s('declaration', '2026-09-13', 'MoDem, F. Bayrou (président du MoDem), invité de LCI le 13 septembre 2026', 'https://www.mouvementdemocrate.fr/actualites/francois-bayrou-tous-ceux-qui-croient-que-la-campagne-presidentielle-est-jouee-sont-cote');
const MODEM_SOLIDARITES = s('autre', '2025-09-19', 'Page « Solidarités » du MoDem (non datée ; seule date visible : 19 septembre 2025)', 'https://www.mouvementdemocrate.fr/solidarites-7924');
const FRANCEINFO_HOR_BUDGET = s('declaration', '2026-10-13', 'franceinfo (AFP), « Horizons propose un "budget alternatif" avec 10 milliards d\'économies supplémentaires »', 'https://www.franceinfo.fr/economie/budget/horizons-propose-un-budget-alternatif-avec-10-milliards-d-economies-supplementaires_8234875.html');
const JDD_CIOTTI = s('declaration', '2026-08-15', 'JDD, entretien avec É. Ciotti', 'https://www.lejdd.fr/politique/eric-ciotti-maire-udr-de-nice-je-serai-engage-fortement-pour-la-victoire-de-marine-le-pen-181203');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');

// ── Profile helpers ───────────────────────────────────────────────────────────────────────

const retired = (p: Profile): boolean => p.status === 'retraite';
const partnerRetired = (p: Profile): boolean => p.household === 'couple' && p.partnerStatus === 'retraite';

export const measure: Measure = {
    id: 'pensions-revalorisation',
    theme: 'Retraites',
    title: 'Revalorisation annuelle des pensions de retraite',
    context: note(
        'Les pensions de retraite ont représenté 395 Md€ en 2024, soit 13,5 % du PIB. La loi les revalorise chaque 1er janvier selon les prix ; le PLFSS 2027 (article 35) propose de réduire cette hausse au-delà de 1 260 € de pensions par mois, et au-delà de 1 281 € de la fixer par décret, nulle à défaut.',
        at(DREES_MASSES, 'p.98'),
        at(PLFSS_2027, 'art. 35 et exposé des motifs'),
    ),
    options: [
        {
            id: 'a',
            label: 'Revaloriser toutes les pensions au rythme des prix (règle légale).',
            explain: 'Rien ne changerait : chaque 1er janvier, les pensions de base montent comme les prix des douze derniers mois. Le PLFSS 2027 prévoit 2,1 % d\'inflation en 2026.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Revaloriser les petites pensions au rythme des prix, geler ou limiter la hausse des plus élevées.',
            explain: 'Sous un seuil de pensions, elles suivraient les prix ; au-dessus, leur hausse serait plus faible, ou nulle. Le seuil varie selon les projets : 1 260 € par mois dans le PLFSS 2027.',
            effects: [
                {
                    when: p => retired(p) && (p.income ?? 0) >= 2,
                    direction: 'mixed',
                    weight: 2,
                    why: 'La hausse de vos pensions serait réduite ou nulle si leur total dépasse le seuil retenu, qui n\'est pas fixé.',
                },
                {
                    when: retired,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Vos pensions suivraient les prix si leur total reste sous le seuil retenu ; au-dessus, leur hausse serait réduite.',
                },
                {
                    when: partnerRetired,
                    direction: 'mixed',
                    weight: 1,
                    why: 'La hausse des pensions de votre conjoint serait réduite ou nulle si leur total dépasse le seuil retenu.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Geler toutes les pensions pendant un an.',
            explain: 'Geler veut dire ne pas augmenter. Les pensions de base resteraient au même montant pendant un an, même si les prix montent. Les complémentaires sont fixées par les syndicats et le patronat.',
            effects: [
                {
                    when: retired,
                    direction: 'loss',
                    weight: 3,
                    why: 'Vos pensions de base ne monteraient pas pendant un an, alors que les prix augmentent (2,1 % prévus pour 2026).',
                },
                {
                    when: partnerRetired,
                    direction: 'loss',
                    weight: 1,
                    why: 'Les pensions de base de votre conjoint ne monteraient pas pendant un an, alors que les prix augmentent.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Augmenter les pensions plus vite que les prix et porter au SMIC la pension d\'une carrière complète.',
            explain: 'Les pensions monteraient plus vite que les prix, par exemple comme les salaires. Une personne ayant cotisé toute la durée exigée toucherait au moins le SMIC.',
            effects: [
                {
                    when: p => retired(p) && p.income === 0,
                    direction: 'gain',
                    weight: 3,
                    why: 'Votre pension monterait plus vite que les prix ; avec une carrière complète, elle atteindrait au moins le SMIC.',
                },
                {
                    when: retired,
                    direction: 'gain',
                    weight: 2,
                    why: 'Votre pension monterait chaque année plus vite que les prix.',
                },
                {
                    when: partnerRetired,
                    direction: 'gain',
                    weight: 1,
                    why: 'La pension de votre conjoint monterait chaque année plus vite que les prix.',
                },
                {
                    // A minimum at the SMIC only matters to those whose own pay is near it
                    when: p => p.age === 'a55' && p.status !== null && p.status !== 'retraite' && p.income !== null && p.income <= 1,
                    direction: 'gain',
                    weight: 1,
                    why: 'Votre future pension serait au moins égale au SMIC si vous avez une carrière complète.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('d', [at(LFI_SYNTHESE, 'chap. 8 « Revaloriser les pensions de retraite a minima au niveau du SMIC revalorisé »'), at(NFP, 'p.4 et 16 « Indexer le montant des retraites sur les salaires »')]),
        pcf: split(['a', 'd'], [
            at(PCF_BUDGET, '« indexer les salaires et les pensions sur l\'inflation »'),
            at(NFP, 'p.4 et 16'),
            at(PCF_BASE, 'p.49 « une retraite de haut niveau »'),
            at(PCF_ROUSSEL, 'p.9, contre le gel des retraites'),
        ], 'faible : a est la demande du PCF du 18 septembre 2026 (prix) ; d repose sur le contrat NFP 2024 (salaires, minimum au SMIC)'),
        eco: clear('b', [at(ECO_PROGRAMME, 'p.67, chap. 17, proposition 9 « Sous-indexer les plus hautes retraites »'), at(ECO_PROGRAMME, 'p.117, chap. 31, mesure 4 « Indexer le montant des pensions de manière juste et différenciée »')], 'sous-indexation des plus hautes pensions, sans seuil chiffré'),
        ps: clear('a', [at(LCP_PS_BUDGET, 'S. Runel : le groupe « s\'opposerait à toute forme de désindexation, même différenciée, des pensions »')], 'faible : position du groupe à l\'Assemblée rapportée par la presse ; le Projet ne traite pas de l\'indexation'),
        ren: clear('b', [at(ATTAL_PARISIEN, '« une "année blanche" gèlera temporairement les prestations sociales, tout en protégeant les petites retraites »'), FRANCEINFO_ZERO_DEFICIT], 'faible : « année blanche » dès le budget 2028, petites retraites épargnées sans seuil'),
        modem: clear('b', [
            at(MODEM_FESNEAU_BUDGET, '« une désindexation partielle des retraites »'),
            at(MODEM_BAYROU_LCI, 'la désindexation, « le plus accessible »'),
            at(MODEM_SOLIDARITES, '« garantir un pouvoir d\'achat inchangé aux petites retraites »'),
        ], 'faible : « désindexation partielle » sans seuil ; l\'« année blanche générale » soutenue le 15 octobre 2026 ne cite pas les pensions'),
        hor: clear('b', [at(FRANCEINFO_HOR_BUDGET, 'le parti « soutiendra les mesures d\'économies proposées par le gouvernement concernant les retraités »')], 'faible : formule générale, ni seuil ni gel nommés ; la mesure du gouvernement est l\'article 35 du PLFSS 2027'),
        udr: clear('a', [JDD_CIOTTI], '« Non, je ne suis pas favorable à la désindexation des pensions »'),
        rn: clear('a', [at(RN_CONTRE_BUDGET, '« Indexation des retraites et dégel des prestations »')]),
        // LO's brochure (p.9) asks for a « massive » rise of pensions indexed on prices, without the SMIC
        // minimum of option d: no option states its parameter.
        lo: NC,
        lr: NC,
        rec: NC,
    }),
};
