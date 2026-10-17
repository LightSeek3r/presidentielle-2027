import { at, clear, isWorking, note, programme, s, split, AMB, NC } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// Positions reused from the quiz question `retraites-age` (questions.ts), sources reopened on
// 2026-10-16. Option letters differ: quiz a/b/c/d/e = here c/b/a/d/e.

// ── Official sources ──────────────────────────────────────────────────────────────────────

const COR_2026 = s('autre', '2026-06-11', 'Conseil d\'orientation des retraites, synthèse du rapport annuel 2026', 'https://www.cor-retraites.fr/sites/default/files/2026-06/Synth%C3%A8se_RA_2026_0.pdf');
const AGE_LEGAL = s('autre', '2026-08-14', 'Service-public.gouv.fr, « À partir de quel âge un salarié peut-il partir en retraite ? » (page vérifiée le 14 août 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14043');

// ── Party sources (same constants as questions.ts) ────────────────────────────────────────

const LO_BROCHURE = s('programme-2027', '2026-06-26', 'Brochure LO Présidentielle 2027', 'https://www.lutte-ouvriere.org/medias/document/fichiers/2026/06/brochure_caravane_2026-01_-_couleur.pdf');
const LO_RETRAITE_2022 = s('declaration', '2022-05-11', 'Lutte ouvrière n°2806, « Retraite : riposter aux plans de Macron »', 'https://www.lutte-ouvriere.org/portail/journal/2022-05-11-retraite-riposter-aux-plans-de-macron_316790.html');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const LFI_CONTRE_BUDGET = s('declaration', '2026-10-14', 'LCP, contre-budget 2027 de LFI', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const FRANCEINFO_DEBAT_MEDEF = s('declaration', '2026-08-27', 'franceinfo, premier débat des principaux candidats (Medef)', 'https://www.franceinfo.fr/elections/presidentielle/dette-publique-retraites-reindustrialisation-ce-qu-il-faut-retenir-du-premier-debat-des-principaux-candidats-a-la-presidentielle_8165342.html');
const PCF_BASE = s('motion', '2026-07-15', 'Base commune du 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const PCF_ROUSSEL = s('declaration', '2026-07-09', 'Discours de F. Roussel (CommunisteS n°1094)', 'https://assets.nationbuilder.com/pcf/pages/42431/attachments/original/1784125633/document_1094_CommunisteS_40e_Congres.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre libres »', 'https://projet-socialiste.fr/projet/vivre-libres/');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const LCP_PRIMAIRE_PS = s('declaration', '2026-10-09', 'LCP, différences entre les candidats à la primaire socialiste', 'https://lcp.fr/actualites/glucksmann-faure-royal-maurel-guedj-quelles-differences-entre-les-candidats-a-la');
const FRANCEINFO_RETRAITES = s('declaration', '2026-09-30', 'franceinfo, « Que proposent les principaux candidats à l\'élection présidentielle pour les retraites ? »', 'https://www.franceinfo.fr/economie/retraite/reforme-des-retraites/changement-de-systeme-passage-a-60-ou-a-65-ans-capitalisation-que-proposent-les-principaux-candidats-a-l-election-presidentielle-pour-les-retraites_8215784.html');
const ATTAL_BLOIS = s('declaration', '2026-10-05', 'Site de campagne de G. Attal, « Gabriel Attal débat avec les Français à Blois et à Bourges »', 'https://attalpresident.fr/actualites/gabriel-attal-debat-avec-les-francais-a-blois-et-a-bourges');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const JDN_PHILIPPE = s('declaration', '2026-10-09', 'Journal du Net, mesures d\'É. Philippe', 'https://www.journaldunet.com/business/action-publique/1556123-edouard-philippe-presente-ses-principales-mesures-pour-la-presidentielle-de-2027/');
const JDD_CIOTTI = s('declaration', '2026-08-15', 'JDD, entretien avec É. Ciotti', 'https://www.lejdd.fr/politique/eric-ciotti-maire-udr-de-nice-je-serai-engage-fortement-pour-la-victoire-de-marine-le-pen-181203');
const ENTREVUE_CIOTTI = s('declaration', '2026-08-16', 'Entrevue, « Retraites : Éric Ciotti souhaite une évolution du RN sur l\'âge de départ »', 'https://entrevue.fr/politique/retraites-eric-ciotti-souhaite-une-evolution-du-rn-sur-lage-de-depart/');
const UDR_ACTE_III = s('programme-2027', '2025-05-27', 'Livret du groupe UDR « Retraites : vers la capitalisation » (27 mai 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/4910/attachments/original/Livret_Colloque_3_-_Retraites__vers_la_capitalisation_-_27_mai__2025_VF.pdf?1748419800');
const RN_FRANCE24 = s('declaration', '2026-10-06', 'France 24, programme économique de M. Le Pen', 'https://www.france24.com/fr/france/20261006-pr%C3%A9sidentielle-2027-marine-le-pen-promet-140-milliards-d-euros-nets-d-%C3%A9conomies-d-ici-5-ans');
const JDN_LE_PEN_RETRAITES = s('declaration', '2026-08-28', 'Journal du Net, « Marine Le Pen maintient le retour à la retraite à 62 ans »', 'https://www.journaldunet.com/business/action-publique/1554113-marine-le-pen-maintient-le-retour-a-la-retraite-a-62-ans/');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const RN_LIVRET_ENTREPRISE = s('programme-2022', '2024-09-06', 'Livret RN « La France entreprend » (version 2022 mise à jour, PDF du 6 septembre 2024)', 'https://rassemblementnational.fr/documents/WEB-GRN-LIVRET-ENTREPRISE.pdf');
const REC_BFMTV = s('declaration', '2026-09-18', 'BFMTV, entretien d\'É. Zemmour (« Face à BFM », 17 septembre 2026, article du 18)', 'https://www.bfmtv.com/politique/elections/presidentielle/presidentielle-immigration-voile-marine-le-pen-ce-qu-il-faut-retenir-de-l-interview-d-eric-zemmour-sur-bfmtv_AV-202609170966.html');
const REC_PUBLICSENAT_2022 = s('programme-2022', '2022-03-23', 'Public Sénat, programme d\'É. Zemmour 2022', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2022-eric-zemmour-detaille-son-programme-et-assume-le-terme');

// ── Profile helpers ───────────────────────────────────────────────────────────────────────

// Not yet retired: anyone in work or looking for work, and students
const beforeRetirement = (p: Profile): boolean => isWorking(p) || p.status === 'chomeur' || p.status === 'etudiant';
const near = (p: Profile): boolean => beforeRetirement(p) && p.age === 'a55';
const mid = (p: Profile): boolean => beforeRetirement(p) && p.age === 'a40';
const young = (p: Profile): boolean => beforeRetirement(p) && p.age === 'a25';
const youngest = (p: Profile): boolean => beforeRetirement(p) && p.age === 'a18';

export const measure: Measure = {
    id: 'retraite-age-legal',
    theme: 'Retraites',
    title: 'Âge minimum légal de départ à la retraite',
    context: note(
        'Les dépenses de retraite atteignent 422 Md€ en 2025, soit 14,1 % du PIB. L\'âge minimum de départ monte selon l\'année de naissance, jusqu\'à 64 ans pour les personnes nées dès 1969 ; la hausse est suspendue pour la génération 1964 et le début de 1965.',
        at(COR_2026, 'p.3 et 5'),
        AGE_LEGAL,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder la règle actuelle : âge légal porté à 64 ans pour les personnes nées en 1969 ou après.',
            explain: 'Rien ne changerait : l\'âge minimum de départ continuerait de monter selon l\'année de naissance, jusqu\'à 64 ans. Les départs anticipés (carrière longue, handicap...) resteraient possibles.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Annuler la réforme de 2023 et ramener l\'âge légal à 62 ans.',
            explain: 'L\'âge minimum de départ redeviendrait celui d\'avant 2023 : 62 ans. Les départs anticipés (carrière longue, handicap...) resteraient possibles.',
            effects: [
                { when: near, direction: 'gain', weight: 3, why: 'Vous pourriez partir dès 62 ans au lieu de 62 ans et 9 mois à 64 ans, selon votre année de naissance.' },
                { when: mid, direction: 'gain', weight: 2, why: 'Vous pourriez partir dès 62 ans au lieu de 64 ans, avec une pension complète si vous avez assez cotisé.' },
                { when: young, direction: 'gain', weight: 1, why: 'Vous pourriez partir dès 62 ans au lieu de 64 ans ; la règle pourrait encore changer d\'ici votre retraite.' },
                { when: youngest, direction: 'gain', weight: 1, why: 'Vous pourriez partir dès 62 ans au lieu de 64 ans ; la règle pourrait encore changer d\'ici votre retraite.' },
            ],
        },
        {
            id: 'c',
            label: 'Abaisser l\'âge légal de départ à la retraite à 60 ans.',
            explain: 'Chacun pourrait partir dès 60 ans. Une pension complète demanderait toujours d\'avoir assez cotisé.',
            effects: [
                { when: near, direction: 'gain', weight: 3, why: 'Vous pourriez partir dès 60 ans au lieu de 62 ans et 9 mois à 64 ans, selon votre année de naissance.' },
                { when: mid, direction: 'gain', weight: 3, why: 'Vous pourriez partir dès 60 ans au lieu de 64 ans, avec une pension complète si vous avez assez cotisé.' },
                { when: young, direction: 'gain', weight: 2, why: 'Vous pourriez partir dès 60 ans au lieu de 64 ans ; la règle pourrait encore changer d\'ici votre retraite.' },
                { when: youngest, direction: 'gain', weight: 1, why: 'Vous pourriez partir dès 60 ans au lieu de 64 ans ; la règle pourrait encore changer d\'ici votre retraite.' },
            ],
        },
        {
            id: 'd',
            label: 'Relever peu à peu l\'âge légal jusqu\'à 65 ans.',
            explain: 'L\'âge minimum de départ monterait par étapes jusqu\'à 65 ans. Les départs anticipés (carrière longue, handicap...) resteraient possibles.',
            effects: [
                { when: mid, direction: 'loss', weight: 3, why: 'Vous devriez attendre 65 ans au lieu de 64 ans pour partir, sauf départ anticipé (carrière longue, handicap, santé).' },
                { when: young, direction: 'loss', weight: 2, why: 'Vous devriez attendre 65 ans au lieu de 64 ans pour partir, sauf départ anticipé (carrière longue, handicap, santé).' },
                { when: near, direction: 'loss', weight: 2, why: 'Selon le rythme de la hausse, vous pourriez devoir partir quelques mois plus tard qu\'aujourd\'hui.' },
                { when: youngest, direction: 'loss', weight: 1, why: 'Vous devriez attendre 65 ans au lieu de 64 ans pour partir ; la règle pourrait encore changer d\'ici là.' },
            ],
        },
        {
            id: 'e',
            label: 'Supprimer l\'âge légal : seule la durée de cotisation compterait.',
            explain: 'La loi ne fixerait plus d\'âge minimum : seule une durée de cotisation compterait. Partir plus tôt donnerait une pension moins élevée, partir plus tard une pension supérieure.',
            effects: [
                {
                    when: p => near(p) || mid(p) || young(p) || youngest(p),
                    direction: 'mixed',
                    weight: 2,
                    why: 'Vous pourriez partir plus tôt avec une pension plus faible, ou plus tard avec une pension plus forte ; la durée exigée n\'est pas fixée.',
                },
            ],
        },
    ],
    programme: programme({
        lo: clear('c', [LO_RETRAITE_2022, at(LO_BROCHURE, 'p.5')], 'faible : 60 ans et 37,5 annuités comme « premier objectif » en 2022 ; la brochure 2027 dénonce le recul de l\'âge sans fixer d\'âge'),
        lfi: split(['b', 'c'], [
            at(FRANCEINFO_DEBAT_MEDEF, 'J.-L. Mélenchon, « Nous reviendrons dans un premier temps à 62 ans, et le but est de revenir plus vite à 60 ans »'),
            at(LFI_CONTRE_BUDGET, '« rétablir l\'âge de départ à la retraite à 62 ans (avant un éventuel retour à 60 ans) »'),
            FRANCEINFO_RETRAITES,
            at(LFI_SYNTHESE, 'chap. 8 « Instaurer la retraite à 60 ans »'),
        ], 'b : retour à 62 ans « dans un premier temps » ; c : 60 ans ensuite'),
        pcf: clear('c', [at(PCF_BASE, 'p.49'), at(PCF_ROUSSEL, 'p.4')]),
        eco: split(['b', 'c'], [at(ECO_PROGRAMME, 'p.116, chap. 31, mesure 1'), FRANCEINFO_RETRAITES], 'b : retour immédiat à 62 ans ; c : objectif de 60 ans, en priorité pour les carrières commencées tôt ou pénibles'),
        ps: clear('b', [at(PS_VIVRE_LIBRES, 'ch.1 « Pouvoir profiter de sa retraite »'), LCP_PRIMAIRE_PS, at(PP_ACTE_UN, 'p.43')], 'le candidat (Acte un) abroge la réforme de 2023 sans faire de l\'âge légal le centre de sa réforme'),
        ren: clear('e', [at(ATTAL_BLOIS, '« l\'âge légal de départ serait supprimé au profit d\'une durée de cotisation décidée par les partenaires sociaux »'), FRANCEINFO_RETRAITES]),
        modem: NC,
        hor: clear('d', [HOR_PROSPERE, FRANCEINFO_RETRAITES, JDN_PHILIPPE]),
        // Retailleau's measure 108 (avecretailleau.fr/projet/mesure/d, updated 2026-10-15) and press sheet 6
        // (2026-10-12): minimum age down to 63 with a 7 % discount a year, full rate guaranteed at 65. No
        // option carries it and a sixth one is not allowed: the owner must choose AMB, NC or a new option set.
        lr: AMB,
        udr: clear('a', [JDD_CIOTTI, ENTREVUE_CIOTTI, at(UDR_ACTE_III, 'p.22 et 26, « sans […] repousser l\'âge de départ »')], 'faible : entretien de 2026 sans âge chiffré (64 ans n\'est cité que par Entrevue) ; le livret du groupe (2025) exclut un recul de l\'âge'),
        // France 24's « voire à 60 » is the journalist's wording; the 60 of the RN programme is only for
        // careers started before 20, which is not option c (same age for all), so b only.
        rn: clear('b', [RN_FRANCE24, FRANCEINFO_RETRAITES, JDN_LE_PEN_RETRAITES, at(RN_PROJET_2024, 'p.14 (page 8 du PDF)'), at(RN_LIVRET_ENTREPRISE, 'p.44 (page 23 du PDF)')], 'M. Le Pen, candidate : 62 ans, 60 ans pour qui a commencé avant 20 ans ; J. Bardella a plaidé pour l\'abandon de la mesure d\'âge de départ (Journal du Net, 28 août 2026)'),
        rec: split(['a', 'd'], [REC_BFMTV, FRANCEINFO_RETRAITES, at(REC_PUBLICSENAT_2022, '64 ans')], 'faible : « 64 voire 65 ans » (É. Zemmour, BFMTV, 17 septembre 2026), propos rapportés par la presse ; 64 ans au programme 2022'),
    }),
};
