import { at, both, clear, note, programme, s, NC } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// ── Official sources ──────────────────────────────────────────────────────────────────────

const UNEDIC = s('autre', '2026-06-17', 'Unédic, « Situation financière de l\'Assurance chômage à horizon 2028 » (juin 2026)', 'https://s3.eusc-de-east-1.amazonaws.eu/unedic-eks-prod-cms/2026/06/17/situation-financiere-assurance-chomage-a-horizon-2028-juin-2026_uid_6a32884bd3186.pdf');
const ARE = s('autre', '2026-07-23', 'Service-public.gouv.fr, fiche F38881 « Allocation chômage (ARE), fin de contrat à compter du 1er avril 2025 » (vérifiée le 23 juillet 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F38881');

// ── Party sources ─────────────────────────────────────────────────────────────────────────

const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const LFI_CONTRE_BUDGET = s('declaration', '2026-10-14', 'LCP, contre-budget 2027 de LFI', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const PCF_2022_OBJ1 = s('programme-2022', '2022-01-01', 'Programme du PCF, objectif 1 (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/objectif_1');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre libres »', 'https://projet-socialiste.fr/projet/vivre-libres/');
const ATTAL_PARISIEN = s('declaration', '2026-07-03', 'Site de campagne de G. Attal, « Dans Le Parisien : Gabriel Attal vise le zéro déficit en 2037 »', 'https://attalpresident.fr/actualites/dans-le-parisien-gabriel-attal-vise-le-zero-deficit-en-2037');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const JDN_PHILIPPE = s('declaration', '2026-10-09', 'Journal du Net, mesures d\'É. Philippe', 'https://www.journaldunet.com/business/action-publique/1556123-edouard-philippe-presente-ses-principales-mesures-pour-la-presidentielle-de-2027/');
const LR_TRAVAIL = s('programme-2027', '2025-12-01', 'Brochure LR « Le travail gagnant » (décembre 2025)', 'https://republicains.fr/wp-content/uploads/2026/01/51705_LesRepublicains_Brochures_A5-40P_DEF.pdf');
const LR_COMPTES_PUBLICS = s('programme-2027', '2026-10-12', 'Projet Retailleau, fiches presse « Rétablir l\'ordre dans les comptes publics » (12 octobre 2026)', 'https://www.avecretailleau.fr/api/media/file/20261011_Fiches_presse_comptes_publics_mise_en_page%20(1).pdf');
const UDR_ACTE_II = s('programme-2027', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const RN_BFM_ASSURANCE = s('declaration', '2024-06-16', 'BFM (AFP), « Jordan Bardella assure que le RN supprimera la réforme de l\'assurance-chômage »', 'https://www.bfmtv.com/economie/economie-social/jordan-bardella-assure-que-le-rn-supprimera-la-reforme-de-l-assurance-chomage-s-il-accede-au-pouvoir_AD-202406160248.html');

// ── Profile helpers ───────────────────────────────────────────────────────────────────────

const indemnise = (p: Profile): boolean => p.status === 'chomeur' && p.aids.includes('are');
const under40 = (p: Profile): boolean => p.age === 'a18' || p.age === 'a25';
// The 40-54 band straddles the 50 and 53 thresholds, so its texts stay conditional
const under55 = (p: Profile): boolean => under40(p) || p.age === 'a40';

// No euro amount: the months gained or lost are paid once, at the end of the rights, not every year.

export const measure: Measure = {
    id: 'assurance-chomage',
    theme: 'Chômage',
    title: 'Assurance chômage : durée maximale et baisse des hautes allocations',
    context: note(
        'En 2025, 2,6 millions de personnes étaient indemnisées par l\'Assurance chômage, qui a versé 37,2 Md€ d\'allocations et d\'aides. Avant 55 ans, l\'allocation dure au plus 548 jours (18 mois). Elle baisse de 30 % au 7e mois si l\'ancien salaire dépassait 4 857,81 € brut par mois.',
        at(UNEDIC, 'p.6 et 10'),
        ARE,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder 18 mois maximum avant 55 ans, et la baisse de 30 % au 7e mois des hautes allocations.',
            explain: 'Rien ne changerait. La baisse de 30 % ne vise que les personnes de moins de 55 ans dont l\'ancien salaire dépassait 4 857,81 € brut par mois.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Ramener à 12 mois la durée maximale d\'indemnisation chômage avant 50 ans.',
            explain: 'Avant 50 ans, l\'allocation chômage serait versée au plus 12 mois au lieu de 18. Après 50 ans, les durées actuelles resteraient.',
            effects: [
                {
                    when: p => indemnise(p) && under40(p),
                    direction: 'loss',
                    weight: 3,
                    why: 'Votre allocation chômage serait versée au plus 12 mois au lieu de 18 : jusqu\'à 6 mois d\'allocation en moins.',
                },
                {
                    when: p => indemnise(p) && p.age === 'a40',
                    direction: 'loss',
                    weight: 2,
                    why: 'Si vous avez moins de 50 ans, votre allocation chômage serait versée au plus 12 mois au lieu de 18.',
                },
                {
                    when: p => p.status === 'salarie' && under55(p),
                    direction: 'loss',
                    weight: 1,
                    why: 'Si vous perdiez votre emploi avant 50 ans, l\'allocation chômage durerait au plus 12 mois au lieu de 18.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Supprimer l\'allocation au 3e refus d\'offre raisonnable et étendre la baisse progressive des allocations.',
            explain: 'Refuser une troisième offre d\'emploi jugée raisonnable mettrait fin à l\'allocation. La baisse au fil des mois toucherait des salaires plus bas qu\'aujourd\'hui, par exemple dès 3 000 € net.',
            effects: [
                {
                    when: p => indemnise(p) && (p.income ?? 0) >= 2 && p.age !== 'a55' && p.age !== 'a65',
                    direction: 'loss',
                    weight: 2,
                    why: 'Votre allocation pourrait baisser au fil des mois, plus tôt ou plus fort qu\'aujourd\'hui, et s\'arrêter au troisième refus d\'offre raisonnable.',
                },
                {
                    when: indemnise,
                    direction: 'loss',
                    weight: 1,
                    why: 'Refuser une troisième offre d\'emploi raisonnable mettrait fin à votre allocation chômage.',
                },
                {
                    when: p => p.status === 'salarie',
                    direction: 'loss',
                    weight: 1,
                    why: 'Si vous perdiez votre emploi, l\'allocation pourrait baisser plus vite et s\'arrêter au troisième refus d\'offre raisonnable.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Annuler les réformes de 2019 à 2025 : durées plus longues, sans baisse au 7e mois.',
            explain: 'L\'allocation pourrait de nouveau durer jusqu\'à 24 mois au lieu de 18 avant 53 ans, et plus longtemps après. La baisse de 30 % au 7e mois disparaîtrait.',
            effects: [
                {
                    when: p => indemnise(p) && under40(p),
                    direction: 'gain',
                    weight: 3,
                    why: 'Votre allocation chômage pourrait durer jusqu\'à 24 mois au lieu de 18, soit 6 mois de plus, sans baisse au 7e mois.',
                },
                {
                    when: p => indemnise(p) && p.age === 'a40',
                    direction: 'gain',
                    weight: 3,
                    why: 'Votre allocation pourrait durer 6 mois de plus avant 53 ans, 12 mois de plus à 53 ou 54 ans, sans baisse au 7e mois.',
                },
                {
                    when: p => indemnise(p) && p.age === 'a55',
                    direction: 'gain',
                    weight: 3,
                    why: 'Votre allocation chômage pourrait durer 9 à 13,5 mois de plus selon votre âge (jusqu\'à 36 mois au total).',
                },
                {
                    when: p => p.status === 'salarie',
                    direction: 'gain',
                    weight: 1,
                    why: 'Si vous perdiez votre emploi, l\'allocation chômage pourrait durer plus longtemps et ne baisserait plus au 7e mois.',
                },
            ],
        },
        {
            id: 'e',
            label: 'Ramener à 15 mois la durée maximale d\'indemnisation chômage, au lieu de 18.',
            explain: 'L\'allocation serait versée au plus 15 mois au lieu de 18 (durée actuelle avant 55 ans). Selon les projets, il faudrait aussi avoir travaillé plus longtemps pour ouvrir des droits.',
            effects: [
                {
                    when: p => indemnise(p) && under55(p),
                    direction: 'loss',
                    weight: 2,
                    why: 'Votre allocation chômage serait versée au plus 15 mois au lieu de 18 : jusqu\'à 3 mois d\'allocation en moins.',
                },
                {
                    when: p => indemnise(p) && p.age === 'a55',
                    direction: 'mixed',
                    weight: 1,
                    why: 'Selon les projets, les durées plus longues accordées après 55 ans resteraient ou commenceraient plus tard.',
                },
                {
                    when: p => p.status === 'salarie' && under55(p),
                    direction: 'loss',
                    weight: 1,
                    why: 'Si vous perdiez votre emploi, l\'allocation chômage durerait au plus 15 mois au lieu de 18.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('d', [
            at(LFI_CONTRE_BUDGET, '« L\'abrogation de toutes les réformes sur les droits à l\'assurance chômage »'),
            at(LFI_SYNTHESE, 'chap. 8 « Supprimer les réformes successives liées au calcul de l\'allocation chômage »'),
            at(NFP, 'p.4'),
        ]),
        pcf: clear('d', [
            at(PCF_2022_OBJ1, 'proposition 2, « la loi Borne sur l\'Assurance-chômage seront immédiatement abrogées »'),
            at(NFP, 'p.4 « ainsi que les réformes de l\'assurance-chômage »'),
        ], 'faible : programme 2022 et contrat NFP 2024, aucun texte PCF de 2026 sur l\'assurance chômage'),
        eco: clear('d', [at(ECO_PROGRAMME, 'p.58, chap. 14, mesure 7 « Abroger les réformes régressives »')]),
        ps: clear('d', [at(PP_ACTE_UN, 'p.53 « Abroger la réforme Macron de l\'assurance chômage »'), at(PS_VIVRE_LIBRES, 'ch.1, radiations et sanctions')], 'faible : le texte du candidat ne précise pas quelle réforme est visée'),
        ren: clear('e', [at(ATTAL_PARISIEN, '« la reprise de la réforme de l\'assurance chômage initiée lorsqu\'il était Premier ministre »')], 'faible : reprend la réforme préparée en 2024 (durée de 18 à 15 mois), sans citer la durée'),
        hor: clear('b', [at(HOR_PROSPERE, '« Réduire à 12 mois maximum la durée d\'indemnisation chômage pour les moins de 50 ans »'), JDN_PHILIPPE]),
        lr: both(['c', 'e'], [
            at(LR_TRAVAIL, 'fiche 05, p.31-33 : fin de l\'indemnisation au 3e refus, dégressivité accélérée au-dessus de 3 000 € nets'),
            at(LR_COMPTES_PUBLICS, 'fiche 8, « application des règles de juin 2024, jamais appliquées (durée maximale de 18 à 15 mois […]) » et « suspension au troisième refus d\'une offre raisonnable »'),
        ], 'proposées ensemble ; les droits plus longs des seniors commenceraient plus tard'),
        udr: clear('e', [at(UDR_ACTE_II, 'p.42, « Réduction de la durée maximale d\'indemnisation, de 18 à 15 mois »')], 'propose aussi d\'exiger 12 mois travaillés sur 24, au lieu de 6, pour ouvrir des droits'),
        rn: clear('a', [at(RN_PROJET_2024, 'p.4 du PDF, « Annulation de la réforme de l\'assurance chômage de juillet 2024 »'), RN_BFM_ASSURANCE], 'faible : programme de juin 2024 ; annule la réforme qui ramenait la durée de 18 à 15 mois, sans rien dire de la baisse au 7e mois'),
        // LO (journal 2025-12-24, brève 2026-02-23) denounces the 2023 cut from 24 to 18 months without
        // asking for it to be undone: no demand, so not coded.
        lo: NC,
        modem: NC,
        rec: NC,
    }),
};
