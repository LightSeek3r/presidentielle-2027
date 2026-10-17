import { at, both, clear, note, programme, s, split, wealthFloor, wealthMid } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// The visitor is read as the parent who transmits: their own wealth split between their children.
// `children` 3 means "3 or more", so the share per child is an upper bound for large families.
const share = (p: Profile, wealth: number): number | null =>
    p.children === null || p.children === 0 ? null : wealth / p.children;
const shareFloor = (p: Profile): number => share(p, wealthFloor(p).total) ?? 0;
const shareMid = (p: Profile): number => share(p, wealthMid(p)) ?? 0;

const ABATTEMENT = 100_000;

const runsBusiness = (p: Profile): boolean =>
    (p.status === 'patron' || p.status === 'indep') && (p.children ?? 0) > 0 && (p.wealthImmaterial ?? 0) >= 3;

const VM1 = s('autre', '2026-10-05', 'PLF 2027, Évaluation des voies et moyens, tome I (PDF du 5 octobre 2026)', 'https://www.budget.gouv.fr/documentation/file-download/34339');
const SP_SUCCESSION = s('autre', '2026-02-09', 'Service-public, fiche F14198 « Droits de succession : calcul des droits » (vérifiée le 9 février 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14198');

// Parties
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const ENSEMBLE_2024 = s('plateforme-2024', '2024-06-20', 'Programme Ensemble 2024 (législatives)', 'https://doc.ensemble-2024.fr/programme-legislatives-24.pdf');
const LFI_SYNTHESE_6 = s('programme-2027', '2026-07-17', 'Synthèse des contributions, chapitre 6, « déjà présentes dans le programme actuel »', 'https://melenchon2027.fr/programme/synthese-des-contributions/chapitre-6-partage-des-richesses/');
const LCP_CONTRE_BUDGET_LFI = s('declaration', '2026-10-14', 'LCP, contre-budget de LFI pour 2027', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const LCP_HERITAGES = s('declaration', '2026-08-27', 'LCP, « Héritages et droits de succession : que proposent les candidats »', 'https://lcp.fr/actualites/heritages-et-droits-de-succession-que-proposent-les-candidats-a-l-election');
const PCF_2022 = s('programme-2022', '2022-01-01', 'Programme du PCF « La France des jours heureux », proposition 128 (2022, page non datée, le 1er janvier est utilisé)', 'https://www.pcf.fr/128_la_fiscalit_des_donations_et_des_successions_sera_profond_ment_r_form_e');
const PCF_HUMA = s('declaration', '2026-09-15', 'PCF, discours de Fabien Roussel à la Fête de l’Humanité 2026 (publié le 15 septembre 2026)', 'https://www.pcf.fr/fete_de_lhumanite_2026_discours_de_fabien_roussel');
const PCF_BUDGET = s('declaration', '2026-09-18', 'PCF, « Budget 2027 : Lecornu annonce une saignée sociale au service du capital »', 'https://www.pcf.fr/budget_2027_lecornu_annonce_une_saignee_sociale_au_service_du_capital');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const ECO_DP_BUDGET = s('programme-2027', '2026-08-26', 'Les Écologistes, dossier de presse « Budget 2027 : la grande transmission doit financer la grande transition »', 'https://lesecologistes.fr/document/3uFsOCRc1JbiqUtDqkoLVd/dossierpresse-budget2027.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société »', 'https://projet-socialiste.fr/projet/refaire-societe/');
const ATTAL_REF = s('declaration', '2026-08-27', 'Site de campagne de G. Attal, « À La REF : Gabriel Attal, grand gagnant du premier débat de la présidentielle 2027 »', 'https://attalpresident.fr/actualites/a-la-ref-gabriel-attal-grand-gagnant-du-premier-debat-de-la-presidentielle-2027');
const ATTAL_AFER = s('declaration', '2026-09-29', 'Site de campagne de G. Attal, « Aux Assises de l’AFER, Gabriel Attal défend une épargne qui finance l’économie française »', 'https://attalpresident.fr/actualites/aux-assises-de-l-afer-gabriel-attal-defend-une-epargne-qui-finance-l-economie-francaise');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const HOR_ENFANTS = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus attentive à ses enfants » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-attentive-a-ses-enfants');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const LR_SUCCESSION = s('declaration', '2026-08-26', 'LR, B. Retailleau, « Je serai le président qui baissera les impôts de succession »', 'https://republicains.fr/actualites/2026/08/26/je-serai-le-president-qui-baissera-les-impots-de-succession/');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const NICE_PREMIUM = s('declaration', '2026-09-05', 'Nice Premium, discours d\'É. Ciotti à Levens', 'https://www.nicepremium.fr/actualites/eric-ciotti-officialise-son-soutien-a-marine-le-pen-lors-de-sa-rentree-politique-a-levens/');
const BV_CIOTTI = s('declaration', '2026-06-24', 'Boulevard Voltaire, « Mettre fin à l’impôt sur la mort : Éric Ciotti muscle son programme économique » (mis à jour le 26 août 2026)', 'https://www.bvoltaire.fr/mettre-fin-a-limpot-sur-la-mort-eric-ciotti-muscle-son-programme-economique/');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');

export const measure: Measure = {
    id: 'succession-donation',
    theme: 'Patrimoine',
    title: 'Droits de succession et de donation entre parents et enfants',
    context: note(
        'En 2025, les droits de succession et de donation ont rapporté 21,2 milliards d’euros. Chaque enfant peut recevoir 100 000 € de chacun de ses parents sans droits ; au-delà, le taux monte par tranches de 5 % à 45 %.',
        at(VM1, 'p. 42, mutations à titre gratuit'), SP_SUCCESSION,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder l’abattement de 100 000 € par enfant et par parent, et le barème actuel de 5 à 45 %.',
            explain: 'Chaque enfant reçoit 100 000 € de chacun de ses parents sans droits. Au-delà, le taux monte par tranches, jusqu’à 45 % pour la part qui dépasse 1,8 million d’euros.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Relever l’abattement à 150 000 ou 200 000 € par enfant, sur les donations, l’héritage ou les deux.',
            explain: 'Chaque enfant pourrait recevoir jusqu’à 50 000 à 100 000 € de plus sans droits. Selon les propositions, la hausse vaut pour les donations seulement, parfois pendant quelques années, ou aussi pour l’héritage.',
            effects: [
                { when: p => shareFloor(p) > ABATTEMENT, direction: 'gain', weight: 2, why: 'La part de chaque enfant dépasse 100 000 € : jusqu’à 50 000 ou 100 000 € de plus lui seraient transmis sans droits.' },
                { when: p => shareMid(p) > ABATTEMENT, direction: 'gain', weight: 1, why: 'Si la part de chacun de vos enfants dépasse 100 000 €, une plus grande partie pourrait leur être transmise sans droits.' },
            ],
        },
        {
            id: 'c',
            label: 'Supprimer les droits de succession pour les patrimoines modestes et moyens.',
            explain: 'Les héritages des parents aux enfants sous un seuil ne paieraient plus de droits, par exemple 200 000 € ou 1 million d’euros par enfant selon les propositions. Les plus gros héritages resteraient taxés.',
            effects: [
                { when: p => shareFloor(p) > ABATTEMENT && shareMid(p) <= 500_000, direction: 'gain', weight: 2, why: 'Vos enfants paieraient des droits aujourd’hui ; ils pourraient ne plus en payer, selon le seuil retenu.' },
                { when: p => shareMid(p) > ABATTEMENT && shareMid(p) <= 2_000_000, direction: 'gain', weight: 1, why: 'Si votre patrimoine reste sous le seuil retenu, vos enfants ne paieraient plus de droits de succession.' },
            ],
        },
        {
            id: 'd',
            label: 'Taxer davantage les très gros héritages, par de nouvelles tranches, le cumul des sommes reçues ou un plafond.',
            explain: 'De nouvelles tranches viseraient les héritages de plusieurs millions d’euros, ou l’ensemble de ce qu’une personne reçoit dans sa vie. Selon une proposition, un héritage maximal prélèverait tout au-delà d’un plafond.',
            effects: [
                { when: p => shareFloor(p) >= 4_000_000, direction: 'loss', weight: 3, why: 'La part de chacun de vos enfants dépasse 4 millions d’euros : elle serait nettement plus taxée, selon les projets jusqu’à un plafond.' },
                { when: p => shareMid(p) >= 1_000_000, direction: 'loss', weight: 1, why: 'Selon le seuil retenu, non fixé par l’option, la part de vos enfants, au-delà d’un million d’euros, pourrait être plus taxée.' },
            ],
        },
        {
            id: 'e',
            label: 'Limiter les régimes de faveur : transmission d’entreprise (pacte Dutreil) et assurance-vie.',
            explain: 'Aujourd’hui, la transmission d’une entreprise familiale est en grande partie exonérée (pacte Dutreil) et l’assurance-vie a son propre abattement. Ces avantages seraient plafonnés ou supprimés.',
            effects: [
                // wealthImmaterial 5 = more than 50 M€, the highest cap proposed for the pacte Dutreil
                { when: p => runsBusiness(p) && (p.wealthImmaterial ?? 0) >= 5, direction: 'loss', weight: 2, why: 'La transmission de votre entreprise à vos enfants serait moins exonérée qu’avec le pacte Dutreil actuel.' },
                { when: runsBusiness, direction: 'mixed', weight: 1, why: 'Selon le plafond retenu pour le pacte Dutreil (50 millions d’euros dans une proposition), la transmission de votre entreprise serait ou non moins exonérée.' },
                { when: p => shareMid(p) > ABATTEMENT, direction: 'loss', weight: 1, why: 'Si une partie de votre patrimoine est placée en assurance-vie, sa transmission à vos enfants serait davantage taxée.' },
            ],
        },
    ],
    programme: programme({
        lfi: both(['d', 'e'], [
            at(NFP, 'p. 13'),
            at(LFI_SYNTHESE_6, '« Refondre progressivement les droits de succession et instaurer un héritage maximal »'),
            at(LCP_HERITAGES, 'M. Panot, « prendre tout » au-delà de 12 millions d’euros'),
            at(LCP_CONTRE_BUDGET_LFI, 'taxe sur les héritages et « raboter les principales niches fiscales », dont le pacte Dutreil'),
        ], 'd : programme ; e : pacte Dutreil « raboté » dans le contre-budget du 14 octobre 2026, rapporté par la presse, assurance-vie non citée'),
        pcf: both(['c', 'd', 'e'], [
            at(PCF_HUMA, '« nous taxerons les héritages les plus riches et nous exonérerons les héritages des classes populaires, nous exonérerons les héritages en dessous de 200 000 € »'),
            at(PCF_BUDGET, '« le Pacte Dutreil et les principales niches fiscales seraient sanctuarisés. C’est inacceptable »'),
            PCF_2022,
            at(NFP, 'p. 13'),
        ], 'c : héritages exonérés sous 200 000 €, sans dire si le seuil est par enfant ; e : refus de « sanctuariser » le pacte Dutreil, assurance-vie non citée'),
        eco: both(['d', 'e'], [at(ECO_PROGRAMME, 'ch. 17-2, p. 66'), at(ECO_DP_BUDGET, 'p. 5, 10 % sur les héritages au-delà de 4 millions d’euros, 10 % de plus au-delà de 13 millions ; abattement Dutreil ramené à 50 % au-delà de 50 millions'), LCP_HERITAGES]),
        ps: both(['d', 'e'], [at(PS_REFAIRE_SOCIETE, '« Rétablir la justice dans l’héritage » : impôt sur les grandes successions et « Plafonner le pacte Dutreil », lu via archive.org (6 octobre 2026)')]),
        ren: clear('b', [
            at(ENSEMBLE_2024, 'p. 6, « Aucun impôt ne sera appliqué aux successions et donations jusqu’à 150 000 € par enfant »'),
            at(ATTAL_AFER, '« opposition à toute hausse de la fiscalité sur l’héritage » ; « faciliter et fluidifier les donations du vivant »'),
            at(ATTAL_REF, 'pérennité du pacte Dutreil'),
        ], 'faible : le montant vient de la plateforme de coalition de 2024 ; en 2026 le candidat veut faciliter les donations, sans montant'),
        modem: split(['b', 'e'], [
            at(MODEM_BUDGET, '« Équité fiscale » : limiter les effets d’aubaine du pacte Dutreil, fin des avantages de transmission des contrats d’assurance vie'),
            at(ENSEMBLE_2024, 'p. 6, « Aucun impôt ne sera appliqué aux successions et donations jusqu’à 150 000 € par enfant »'),
        ], 'e : dossier budgétaire du groupe (2025) ; b, faible : plateforme de coalition de 2024 seulement'),
        hor: clear('b', [
            at(HOR_ENFANTS, '« Augmenter massivement les plafonds de donation du vivant aux enfants et petits-enfants pendant les trois premières années du quinquennat »'),
            at(ENSEMBLE_2024, 'p. 6, « Aucun impôt ne sera appliqué aux successions et donations jusqu’à 150 000 € par enfant »'),
            at(LCP_HERITAGES, 'É. Philippe, « augmentation très sensible des plafonds » de donation'),
            at(HOR_PROSPERE, '« Défendre le maintien du pacte Dutreil »'),
        ], 'faible : en 2026, donations seulement, pendant trois ans, sans montant ; le montant vient de la plateforme de coalition de 2024 ; défend le maintien du pacte Dutreil'),
        lr: clear('b', [LR_SUCCESSION], 'donations jusqu’à 150 000 € par parent aux enfants de moins de 30 ans, pendant trois ans ; veut aussi exonérer les entreprises familiales transmises tant qu’elles ne sont pas vendues'),
        udr: clear('c', [at(UDR_ACTE_II, 'p. 6 et 28, exonération jusqu’à 1 million d’euros par parent et par enfant, puis taux unique de 20 %'), at(BV_CIOTTI, 'exonération jusqu’à 1 million d’euros par enfant'), NICE_PREMIUM], 'texte du groupe (2025), repris en 2026 ; donations en ligne directe exonérées jusqu’à 1 million d’euros tous les 10 ans'),
        rn: clear('c', [at(RN_PROJET_2024, '« Supprimer les impôts sur l’héritage direct pour les familles modestes et les classes moyennes »'), at(RN_BARDELLA_FETE, 'droits de succession des agriculteurs')], 'faible : programme 2024, seuil non chiffré ; propose aussi de relever les exonérations de dons familiaux, levier hors options'),
    }),
};
