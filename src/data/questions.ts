import type { OptionId, Position, Question, Source, SourceKind } from './types.ts';

// Writing rules for the question bank
//
// - Universal wording: never presuppose a status (job, property, income, children, car...).
//   Every reader must be able to picture the situation.
// - situation: 35 words at most. Option label: 20 words at most (enforced by validateDataset).
// - 3 to 5 options. Options are actions, not judgments or slogans.
// - A party backing no option, or an ambiguous one, gets { backs: null, reason }, never a guess.
// - Every non-null position carries at least one source: https URL, ISO date, not after PUBLISHED_AT.
// - "Fait" comes only from scrutin mappings (data/scrutins.json), never from free text.
//
// Question set version 3, with the author's decisions of 2026-10-12.
// - "Dit" (programme) comes only from documents and statements of the party or its candidate.
//   A joint text (NFP 2024, Ensemble 2024) is used only as a "faible" fallback when the party has
//   no more recent document of its own on the question (one author exception: LFI, question 3).
// - A note starting with "faible" flags a position to be revalidated first (2022 source, joint
//   text, book of a leader, half of an option sourced...).
// - Dates are ISO. When a source only gives a year or a month, the 1st is used and the label says so.

const s = (kind: SourceKind, date: string, label: string, url: string): Source => ({ url, label, date, kind });

// Same source, with the passage or page it is used for
const at = (source: Source, where: string): Source => ({ ...source, label: `${source.label}, ${where}` });

const clear = (option: OptionId, sources: Source[], note?: string): Position => ({
    backs: [option],
    kind: 'clear',
    sources,
    ...(note ? { note } : {}),
});

const split = (backs: OptionId[], sources: Source[], note?: string): Position => ({
    backs,
    kind: 'split',
    sources,
    ...(note ? { note } : {}),
});

const NC: Position = { backs: null, reason: 'non-couvert' };
const AMB: Position = { backs: null, reason: 'ambigu' };

// ---------------------------------------------------------------------------------------------
// Sources shared by several positions
// ---------------------------------------------------------------------------------------------

// Lutte ouvrière
const LO_BROCHURE = s('programme-2027', '2026-06-26', 'Brochure LO Présidentielle 2027', 'https://www.lutte-ouvriere.org/medias/document/fichiers/2026/06/brochure_caravane_2026-01_-_couleur.pdf');
const LO_DISCOURS = s('declaration', '2026-09-29', 'Discours N. Arthaud du 26/09/2026', 'https://www.lutte-ouvriere.org/portail/brochures/meeting-26-septembre-2026-discours-nathalie-arthaud-197446.html');
const LO_FETE = s('declaration', '2026-05-28', 'Discours N. Arthaud, fête LO (dimanche)', 'https://www.lutte-ouvriere.org/portail/brochures/fete-lutte-ouvriere-2026-discours-nathalie-arthaud-dimanche-194655.html');
const LO_ASSOC = s('programme-2022', '2022-03-07', 'Réponses aux associations 2022', 'https://lutte-ouvriere.org/r/51874');
const LO_RETRAITE_2022 = s('declaration', '2022-05-11', 'Lutte ouvrière n°2806, « Retraite : riposter aux plans de Macron »', 'https://www.lutte-ouvriere.org/portail/journal/2022-05-11-retraite-riposter-aux-plans-de-macron_316790.html');
const LO_UBER_2024 = s('declaration', '2024-02-21', 'Lutte ouvrière n°2899, « Uber, Deliveroo : le soutien des gouvernements »', 'https://www.lutte-ouvriere.org/portail/journal/2024-02-21-uber-deliveroo-le-soutien-des-gouvernements_729469.html');
const LO_LIVREURS_2026 = s('declaration', '2026-04-28', 'Lutte ouvrière n°3013, « Livreurs à vélo : l\'esclavage moderne »', 'https://lutte-ouvriere.org/journal/article/livreurs-velo-lesclavage-moderne-193894.html');

// La France insoumise
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-06-01', 'Synthèse des contributions, « déjà au programme » (juin 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const LFI_NICHE = s('declaration', '2026-10-05', 'Niche LFI, proposition de loi salaires et retraites', 'https://lafranceinsoumise.fr/2026/10/05/niche-2026-augmenter-les-salaires-et-les-retraites/');
const LFI_RURALITES = s('programme-2027', '2026-10-01', 'Plan « Ruralités » (octobre 2026, date approximative)', 'https://melenchon2027.fr/programme/plans-thematiques/ruralite/');
const LFI_BTP = s('programme-2027', '2026-09-01', 'Plan « BTP et logement » (septembre 2026, date approximative)', 'https://melenchon2027.fr/programme/plans-investissement/btp-logement/');
const LFI_OTAN = s('motion', '2026-01-19', 'Proposition de résolution du groupe LFI pour sortir de l\'OTAN', 'https://lafranceinsoumise.fr/2026/01/19/le-groupe-parlementaire-de-la-france-insoumise-propose-de-sortir-de-lotan/');
const LFI_PRESOMPTION = s('declaration', '2026-09-22', 'Communiqué du groupe LFI, « Le gouvernement refuse de transposer la directive sur la présomption de salariat »', 'https://lafranceinsoumise.fr/2026/09/22/le-gouvernement-refuse-de-transposer-la-directive-sur-la-presomption-de-salariat/');
const LFI_CHSCT = s('declaration', '2025-12-27', 'Communiqué du groupe LFI et de la délégation FI au Parlement européen, « En France comme en Europe, aucun salarié ne devrait mourir au travail ! »', 'https://lafranceinsoumise.fr/2025/12/27/en-france-comme-en-europe-aucun-salarie-ne-devrait-mourir-au-travail/');

// Parti communiste français
const PCF_BASE = s('motion', '2026-07-15', 'Base commune du 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const PCF_ROUSSEL = s('declaration', '2026-07-09', 'Discours de F. Roussel (CommunisteS n°1094)', 'https://assets.nationbuilder.com/pcf/pages/42431/attachments/original/1784125633/document_1094_CommunisteS_40e_Congres.pdf');
const PCF_MJCF_SANTE = s('declaration', '2026-05-06', 'MJCF, « Jeunes morts au travail : en finir avec l\'hécatombe » (CommunisteS n°1085, pcf.fr)', 'https://www.pcf.fr/jeunes_morts_au_travail_en_finir_avec_hecatombe');

// Les Écologistes
const ECO_PLATEFORME = s('programme-2027', '2025-12-15', 'Plateforme projet [consultation]', 'https://projet.lesecologistes.fr/pages/sommaire-detaille');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');

// PS / Place publique
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre libres »', 'https://projet-socialiste.fr/projet/vivre-libres/');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société »', 'https://projet-socialiste.fr/projet/refaire-societe/');
const PS_SECURITES = s('programme-2027', '2026-06-25', 'Projet socialiste « Être en sécurité(s) »', 'https://projet-socialiste.fr/projet/etre-en-securites/');
const PS_EPANOUIR = s('programme-2027', '2026-06-25', 'Projet socialiste « S\'épanouir à égalité »', 'https://projet-socialiste.fr/projet/sepanouir-a-egalite/');
const PS_NATURE = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre avec la nature »', 'https://projet-socialiste.fr/projet/vivre-avec-la-nature/');
const PS_PRIORITES = s('declaration', '2026-09-24', '« Les 7 priorités des Socialistes pour le budget 2027 »', 'https://parti-socialiste.fr/vie-parlementaire/les-7-priorites-des-socialistes-pour-le-budget-2027/');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const LCP_PRIMAIRE_PS = s('declaration', '2026-10-09', 'LCP, différences entre les candidats à la primaire socialiste', 'https://lcp.fr/actualites/glucksmann-faure-royal-maurel-guedj-quelles-differences-entre-les-candidats-a-la');

// Renaissance, MoDem, Horizons
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const REN_REGALIEN = s('programme-2027', '2025-05-26', 'Convention Renaissance « Une République ferme, une France apaisée »', 'https://doc.parti.re/conventions/Restitution-Regalien-Une-Republique-ferme-une-France-apaisee.pdf');
const ENSEMBLE_2024 = s('plateforme-2024', '2024-06-20', 'Programme Ensemble 2024 (législatives)', 'https://doc.ensemble-2024.fr/programme-legislatives-24.pdf');
const FRANCEINFO_DEBAT = s('declaration', '2026-08-27', 'franceinfo, premier débat des principaux candidats (Medef)', 'https://www.franceinfo.fr/elections/presidentielle/dette-publique-retraites-reindustrialisation-ce-qu-il-faut-retenir-du-premier-debat-des-principaux-candidats-a-la-presidentielle_8165342.html');
const FRANCEINFO_RETRAITES = s('declaration', '2026-09-30', 'franceinfo, « Que proposent les principaux candidats à l\'élection présidentielle pour les retraites ? »', 'https://www.franceinfo.fr/economie/retraite/reforme-des-retraites/changement-de-systeme-passage-a-60-ou-a-65-ans-capitalisation-que-proposent-les-principaux-candidats-a-l-election-presidentielle-pour-les-retraites_8215784.html');
const PUBLICSENAT_MEETING = s('declaration', '2026-05-30', 'Public Sénat, premier meeting de G. Attal', 'https://www.publicsenat.fr/actualites/politique/un-an-pour-convaincre-pour-son-premier-grand-meeting-gabriel-attal-mise-sur-lespoir-et-joue-sa-difference-avec-edouard-philippe');
const FRANCEINFO_ZERO_DEFICIT = s('declaration', '2026-07-03', 'franceinfo, « Zéro déficit en 2037 » (G. Attal)', 'https://www.franceinfo.fr/politique/gabriel-attal/zero-deficit-en-2037-gabriel-attal-devoile-une-serie-de-mesures-pour-retablir-les-finances-publiques-en-vue-de-la-presidentielle_8091860.html');
const ATTAL_BLOIS = s('declaration', '2026-10-05', 'Site de campagne de G. Attal, « Gabriel Attal débat avec les Français à Blois et à Bourges »', 'https://attalpresident.fr/actualites/gabriel-attal-debat-avec-les-francais-a-blois-et-a-bourges');
const JDD_ATTAL = s('declaration', '2026-08-01', 'JDD, entretien avec G. Attal', 'https://www.lejdd.fr/politique/exclusif-gabriel-attal-je-propose-la-plus-grande-reforme-institutionnelle-depuis-1958-180333');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const MODEM_LIVRET = s('motion', '2024-01-01', 'Livret de contributions, congrès de Blois (2024, mois non précisé)', 'https://www.mouvementdemocrate.fr/system/files/documents/C24_LivretContributions_Web_0.pdf');
const MODEM_SOLIDARITES = s('autre', '2026-01-01', 'Page « Solidarités » du MoDem (non datée, date indicative)', 'https://www.mouvementdemocrate.fr/solidarites-7924');
const MODEM_DEMOCRATIE = s('autre', '2026-01-01', 'Page « Démocratie » du MoDem (non datée, date indicative)', 'https://www.mouvementdemocrate.fr/democratie-7927');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const HOR_ENFANTS = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus attentive à ses enfants » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-attentive-a-ses-enfants');
const HOR_SURE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus sûre » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-sure');
const HOR_CONQUERANTE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus conquérante » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-conquerante');
const HOR_ANNONCES = s('declaration', '2026-10-08', '« Trois principales annonces d\'Édouard Philippe à l\'Heure de vérité »', 'https://www.edouardphilippe.fr/actualites/trois-principales-annonces-dedouard-philippe-a-lheure-de-verite');
const HOR_NARCO = s('programme-2027', '2026-05-01', 'Plan d\'É. Philippe contre le narcotrafic (mai 2026, date approximative)', 'https://horizonsleparti.fr/le-plan-dedouard-philippe-contre-le-narcotrafic/');
const JDN_PHILIPPE = s('declaration', '2026-10-09', 'Journal du Net, mesures d\'É. Philippe', 'https://www.journaldunet.com/business/action-publique/1556123-edouard-philippe-presente-ses-principales-mesures-pour-la-presidentielle-de-2027/');

// Les Républicains
const LR_TRAVAIL = s('programme-2027', '2025-12-01', 'Brochure LR « Le travail gagnant » (décembre 2025)', 'https://republicains.fr/wp-content/uploads/2026/01/51705_LesRepublicains_Brochures_A5-40P_DEF.pdf');
const LR_ECOLE = s('programme-2027', '2026-09-01', 'Brochure LR « École » (septembre 2026)', 'https://republicains.fr/wp-content/uploads/2026/09/LR_Ecole_vF.pdf');
const LR_PRODUIRE = s('programme-2027', '2026-02-01', 'Livret LR « Produire plus pour vivre mieux » (février 2026, le 1er du mois est utilisé)', 'https://republicains.fr/wp-content/uploads/2026/02/LR_Produire_Plus_LIVRET.pdf');
const RETAILLEAU_100_REGLES = s('programme-2027', '2026-09-11', 'Projet Retailleau, mesure 30 « Supprimer 100 règles qui pénalisent le plus les entreprises » (mise à jour du 11 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/supprimer-100-regles-qui-penalisent-le-plus-les-entreprises');
const RETAILLEAU_ELECTRICITE = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème électricité (mai à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/electricite');
const RETAILLEAU_AGRICULTURE = s('programme-2027', '2026-10-12', 'Projet Retailleau, thème agriculture (relevé le 12 octobre 2026)', 'https://www.avecretailleau.fr/projet/theme/agriculture');
const RETAILLEAU_LOGEMENT = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème logement (mai à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/logement');
const RETAILLEAU_INSTITUTIONS = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème institutions (septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/institutions');
const RETAILLEAU_FAMILLE = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème famille (mai à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/famille');
const RETAILLEAU_INDUSTRIE = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème industrie-entreprises (février à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/industrie-entreprises');
const RETAILLEAU_PROJET = s('programme-2027', '2026-10-12', 'Projet Retailleau, liste des mesures (relevé le 12 octobre 2026)', 'https://www.avecretailleau.fr/projet');
const RETAILLEAU_QUOTAS = s('programme-2027', '2026-09-01', 'Projet Retailleau, mesure « quotas migratoires » (septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/faire-fixer-par-la-loi-des-quotas-migratoires');
const RETAILLEAU_PRESTATIONS = s('programme-2027', '2026-09-22', 'Projet Retailleau, mesure « prestations après cinq ans de séjour »', 'https://www.avecretailleau.fr/projet/mesure/conditionner-les-prestations-sociales-a-cinq-ans-de-sejour');
const RETAILLEAU_CHARTE = s('programme-2027', '2026-09-24', 'Projet Retailleau, mesure « Charte républicaine »', 'https://www.avecretailleau.fr/projet/mesure/charte-republicaine');
const PLANET_RETAILLEAU = s('declaration', '2026-02-16', 'Planet, programme de B. Retailleau', 'https://www.planet.fr/politique-presidentielle-2027-justice-immigration-et-rsa-le-programme-radical-de-retailleau.2994292.29334.html');
const PUBLICSENAT_RETAILLEAU = s('declaration', '2026-09-03', 'Public Sénat, B. Retailleau veut « renverser la table »', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-bruno-retailleau-veut-renverser-la-table-avec-une-profonde-reforme-constitutionnelle');

// UDR
const JDD_CIOTTI = s('declaration', '2026-08-15', 'JDD, entretien avec É. Ciotti', 'https://www.lejdd.fr/politique/eric-ciotti-maire-udr-de-nice-je-serai-engage-fortement-pour-la-victoire-de-marine-le-pen-181203');
const JDD_UNION_DROITES = s('declaration', '2026-01-11', 'JDD, « L\'union des droites est une nécessité »', 'https://www.lejdd.fr/politique/eric-ciotti-lunion-des-droites-est-une-necessite-politique-electorale-et-vitale-165758');
const NICE_PREMIUM = s('declaration', '2026-09-05', 'Nice Premium, discours d\'É. Ciotti à Levens', 'https://www.nicepremium.fr/actualites/eric-ciotti-officialise-son-soutien-a-marine-le-pen-lors-de-sa-rentree-politique-a-levens/');
const FRANCEINFO_PACTE = s('declaration', '2026-09-05', 'franceinfo, « pacte d\'alliance » proposé par É. Ciotti (Levens)', 'https://www.franceinfo.fr/politique/il-n-y-a-qu-une-voie-eric-ciotti-propose-a-marine-le-pen-un-pacte-d-alliance-pour-la-presidentielle-de-2027_8178815.html');
const UDR_PPLC = s('motion', '2025-12-11', 'Proposition de loi constitutionnelle n°2237 « priorité nationale et locale »', 'https://www.assemblee-nationale.fr/dyn/17/textes/l17b2237_proposition-loi.pdf');
const UDR_JOURNEE = s('motion', '2025-06-26', 'Journée réservée du groupe UDR à l\'Assemblée nationale', 'https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/journee-reservee-du-groupe-udr-examen-de-plusieurs-propositions-de-loi-et-de-resolution');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const UDR_ACTE_I = s('motion', '2025-04-10', 'Livret du groupe UDR « Acte I du Grand Forum des Libertés » (PDF du 10 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3524/attachments/original/Livret_Acte_I_Grand_Forum_des_Liberte%CC%81s_compressed.pdf?1744280025');
const ENTREVUE_CIOTTI = s('declaration', '2026-08-16', 'Entrevue, « Retraites : Éric Ciotti souhaite une évolution du RN sur l\'âge de départ »', 'https://entrevue.fr/politique/retraites-eric-ciotti-souhaite-une-evolution-du-rn-sur-lage-de-depart/');

// Rassemblement national
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');
const RN_22_MESURES = s('programme-2022', '2022-01-01', 'Les 22 mesures du RN (2022)', 'https://rassemblementnational.fr/22-mesures');
const RN_LCP_2024 = s('plateforme-2024', '2024-06-24', 'LCP, programme du RN pour les législatives 2024', 'https://lcp.fr/actualites/legislatives-2024-pouvoir-d-achat-immigration-ecole-jordan-bardella-devoile-le-programme');
const RN_FRANCE24 = s('declaration', '2026-10-06', 'France 24, programme économique de M. Le Pen', 'https://www.france24.com/fr/france/20261006-pr%C3%A9sidentielle-2027-marine-le-pen-promet-140-milliards-d-euros-nets-d-%C3%A9conomies-d-ici-5-ans');
const RN_LIVRET_IMMIGRATION = s('programme-2022', '2022-01-01', 'Livret RN « Contrôler l\'immigration » (2022)', 'https://rassemblementnational.fr/documents/projet/projet-controle-de-limmigration.pdf');
const RN_LIVRET_SANTE = s('programme-2022', '2022-01-01', 'Livret RN « La santé » (2022)', 'https://rassemblementnational.fr/documents/projet/projet-la-sante.pdf');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const RN_LIVRET_ENTREPRISE = s('programme-2022', '2024-09-06', 'Livret RN « La France entreprend » (version 2022 mise à jour, PDF du 6 septembre 2024)', 'https://rassemblementnational.fr/documents/WEB-GRN-LIVRET-ENTREPRISE.pdf');
const JDN_LE_PEN_RETRAITES = s('declaration', '2026-08-28', 'Journal du Net, « Marine Le Pen maintient le retour à la retraite à 62 ans »', 'https://www.journaldunet.com/business/action-publique/1554113-marine-le-pen-maintient-le-retour-a-la-retraite-a-62-ans/');
const LCP_ZFE = s('declaration', '2026-10-09', 'LCP, suppression des ZFE (niche parlementaire du RN, article du 9 octobre 2026)', 'https://lcp.fr/actualites/zfe-le-rn-ne-parvient-pas-a-faire-voter-leur-suppression-lors-de-sa-niche-parlementaire');

// Reconquête (candidate's 2022 programme, then a leader's 2026 book)
const REC_PUBLICSENAT_2022 = s('programme-2022', '2022-03-23', 'Public Sénat, programme d\'É. Zemmour 2022', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2022-eric-zemmour-detaille-son-programme-et-assume-le-terme');
const REC_TOUTSURMESFINANCES = s('programme-2022', '2022-01-01', 'Toutsurmesfinances, programme d\'É. Zemmour 2022 (mis à jour en septembre 2025)', 'https://www.toutsurmesfinances.com/argent/a/eric-zemmour-programme');
const REC_KNAFO_IRDEME = s('autre', '2026-09-19', 'IRDEME, livre de S. Knafo « Le Casse du siècle » (livre d\'une dirigeante, pas programme du candidat)', 'https://irdeme.org/les-15-resolutions-de-sarah-knafo-ne-sont-pas-toutes-des-solutions/');
const REC_BFMTV = s('declaration', '2026-09-17', 'BFMTV, entretien d\'É. Zemmour (« Face à BFM », 17 septembre 2026)', 'https://www.bfmtv.com/politique/elections/presidentielle/presidentielle-immigration-voile-marine-le-pen-ce-qu-il-faut-retenir-de-l-interview-d-eric-zemmour-sur-bfmtv_AV-202609170966.html');
const REC_KNAFO_QDE = s('autre', '2026-09-15', 'Le Quotidien des entreprises, livre de S. Knafo (livre d\'une dirigeante, pas programme du candidat)', 'https://www.lequotidiendesentreprises.fr/politique/sarah-knafo-decryptage-du-casse-du-siecle/');

// Notes repeated on many positions
const NOTE_ENSEMBLE = 'faible : plateforme de coalition Ensemble 2024';
const NOTE_NFP = 'faible : programme commun NFP 2024 seul';
const NOTE_2022 = 'faible : programme 2022';
const NOTE_REC_2022_LIVRE = 'faible : programme 2022 et livre d\'une dirigeante';

// ---------------------------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------------------------

export const QUESTIONS: Question[] = [
    // ----- Tronc (20) -----
    {
        id: 'travail-salaire',
        tier: 'core',
        theme: 'Salaires (SMIC, cotisations)',
        situation: "Une personne travaille à temps plein au SMIC, soit environ 1 480 € net par mois. Vous êtes peut-être cette personne, un proche ou son employeur. Que faire d'abord pour augmenter son revenu ?",
        context: {
            text: "Le SMIC à temps plein vaut 1 867,02 € brut, soit environ 1 478 € net par mois.",
            sources: [s('autre', "2026-06-01", "Service-public.gouv.fr, fiche F2300 « Smic »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300")],
        },
        options: [
            {
                id: 'a',
                label: "Augmenter le SMIC par la loi, d'au moins 100 € net par mois.",
                explain: "Le SMIC est le salaire minimum légal. L'employeur paierait la hausse, et la personne toucherait au moins 100 € de plus chaque mois.",
            },
            {
                id: 'b',
                label: 'Baisser les cotisations et la CSG retenues sur la fiche de paie, pour augmenter le salaire net.',
                explain: "Retenues sur le salaire, la CSG et les cotisations financent la protection sociale (santé, retraite). La personne toucherait plus ; la protection sociale recevrait moins, sauf si l'État compense.",
            },
            {
                id: 'c',
                label: "Supprimer les cotisations patronales sur les hausses de salaire accordées par l'employeur.",
                explain: "L'employeur paie des cotisations patronales en plus du salaire. Il n'en paierait plus sur les hausses qu'il choisit d'accorder ; la protection sociale recevrait moins, sauf si l'État compense.",
            },
            {
                id: 'd',
                label: 'Supprimer les cotisations sur les heures supplémentaires, au-delà de 35 heures par semaine.',
                explain: "Sur les heures au-delà de 35 heures par semaine, salarié et employeur ne paieraient aucune cotisation sociale. La protection sociale recevrait moins, sauf si l'État compense.",
            },
        ],
        programme: {
            lo: clear('a', [at(LO_BROCHURE, 'p.9'), LO_DISCOURS]),
            lfi: clear('a', [LFI_NICHE]),
            pcf: clear('a', [PCF_ROUSSEL, at(NFP, 'p.4')], 'faible : aucun chiffre propre au PCF (1 600 € net dans le NFP 2024)'),
            eco: clear('a', [FRANCEINFO_DEBAT]),
            ps: split(['a', 'b'], [at(PS_VIVRE_LIBRES, 'ch.1'), PS_PRIORITES, FRANCEINFO_DEBAT], 'b : baisse de la CSG, portée par R. Glucksmann (franceinfo, 2026-08-27)'),
            ren: clear('b', [PUBLICSENAT_MEETING, FRANCEINFO_DEBAT]),
            modem: clear('b', [at(MODEM_BUDGET, 'section 3')]),
            hor: clear('d', [HOR_ANNONCES]),
            lr: clear('d', [at(LR_TRAVAIL, 'fiches 01-02')]),
            udr: NC,
            rn: split(
                ['b', 'c'],
                [RN_BARDELLA_FETE, at(RN_22_MESURES, 'n°5'), RN_LCP_2024],
                'faible : c repose sur des mesures de 2022-2024, reformulées en 2026 en incitation fiscale',
            ),
            rec: split(
                ['b', 'd'],
                [REC_PUBLICSENAT_2022, REC_TOUTSURMESFINANCES, s('autre', '2026-09-07', "Yahoo Finance, livre de S. Knafo (livre d'une dirigeante)", 'https://fr.finance.yahoo.com/actualites/130-milliards-d%C3%A9conomies-sarah-knafo-103113554.html')],
                NOTE_REC_2022_LIVRE,
            ),
        },
    },
    {
        id: 'prix-quotidien',
        tier: 'core',
        theme: 'Prix du quotidien (courses, carburant)',
        situation: "En un an, le prix des carburants, de l'énergie et des courses augmente de 10 %. Que faire en priorité ?",
        options: [
            {
                id: 'a',
                label: "Bloquer par la loi les prix de vente des produits de base, de l'énergie et des carburants.",
                explain: "Les prix de ces produits seraient fixés par l'État. Magasins, stations-service et fournisseurs d'énergie ne pourraient pas vendre plus cher, même si leurs propres coûts augmentent.",
                cases: {
                    text: "En France, fin 2021, l'État a bloqué les tarifs réglementés du gaz, qu'il fixait lui-même, au niveau d'octobre 2021. Le 1er février 2022, la hausse du prix de l'électricité a été limitée à 4 %, toutes taxes comprises (TTC). Ces blocages ont été prolongés en 2023, avec une hausse de 15 %. Ils ne portaient ni sur les carburants ni sur l'alimentation.",
                    sources: [
                        s('autre', "2024-03-15", "Cour des comptes, « Les mesures exceptionnelles de lutte contre la hausse des prix de l'énergie » (rapport, mars 2024)", "https://www.ccomptes.fr/sites/default/files/2024-03/20240315_Mesures-exceptionnelles-lutte-contre-hausse-prix-energie.pdf"),
                    ],
                },
            },
            {
                id: 'b',
                label: "Baisser fortement la TVA sur l'énergie, les carburants et les produits de première nécessité.",
                explain: "La TVA est une taxe incluse dans le prix de ce qu'on achète. Elle serait fortement réduite sur ces produits : la part du prix qui va à l'État diminuerait.",
                cases: {
                    text: "En Espagne, le gouvernement a pris un décret-loi le 27 décembre 2022, un texte qui a valeur de loi. Il a fait passer la TVA, taxe incluse dans les prix, de 4 % à 0 % sur les aliments de base. Sur les huiles et les pâtes, elle est passée de 10 % à 5 %. Ces deux baisses ont été prolongées jusqu'à mi-2024. Le décret-loi a aussi gardé la TVA sur le gaz à 5 % en 2023.",
                    sources: [
                        s('autre', "2022-12-28", "BOE, Real Decreto-ley 20/2022 du 27 décembre 2022 (préambule et art. 72, version consolidée), publié le 28 décembre 2022 (en espagnol)", "https://www.boe.es/buscar/act.php?id=BOE-A-2022-22685"),
                    ],
                },
            },
            {
                id: 'c',
                label: "Supprimer des frais ajoutés au prix de l'énergie hors TVA, comme les certificats d'économie d'énergie.",
                explain: "Des frais inclus dans le prix de l'énergie, autres que la TVA, seraient supprimés. Par exemple, les vendeurs d'énergie ne devraient plus financer des travaux comme l'isolation (certificats d'économie d'énergie).",
                cases: {
                    text: "En Allemagne, la taxe EEG finançait les énergies renouvelables, comme le solaire et l'éolien, par la facture d'électricité. EEG est le sigle allemand de la loi sur les énergies renouvelables. En janvier 2022, elle est passée de 6,5 à 3,72 centimes par kilowattheure (kWh), l'unité qui mesure l'électricité consommée. Puis elle est passée à zéro le 1er juillet de la même année. L'État fédéral a compensé ce passage à zéro par un fonds spécial d'environ 6,6 milliards d'euros.",
                    sources: [
                        s('autre', "2022-05-28", "Gouvernement fédéral allemand (Bundesregierung), « EEG-Umlage fällt weg », 28 mai 2022 (en allemand)", "https://www.bundesregierung.de/breg-de/aktuelles/eeg-umlage-faellt-weg-2011728"),
                        s('autre', "2024-03-15", "Cour des comptes, « Les mesures exceptionnelles de lutte contre la hausse des prix de l'énergie » (rapport, mars 2024)", "https://www.ccomptes.fr/sites/default/files/2024-03/20240315_Mesures-exceptionnelles-lutte-contre-hausse-prix-energie.pdf"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Verser une aide ciblée aux ménages modestes (chèque énergie ou alimentation) plutôt que baisser les prix pour tous.',
                explain: "Les foyers aux petits revenus recevraient de l'État une somme pour payer leur énergie ou leurs courses. Les prix, eux, ne seraient pas baissés.",
                cases: {
                    text: "En France, en décembre 2021, un chèque énergie exceptionnel de 100 € a été envoyé à 5,8 millions de foyers. Ces foyers recevaient déjà le chèque énergie, une aide pour payer les factures d'énergie. Ils faisaient partie des 20 % de foyers aux revenus les plus bas (les deux premiers déciles). Ce chèque s'ajoutait au bouclier tarifaire, qui limitait la hausse des prix du gaz et de l'électricité. Ce bouclier était une mesure générale, étendue peu à peu à tous les foyers.",
                    sources: [
                        s('autre', "2024-03-15", "Cour des comptes, « Les mesures exceptionnelles de lutte contre la hausse des prix de l'énergie » (rapport, mars 2024)", "https://www.ccomptes.fr/sites/default/files/2024-03/20240315_Mesures-exceptionnelles-lutte-contre-hausse-prix-energie.pdf"),
                    ],
                },
            },
            {
                id: 'e',
                label: 'Indexer par la loi les salaires, les pensions et les allocations sur la hausse des prix.',
                explain: "Indexer, c'est augmenter automatiquement au rythme des prix : s'ils montent de 10 %, salaires, retraites et allocations aussi. Employeurs, caisses de retraite et organismes sociaux paieraient ces hausses.",
                cases: {
                    text: "En Belgique, la plupart des salaires sont indexés : ils montent avec les prix. Ils suivent l'indice santé lissé : les prix hors produits jugés nocifs pour la santé, en moyenne sur plusieurs mois. Cela passe par des accords dans chaque secteur d'activité, souvent par paliers de 2 % à la fois. Les allocations sociales sont aussi indexées. Depuis juin 2026, une loi limite l'indexation de la part d'un salaire qui dépasse 4 000 €.",
                    sources: [
                        s('autre', "1993-12-24", "SPF Emploi (Belgique), « Indexation automatique des salaires » (page non datée ; date de l'arrêté royal du 24 décembre 1993 cité)", "https://emploi.belgique.be/fr/themes/remuneration/indexation-automatique-des-salaires"),
                        s('autre', "2015-04-23", "SPF Emploi (Belgique), « Saut d'index 2015 » (page non datée ; date de la loi du 23 avril 2015 citée)", "https://emploi.belgique.be/fr/themes/remuneration/indexation-automatique-des-salaires/saut-dindex-2015"),
                        s('autre', "2026-05-30", "SPF Emploi (Belgique), « Index centimes » (page non datée ; date de la loi-programme du 30 mai 2026 citée)", "https://emploi.belgique.be/fr/themes/remuneration/indexation-automatique-des-salaires/index-centimes"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('e', [at(LO_BROCHURE, 'p.8-9'), at(LO_DISCOURS, 'carburant à prix coûtant')]),
            lfi: split(['a', 'e'], [LFI_NICHE, at(NFP, 'p.4')], 'faible : a repose sur le NFP 2024 et des affiches de 2026'),
            pcf: clear('a', [at(NFP, 'p.4'), at(PCF_BASE, 'p.47')]),
            eco: clear('d', [
                s('declaration', '2026-03-28', 'franceinfo, M. Tondelier sur France Inter', 'https://www.franceinfo.fr/economie/automobile/essence/prix-des-carburants-la-patronne-des-ecologistes-marine-tondelier-reclame-une-aide-ciblee-selon-les-revenus-pour-aider-les-particuliers_7900238.html'),
                ECO_PLATEFORME,
            ]),
            ps: split(['b', 'd'], [at(PS_VIVRE_LIBRES, 'ch.2 « Se nourrir »')], "faible : b limitée à la TVA sur l'alimentation, carburant non trouvé"),
            ren: NC,
            modem: AMB,
            hor: NC,
            lr: clear('c', [at(RETAILLEAU_ELECTRICITE, "suppression des certificats d'économie d'énergie")], 'faible : source primaire de la conférence du 15 septembre 2026 non lue'),
            udr: NC,
            rn: split(['b', 'c'], [RN_CONTRE_BUDGET, RN_BARDELLA_FETE]),
            rec: AMB,
        },
    },
    {
        id: 'medecin-installation',
        tier: 'core',
        theme: 'Médecin près de chez soi',
        situation: "Le médecin généraliste de votre commune part à la retraite sans successeur. Beaucoup d'habitants n'ont plus de médecin traitant. Que faire en priorité ?",
        context: {
            text: "Fin 2023, environ 11 % des patients de 16 ans et plus n'avaient pas de médecin traitant.",
            sources: [s('autre', "2025-07-01", "Assurance maladie, rapport « Charges et produits pour 2026 » (juillet 2025, jour non précisé)", "https://www.assurance-maladie.ameli.fr/sites/default/files/2025-07_rapport-propositions-pour-2026_assurance-maladie.pdf")],
        },
        options: [
            {
                id: 'a',
                label: "Conditionner l'installation des nouveaux médecins : libre là où il en manque, sinon seulement pour remplacer un départ.",
                explain: "Dans votre commune, qui manque de médecins, un nouveau médecin pourrait s'installer librement. Là où il y en a assez, il devrait attendre le départ d'un autre médecin.",
                cases: {
                    text: "En Allemagne, les médecins conventionnés sont ceux dont les soins sont pris en charge par l'assurance maladie publique. Quand leur nombre dans un secteur dépasse le besoin de 10 %, des comités régionaux y bloquent les nouvelles installations. Cette règle figure dans le livre V du code social, articles 101 et 103. Un cabinet qui arrête son activité peut quand même être repris, sur décision d'un comité d'admission.",
                    sources: [
                        s('autre', "1988-12-20", "Sozialgesetzbuch V, § 101 « Überversorgung » (page non datée ; date de la loi du 20 décembre 1988 citée) (en allemand)", "https://www.gesetze-im-internet.de/sgb_5/__101.html"),
                        s('autre', "1988-12-20", "Sozialgesetzbuch V, § 103 « Zulassungsbeschränkungen » (page non datée ; date de la loi du 20 décembre 1988 citée) (en allemand)", "https://www.gesetze-im-internet.de/sgb_5/__103.html"),
                    ],
                },
            },
            {
                id: 'b',
                label: "Laisser l'installation libre et verser des aides aux médecins qui s'installent là où il en manque.",
                explain: "Les médecins continueraient à choisir où ils s'installent. Ceux qui viennent dans une zone qui manque de médecins, comme votre commune, recevraient de l'argent public, par exemple une prime.",
                cases: {
                    text: "En France, depuis le 1er janvier 2026, l'Assurance maladie verse une aide unique aux médecins qui s'installent à leur compte. C'est réservé à une première installation, en secteur 1 (sans supplément de prix) ou à l'Optam (suppléments limités). L'aide est de 10 000 € en zone d'intervention prioritaire, où il manque le plus de médecins. Elle est de 5 000 € en zone d'action complémentaire, où le manque est moins fort. Ces aides remplacent les contrats démographiques, d'anciennes aides liées à un contrat avec l'Assurance maladie.",
                    sources: [
                        s('autre', "2026-03-17", "Assurance maladie (ameli.fr), « Des aides en faveur de l'exercice en zone sous-dense rénovées » (page du 17 mars 2026)", "https://www.ameli.fr/medecin/exercice-liberal/vie-cabinet/aides-financieres/aides-exercice-zone-sous-dense-renovees"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Ouvrir des centres de santé publics, avec des médecins salariés.',
                explain: "Des organismes publics (commune, département, hôpital...) ouvriraient des lieux de consultation. Les médecins y toucheraient un salaire fixe, au lieu d'être payés à chaque consultation.",
                cases: {
                    text: "En France, les centres de santé ne cherchent pas à faire de bénéfices et sont ouverts à tous. Leur personnel est en général salarié : il est employé par le centre. Les centres sont gérés par des collectivités (communes, départements...) ou des hôpitaux, mais aussi par des associations ou des mutuelles. Selon la Cour des comptes, il y en avait environ 2 500 en 2023, en comptant les centres infirmiers et dentaires.",
                    sources: [
                        s('autre', "2024-05-13", "Cour des comptes, « L'organisation territoriale des soins de premier recours » (rapport, 13 mai 2024), p. 98", "https://www.ccomptes.fr/sites/default/files/2024-06/20240513-Organisation_territoriale-soins-premier-recours.pdf"),
                    ],
                },
            },
            {
                id: 'd',
                label: "Laisser l'installation libre et confier davantage de soins aux pharmaciens et aux infirmiers.",
                explain: "Les médecins continueraient à choisir où ils s'installent. Pharmaciens et infirmiers auraient le droit de faire plus de soins réservés aujourd'hui aux médecins, comme prescrire certains médicaments.",
                cases: {
                    text: "En France, un décret du 17 juin 2024 permet aux pharmaciens de ville de remettre un antibiotique sans ordonnance. Cela concerne une angine due à une bactérie, le streptocoque, confirmée par un test rapide. Les infirmiers en pratique avancée ont suivi une formation plus longue que les autres infirmiers. Un arrêté (texte officiel) du 18 juillet 2018 leur permet de prescrire certains produits et de renouveler des ordonnances.",
                    sources: [
                        s('autre', "2026-09-04", "Assurance maladie (ameli.fr), « Traitement de l'angine avec ou sans antibiotiques » (page du 4 septembre 2026 ; cite le décret n° 2024-550 du 17 juin 2024)", "https://www.ameli.fr/assure/sante/themes/angine/traitement"),
                        s('autre', "2026-09-25", "Assurance maladie (ameli.fr), « L'exercice des infirmiers en pratique avancée » (page du 25 septembre 2026 ; cite l'arrêté du 18 juillet 2018)", "https://www.ameli.fr/infirmier/exercice-liberal/vie-cabinet/installation-liberal/exercice-des-infirmiers-en-pratique-avancee"),
                    ],
                },
            },
        ],
        programme: {
            lo: split(['a', 'c'], [at(LO_ASSOC, 'dossier « déserts médicaux »')], 'faible : programme 2022, formulation prudente'),
            lfi: split(
                ['a', 'c'],
                [at(LFI_RURALITES, 'centres de santé publics'), at(NFP, "p.9, régulation de l'installation")],
                "faible : a vient du NFP 2024 (exception décidée par l'auteur du comparateur), à revérifier en novembre 2026",
            ),
            pcf: clear('a', [at(NFP, 'p.9')], 'faible : rien dans les textes PCF 2026, seulement le programme commun NFP 2024'),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 3 IV')]),
            ps: clear('a', [at(PS_SECURITES, '« Se faire soigner »')]),
            ren: clear('d', [ENSEMBLE_2024], NOTE_ENSEMBLE),
            modem: clear('d', [ENSEMBLE_2024, MODEM_SOLIDARITES], NOTE_ENSEMBLE),
            hor: clear('d', [ENSEMBLE_2024], NOTE_ENSEMBLE),
            lr: NC,
            udr: NC,
            rn: clear('b', [at(RN_LIVRET_SANTE, 'p.14-17'), RN_LCP_2024]),
            rec: clear('c', [REC_PUBLICSENAT_2022], NOTE_2022),
        },
        votes: { scrutins: [1214], mapping: { pour: 'a', contre: null, abstention: null } },
    },
    {
        id: 'sante-franchises',
        tier: 'core',
        theme: 'Remboursements et franchises',
        situation: 'Pour chaque boîte de médicaments, 1 € reste à la charge du patient (franchise). Pour réduire le déficit de la Sécurité sociale, il est proposé de doubler ce montant. Que faire ?',
        context: {
            text: "La franchise est plafonnée à 70 € par an et par personne. Les mineurs, les femmes enceintes à partir du 6e mois et les bénéficiaires de la complémentaire santé solidaire (C2S) n'en paient pas.",
            sources: [s('autre', '2026-09-29', 'Ameli, « Franchise médicale » (page mise à jour le 29 septembre 2026)', 'https://www.ameli.fr/assure/remboursements/reste-charge/franchise-medicale')],
        },
        options: [
            {
                id: 'a',
                label: 'Supprimer les franchises et rembourser à 100 % les soins courants (médecin, médicaments, dentiste, lunettes).',
                explain: "Le patient ne paierait plus de franchise, comme l'euro par boîte. La Sécurité sociale rembourserait en entier ses soins courants, ce qui augmenterait ses dépenses.",
            },
            {
                id: 'b',
                label: 'Garder la règle actuelle (1 € par boîte) et économiser ailleurs sur les dépenses de santé.',
                explain: "Le patient continuerait à payer 1 € par boîte, comme aujourd'hui. Pour réduire le déficit (l'argent qui manque) de la Sécurité sociale, d'autres dépenses de santé baisseraient.",
            },
            {
                id: 'c',
                label: 'Doubler la franchise, soit 2 € par boîte de médicaments.',
                explain: "Le patient paierait 2 € par boîte au lieu de 1 €. La Sécurité sociale rembourserait 1 € de moins par boîte, ce qui réduirait ses dépenses.",
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('a', [at(LFI_SYNTHESE, 'chap. 15'), at(NFP, 'p.9, reste à charge zéro')]),
            pcf: clear('a', [at(PCF_BASE, 'p.49'), PCF_ROUSSEL]),
            eco: clear('a', [at(ECO_PROGRAMME, 'p.111, chap. 29, mesure 4 : « Supprimer les franchises »')]),
            ps: clear('a', [at(PS_SECURITES, '« Se faire soigner »')], "faible : le mot « franchise » n'apparaît pas dans le Projet"),
            ren: NC,
            modem: NC,
            hor: NC,
            lr: NC,
            udr: NC,
            rn: NC,
            rec: NC,
        },
        votes: { scrutins: [3598], mapping: { pour: 'b', contre: 'c', abstention: null } },
    },
    {
        id: 'retraites-pensions',
        tier: 'core',
        theme: 'Retraites (montant)',
        situation: "Deux retraités de votre entourage touchent l'un 1 100 €, l'autre 2 800 € net par mois. Pour réduire le déficit, il est proposé de geler les pensions l'an prochain. Que faire ?",
        options: [
            {
                id: 'a',
                label: "Augmenter les pensions plus vite que les prix, et porter au SMIC la pension minimale d'une carrière complète.",
                explain: "Les deux retraités verraient leur pension monter plus vite que les prix. Une personne ayant travaillé toute la durée exigée toucherait au moins le SMIC (salaire minimum) en retraite.",
            },
            {
                id: 'b',
                label: 'Garder la règle actuelle : augmenter toutes les pensions au même rythme que les prix.',
                explain: "Les deux retraités verraient leur pension monter chaque année du même pourcentage que les prix. Il n'y aurait pas de gel.",
            },
            {
                id: 'c',
                label: 'Augmenter les petites pensions au rythme des prix, et geler ou limiter la hausse des plus élevées.',
                explain: "Sous un montant fixé par la loi, les pensions monteraient comme les prix. Au-dessus, la hausse serait plus faible, ou nulle (gel).",
            },
            {
                id: 'd',
                label: 'Geler toutes les pensions pendant un an.',
                explain: "Geler veut dire ne pas augmenter. Les deux retraités toucheraient le même montant qu'avant pendant un an, même si les prix montent.",
            },
        ],
        programme: {
            lo: clear('a', [at(LO_BROCHURE, 'p.5, 9')]),
            lfi: clear('a', [at(NFP, 'p.4, 16'), at(LFI_SYNTHESE, 'chap. 8')]),
            pcf: clear('a', [at(PCF_BASE, 'p.49'), PCF_ROUSSEL], 'faible : pas de montant'),
            eco: clear('c', [at(ECO_PLATEFORME, 'chap. 2 I')], 'faible : texte en consultation (2025-12), « différenciée » ambigu'),
            ps: NC,
            ren: clear('c', [FRANCEINFO_ZERO_DEFICIT]),
            modem: clear('c', [MODEM_SOLIDARITES, at(MODEM_BUDGET, 'abattement forfaitaire')], 'faible : position déduite des textes'),
            hor: NC,
            lr: NC,
            udr: clear('b', [JDD_CIOTTI]),
            rn: clear('b', [RN_CONTRE_BUDGET, at(RN_22_MESURES, 'n°9')]),
            rec: AMB,
        },
        votes: { scrutins: [3685], mapping: { pour: 'b', contre: 'd', abstention: null } },
    },
    {
        id: 'dette-economies',
        tier: 'core',
        theme: 'Dette : où économiser',
        situation: "Pour réduire son déficit, l'État cherche environ 40 milliards d'euros par an, en économies ou en recettes, soit près de 600 € par habitant. Par quoi commencer ?",
        options: [
            {
                id: 'a',
                label: 'Augmenter les impôts des plus hauts revenus et patrimoines, et réduire les aides aux grandes entreprises.',
                explain: "Les personnes qui gagnent ou possèdent le plus (argent, logements, entreprises) paieraient plus d'impôts. Les grandes entreprises recevraient moins d'aides de l'État, comme des baisses d'impôts.",
                cases: {
                    text: "En France, la contribution différentielle sur les hauts revenus vise un impôt minimum de 20 % des revenus. Elle concerne les personnes seules dont le revenu fiscal de référence dépasse 250 000 €, et les couples au-delà de 500 000 €. Le revenu fiscal de référence est le revenu retenu par les impôts, indiqué sur l'avis d'impôt. Cette contribution s'applique aux revenus de 2025 et de 2026. Elle ne touche ni le patrimoine, c'est-à-dire ce que l'on possède, ni les aides aux entreprises.",
                    sources: [
                        s('autre', "2026-04-15", "Service-Public.gouv.fr, « Qui doit payer la contribution exceptionnelle sur les hauts revenus ? » (section sur la contribution différentielle), vérifié le 15 avril 2026", "https://www.service-public.gouv.fr/particuliers/vosdroits/F31130"),
                    ],
                },
            },
            {
                id: 'b',
                label: "Réduire le nombre d'agents publics en ne remplaçant pas tous les départs, et fusionner des agences de l'État.",
                explain: "Les agents publics travaillent pour l'État, les communes ou les hôpitaux publics. Certains départs ne seraient pas remplacés, et des agences (organismes) de l'État seraient regroupées.",
                cases: {
                    text: "En France, de 2008 à 2012, la révision générale des politiques publiques, un programme de réforme, s'est appliquée aux ministères. Sur deux départs à la retraite, un seul y était remplacé. Selon la Cour des comptes, les ministères ont eu 144 000 équivalents temps plein de moins (deux mi-temps comptent pour un). La Cour a chiffré l'économie brute (avant de déduire d'autres coûts) à 840 millions d'euros par an en moyenne. En 2008, impôts et comptabilité publique ont fusionné dans la direction générale des finances publiques (DGFiP).",
                    sources: [
                        s('autre', "2015-09-09", "Cour des comptes, « La masse salariale de l'État : enjeux et leviers », rapport rendu public le 9 septembre 2015", "https://www.ccomptes.fr/sites/default/files/EzPublish/20150909-rapport-masse-salariale-Etat.pdf"),
                        s('autre', "2018-06-20", "Cour des comptes, « La DGFiP, dix ans après la fusion », 20 juin 2018", "https://www.ccomptes.fr/fr/publications/la-dgfip-dix-ans-apres-la-fusion"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Réduire les dépenses sociales : allocations, assurance chômage, retraites.',
                explain: "Les sommes versées aux retraités, aux chômeurs et aux personnes qui touchent des aides (logement, famille...) seraient réduites ou augmenteraient moins vite.",
                cases: {
                    text: "En France, une loi a modifié en cours d'année le budget 2014 de la Sécurité sociale (loi de financement rectificative). Son article 9 a gelé la hausse prévue en 2014 (la revalorisation) des retraites de base. La retraite de base est la première part de la retraite ; la retraite complémentaire s'y ajoute. Les retraités dont le total des pensions ne dépassait pas 1 200 € par mois n'étaient pas concernés. Seules les retraites étaient concernées par ce gel.",
                    sources: [
                        s('autre', "2014-08-06", "Conseil constitutionnel, décision n° 2014-698 DC du 6 août 2014 (loi de financement rectificative de la sécurité sociale pour 2014), art. 9", "https://www.conseil-constitutionnel.fr/decision/2014/2014698DC.htm"),
                    ],
                },
            },
            {
                id: 'd',
                label: "Réduire la contribution de la France au budget de l'Union européenne.",
                explain: "Chaque année, la France verse de l'argent au budget commun de l'Union européenne, qui aide par exemple les agriculteurs. Cette somme serait réduite.",
                cases: {
                    text: "Dans l'Union européenne, pour 2021-2027, des corrections forfaitaires (montants fixes) baissent ce que versent cinq pays au budget européen. Ces baisses annuelles sont exprimées en prix de 2020, sans compter la hausse des prix depuis. La réduction est de 3 671 millions d'euros pour l'Allemagne, 1 921 millions pour les Pays-Bas et 1 069 millions pour la Suède. Elle est de 565 millions pour l'Autriche et de 377 millions pour le Danemark. Les autres pays membres, dont la France, paient ces réductions.",
                    sources: [
                        s('autre', "2022-11-15", "Commission européenne, « Rebates » (budget de l'UE 2021-2027), page mise à jour le 15 novembre 2022 (en anglais)", "https://commission.europa.eu/strategy-and-policy/eu-budget/long-term-eu-budget/2021-2027/revenue/rebates_en"),
                    ],
                },
            },
            {
                id: 'e',
                label: "Réduire les dépenses liées à l'immigration, comme l'aide médicale de l'État (soins des personnes sans titre de séjour).",
                explain: "L'aide médicale de l'État paie les soins d'étrangers sans titre de séjour en France. Comme d'autres dépenses liées à l'immigration, elle serait réduite : moins de soins ou de personnes couverts.",
                cases: {
                    text: "En France, le budget de l'État pour 2020 (loi de finances) a réformé l'aide médicale de l'État pour les adultes. La réforme a ouvert ce droit après trois mois passés en France sans titre de séjour valide. Pour certains soins non urgents, elle a imposé d'attendre 9 mois après l'admission à cette aide. Ces soins comprennent par exemple une prothèse de hanche ou une opération de la cataracte, une maladie de l'œil. Le Gouvernement attendait 15 millions d'euros d'économies en 2020.",
                    sources: [
                        s('autre', "2020-11-19", "Sénat, rapport général n° 138 (2020-2021), tome III, annexe 28 « Santé », partie sur l'aide médicale de l'État, 19 novembre 2020", "https://www.senat.fr/rap/l20-138-328/l20-138-3286.html"),
                        s('autre', "2026-04-01", "Service-Public.gouv.fr, « Qu'est-ce que l'aide médicale de l'État (AME) ? », vérifié le 1er avril 2026", "https://www.service-public.gouv.fr/particuliers/vosdroits/F3079"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('a', [at(LO_BROCHURE, 'p.6-7')], 'faible : vise surtout les profits et les aides aux entreprises, pas les hauts revenus et patrimoines'),
            lfi: clear('a', [at(NFP, 'p.13'), at(LFI_SYNTHESE, 'chap. 6')]),
            pcf: clear('a', [at(PCF_BASE, 'p.42')]),
            eco: clear('a', [
                s('declaration', '2026-09-30', 'franceinfo, retraites : que proposent les candidats', 'https://www.franceinfo.fr/economie/retraite/reforme-des-retraites/changement-de-systeme-passage-a-60-ou-a-65-ans-capitalisation-que-proposent-les-principaux-candidats-a-l-election-presidentielle-pour-les-retraites_8215784.html'),
                s('declaration', '2026-07-13', 'Parlons Politique, programme de M. Tondelier', 'https://www.parlons-politique.fr/elections/ce-que-le-programme-ecologiste-de-marine-tondelier-changerait-pour-les-retraites-le-nucleaire-et-les-impots_23570/'),
            ]),
            ps: clear('a', [at(PS_VIVRE_LIBRES, 'ch.3'), at(PS_REFAIRE_SOCIETE, 'fiscalité')]),
            ren: split(['b', 'c'], [
                FRANCEINFO_ZERO_DEFICIT,
                s('declaration', '2026-09-24', 'Public Sénat, Attal, Le Pen et Mélenchon', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-attal-le-pen-et-melenchon-trois-manieres-de-parler-a-un-pays-exaspere'),
            ]),
            modem: split(['a', 'b'], [MODEM_BUDGET]),
            hor: split(['b', 'c'], [JDN_PHILIPPE, HOR_PROSPERE]),
            lr: split(['b', 'c'], [at(LR_TRAVAIL, 'fiches 04-05'), RETAILLEAU_AGRICULTURE], 'faible : le non-remplacement des agents (moitié de b) n\'est pas sourcé'),
            udr: split(['b', 'e'], [JDD_CIOTTI], "faible : le non-remplacement des départs (moitié de b) n'est pas sourcé"),
            rn: split(['b', 'd', 'e'], [RN_FRANCE24, RN_CONTRE_BUDGET], "faible : seule la baisse des subventions aux agences est sourcée pour b"),
            rec: split(['b', 'd', 'e'], [REC_PUBLICSENAT_2022, REC_TOUTSURMESFINANCES, REC_KNAFO_QDE], NOTE_REC_2022_LIVRE),
        },
    },
    {
        id: 'heritage-fortunes',
        tier: 'core',
        theme: 'Héritage et grandes fortunes',
        situation: 'Une famille de votre commune veut transmettre sa maison ou son entreprise à ses enfants. On débat aussi de taxer les très grandes fortunes. Que faire des impôts sur le patrimoine et l\'héritage ?',
        context: {
            text: "Aujourd'hui, chaque enfant peut recevoir jusqu'à 100 000 € de chacun de ses parents sans droits de succession. Au-delà, le taux monte par tranches, de 5 % jusqu'à 45 % pour la part qui dépasse 1,8 million d'euros.",
            sources: [s('autre', "2026-02-09", "Service-public.gouv.fr, fiche F14198 « Droits de succession : évaluation de la succession et calcul des droits »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F14198")],
        },
        options: [
            {
                id: 'a',
                label: "Taxer davantage les très grandes fortunes (2 % par an au-delà de 100 millions d'euros) et les gros héritages.",
                explain: "Les personnes les plus riches paieraient chaque année 2 % d'impôt sur leur fortune (tout ce qu'elles possèdent) au-delà de 100 millions d'euros. Les gros héritages seraient aussi plus taxés.",
            },
            {
                id: 'b',
                label: "Remplacer l'impôt sur les gros patrimoines immobiliers par un impôt sur les gros patrimoines financiers ou non investis.",
                explain: "L'impôt annuel des plus riches sur leurs maisons et immeubles serait supprimé. Un nouvel impôt viserait leur argent placé (épargne, actions) ou les biens qui ne financent aucune activité.",
            },
            {
                id: 'c',
                label: "Garder la règle actuelle : pas de nouvel impôt sur le patrimoine ni sur l'héritage.",
                explain: "Les impôts sur l'héritage et sur la fortune resteraient les mêmes. Un enfant pourrait toujours recevoir jusqu'à 100 000 € de chaque parent sans impôt.",
            },
            {
                id: 'd',
                label: "Baisser les droits de succession et relever les montants que l'on peut donner sans impôt.",
                explain: "Les droits de succession sont l'impôt payé sur un héritage. Ils baisseraient, et les parents pourraient transmettre à leurs enfants une plus grosse somme sans payer d'impôt.",
            },
            {
                id: 'e',
                label: "Exproprier les grands groupes et utiliser leurs profits, sans passer par un impôt sur le patrimoine.",
                explain: "Exproprier, c'est retirer un bien à son propriétaire. Les grands groupes (très grandes entreprises) appartiendraient à la collectivité, qui utiliserait leurs bénéfices, sans impôt sur les fortunes.",
            },
        ],
        programme: {
            lo: clear('e', [at(LO_BROCHURE, 'p.12'), LO_FETE]),
            lfi: clear('a', [at(NFP, 'p.13'), at(LFI_SYNTHESE, 'chap. 6')]),
            pcf: clear('a', [at(PCF_BASE, 'p.42'), at(NFP, 'p.13, héritage plus progressif')], 'faible : pas de taxe Zucman nommée, héritage seulement dans le NFP 2024'),
            eco: clear('a', [s('declaration', '2026-07-13', 'Parlons Politique, programme de M. Tondelier', 'https://www.parlons-politique.fr/elections/ce-que-le-programme-ecologiste-de-marine-tondelier-changerait-pour-les-retraites-le-nucleaire-et-les-impots_23570/')], 'faible : seule la moitié « fortunes » de a est sourcée'),
            ps: clear('a', [at(PS_REFAIRE_SOCIETE, 'fiscalité')]),
            ren: clear('c', [REN_NOUVELLE_DONNE], 'faible : rien du candidat, position déduite (bilan de l\'ISF, défense du pacte Dutreil)'),
            modem: clear('b', [MODEM_BUDGET]),
            hor: clear('d', [s('declaration', '2026-08-27', 'LCP, héritages : ce que proposent les candidats', 'https://lcp.fr/actualites/heritages-et-droits-de-succession-que-proposent-les-candidats-a-l-election')], 'faible : seule la moitié « donations » de d est sourcée'),
            lr: clear('d', [s('declaration', '2026-08-26', 'LR, « Je serai le président qui baissera les impôts de succession »', 'https://republicains.fr/actualites/2026/08/26/je-serai-le-president-qui-baissera-les-impots-de-succession/')]),
            udr: clear('d', [NICE_PREMIUM]),
            rn: split(['b', 'd'], [RN_CONTRE_BUDGET, RN_LCP_2024, RN_BARDELLA_FETE]),
            rec: clear('d', [REC_TOUTSURMESFINANCES, REC_KNAFO_QDE], NOTE_REC_2022_LIVRE),
        },
        votes: { scrutins: [3300], mapping: { pour: 'a', contre: null, abstention: null } },
    },
    {
        id: 'chomage-controles',
        tier: 'core',
        theme: 'Chômage et contrôles',
        situation: "Une personne de votre entourage est au chômage depuis 18 mois. On lui propose un emploi moins payé que l'ancien, à une heure de trajet, dans une entreprise qui peine à recruter. Que faire ?",
        context: {
            text: "Aujourd'hui, le contrat signé avec France Travail fixe le métier recherché, la zone géographique et le salaire attendu. Refuser deux « offres raisonnables d'emploi » sans motif légitime peut entraîner la radiation et la suppression des allocations.",
            sources: [s('autre', "2026-08-17", "Service-public.gouv.fr, fiche F14926 « Contrat d'engagement du demandeur d'emploi inscrit à France Travail »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F14926")],
        },
        options: [
            {
                id: 'a',
                label: 'Sanctionner moins les refus d\'offre, et garantir un emploi ou une formation payée aux chômeurs de longue durée.',
                explain: "Refuser une offre ferait perdre moins d'allocations (l'argent versé pendant le chômage). Une personne au chômage depuis plus d'un an aurait droit à un emploi ou une formation payée.",
                cases: {
                    text: "En Allemagne, à son lancement en 2023, l'aide mensuelle « Bürgergeld » limitait ses baisses en cas d'obligation non respectée. La baisse était de 10 % pendant un mois, puis 20 % pendant deux mois, et 30 % pendant trois mois au plus. Le Bürgergeld a aussi rendu permanent le programme d'emplois aidés, financés par de l'argent public. Il a également créé un versement de 150 € par mois pendant une formation menant à un diplôme. Depuis le 1er juillet 2026, cette aide est devenue le « Grundsicherungsgeld », avec des règles modifiées.",
                    sources: [
                        s('autre', "2022-12-20", "BMAS (ministère fédéral du Travail, Allemagne), « Das ändert sich im neuen Jahr », communiqué du 20 décembre 2022 (en allemand)", "https://www.bmas.de/DE/Service/Presse/Pressemitteilungen/2022/das-aendert-sich-2023.html"),
                        s('autre', "2026-07-01", "BMAS, « Umgestaltung der Grundsicherung: Änderungen treten in Kraft », communiqué du 1er juillet 2026 (en allemand)", "https://www.bmas.de/DE/Service/Presse/Pressemitteilungen/2026/umgestaltung-der-grundsicherung-tritt-in-kraft.html"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Garder les règles actuelles, et vérifier davantage les dossiers : fraudes, erreurs et droits non réclamés.',
                explain: "Comme aujourd'hui, refuser deux offres raisonnables sans motif valable pourrait couper les allocations chômage. Les dossiers seraient plus contrôlés : fraudes, erreurs, aides dues mais non demandées.",
                cases: {
                    text: "En France, une loi contre la fraude date du 25 juin 2026. Elle permet à France Travail de bloquer des allocations chômage jusqu'à 3 mois, en cas d'indices sérieux de fraude. Elle lui permet aussi de vérifier à qui appartient le compte bancaire où l'argent est versé. En juillet 2026, un décret, texte pris par le gouvernement, était encore attendu. Ces mesures ne visent ni les erreurs ni le non-recours, c'est-à-dire les aides dues mais non demandées.",
                    sources: [
                        s('autre', "2026-07-03", "Service-Public.gouv.fr, « Les allocations chômage peuvent désormais être suspendues en cas de suspicion de fraude », 3 juillet 2026", "https://www.service-public.gouv.fr/particuliers/actualites/A18941"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Réduire la durée et le montant des allocations, et les supprimer après plusieurs refus d\'offres raisonnables.',
                explain: "Chaque mois, la personne recevrait moins d'argent de France Travail, et pendant moins longtemps. Refuser plusieurs offres jugées raisonnables lui ferait perdre ces versements.",
                cases: {
                    text: "En France, depuis février 2023, la durée de versement des allocations chômage est réduite de 25 %. Cette baisse s'applique si le chômage est sous 9 % et n'a pas augmenté de 0,8 point sur un trimestre. Une autre règle vise les contrats terminés depuis avril 2025, pour les personnes de moins de 55 ans. Si leur ancien salaire brut (avant retenues) dépassait 4 857,81 € par mois, l'allocation baisse de 30 % dès le 7e mois.",
                    sources: [
                        s('autre', "2026-07-23", "Service-Public.gouv.fr, fiche F38881 « Allocation chômage d'aide au retour à l'emploi (ARE) d'un salarié du secteur privé dont la fin de contrat de travail intervient à compter du 1er avril 2025 », vérifiée le 23 juillet 2026", "https://www.service-public.gouv.fr/particuliers/vosdroits/F38881"),
                        s('autre', "2026-07-23", "Service-Public.gouv.fr, fiche F14860 « Allocation chômage d'aide au retour à l'emploi (ARE) d'un salarié du secteur privé dont la fin de contrat de travail intervient avant le 1er avril 2025 », vérifiée le 23 juillet 2026", "https://www.service-public.gouv.fr/particuliers/vosdroits/F14860"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Partager le travail entre tous : réduire le temps de travail sans baisse de salaire.',
                explain: "Les salariés travailleraient moins d'heures par semaine (la base légale est aujourd'hui de 35 heures), pour le même salaire. L'idée : confier les heures libérées à des chômeurs.",
                cases: {
                    text: "En France, deux lois datent du 13 juin 1998 et du 19 janvier 2000. Elles fixent la durée légale à 35 heures par semaine : au-delà, ce sont des heures supplémentaires. Cette durée s'applique depuis 2000 dans les entreprises de plus de 20 salariés, et depuis 2002 dans les autres. Selon la Dares, service statistique du ministère du Travail, le salaire mensuel de base a en général été maintenu. Selon elle, cela s'est souvent fait avec une modération salariale, c'est-à-dire des hausses de salaire plus lentes.",
                    sources: [
                        s('autre', "2014-12-09", "Assemblée nationale, rapport n° 2436 de la commission d'enquête sur l'impact de la réduction progressive du temps de travail, enregistré le 9 décembre 2014", "https://www.assemblee-nationale.fr/14/pdf/rap-enq/r2436.pdf"),
                    ],
                },
            },
        ],
        programme: {
            lo: split(['a', 'd'], [
                s('declaration', '2026-03-18', 'LO, « Allocataires du RSA : sanctions inadmissibles »', 'https://www.lutte-ouvriere.org/portail/journal/allocataires-rsa-sanctions-inadmissibles-192879.html'),
                at(LO_BROCHURE, 'p.9-10'),
            ]),
            lfi: clear('a', [at(LFI_SYNTHESE, 'chap. 8'), at(NFP, 'p.4, 9')]),
            pcf: split(['a', 'd'], [at(PCF_BASE, 'p.43')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 1 III et chap. 2 I')]),
            ps: clear('a', [at(PS_VIVRE_LIBRES, 'ch.1'), at(PS_REFAIRE_SOCIETE, 'pauvreté')]),
            ren: clear('c', [FRANCEINFO_ZERO_DEFICIT], 'faible : contenu non détaillé, direction déduite du plan d\'économies'),
            modem: AMB,
            hor: clear('c', [JDN_PHILIPPE], 'faible : partiel, seule la durée des allocations est sourcée'),
            lr: clear('c', [at(LR_TRAVAIL, 'fiche 05')]),
            udr: NC,
            rn: clear(
                'b',
                [s('plateforme-2024', '2024-06-26', 'La Finance pour tous, législatives 2024', 'https://www.lafinancepourtous.com/2024/06/26/elections-legislatives-2024-propositions-economiques-des-principaux-partis-ou-coalitions/'), at(RN_CONTRE_BUDGET, 'plan anti-fraude de 3,5 Md€')],
                'faible : « garder les règles » est approximatif (abrogation de la réforme de 2024), le non-recours n\'est pas sourcé',
            ),
            rec: clear('c', [REC_KNAFO_IRDEME, REC_TOUTSURMESFINANCES], 'faible : livre d\'une dirigeante'),
        },
        votes: { scrutins: [6319], mapping: { pour: null, contre: 'a', abstention: null } },
    },
    {
        id: 'ecole-priorite',
        tier: 'core',
        theme: 'École',
        situation: 'Dans l\'école et le collège publics de votre commune, les classes sont chargées, des absences ne sont pas remplacées et le niveau baisse. Que faire en priorité ?',
        options: [
            {
                id: 'a',
                label: 'Recruter des enseignants pour limiter les classes à environ 20 élèves.',
                explain: "L'État embaucherait plus de professeurs. L'école et le collège de la commune pourraient ouvrir plus de classes, avec environ 20 élèves dans chacune.",
            },
            {
                id: 'b',
                label: 'Augmenter nettement le salaire des enseignants.',
                explain: "L'État, qui verse le salaire des enseignants, l'augmenterait fortement. La hausse concernerait ceux qui enseignent déjà comme ceux qui seraient recrutés ensuite.",
            },
            {
                id: 'c',
                label: 'Donner aux directeurs d\'école et aux principaux de collège le pouvoir de choisir leurs enseignants et leurs horaires.',
                explain: "Aujourd'hui, l'Éducation nationale décide en général dans quelle école va chaque enseignant. Le directeur d'école ou le principal (chef du collège) choisirait lui-même son équipe et les horaires.",
            },
            {
                id: 'd',
                label: 'Généraliser les groupes de niveau, créer un examen d\'entrée en sixième, développer l\'uniforme et durcir les sanctions.',
                explain: "Les élèves seraient répartis en groupes selon leurs résultats, passeraient un examen pour entrer au collège, porteraient plus souvent une tenue commune et seraient punis plus sévèrement.",
            },
            {
                id: 'e',
                label: 'Supprimer le financement public des écoles privées sous contrat et le transférer à l\'école publique.',
                explain: "Aujourd'hui, l'argent public paie notamment les enseignants des écoles privées « sous contrat », qui suivent les programmes nationaux. Cet argent irait aux écoles publiques ; ces écoles privées devraient se financer seules.",
            },
        ],
        programme: {
            lo: split(['a', 'e'], [
                at(LO_BROCHURE, 'p.6, 10'),
                s('programme-2022', '2022-03-22', 'LO, « L\'argent public pour l\'enseignement public, pas pour le privé »', 'https://www.lutte-ouvriere.org/en-regions/normandie/breves/largent-public-pour-lenseignement-public-pas-pour-le-prive-242402.html'),
            ], 'faible : pas de chiffre d\'élèves, et e date de 2022'),
            lfi: clear('a', [at(NFP, 'p.5, 9-10')], NOTE_NFP),
            pcf: split(['a', 'e'], [at(PCF_BASE, 'p.50')]),
            eco: split(['a', 'b'], [
                ECO_PLATEFORME,
                s('declaration', '2026-04-17', 'M. Tondelier, lettre « 21 priorités » (publication sur X)', 'https://x.com/marinetondelier/status/2045125213474430977'),
                s('declaration', '2026-04-17', 'La Gazette de France, M. Tondelier propose un socle programmatique', 'https://www.lagazettefrance.fr/article/presidentielle-tondelier-propose-un-socle-programmatique-aux-autres-partis-de-gauche'),
            ]),
            ps: split(['a', 'b'], [at(PS_EPANOUIR, 'ch.11')]),
            ren: split(['b', 'd'], [
                s('declaration', '2026-08-25', 'Public Sénat, éducation : Philippe et Attal', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2027-philippe-et-attal-font-de-lecole-un-nouveau-terrain-de-bataille-au-risque-dereinter-le-bilan-macron'),
                PUBLICSENAT_MEETING,
            ]),
            modem: split(['a', 'b'], [at(MODEM_LIVRET, 'section 3')], 'faible : programme 2024, avec 24 élèves par classe au lieu d\'environ 20'),
            hor: split(['b', 'c'], [HOR_ENFANTS]),
            lr: clear('d', [LR_ECOLE]),
            udr: NC,
            rn: clear('d', [RN_BARDELLA_FETE, RN_LCP_2024]),
            rec: clear('d', [REC_PUBLICSENAT_2022, REC_KNAFO_IRDEME], 'faible : programme 2022 et livre d\'une dirigeante, d est soutenue en partie'),
        },
    },
    {
        id: 'logement-loyers',
        tier: 'core',
        theme: 'Logement',
        situation: 'Dans votre commune, les loyers ont augmenté de 15 % en trois ans, peu de logements se construisent et il faut cinq ans pour obtenir un logement social. Que faire d\'abord ?',
        context: {
            text: "Aujourd'hui, les loyers sont encadrés, à titre expérimental, dans certaines villes comme Paris, Lyon ou Bordeaux.",
            sources: [s('autre', "2026-08-01", "Service-public.gouv.fr, fiche F1314 « Encadrement des loyers en zone tendue »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1314")],
        },
        options: [
            {
                id: 'a',
                label: 'Encadrer les loyers et construire beaucoup plus de logements sociaux et publics.',
                explain: "Les loyers ne pourraient plus dépasser un plafond fixé par les pouvoirs publics selon le quartier et le logement. L'argent public financerait beaucoup plus de logements à loyer modéré.",
            },
            {
                id: 'b',
                label: 'Construire plus vite en simplifiant les règles (permis, normes), sans encadrer les loyers.',
                explain: "Obtenir un permis de construire (l'autorisation officielle de bâtir) serait plus rapide, et les règles techniques des bâtiments moins nombreuses. Les loyers ne seraient pas plafonnés.",
            },
            {
                id: 'c',
                label: 'Attribuer les logements sociaux en priorité aux ménages qui ont un emploi.',
                explain: "Les logements sociaux sont des logements à loyer modéré. Pour en obtenir un, les ménages (personne seule ou personnes vivant ensemble) qui travaillent passeraient avant ceux sans emploi.",
            },
            {
                id: 'd',
                label: 'Réserver en priorité les logements sociaux aux ménages de nationalité française.',
                explain: "Les logements sociaux sont des logements à loyer modéré. Pour en obtenir un, les ménages (personne seule ou personnes vivant ensemble) de nationalité française passeraient avant les ménages étrangers.",
            },
            {
                id: 'e',
                label: 'Retirer leurs logements vides aux grands propriétaires et confier le logement à un service public.',
                explain: "Les logements vides des grands propriétaires (particuliers ou sociétés qui en possèdent beaucoup) leur seraient retirés. Un service public serait chargé de les attribuer et de loger les habitants.",
            },
        ],
        programme: {
            lo: clear('e', [s('programme-2022', '2022-02-21', 'LO, « Logement : un droit fondamental à conquérir »', 'https://lutte-ouvriere.org/portail/qui-sommes-nous/qui-sommes-nous-nos-idees-et-positions-politiques-logement-un-droit-fondamental-conquerir')], NOTE_2022),
            lfi: clear('a', [at(NFP, 'p.4, 16'), LFI_BTP]),
            pcf: clear('a', [at(PCF_BASE, 'p.48')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 1 II')]),
            ps: clear('a', [at(PS_VIVRE_LIBRES, 'ch.2 « Se loger »')]),
            ren: clear('c', [REN_NOUVELLE_DONNE], 'faible : la source vise les métiers en tension, plus étroits que c'),
            modem: clear('b', [at(MODEM_LIVRET, 'section 2 C')]),
            hor: NC,
            lr: split(['b', 'c'], [RETAILLEAU_LOGEMENT]),
            udr: clear('d', [JDD_CIOTTI, at(UDR_PPLC, 'le texte ne cite pas le logement')], 'faible : principe général de priorité nationale, logement non nommé'),
            rn: clear('d', [RN_BARDELLA_FETE]),
            rec: split(['c', 'd'], [REC_TOUTSURMESFINANCES, REC_PUBLICSENAT_2022], NOTE_2022),
        },
        votes: { scrutins: [4745], mapping: { pour: 'a', contre: null, abstention: null } },
    },
    {
        id: 'securite-trafic',
        tier: 'core',
        theme: 'Délinquance et police',
        situation: "Un point de vente de drogue s'installe dans un quartier de votre commune. Des habitants se plaignent d'allées et venues et d'insécurité. Que faire en priorité ?",
        options: [
            {
                id: 'a',
                label: 'Rétablir une police ou une gendarmerie de proximité, et financer la prévention et la médiation.',
                explain: "Des policiers ou gendarmes travailleraient chaque jour dans le même quartier, au contact des habitants. L'argent public paierait des éducateurs et des médiateurs, chargés d'apaiser les conflits.",
            },
            {
                id: 'b',
                label: 'Créer une police municipale dans chaque commune de plus de 10 000 habitants et donner plus de pouvoirs aux maires.',
                explain: "Une police municipale est dirigée par le maire, pas par l'État. Chaque commune de plus de 10 000 habitants devrait en avoir une, et les maires auraient plus de pouvoirs.",
            },
            {
                id: 'c',
                label: 'Démanteler les réseaux : opérations répétées de police ou de gendarmerie, saisie des biens, enquêtes renforcées.',
                explain: "Policiers et gendarmes interviendraient souvent sur le point de vente et enquêteraient jusqu'aux chefs du trafic. L'argent, les voitures ou les logements des trafiquants seraient pris par la justice.",
            },
            {
                id: 'd',
                label: 'Créer une présomption de légitime défense pour les policiers et les gendarmes, et alourdir les peines des trafiquants.',
                explain: "Si un policier ou un gendarme utilise son arme, on supposerait qu'il se défendait de façon autorisée, sauf preuve contraire. Les trafiquants condamnés auraient des peines plus lourdes.",
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('a', [at(NFP, 'p.5, 17, 25')], NOTE_NFP),
            pcf: clear('a', [at(PCF_BASE, 'p.36, 49')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 2 III')]),
            ps: clear('a', [at(PS_SECURITES, '« Restaurer la confiance »')]),
            ren: split(['b', 'c'], [REN_REGALIEN]),
            modem: clear('c', [MODEM_SOLIDARITES]),
            hor: split(['b', 'c'], [HOR_SURE, HOR_NARCO]),
            lr: clear('c', [PLANET_RETAILLEAU], 'faible : le thème sécurité n\'est pas encore publié sur le site du projet'),
            udr: clear('d', [UDR_JOURNEE], 'faible : textes du groupe UDR (peines planchers), pas un programme'),
            rn: clear('d', [at(RN_22_MESURES, 'n°3'), RN_LCP_2024]),
            rec: clear('d', [REC_PUBLICSENAT_2022, REC_KNAFO_IRDEME], 'faible : programme 2022, et peines planchers tirées du livre d\'une dirigeante'),
        },
        votes: { scrutins: [1473], mapping: { pour: 'c', contre: 'a', abstention: null } },
    },
    {
        id: 'justice-peines',
        tier: 'core',
        theme: 'Justice et peines',
        situation: 'Un homme de 25 ans est condamné à six mois de prison ferme pour un cambriolage chez une personne de votre entourage. Que faire en priorité ?',
        context: {
            text: "Aujourd'hui, une peine de prison ferme d'un an ou moins doit en principe être aménagée (semi-liberté, placement à l'extérieur ou bracelet électronique). Le tribunal peut l'écarter, en motivant sa décision.",
            sources: [s('autre', "2026-09-11", "Service-public.gouv.fr, fiche F35705 « Peine de prison ferme »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F35705")],
        },
        options: [
            {
                id: 'a',
                label: "Pour les délits les moins graves, développer davantage les peines hors prison (travail d'intérêt général, bracelet électronique).",
                explain: "Pour les délits les moins graves, plus de peines se feraient hors de prison : travail non payé, par exemple pour une mairie, ou bracelet électronique à la maison.",
            },
            {
                id: 'b',
                label: 'Faire exécuter en prison les peines de prison ferme, même courtes, au lieu de les remplacer par défaut.',
                explain: "L'homme condamné à six mois ferait sa peine en prison. Aujourd'hui, une peine d'un an ou moins est en principe faite autrement, par exemple avec un bracelet électronique.",
            },
            {
                id: 'c',
                label: 'Punir plus sévèrement : peines minimales obligatoires, et perpétuité sans libération possible pour les crimes les plus graves.',
                explain: "Le juge ne pourrait plus donner une peine en dessous d'un minimum fixé par la loi. Pour les crimes les plus graves, le condamné resterait en prison toute sa vie.",
            },
        ],
        programme: {
            lo: clear('a', [s('declaration', '2024-10-03', 'LO, « Ouvrez des écoles, fermez des prisons ! » (brève locale)', 'https://lutte-ouvriere.org/portail/breves/nimes-gard-ouvrez-ecoles-fermez-prisons-178542.html')], 'faible : brève locale, aucune proposition détaillée'),
            lfi: clear('a', [at(NFP, 'p.17')], 'faible : peines hors prison non nommées explicitement pour les majeurs'),
            pcf: clear('a', [at(PCF_BASE, 'p.36')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 2 III')]),
            ps: clear('a', [at(PS_SECURITES, 'justice')]),
            ren: split(['b', 'c'], [at(JDD_ATTAL, 'suppression du juge de l\'application des peines'), at(REN_REGALIEN, 'seuils minimaux de peine')], 'faible : c à moitié, la perpétuité sans libération possible n\'est pas reprise'),
            modem: AMB,
            hor: split(['b', 'c'], [HOR_SURE]),
            lr: split(['b', 'c'], [PLANET_RETAILLEAU, PUBLICSENAT_RETAILLEAU]),
            udr: clear('c', [NICE_PREMIUM, UDR_JOURNEE], 'faible : c à moitié, la perpétuité n\'est pas sourcée'),
            rn: split(['b', 'c'], [at(RN_22_MESURES, 'n°3')], NOTE_2022),
            rec: split(['b', 'c'], [REC_KNAFO_IRDEME], 'faible : livre d\'une dirigeante, perpétuité réelle non retrouvée dans une source lue'),
        },
        votes: { scrutins: [1243], mapping: { pour: 'b', contre: 'a', abstention: null } },
    },
    {
        id: 'immigration-sejour',
        tier: 'core',
        theme: 'Immigration : entrées, séjour, éloignement',
        situation: "Une personne étrangère vit dans votre région depuis cinq ans sans titre de séjour. Elle travaille, mais a reçu l'ordre de quitter la France. Que faire ?",
        context: {
            text: "Aujourd'hui, le préfet peut régulariser au cas par cas un étranger qui travaille. Il peut exiger au moins 7 ans de vie en France.",
            sources: [s('autre', "2025-06-03", "Service-public.gouv.fr, fiche F16053 « Régularisation d'un étranger par le travail »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F16053")],
        },
        options: [
            {
                id: 'a',
                label: "La régulariser, et faciliter l'accès aux visas et aux titres de séjour.",
                explain: "Elle recevrait un titre de séjour, la carte qui permet de vivre et de travailler légalement en France. D'autres étrangers obtiendraient plus facilement un visa (autorisation d'entrer) ou ce titre.",
            },
            {
                id: 'b',
                label: "Donner un titre de séjour à toute personne qui a un contrat de travail d'au moins six mois.",
                explain: "Le préfet (représentant de l'État) ne déciderait plus au cas par cas. Un contrat de travail de six mois ou plus suffirait pour obtenir le titre de séjour.",
            },
            {
                id: 'c',
                label: "Ne la régulariser que si son métier entre dans des quotas annuels fixés par le Parlement.",
                explain: "Chaque année, le Parlement fixerait un nombre maximum de places par métier (quota). Elle n'aurait un titre de séjour que si son métier y figure et qu'il reste des places.",
            },
            {
                id: 'd',
                label: "La renvoyer dans son pays, sanctionner son employeur et durcir les règles d'entrée et de séjour.",
                explain: "Elle serait renvoyée dans son pays et son employeur serait puni, par exemple par une amende. Les règles pour venir et rester en France deviendraient plus strictes.",
            },
            {
                id: 'e',
                label: 'La renvoyer, et renvoyer aussi des étrangers en règle : condamnés, ou au chômage depuis plus d\'un an.',
                explain: "Elle serait renvoyée de France. Des étrangers avec un titre de séjour seraient aussi renvoyés s'ils ont été condamnés par la justice ou sont sans emploi depuis plus d'un an.",
            },
        ],
        programme: {
            lo: clear('a', [at(LO_BROCHURE, 'p.13-14')]),
            lfi: clear('a', [at(NFP, 'p.24')], NOTE_NFP),
            pcf: clear('a', [at(PCF_BASE, 'p.39')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 4 II')]),
            ps: clear('b', [at(PS_REFAIRE_SOCIETE, 'immigration')]),
            ren: clear('c', [PUBLICSENAT_MEETING, JDD_ATTAL], 'faible : les quotas visent les entrées, la régularisation n\'est pas sourcée'),
            modem: AMB,
            hor: split(['c', 'd'], [HOR_ANNONCES, HOR_SURE], 'faible : régularisation non trouvée, sanction de l\'employeur non sourcée'),
            lr: split(['c', 'd'], [RETAILLEAU_QUOTAS], "régularisation et sanction de l'employeur non sourcées"),
            udr: clear('d', [FRANCEINFO_PACTE, NICE_PREMIUM]),
            rn: split(['d', 'e'], [at(RN_LIVRET_IMMIGRATION, 'p.12-16'), RN_BARDELLA_FETE, RN_CONTRE_BUDGET, RN_LCP_2024]),
            rec: clear('e', [s('declaration', '2026-09-18', 'L\'Avenir, É. Zemmour sur BFMTV', 'https://www.lavenir.net/actu/monde/2026/09/18/zemmour-confirme-quil-sera-candidat-a-lelection-presidentielle-en-france-et-durcit-encore-son-discours-sur-limmigration-5OFMOVM6CVCDFHY4B3GI5QID3Q/')]),
        },
        votes: { scrutins: [7405], mapping: { pour: null, contre: 'a', abstention: null } },
        europeanVotes: [
            {
                party: 'rec',
                summary: "Au Parlement européen, sa seule eurodéputée, Sarah Knafo, a voté pour le règlement Retour (17/06/2026), la liste de pays d'origine sûrs et la notion de pays tiers sûr (10/02/2026).",
                votes: [
                    {
                        title: 'Règlement Retour des ressortissants de pays tiers en séjour irrégulier, accord provisoire (418-218-30)',
                        date: '2026-06-17',
                        url: 'https://howtheyvote.eu/votes/194134',
                    },
                    {
                        title: "Liste de pays d'origine sûrs au niveau de l'Union, accord provisoire (408-184-60)",
                        date: '2026-02-10',
                        url: 'https://howtheyvote.eu/votes/184172',
                    },
                    {
                        title: 'Notion de pays tiers sûr, accord provisoire (396-226-30)',
                        date: '2026-02-10',
                        url: 'https://howtheyvote.eu/votes/184168',
                    },
                ],
            },
        ],
    },
    {
        id: 'etrangers-droits-sociaux',
        tier: 'core',
        theme: 'Droits sociaux des étrangers',
        situation: 'Une personne étrangère vit en France avec un titre de séjour et travaille depuis deux ans. Doit-elle avoir droit aux mêmes aides (allocations familiales, aide au logement) qu\'un Français ?',
        context: {
            text: "En 2024, le Conseil constitutionnel a jugé contraire à la Constitution une condition de cinq ans de résidence pour certaines aides sociales.",
            sources: [s('autre', '2024-04-11', 'Conseil constitutionnel, décision n° 2024-6 RIP', 'https://www.conseil-constitutionnel.fr/decision/2024/20246RIP.htm')],
        },
        options: [
            {
                id: 'a',
                label: 'Oui, les mêmes aides, dès qu\'elle est en règle.',
                explain: "Avec un titre de séjour valide, elle recevrait les mêmes aides qu'un Français dans sa situation, comme les allocations familiales (argent versé pour les enfants) ou l'aide au logement.",
                cases: {
                    text: "En France, les prestations familiales, des aides pour les enfants, sont ouvertes aux étrangers en séjour régulier. Il faut vivre en France et avoir un enfant à charge. L'aide personnalisée au logement (APL) est ouverte aux étrangers qui ont un titre de séjour valide. Depuis juillet 2026, certains étudiants non européens n'y ont plus droit. Le RSA, un revenu minimum, exige de certains étrangers cinq ans de titre de séjour autorisant à travailler.",
                    sources: [
                        s('autre', "2025-09-17", "Service-public.fr, « Un étranger peut-il percevoir des prestations familiales en France ? » (vérifié le 17 septembre 2025)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2787"),
                        s('autre', "2026-07-01", "Service-public.fr, « Aide personnalisée au logement (APL) » (vérifié le 1er juillet 2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F12006"),
                        s('autre', "2026-04-01", "Service-public.fr, « RSA : demandeur de 25 ans et plus » (vérifié le 1er avril 2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F19778"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Seulement après plusieurs années de résidence ou de travail (par exemple cinq ans), en modifiant la Constitution.',
                explain: "Elle devrait avoir vécu ou travaillé plusieurs années en France, par exemple cinq ans, avant d'y avoir droit. La Constitution (règles de base du pays) serait changée pour le permettre.",
                cases: {
                    text: "En France, le revenu de solidarité active (RSA), un revenu minimum, pose une condition aux étrangers non européens. Le droit actuel leur demande un titre de séjour autorisant à travailler, détenu depuis au moins cinq ans. Les titulaires d'une carte de résident (titre de séjour de longue durée), les réfugiés et les Algériens en sont dispensés. Les apatrides (personnes sans nationalité) et les bénéficiaires de la protection subsidiaire (menacés dans leur pays) en sont aussi dispensés.",
                    sources: [
                        s('autre', "2026-04-01", "Service-public.fr, « RSA : demandeur de 25 ans et plus » (vérifié le 1er avril 2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F19778"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Réserver en priorité les aides sociales aux Français, en modifiant la Constitution.',
                explain: "Pour les aides comme les allocations familiales ou l'aide au logement, les Français passeraient avant elle. La Constitution (texte des règles de base du pays) serait changée pour le permettre.",
                cases: {
                    text: "En Suisse, les prestations complémentaires sont des aides versées en plus de l'assurance-vieillesse et survivants (AVS) et de l'assurance-invalidité (AI). Les Suisses et les Européens y ont accès sans condition de durée de résidence. Ces Européens sont ceux de l'Union européenne (UE) et de l'Association européenne de libre-échange (AELE). Les autres étrangers doivent avoir vécu en Suisse dix ans de suite, cinq ans pour réfugiés et apatrides (sans nationalité). Cet exemple porte uniquement sur cette aide.",
                    sources: [
                        s('autre', "2025-01-01", "Centrale de compensation AVS/AI (ahv-iv.ch), mémento 5.01 « Prestations complémentaires à l'AVS et à l'AI » (état au 1er janvier 2025)", "https://www.ahv-iv.ch/p/5.01.f"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('a', [
                s('declaration', '2024-03-23', 'LO, « Travailleurs français, immigrés, ne nous laissons pas diviser ! »', 'https://lutte-ouvriere.org/portail/qui-sommes-nous/travailleurs-francais-immigres-laissons-diviser-164193'),
                LO_DISCOURS,
            ]),
            lfi: clear('a', [at(NFP, 'p.15, 24')], 'faible : services publics « sans condition de nationalité », pas les prestations au sens strict'),
            pcf: clear('a', [at(PCF_BASE, 'p.39'), at(NFP, 'p.24')], 'faible : égalité des droits en termes généraux, détail dans le NFP 2024'),
            eco: AMB,
            ps: AMB,
            ren: NC,
            modem: NC,
            hor: NC,
            lr: clear('b', [RETAILLEAU_PRESTATIONS]),
            udr: split(['b', 'c'], [JDD_CIOTTI, UDR_PPLC]),
            rn: clear('c', [RN_BARDELLA_FETE, UDR_PPLC]),
            rec: clear('c', [REC_PUBLICSENAT_2022, REC_KNAFO_QDE], 'faible : programme 2022 et livre d\'une dirigeante, c est plus douce que la source'),
        },
    },
    {
        id: 'ecrans-reseaux',
        tier: 'core',
        theme: 'Écrans des moins de 15 ans',
        situation: 'Un enfant de 13 ans de votre entourage veut ouvrir un compte sur un réseau social, comme ses camarades. Que faire ?',
        options: [
            {
                id: 'a',
                label: "Interdire les réseaux sociaux avant 15 ans, avec une vérification obligatoire de l'âge.",
                explain: "L'enfant ne pourrait pas ouvrir de compte avant 15 ans. Les réseaux sociaux devraient contrôler l'âge de chaque personne qui s'inscrit.",
            },
            {
                id: 'b',
                label: 'Interdire avant 15 ans, et limiter aussi l\'usage des 15-18 ans, par exemple la nuit.',
                explain: "L'enfant ne pourrait pas ouvrir de compte avant 15 ans. Ensuite, jusqu'à 18 ans, il pourrait avoir un compte, mais avec des limites d'usage, comme des horaires.",
            },
            {
                id: 'c',
                label: 'Ne pas interdire, mais obliger les plateformes à changer ce qu\'elles montrent aux jeunes, et renforcer l\'éducation au numérique.',
                explain: "L'enfant pourrait ouvrir un compte. Les plateformes (sites et applis) devraient modifier les contenus proposés aux mineurs, et l'école enseignerait davantage l'usage d'Internet et des réseaux.",
            },
            {
                id: 'd',
                label: 'Interdire d\'abord le portable jusqu\'à la fin du lycée et les écrans à l\'école primaire.',
                explain: "En priorité, les élèves ne pourraient pas utiliser de portable jusqu'à la fin du lycée, et l'école primaire n'utiliserait pas d'écrans.",
            },
            {
                id: 'e',
                label: 'Laisser les parents décider, avec un contrôle parental activé par défaut sur les téléphones.',
                explain: "Ses parents choisiraient s'il peut ouvrir un compte. Les téléphones seraient vendus avec le contrôle parental (outil qui bloque ou limite certains contenus et applis) déjà allumé.",
            },
        ],
        programme: {
            lo: NC,
            lfi: clear('c', [at(NFP, 'p.23')], 'faible : NFP 2024, opposition à l\'interdiction relayée en 2026 et non relue'),
            pcf: NC,
            eco: AMB,
            ps: AMB,
            ren: clear('b', [REN_REGALIEN, s('declaration', '2026-08-15', 'franceinfo, tribune pour un référendum sur les réseaux sociaux', 'https://www.franceinfo.fr/internet/reseaux-sociaux/une-course-contre-la-montre-a-demarre-gabriel-attal-appelle-a-un-referendum-sur-l-interdiction-des-reseaux-aux-moins-de-15-ans_8149565.html')]),
            modem: clear('a', [
                ENSEMBLE_2024,
                MODEM_SOLIDARITES,
                s('declaration', '2026-06-28', 'Parlons Politique, discours de J.-N. Barrot', 'https://www.parlons-politique.fr/elections/presidentielle-2027-comment-jean-noel-barrot-veut-rendre-le-pouvoir-aux-francais-et-rouvrir-le-jeu-democratique_22284/'),
            ]),
            hor: clear('a', [ENSEMBLE_2024], 'faible : plateforme de coalition Ensemble 2024, rien en 2027'),
            lr: clear('d', [LR_ECOLE]),
            udr: NC,
            rn: clear('d', [RN_LCP_2024, RN_BARDELLA_FETE]),
            rec: NC,
        },
    },
    {
        id: 'voiture-pollution',
        tier: 'core',
        theme: 'Voiture et ZFE',
        situation: "Pour réduire la pollution de l'air, des villes veulent interdire les véhicules anciens les plus polluants. Certains habitants, artisans ou salariés n'ont pas les moyens d'en changer. Que faire en priorité ?",
        context: {
            text: "En mai 2026, le Conseil constitutionnel a censuré, pour une raison de procédure, la suppression des ZFE votée par le Parlement : les ZFE restent prévues par la loi.",
            sources: [s('autre', "2026-05-21", "Conseil constitutionnel, décision n° 2026-903 DC", "https://www.conseil-constitutionnel.fr/decision/2026/2026903DC.htm")],
        },
        options: [
            {
                id: 'a',
                label: 'Supprimer ces zones à faibles émissions (ZFE) et continuer à vendre des voitures neuves essence et diesel après 2035.',
                explain: "Les zones à faibles émissions (ZFE), où les véhicules anciens les plus polluants sont interdits, seraient supprimées. Après 2035, on pourrait encore acheter une voiture neuve à essence ou diesel.",
            },
            {
                id: 'b',
                label: 'Laisser chaque ville décider de ces zones, avec des aides pour changer de véhicule.',
                explain: "Chaque ville choisirait d'interdire ou non les véhicules anciens dans une partie de la ville. Les personnes concernées pourraient recevoir de l'argent public pour en changer.",
            },
            {
                id: 'c',
                label: 'Aider fortement les ménages modestes à passer à l\'électrique, par exemple par une voiture louée 100 € par mois.',
                explain: "Les foyers aux petits revenus (ménages modestes) recevraient une forte aide publique pour passer à l'électrique, par exemple une voiture électrique louée 100 € par mois.",
            },
            {
                id: 'd',
                label: 'Investir d\'abord dans les transports collectifs (bus, car, tram, train, bateau) pour réduire le besoin de voiture.',
                explain: "L'argent public irait en priorité aux bus, trains et trams : plus de lignes et plus de passages, pour faire davantage de trajets sans voiture.",
            },
            {
                id: 'e',
                label: 'Garder les zones à faibles émissions prévues par la loi, avec des aides pour changer de véhicule.',
                explain: "Là où la loi les impose, les villes continueraient d'interdire les véhicules anciens les plus polluants dans une zone. Leurs propriétaires pourraient recevoir de l'argent public pour en changer.",
            },
        ],
        programme: {
            lo: clear('d', [
                s('declaration', '2024-01-03', 'LO, « ZFE : les voitures de pauvres à la casse »', 'https://www.lutte-ouvriere.org/journal/article/2024-01-03-zfe-les-voitures-de-pauvres-la-casse_728535.html'),
                s('declaration', '2025-06-04', 'LO, « Fin des ZFE : les vrais pollueurs toujours pas inquiétés »', 'https://www.lutte-ouvriere.org/portail/journal/fin-zfe-vrais-pollueurs-toujours-inquietes-184826.html'),
            ]),
            lfi: clear('d', [at(NFP, 'p.4, moratoire sur les autoroutes'), at(LFI_SYNTHESE, 'chap. 13')], 'faible : position sur les ZFE non trouvée'),
            pcf: clear('d', [at(PCF_BASE, 'p.45, 48')]),
            eco: split(['d', 'e'], [at(LCP_ZFE, 'défense des ZFE par L. Belluco, groupe EcoS'), at(ECO_PLATEFORME, 'chap. 1 II')]),
            ps: clear('c', [at(PS_SECURITES, 'air'), at(PS_VIVRE_LIBRES, 'ch.2 « Se déplacer »')]),
            ren: clear('b', [REN_NOUVELLE_DONNE]),
            modem: split(['c', 'd'], [at(MODEM_LIVRET, 'section 2 D')], 'faible : leasing social cité au bilan, pas comme proposition ; position sur les ZFE non trouvée'),
            hor: clear('c', [ENSEMBLE_2024], NOTE_ENSEMBLE),
            lr: NC,
            udr: NC,
            rn: clear('a', [LCP_ZFE, s('declaration', '2026-10-08', 'Communiqué RN « 2035 : l\'interdiction totale du thermique est en train de tomber »', 'https://rassemblementnational.fr/communiques/2035-linterdiction-totale-du-thermique-est-en-train-de-tomber')]),
            rec: clear('a', [s('programme-2022', '2022-01-01', 'Institut Montaigne, programme d\'É. Zemmour 2022 (ZFE)', 'https://www.institutmontaigne.org/presidentielle-2022/eric-zemmour/mettre-fin-aux-interdictions-de-circuler-en-ville-en-fonction-du-type-de-vehicule')], 'faible : programme 2022, la fin de 2035 n\'est pas sourcée par un texte primaire'),
        },
    },
    {
        id: 'electricite-production',
        tier: 'core',
        theme: 'Électricité : nucléaire ou renouvelables',
        situation: "La France doit renouveler une partie de ses centrales et produire plus d'électricité d'ici 2050. Ces choix pèseront sur les factures de tous. Que privilégier ?",
        context: {
            text: "En 2025, 68 % de l'électricité produite en France métropolitaine venait du nucléaire, 27 % des énergies renouvelables (eau, vent, soleil) et moins de 4 % du gaz, du charbon ou du fioul.",
            sources: [s('autre', "2026-01-01", "RTE, « Bilan électrique 2025 : production » (2026, jour non précisé)", "https://analysesetdonnees.rte-france.com/bilan-electrique-2025/production")],
        },
        options: [
            {
                id: 'a',
                label: 'Sortir progressivement du nucléaire et miser sur les renouvelables (éolien, solaire).',
                explain: "Les centrales nucléaires fermeraient peu à peu, sans être remplacées par de nouvelles. L'électricité viendrait de plus en plus du vent et du soleil (énergies renouvelables).",
                cases: {
                    text: "En Allemagne, la loi sur l'atome n'autorise plus de nouvelle centrale nucléaire commerciale (qui produit de l'électricité pour la vendre). Les trois derniers réacteurs ont perdu leur droit de fonctionner le 15 avril 2023. Une autre loi, l'EEG (loi sur les énergies renouvelables), fixe un objectif pour 2030. Elle vise au moins 80 % d'électricité renouvelable dans la consommation brute, soit le total d'électricité consommée.",
                    sources: [
                        s('autre', "2026-07-22", "Gesetze im Internet, Atomgesetz, § 7 (page non datée ; date de la dernière modification citée, loi du 22 juillet 2026) (en allemand)", "https://www.gesetze-im-internet.de/atg/__7.html"),
                        s('autre', "2025-12-18", "Gesetze im Internet, Erneuerbare-Energien-Gesetz (EEG 2023), § 1 (page non datée ; date de la dernière modification citée, loi du 18 décembre 2025) (en allemand)", "https://www.gesetze-im-internet.de/eeg_2014/__1.html"),
                    ],
                },
            },
            {
                id: 'b',
                label: "Construire de nouveaux réacteurs nucléaires et continuer à développer l'éolien et le solaire.",
                explain: "De nouvelles centrales nucléaires seraient construites pour remplacer ou compléter les anciennes. On continuerait aussi d'installer des éoliennes et des panneaux solaires.",
                cases: {
                    text: "Au Royaume-Uni, le gouvernement a signé le 22 juillet 2025 la décision d'investir dans Sizewell C. Sizewell C est une nouvelle centrale nucléaire d'un coût d'environ 38 milliards de livres (monnaie britannique). Au départ, l'État a pris 44,9 % de son capital, c'est-à-dire de sa propriété. Début 2026, les enchères du gouvernement (mise en concurrence de producteurs d'électricité) ont retenu 14,7 gigawatts (GW, unité de puissance). Il s'agit d'éolien, de solaire et d'hydrolien, qui utilise les courants de la mer.",
                    sources: [
                        s('autre', "2025-07-22", "GOV.UK (DESNZ), « Sizewell C gets green light with final investment decision », 22 juillet 2025 (en anglais)", "https://www.gov.uk/government/news/sizewell-c-gets-green-light-with-final-investment-decision"),
                        s('autre', "2026-02-10", "GOV.UK (DESNZ), « New auction delivers unprecedented clean, homegrown power », 10 février 2026 (en anglais)", "https://www.gov.uk/government/news/new-auction-delivers-unprecedented-clean-homegrown-power"),
                    ],
                },
            },
            {
                id: 'c',
                label: "Relancer fortement le nucléaire et arrêter de soutenir de nouveaux parcs éoliens et solaires.",
                explain: "Beaucoup de nouvelles centrales nucléaires seraient construites. L'État ne donnerait plus d'aide publique pour installer de nouveaux groupes d'éoliennes ou de panneaux solaires (parcs).",
                cases: {
                    text: "Aux États-Unis, une loi de juillet 2025 supprime les crédits d'impôt pour l'éolien et le solaire. Un crédit d'impôt est une somme déduite de l'impôt à payer. La suppression vise les installations mises en service (qui démarrent) après 2027, sauf chantier commencé avant le 5 juillet 2026. Un décret du président, en mai 2025, vise 400 gigawatts (GW, unité de puissance) de nucléaire en 2050. Le pays en comptait environ 100 GW en 2024.",
                    sources: [
                        s('autre', "2025-07-04", "IRS, Notice 2025-42 sur la fin des crédits 45Y et 48E pour l'éolien et le solaire (page non datée ; date de la loi Public Law 119-21 du 4 juillet 2025 qu'elle cite) (en anglais)", "https://www.irs.gov/pub/irs-drop/n-25-42.pdf"),
                        s('autre', "2025-05-29", "Federal Register, décret présidentiel 14300 « Ordering the Reform of the Nuclear Regulatory Commission », signé le 23 mai 2025, publié le 29 mai 2025 (en anglais)", "https://www.federalregister.gov/documents/2025/05/29/2025-09798/ordering-the-reform-of-the-nuclear-regulatory-commission"),
                    ],
                },
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('a', [s('programme-2027', '2025-04-01', "L'Avenir en commun 2025 (relayé, avril 2025)", 'https://melenchon2027.fr/programme2025/livre/')], 'faible : texte relayé et non relu, programme 2027 attendu en novembre 2026'),
            pcf: clear('b', [at(PCF_BASE, 'p.47')]),
            eco: clear('a', [
                at(ECO_PLATEFORME, 'chap. 1 II'),
                s('declaration', '2026-07-02', 'SFEN, colloque de l\'UFE : les grands partis listent leurs positions sur le nucléaire', 'https://www.sfen.org/rgn/presidentielle-2027-au-colloque-de-lufe-les-grands-partis-listent-leurs-positions-sur-le-nucleaire/'),
            ]),
            ps: clear('b', [
                at(PS_VIVRE_LIBRES, 'ch.3'),
                s('declaration', '2026-07-02', 'SFEN, colloque de l\'UFE : les grands partis listent leurs positions sur le nucléaire', 'https://www.sfen.org/rgn/presidentielle-2027-au-colloque-de-lufe-les-grands-partis-listent-leurs-positions-sur-le-nucleaire/'),
            ]),
            ren: clear('b', [REN_NOUVELLE_DONNE]),
            modem: clear('b', [at(MODEM_LIVRET, 'section 2 B')]),
            hor: clear('b', [HOR_CONQUERANTE]),
            lr: clear('c', [RETAILLEAU_ELECTRICITE]),
            udr: NC,
            rn: clear('c', [RN_FRANCE24, RN_LCP_2024]),
            rec: clear('c', [
                s('programme-2022', '2022-03-23', 'effy, programme d\'É. Zemmour 2022 en matière d\'énergie (mis à jour en août 2024)', 'https://www.effy.fr/magazine/presidentielle-2022-le-programme-deric-zemmour-en-matiere-de-politique-energetique'),
                REC_PUBLICSENAT_2022,
                REC_KNAFO_IRDEME,
            ], NOTE_2022),
        },
        votes: { scrutins: [2580], mapping: { pour: 'c', contre: null, abstention: null } },
    },
    {
        id: 'europe-regles',
        tier: 'core',
        theme: 'Europe : normes et libre-échange',
        situation: 'Une nouvelle règle européenne s\'applique aux entreprises, artisans et agriculteurs de votre région, qui reçoivent aussi des aides européennes. Certains la jugent utile, d\'autres trop contraignante. Que faire ?',
        options: [
            {
                id: 'a',
                label: 'Donner plus de pouvoirs à l\'Union : décisions à la majorité, plus de moyens et de compétences communs.',
                explain: "L'Union européenne déciderait sur plus de sujets, avec plus d'argent commun. Plus souvent, un vote à la majorité des pays suffirait, sans l'accord de tous.",
            },
            {
                id: 'b',
                label: 'Garder les traités actuels, simplifier les normes européennes et ne pas en ajouter en France.',
                explain: "Les traités (textes de base de l'Union) ne changeraient pas. Les règles européennes seraient allégées, et la France n'ajouterait pas d'exigences en plus en les appliquant.",
            },
            {
                id: 'c',
                label: 'Changer les traités européens sur les règles économiques et budgétaires.',
                explain: "Les traités, textes de base de l'Union, seraient renégociés entre pays, par exemple sur les limites de déficit (quand l'État dépense plus qu'il ne reçoit) et de dette.",
            },
            {
                id: 'd',
                label: 'Modifier la Constitution pour faire passer les lois françaises avant les règles européennes.',
                explain: "La Constitution (texte des règles de base du pays) serait changée : si une loi française contredit une règle européenne, la loi française s'appliquerait.",
            },
            {
                id: 'e',
                label: 'Ne plus appliquer les règles européennes qui s\'opposent au programme du gouvernement élu.',
                explain: "La France n'appliquerait plus une règle européenne si elle contredit une mesure du programme du gouvernement élu. Elle continuerait d'appliquer les autres règles européennes.",
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('e', [at(LFI_SYNTHESE, 'chap. 17'), at(NFP, 'p.5, 25')]),
            pcf: split(['c', 'e'], [at(PCF_BASE, 'p.45 (c) et p.47 (e)')], 'position sur l\'Union européenne en débat jusqu\'en 2028'),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 4 I')]),
            ps: split(['a', 'c'], [at(PS_VIVRE_LIBRES, 'ch.4')]),
            ren: clear('a', [s('declaration', '2026-09-17', 'Public Sénat, « États-Unis d\'Europe » (G. Attal)', 'https://www.publicsenat.fr/actualites/politique/gabriel-attal-veut-construire-les-etats-unis-deurope-proposition-choc-pour-relancer-lideal-europeen')]),
            modem: clear('a', [MODEM_LIVRET, MODEM_DEMOCRATIE]),
            hor: split(['a', 'b'], [HOR_PROSPERE, HOR_CONQUERANTE], 'faible : pas de position institutionnelle (traités, majorité)'),
            lr: split(['b', 'd'], [
                s('declaration', '2026-09-02', 'LR, « En France, la seule cour suprême, c\'est le peuple »', 'https://republicains.fr/actualites/2026/09/02/en-france-la-seule-cour-supreme-cest-le-peuple-je-lui-donnerai-le-dernier-mot/'),
                at(RETAILLEAU_PROJET, 'mesure « Écarter le droit européen lorsqu\'il excède ses compétences »'),
                RETAILLEAU_AGRICULTURE,
            ]),
            udr: clear('d', [JDD_UNION_DROITES, at(UDR_PPLC, 'art. 2 et 5')]),
            rn: clear('d', [at(RN_LIVRET_IMMIGRATION, 'p.12-16'), RN_LCP_2024]),
            rec: clear('d', [REC_PUBLICSENAT_2022], NOTE_2022),
        },
    },
    {
        id: 'defense-budget',
        tier: 'core',
        theme: 'Défense et Ukraine',
        situation: 'Depuis la guerre en Ukraine, la France augmente chaque année de plusieurs milliards d\'euros le budget de ses armées. Que faire pour la suite ?',
        options: [
            {
                id: 'a',
                label: 'Continuer d\'augmenter fortement le budget national des armées, financé par des économies, des impôts ou l\'emprunt.',
                explain: "L'État continuerait d'augmenter fortement, chaque année, l'argent donné aux armées françaises (soldats, armes, équipement). Pour payer, il réduirait d'autres dépenses, augmenterait des impôts ou emprunterait.",
            },
            {
                id: 'b',
                label: 'Augmenter le budget, mais surtout par des achats et des financements communs avec les autres pays européens.',
                explain: "La France dépenserait plus pour sa défense, mais surtout en achetant des armes avec d'autres pays européens et en partageant les frais avec eux.",
            },
            {
                id: 'c',
                label: 'Ne plus augmenter le budget militaire et chercher d\'abord une paix négociée en Ukraine.',
                explain: "Le budget des armées resterait au niveau actuel. La France pousserait d'abord à un accord entre l'Ukraine et la Russie pour arrêter la guerre.",
            },
        ],
        programme: {
            lo: clear('c', [at(LO_BROCHURE, 'p.18-23'), LO_DISCOURS], 'faible : la moitié « paix négociée » n\'est pas sourcée'),
            lfi: clear('c', [at(LFI_SYNTHESE, 'chap. 16'), LFI_OTAN], 'faible : la moitié « ne plus augmenter le budget » n\'est pas sourcée'),
            pcf: clear('c', [at(PCF_BASE, 'p.30-32')]),
            eco: clear('b', [at(ECO_PLATEFORME, 'chap. 4 I')]),
            ps: clear('b', [at(PS_VIVRE_LIBRES, 'ch.4')], 'budget non chiffré'),
            ren: clear('a', [at(ENSEMBLE_2024, 'doubler le budget militaire d\'ici 2030')], NOTE_ENSEMBLE),
            modem: clear('b', [MODEM_LIVRET, ENSEMBLE_2024]),
            hor: clear('a', [HOR_SURE]),
            lr: NC,
            udr: NC,
            rn: clear('a', [at(RN_22_MESURES, 'n°20')], NOTE_2022),
            rec: clear('a', [REC_PUBLICSENAT_2022], NOTE_2022),
        },
        votes: { scrutins: [6736], mapping: { pour: 'a', contre: null, abstention: null } },
        europeanVotes: [
            {
                party: 'rec',
                summary: 'Au Parlement européen, sa seule eurodéputée, Sarah Knafo, a voté sur six textes européens de défense (2025-2026) : trois pour, un contre, deux abstentions.',
                votes: [
                    {
                        title: "Programme européen pour l'industrie de la défense (EDIP), accord provisoire",
                        date: '2025-11-25',
                        url: 'https://howtheyvote.eu/votes/181587',
                    },
                    {
                        title: "Investissements de défense dans le budget de l'UE (ReArm Europe), accord provisoire",
                        date: '2025-12-16',
                        url: 'https://howtheyvote.eu/votes/182483',
                    },
                    {
                        title: 'Omnibus V : accélération des permis pour les projets de défense',
                        date: '2026-09-16',
                        url: 'https://howtheyvote.eu/votes/196114',
                    },
                    {
                        title: 'Omnibus V : préparation de la défense et investissements',
                        date: '2026-09-16',
                        url: 'https://howtheyvote.eu/votes/196161',
                    },
                    {
                        title: 'Omnibus V : transferts intra-UE de produits de défense et marchés',
                        date: '2026-09-16',
                        url: 'https://howtheyvote.eu/votes/196116',
                    },
                    {
                        title: "Programme AGILE d'innovation de défense rapide",
                        date: '2026-10-06',
                        url: 'https://howtheyvote.eu/votes/197360',
                    },
                ],
            },
        ],
    },
    {
        id: 'institutions-decision',
        tier: 'core',
        theme: 'Institutions : qui décide',
        situation: 'Entre deux élections, beaucoup de Français ont le sentiment que leur avis compte peu dans les grandes décisions nationales. Que changer en priorité dans nos institutions ?',
        context: {
            text: "Aujourd'hui, un référendum est décidé par le président de la République, sur proposition du gouvernement ou du Parlement, ou lancé par un cinquième des parlementaires soutenus par un dixième des électeurs inscrits. Le 49.3 permet au gouvernement de faire adopter sans vote un budget, ou un autre texte par session, sauf si les députés votent une motion de censure.",
            sources: [s('autre', "2024-03-08", "Conseil constitutionnel, « Texte intégral de la Constitution du 4 octobre 1958 en vigueur », articles 11 et 49 (à jour de la révision du 8 mars 2024)", "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur")],
        },
        options: [
            {
                id: 'a',
                label: 'Changer de Constitution : une assemblée constituante, élue ou tirée au sort, en rédige une nouvelle.',
                explain: "Une assemblée spéciale, dont les membres sont élus ou tirés au sort, écrirait une nouvelle Constitution : le texte qui fixe qui a quel pouvoir dans le pays.",
                cases: {
                    text: "Au Chili, une Convention constitutionnelle de 155 membres a écrit un projet de nouvelle Constitution. Tous ses membres ont été élus, les 15 et 16 mai 2021. Aucun n'a été tiré au sort. Le 4 septembre 2022, les électeurs ont voté sur ce projet par référendum. Ils l'ont rejeté avec 61,86 % des voix.",
                    sources: [
                        s('autre', "2022-09-04", "BCN (Chili), chronologie du processus constituant 2021-2022 (page non datée ; dernière entrée du 2022-09-04) (en espagnol)", "https://www.bcn.cl/procesoconstituyente/cronograma"),
                        s('autre', "2022-09-04", "BCN (Chili), « Plebiscito de Salida 2022 » (page non datée ; date du scrutin) (en espagnol)", "https://www.bcn.cl/procesoconstituyente/plebiscito2022"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Permettre aux citoyens de lancer eux-mêmes un référendum pour proposer ou supprimer une loi.',
                explain: "Si assez de citoyens signent une demande, tous les électeurs voteraient sur une loi proposée par ces citoyens, ou sur la suppression d'une loi, sans besoin de l'accord des élus.",
                cases: {
                    text: "En Suisse, 50 000 citoyens peuvent demander un vote du peuple sur une nouvelle loi fédérale, c'est-à-dire nationale. Ils ont 100 jours après la publication de la loi pour le faire. 100 000 citoyens peuvent aussi demander un changement de la Constitution, dans un délai de 18 mois. Ce droit, appelé « initiative populaire fédérale », ne concerne que la Constitution.",
                    sources: [
                        s('autre', "2024-03-03", "Fedlex (Suisse), Constitution fédérale du 18 avril 1999, art. 138, 139 et 141 (version en vigueur au 3 mars 2024)", "https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1999/404/20240303/fr/html/fedlex-data-admin-ch-eli-cc-1999-404-20240303-fr-html.html"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Élire les députés à la proportionnelle : chaque parti a des sièges selon son score.',
                explain: "Chaque parti aurait un nombre de députés proche de sa part des voix. Aujourd'hui, chaque circonscription (une zone du territoire) élit un seul député.",
                cases: {
                    text: "En France, le Conseil constitutionnel a examiné le 2 juillet 1986 une loi sur l'élection des députés. Avant, on votait pour des listes, et les sièges étaient partagés selon le score de chaque liste (proportionnelle). La loi a remplacé ce système par le scrutin « uninominal majoritaire », à un ou deux tours. Chaque circonscription, une zone du territoire, y élit un seul député, à la majorité. La loi a ainsi rétabli le mode de scrutin utilisé avant la proportionnelle.",
                    sources: [
                        s('autre', "1986-07-02", "Conseil constitutionnel, décision n° 86-208 DC du 2 juillet 1986, considérants 2 à 4", "https://www.conseil-constitutionnel.fr/decision/1986/86208DC.htm"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Organiser plus souvent des référendums sur les grands sujets, décidés par les pouvoirs publics.',
                explain: "Les dirigeants (président, gouvernement, Parlement) feraient voter plus souvent tous les électeurs sur de grandes questions, par référendum. Le choix du sujet resterait à ces dirigeants.",
                cases: {
                    text: "En France, le président peut soumettre un projet de loi au vote de tous les électeurs, sur proposition du gouvernement. Cette règle est l'article 11 de la Constitution. Le 9 mars 2005, un décret, décision écrite du président, l'a utilisée pour le référendum sur le traité constitutionnel européen. Le référendum de 2000 portait sur un changement de la Constitution : il relevait d'une autre règle, l'article 89. Ces exemples montrent comment un référendum est décidé, pas à quelle fréquence.",
                    sources: [
                        s('autre', "2005-03-24", "Conseil constitutionnel, décision n° 2005-31 REF du 24 mars 2005, considérants 1 et 5", "https://www.conseil-constitutionnel.fr/decision/2005/200531REF.htm"),
                        s('autre', "2000-09-11", "Conseil constitutionnel, décision n° 2000-28 REF du 11 septembre 2000 (visas)", "https://www.conseil-constitutionnel.fr/decision/2000/200028REF.htm"),
                    ],
                },
            },
            {
                id: 'e',
                label: 'Garder les institutions actuelles, 49.3 compris, et réformer par ordonnances quand le Parlement l\'autorise.',
                explain: "Les institutions resteraient inchangées : le gouvernement pourrait adopter un texte sans vote (49.3), sauf si les députés le renversent, et prendre des ordonnances, sortes de lois, si le Parlement l'autorise.",
                cases: {
                    text: "En France, une loi du 15 septembre 2017 a permis au gouvernement de prendre des ordonnances sur le travail. Cette autorisation portait aussi sur le dialogue social : les discussions entre employeurs et représentants des salariés. Une ordonnance est un texte décidé par le gouvernement à la place d'une loi votée. Le 14 avril 2023, le Conseil constitutionnel a jugé le 49.3 utilisable pour une loi sur les retraites. Cette loi modifiait le budget de la Sécurité sociale en cours d'année : une « loi de financement rectificative ».",
                    sources: [
                        s('autre', "2017-09-15", "Assemblée nationale, dossier législatif de la loi n° 2017-1340 d'habilitation à prendre par ordonnances les mesures pour le renforcement du dialogue social (page non datée ; date de la loi)", "https://www.assemblee-nationale.fr/dyn/15/dossiers/habilitation_ordonnances_dialogue_social"),
                        s('autre', "2023-04-14", "Conseil constitutionnel, décision n° 2023-849 DC du 14 avril 2023", "https://www.conseil-constitutionnel.fr/decision/2023/2023849DC.htm"),
                    ],
                },
            },
        ],
        programme: {
            lo: NC,
            lfi: split(['a', 'b'], [at(LFI_SYNTHESE, 'chap. 1'), at(NFP, 'p.17')]),
            pcf: split(['a', 'b', 'c'], [at(PCF_BASE, 'p.34-35')], 'a : pas de constituante dans le texte 2026, une convention citoyenne'),
            eco: split(['a', 'b'], [at(ECO_PLATEFORME, 'chap. 3 II')]),
            ps: split(['b', 'c'], [at(PS_REFAIRE_SOCIETE, 'institutions')]),
            ren: clear('d', [at(JDD_ATTAL, '« journée référendaire » annuelle')]),
            modem: clear('c', [at(MODEM_LIVRET, 'section 5 A'), MODEM_DEMOCRATIE]),
            hor: split(['d', 'e'], [JDN_PHILIPPE], 'faible : « garder les institutions » est déduit de l\'absence de proposition'),
            lr: clear('d', [RETAILLEAU_INSTITUTIONS, PUBLICSENAT_RETAILLEAU]),
            udr: clear('d', [JDD_UNION_DROITES], 'faible : référendums constitutionnels évoqués en un seul entretien'),
            rn: clear('d', [
                s('declaration', '2026-08-29', 'Parlons Politique, J. Bardella à Châlons', 'https://www.parlons-politique.fr/elections/programme-rn-2027-les-choix-de-bardella-pourraient-changer-les-retraites-limmigration-et-les-finances-publiques_25925/'),
                RN_FRANCE24,
            ]),
            rec: clear('d', [REC_PUBLICSENAT_2022], NOTE_2022),
        },
    },
    // ----- Affiner (11) -----
    {
        id: 'fin-de-vie',
        tier: 'affiner',
        theme: 'Fin de vie',
        situation: 'Une personne de votre entourage a une maladie grave et incurable. Elle demande une aide à mourir ; un autre proche craint qu\'elle le fasse pour ne pas peser sur sa famille. Que prévoir ?',
        context: {
            text: "Une loi d'août 2026 a créé un droit à l'aide à mourir, sous conditions.",
            sources: [s('autre', "2026-08-18", "Sénat, dossier législatif « Droit à l'aide à mourir » (loi n° 2026-794 du 18 août 2026)", "https://www.senat.fr/dossier-legislatif/ppl24-661.html")],
        },
        options: [
            {
                id: 'a',
                label: "Garder la règle actuelle : une aide à mourir sous conditions, pour les majeurs en phase avancée d'une maladie incurable.",
                explain: "La loi d'août 2026 resterait telle quelle : un adulte atteint d'une maladie grave qui ne se guérit pas, à un stade avancé, peut demander une aide à mourir, sous conditions.",
                cases: {
                    text: "En Oregon (États-Unis), une loi de 1997 concerne les adultes capables de prendre eux-mêmes leur décision. Ils doivent avoir une maladie terminale : leur décès est attendu dans les six mois. La loi leur permet d'obtenir d'un médecin un produit qui provoque la mort. La personne doit prendre ce produit elle-même. Chaque année, l'autorité de santé de l'Oregon (Oregon Health Authority) publie un rapport.",
                    sources: [
                        s('autre', "2026-06-17", "Oregon Health Authority, « Oregon Death with Dignity Act, 2025 Data Summary » (révisé le 17 juin 2026) (en anglais)", "https://www.oregon.gov/oha/PH/PROVIDERPARTNERRESOURCES/EVALUATIONRESEARCH/DEATHWITHDIGNITYACT/Documents/year28.pdf"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Ne pas autoriser l\'aide à mourir, et garantir partout l\'accès aux soins palliatifs.',
                explain: "Personne ne pourrait recevoir d'aide pour mourir. L'État devrait garantir partout des soins palliatifs : des soins qui soulagent la douleur des malades qu'on ne peut plus guérir.",
                cases: {
                    text: "En France, l'aide à mourir n'était pas reconnue avant la loi d'août 2026. Des lois de 2005 et 2016 permettent d'arrêter les traitements d'un malade. Elles permettent aussi une « sédation profonde et continue » : endormir le malade jusqu'à sa mort. La loi du 26 mai 2026 organise les soins palliatifs territoire par territoire. Elle ne crée pas de « droit opposable », c'est-à-dire un droit qu'une personne peut faire respecter devant un juge.",
                    sources: [
                        s('autre', "2026-04-29", "Sénat, « L'Essentiel » sur la proposition de loi relative au droit à l'aide à mourir (date du pied de page : 29 avril 2026)", "https://www.senat.fr/lessentiel/ppl24-661.pdf"),
                        s('autre', "2026-05-26", "Sénat, « La loi en clair » : loi n° 2026-404 garantissant l'égal accès à l'accompagnement et aux soins palliatifs (page non datée ; date de la loi)", "https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-visant-a-garantir-legal-acces-de-tous-a-laccompagnement-et-aux-soins-palliatifs.html"),
                        s('autre', "2026-04-29", "Sénat, « L'Essentiel » sur la proposition de loi visant à garantir l'égal accès de tous à l'accompagnement et aux soins palliatifs, deuxième lecture (commission du 29 avril 2026 ; pied de page : 7 janvier 2026)", "https://www.senat.fr/lessentiel/ppl24-662.pdf"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Autoriser l\'aide à mourir plus largement, y compris par directives écrites à l\'avance si la personne ne peut plus s\'exprimer.',
                explain: "L'aide à mourir serait ouverte à plus de cas. Une personne pourrait écrire sa demande à l'avance, pour qu'elle soit suivie si elle ne peut plus dire ce qu'elle veut.",
                cases: {
                    text: "Aux Pays-Bas, une loi du 12 avril 2001 permet l'euthanasie ou l'aide au suicide. Dans l'euthanasie, le médecin donne lui-même le produit mortel ; dans l'aide au suicide, le patient le prend. Il faut une souffrance insupportable, sans espoir d'amélioration, et l'avis d'un second médecin indépendant. Dès 16 ans, si le patient ne peut plus s'exprimer, le médecin peut suivre sa demande écrite plus tôt.",
                    sources: [
                        s('autre', "2001-04-12", "Overheid.nl (Pays-Bas), loi du 12 avril 2001 sur le contrôle de l'euthanasie et de l'aide au suicide, art. 2 (page non datée ; date de la loi) (en néerlandais)", "https://wetten.overheid.nl/BWBR0012410/2021-10-01"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('a', [at(LO_ASSOC, 'dossier « Mourir dans la dignité » (2021-12-11)')], 'faible : documents de 2021-2022'),
            lfi: clear('a', [at(NFP, 'p.17')], 'faible : NFP 2024 seul, position 2026 non vérifiée'),
            pcf: clear('a', [at(NFP, 'p.17')], 'faible : seulement le programme commun NFP 2024'),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 2 I')]),
            ps: clear('a', [at(PS_SECURITES, 'fin de vie')]),
            ren: NC,
            modem: NC,
            hor: NC,
            lr: NC,
            udr: clear('b', [s('declaration', '2025-05-16', 'Sud Radio, fin de vie : ce que pensent les partis (tribune d\'É. Ciotti et H. Mansouri)', 'https://www.sudradio.fr/societe/fin-de-vie-ce-que-les-partis-politiques-pensent-de-laide-a-mourir')], 'faible : la moitié « soins palliatifs » n\'est pas sourcée ; opposition exprimée avant l\'adoption de la loi, abrogation non sourcée'),
            rn: NC,
            rec: NC,
        },
        votes: { scrutins: [7894], mapping: { pour: 'a', contre: 'b', abstention: null } },
    },
    {
        id: 'agriculture-pesticides',
        tier: 'affiner',
        theme: 'Agriculture et pesticides',
        situation: 'Un insecticide interdit en France reste autorisé dans d\'autres pays européens. Des agriculteurs parlent de concurrence déloyale, des habitants proches des champs s\'inquiètent pour leur santé. Que faire ?',
        options: [
            {
                id: 'a',
                label: 'Garder l\'interdiction et interdire aussi l\'importation de produits cultivés avec ce pesticide.',
                explain: "Les agriculteurs français ne pourraient toujours pas utiliser cet insecticide. Les aliments venant d'autres pays et cultivés avec ce produit ne pourraient plus être vendus en France.",
                cases: {
                    text: "Dans l'Union européenne, la clothianidine et le thiaméthoxame, deux néonicotinoïdes (une famille d'insecticides), ne sont pas autorisés. Un règlement du 2 février 2023 ramène leurs traces admises au plus petit niveau mesurable (« limite de détermination »). Cette règle s'applique depuis le 7 mars 2026, y compris aux produits importés. En France, une loi du 18 août 2026 renforce les moyens de lutter contre certaines importations. Elles concernent les produits traités avec des substances interdites dans l'Union européenne.",
                    sources: [
                        s('autre', "2023-02-15", "Journal officiel de l'Union européenne, règlement (UE) 2023/334 de la Commission du 2 février 2023, publié le 15 février 2023", "https://eur-lex.europa.eu/eli/reg/2023/334/oj"),
                        s('autre', "2026-08-19", "Vie-publique.fr, « Loi du 18 août 2026 d'urgence pour la protection et la souveraineté agricoles » (dernière modification le 19 août 2026)", "https://www.vie-publique.fr/loi/302739-urgence-pour-la-protection-et-la-souverainete-agricoles-loi-18-aout-2026"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Le réautoriser en France, dans les conditions fixées par les règles européennes.',
                explain: "Les agriculteurs français pourraient de nouveau utiliser cet insecticide, comme dans les pays européens où il est permis, en respectant les limites fixées par l'Union européenne.",
                cases: {
                    text: "En France, une loi de 2020 a permis des exceptions à l'interdiction des néonicotinoïdes, une famille d'insecticides. Ces exceptions visaient les semences de betterave et étaient possibles jusqu'au 1er juillet 2023. En janvier 2023, la Cour de justice de l'Union européenne a exclu ce type d'exception. Une loi du 18 août 2026 permet de nouvelles exceptions d'un an, renouvelables deux fois. Elles visent l'acétamipride pour les noisettes, et la flupyradifurone pour les betteraves, les pommes et les cerises.",
                    sources: [
                        s('autre', "2020-12-15", "Vie-publique.fr, « Loi du 14 décembre 2020 relative aux conditions de mise sur le marché de certains produits phytopharmaceutiques en cas de danger sanitaire pour les betteraves sucrières » (dernière modification le 15 décembre 2020)", "https://www.vie-publique.fr/loi/276032-loi-14-decembre-2020-derogation-utilisation-neonicotinoides-betteraves"),
                        s('autre', "2020-12-10", "Conseil constitutionnel, décision n° 2020-809 DC du 10 décembre 2020", "https://www.conseil-constitutionnel.fr/decision/2020/2020809DC.htm"),
                        s('autre', "2023-01-19", "Cour de justice de l'UE, communiqué de presse n° 12/23, arrêt C-162/21 du 19 janvier 2023", "https://curia.europa.eu/jcms/upload/docs/application/pdf/2023-01/cp230012fr.pdf"),
                        s('autre', "2026-08-19", "Vie-publique.fr, « Loi du 18 août 2026 d'urgence pour la protection et la souveraineté agricoles » (dernière modification le 19 août 2026)", "https://www.vie-publique.fr/loi/302739-urgence-pour-la-protection-et-la-souverainete-agricoles-loi-18-aout-2026"),
                        s('autre', "2026-08-14", "Conseil constitutionnel, décision n° 2026-914 DC du 14 août 2026", "https://www.conseil-constitutionnel.fr/decision/2026/2026914DC.htm"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Garder l\'interdiction en France sans toucher aux importations, et aider les agriculteurs à s\'en passer.',
                explain: "Les agriculteurs français ne pourraient toujours pas utiliser cet insecticide, et l'État les aiderait à s'en passer. Les règles sur les aliments venant d'autres pays ne changeraient pas.",
                cases: {
                    text: "En France, une loi de 2016 interdit depuis le 1er septembre 2018 d'utiliser les néonicotinoïdes (insecticides) et les semences traitées. Des exceptions temporaires ont existé pour les betteraves, jusqu'en 2023. La loi du 18 août 2026 en a ouvert d'autres. La stratégie Écophyto 2030, adoptée le 6 mai 2024, vise à réduire l'usage des pesticides. Elle prévoit d'autres solutions que les pesticides et un accompagnement des agriculteurs.",
                    sources: [
                        s('autre', "2020-12-15", "Vie-publique.fr, « Loi du 14 décembre 2020 relative aux conditions de mise sur le marché de certains produits phytopharmaceutiques en cas de danger sanitaire pour les betteraves sucrières » (dernière modification le 15 décembre 2020)", "https://www.vie-publique.fr/loi/276032-loi-14-decembre-2020-derogation-utilisation-neonicotinoides-betteraves"),
                        s('autre', "2024-05-06", "Ministère de l'Agriculture, « Écophyto 2030 : une stratégie et des actions pour réduire l'usage et les risques des produits phytopharmaceutiques » (page non datée ; date d'adoption de la stratégie citée)", "https://agriculture.gouv.fr/ecophyto-2030"),
                        s('autre', "2026-08-19", "Vie-publique.fr, « Loi du 18 août 2026 d'urgence pour la protection et la souveraineté agricoles » (dernière modification le 19 août 2026)", "https://www.vie-publique.fr/loi/302739-urgence-pour-la-protection-et-la-souverainete-agricoles-loi-18-aout-2026"),
                        s('autre', "2026-08-14", "Conseil constitutionnel, décision n° 2026-914 DC du 14 août 2026", "https://www.conseil-constitutionnel.fr/decision/2026/2026914DC.htm"),
                    ],
                },
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('a', [at(NFP, 'p.20-21')]),
            pcf: clear('a', [at(PCF_BASE, 'p.44-45')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 1 II « Investir dans l\'agroécologie »')]),
            ps: clear('a', [at(PS_VIVRE_LIBRES, 'ch.4, mêmes normes pour les produits importés'), PS_NATURE], 'faible : les mesures miroirs ne visent pas nommément les pesticides'),
            ren: AMB,
            modem: AMB,
            hor: clear('b', [HOR_PROSPERE], 'faible : pesticides non trouvés, déduit de « pas de surtransposition »'),
            lr: clear('b', [RETAILLEAU_AGRICULTURE]),
            udr: NC,
            rn: AMB,
            rec: NC,
        },
    },
    {
        id: 'nationalite-droit-du-sol',
        tier: 'affiner',
        theme: 'Nationalité et droit du sol',
        situation: 'Un enfant naît en France de parents étrangers et y grandit. Il peut aujourd\'hui devenir français à sa majorité, sous conditions (droit du sol). À Mayotte, les règles sont plus strictes. Que faire ?',
        context: {
            text: "Aujourd'hui, un enfant né en France de parents étrangers devient français à 18 ans s'il vit en France et y a vécu au moins 5 ans depuis ses 11 ans. Des règles spécifiques s'appliquent à Mayotte.",
            sources: [s('autre', "2025-08-19", "Service-public.gouv.fr, fiche F295 « Nationalité française d'un enfant né en France de parents étrangers »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F295")],
        },
        options: [
            {
                id: 'a',
                label: 'Rendre français à la naissance tout enfant né en France, y compris à Mayotte.',
                explain: "Tout bébé né en France, y compris à Mayotte, serait français dès sa naissance, même si ses parents sont étrangers. Il n'aurait plus de conditions à remplir plus tard.",
                cases: {
                    text: "Au Canada, la Loi sur la citoyenneté rend citoyenne toute personne née dans le pays après le 14 février 1977. L'exception vise l'enfant qui remplit deux conditions à la fois. D'abord, aucun parent n'est citoyen canadien ni résident permanent, c'est-à-dire autorisé à vivre au Canada sans limite de durée. Ensuite, un parent travaille pour un gouvernement étranger (diplomate, consul…) ou une organisation internationale à immunités. Les immunités protègent ces personnes de certaines lois du pays où elles travaillent.",
                    sources: [
                        s('autre', "2026-09-21", "Justice Canada, Loi sur la citoyenneté (L.R.C. 1985, ch. C-29), art. 3, texte à jour au 21 septembre 2026", "https://laws-lois.justice.gc.ca/fra/lois/c-29/section-3.html"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Garder les règles actuelles partout, y compris à Mayotte, sans les durcir davantage.',
                explain: "L'enfant pourrait toujours devenir français à 18 ans s'il a vécu assez longtemps en France. À Mayotte, les conditions plus strictes sur le séjour des parents resteraient les mêmes.",
                cases: {
                    text: "En France, un enfant né dans le pays de parents étrangers devient français à 18 ans, sous deux conditions. Il doit vivre en France à ce moment-là. Il doit aussi y avoir vécu au moins 5 ans depuis ses 11 ans. Une démarche écrite, appelée « déclaration », permet de devenir français plus tôt, dès 13 ans. À Mayotte, les parents doivent en plus remplir des conditions de séjour.",
                    sources: [
                        s('autre', "2025-08-19", "Service-public.gouv.fr, fiche F295 « Nationalité française d'un enfant né en France de parents étrangers » (vérifiée le 19 août 2025)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F295"),
                        s('autre', "2025-05-13", "Vie-publique.fr, « Loi du 12 mai 2025 visant à renforcer les conditions d'accès à la nationalité française à Mayotte » (publié le 13 mai 2025)", "https://www.vie-publique.fr/loi/297235-droit-du-sol-mayotte-loi-du-12-mai-2025-acces-la-nationalite-francaise"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Garder le droit du sol dans l\'Hexagone, mais le restreindre davantage dans certains territoires, comme Mayotte.',
                explain: "Dans l'Hexagone (la France métropolitaine), un enfant pourrait toujours devenir français à 18 ans, sous conditions. Dans certains territoires, comme Mayotte, ces conditions seraient encore plus strictes.",
                cases: {
                    text: "À Mayotte, une loi du 12 mai 2025 rend le droit du sol plus strict. À la naissance de l'enfant, ses deux parents doivent vivre légalement en France depuis plus d'un an. Cette règle des deux parents ne s'applique pas si l'enfant n'a légalement qu'un seul parent (famille monoparentale). De 2018 à 2025, il suffisait qu'un seul parent remplisse cette condition, depuis trois mois.",
                    sources: [
                        s('autre', "2025-05-13", "Vie-publique.fr, « Loi du 12 mai 2025 visant à renforcer les conditions d'accès à la nationalité française à Mayotte » (publié le 13 mai 2025)", "https://www.vie-publique.fr/loi/297235-droit-du-sol-mayotte-loi-du-12-mai-2025-acces-la-nationalite-francaise"),
                        s('autre', "2025-05-07", "Conseil constitutionnel, décision n° 2025-881 DC du 7 mai 2025", "https://www.conseil-constitutionnel.fr/decision/2025/2025881DC.htm"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Supprimer le droit du sol : être français seulement par ses parents ou par naturalisation.',
                explain: "Être né et avoir grandi en France ne suffirait plus pour devenir français. Il faudrait un parent français, ou demander la nationalité et que l'État l'accepte (naturalisation).",
                cases: {
                    text: "Au Japon, la loi sur la nationalité a été adoptée en 1950. Un enfant est japonais dès sa naissance si son père ou sa mère est japonais. C'est aussi le cas s'il naît au Japon de parents inconnus ou apatrides, c'est-à-dire sans aucune nationalité. Un enfant qu'un parent japonais a reconnu comme le sien peut le devenir par une démarche écrite (« déclaration »). Sinon, il faut une naturalisation : le ministre de la Justice décide de lui accorder la nationalité.",
                    sources: [
                        s('autre', "2025-06-01", "e-Gov (Japon), loi sur la nationalité (国籍法), version en vigueur le 01/06/2025, art. 2 à 4 (en japonais)", "https://laws.e-gov.go.jp/law/325AC0000000147/20250601_504AC0000000068"),
                    ],
                },
            },
        ],
        programme: {
            lo: NC,
            lfi: clear('a', [at(NFP, 'p.24-25, droit du sol intégral')], NOTE_NFP),
            pcf: clear('b', [at(PCF_BASE, 'p.39')], 'position sur Mayotte non trouvée'),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 4 II')]),
            ps: NC,
            ren: AMB,
            modem: NC,
            hor: NC,
            lr: clear('d', [RETAILLEAU_CHARTE]),
            udr: clear('d', [FRANCEINFO_PACTE]),
            rn: clear('d', [RN_LCP_2024, at(RN_LIVRET_IMMIGRATION, 'p.12-16')]),
            rec: clear('d', [REC_PUBLICSENAT_2022], NOTE_2022),
        },
        votes: { scrutins: [1308], mapping: { pour: 'c', contre: null, abstention: null } },
    },
    {
        id: 'outre-mer-vie-chere',
        tier: 'affiner',
        theme: 'Vie chère en Outre-mer',
        situation: "Dans les départements d'Outre-mer, les produits alimentaires coûtent nettement plus cher que dans l'Hexagone. Que faire en priorité ?",
        context: {
            text: "En 2022, les prix alimentaires étaient de 30 % à 42 % plus élevés dans les départements d'Outre-mer que dans l'Hexagone.",
            sources: [s('autre', "2023-07-11", "Insee Première n° 1958 (11 juillet 2023)", "https://www.insee.fr/fr/statistiques/7648939")],
        },
        options: [
            {
                id: 'a',
                label: 'Plafonner par la loi les prix d\'une liste de produits de base.',
                explain: "Une loi fixerait un prix maximum pour certains produits du quotidien, comme des aliments de base. Les magasins ne pourraient pas les vendre plus cher.",
                cases: {
                    text: "En France, une loi du 20 novembre 2012 a créé le « bouclier qualité-prix » pour l'outre-mer. Chaque année, le représentant de l'État sur place, le préfet, négocie avec les magasins et leurs fournisseurs. Ils discutent du prix total d'un panier de produits de première nécessité. Sans accord après un mois, le représentant de l'État fixe lui-même ce prix.",
                    sources: [
                        s('autre', "2025-04-03", "Sénat, rapport d'information n° 514 (2024-2025) « La lutte contre la vie chère outre-mer : pansements ou vrais remèdes ? », déposé le 3 avril 2025", "https://www.senat.fr/rap/r24-514/r24-514_mono.html"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Renforcer la concurrence dans l\'importation et la grande distribution locales.',
                explain: "L'État agirait pour que plus d'entreprises puissent faire venir des produits et tenir des supermarchés sur place. Les clients auraient plus de vendeurs entre lesquels choisir.",
                cases: {
                    text: "En France, une loi du 20 novembre 2012 interdit en outre-mer les accords d'importation exclusifs. Ces accords réservent un produit à un seul importateur. Elle abaisse aussi le seuil à partir duquel les rachats et fusions de magasins sont contrôlés. Contre un distributeur dominant aux prix ou marges (gains sur chaque vente) élevés, elle permet des « injonctions structurelles ». Ces ordres de changer son organisation n'ont pas été utilisés, selon le Sénat (2025).",
                    sources: [
                        s('autre', "2025-04-03", "Sénat, rapport d'information n° 514 (2024-2025) « La lutte contre la vie chère outre-mer : pansements ou vrais remèdes ? », déposé le 3 avril 2025", "https://www.senat.fr/rap/r24-514/r24-514_mono.html"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Réformer l\'octroi de mer, la taxe sur les produits importés qui finance les communes.',
                explain: "L'octroi de mer taxe surtout les produits venant d'ailleurs et finance en grande partie les communes. Ses taux, ou les produits concernés, changeraient.",
                cases: {
                    text: "En France, depuis 2022, l'octroi de mer suit une décision européenne de 2021. Elle fixe deux listes de produits fabriqués sur place, contre trois listes jusqu'en 2021. Ces produits peuvent être moins taxés que les mêmes venus d'ailleurs : l'écart de taux va jusqu'à 20 ou 30 points. Sous 550 000 € de ventes par an (chiffre d'affaires), une entreprise locale ne paie pas d'octroi sur sa production. Ce seuil était de 300 000 € auparavant.",
                    sources: [
                        s('autre', "2024-03-01", "Cour des comptes, « L'octroi de mer » (rapport d'évaluation, mars 2024 ; le 1er est utilisé)", "https://www.ccomptes.fr/sites/default/files/2024-03/20240305-L-octroi-de-mer.pdf"),
                        s('autre', "2021-06-21", "Journal officiel de l'Union européenne, décision (UE) 2021/991 du Conseil du 7 juin 2021 relative au régime de l'octroi de mer, art. 1er et 5, publiée le 21 juin 2021", "https://eur-lex.europa.eu/eli/dec/2021/991/oj"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Augmenter les revenus : salaires et minima sociaux adaptés au coût de la vie locale.',
                explain: "Les salaires et les aides versées aux personnes aux revenus faibles (minima sociaux, comme le RSA) seraient plus élevés là où la vie coûte plus cher.",
                cases: {
                    text: "En France, une loi du 3 avril 1950 vise des fonctionnaires d'outre-mer. Ils sont en poste en Martinique, en Guadeloupe, en Guyane et à La Réunion. Leur salaire, appelé « traitement », est augmenté : il est multiplié par un « coefficient multiplicateur ». Le but est de compenser un coût de la vie plus élevé. Cette règle ne concerne que les salaires des fonctionnaires.",
                    sources: [
                        s('autre', "2025-04-03", "Sénat, rapport d'information n° 514 (2024-2025) « La lutte contre la vie chère outre-mer : pansements ou vrais remèdes ? », déposé le 3 avril 2025", "https://www.senat.fr/rap/r24-514/r24-514_mono.html"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('d', [s('declaration', '2021-11-26', 'LO, éditorial de N. Arthaud « Antilles : qui sème la misère récolte la colère ! »', 'https://journal.lutte-ouvriere.org/medias/journalnumero/fichiers/2021/11/LO2782.pdf')], 'faible : éditorial de 2021'),
            lfi: clear('a', [at(NFP, 'p.4, 23-24')], NOTE_NFP),
            pcf: clear('a', [at(NFP, 'p.4, bouclier qualité-prix pour les outre-mer')], 'faible : NFP 2024 seul, la base commune 2026 ne traite pas ce point'),
            eco: split(['a', 'b', 'c'], [at(ECO_PLATEFORME, 'chap. 3 IV')]),
            ps: clear('b', [at(PS_REFAIRE_SOCIETE, 'Outre-mer')], 'faible : diagnostic de vie chère nourrie par les monopoles, mesures non extraites'),
            ren: NC,
            modem: NC,
            hor: NC,
            lr: NC,
            udr: NC,
            rn: clear('c', [RN_CONTRE_BUDGET]),
            rec: NC,
        },
    },
    {
        id: 'cannabis',
        tier: 'affiner',
        theme: 'Drogues et cannabis',
        situation: "Un adulte de votre entourage consomme du cannabis. Dans votre commune, la vente de cette drogue fait vivre un trafic. Certains pays l'ont légalisée, d'autres la punissent plus sévèrement. Que faire ?",
        context: {
            text: "En Uruguay, une loi de 2013 confie à l'État le contrôle de la production et de la vente de cannabis. Au Portugal, l'usage de drogues est une infraction administrative, sans prison. En France, l'usage est un délit passible d'un an de prison ; il peut être sanctionné par une amende forfaitaire de 500 €. Au Japon, depuis décembre 2024, l'usage de cannabis est passible de 7 ans de prison.",
            sources: [
                s('autre', "2013-12-20", "IMPO (Uruguay), loi n° 19.172 « Regulación y control del cannabis » (en espagnol)", "https://www.impo.com.uy/bases/leyes/19172-2013"),
                s('autre', "2024-09-04", "Agence de l'Union européenne sur les drogues (EUDA), « Penalties for drug law offences at a glance » (en anglais)", "https://www.euda.europa.eu/publications/topic-overviews/content/drug-law-penalties-at-a-glance_en"),
                s('autre', "2026-08-21", "Service-public.gouv.fr, fiche F33341 « Que risque-t-on pour usage de drogues ? »", "https://www.service-public.gouv.fr/particuliers/vosdroits/F33341"),
                s('autre', "2024-12-12", "e-Gov (Japon), loi sur le contrôle des stupéfiants, articles 27 et 66-2 (en japonais)", "https://laws.e-gov.go.jp/law/328AC0000000014"),
            ],
        },
        options: [
            {
                id: 'a',
                label: 'Légaliser la production et la vente de cannabis, sous contrôle de l\'État.',
                explain: "Acheter du cannabis serait permis, dans des points de vente autorisés. L'État déciderait qui peut en cultiver et en vendre, et selon quelles règles.",
                cases: {
                    text: "En Uruguay, une loi a été promulguée, c'est-à-dire rendue officielle, le 20 décembre 2013. Elle confie à l'État le contrôle du cannabis : culture de la plante, production, vente et distribution. Un institut délivre les licences, c'est-à-dire les autorisations. Il enregistre les usagers et les personnes qui cultivent leur propre cannabis et l'ont déclaré. Il autorise aussi des clubs de cannabis.",
                    sources: [
                        s('autre', "2013-12-20", "IMPO (Uruguay), loi n° 19.172 « Regulación y control del cannabis », date de promulgation (en espagnol)", "https://www.impo.com.uy/bases/leyes/19172-2013"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Ne plus punir la consommation personnelle, sans organiser de vente légale.',
                explain: "Une personne qui consomme du cannabis pour elle-même ne risquerait plus ni prison ni amende. Produire et vendre du cannabis resteraient interdits.",
                cases: {
                    text: "Au Portugal, depuis le 1er juillet 2001, détenir des drogues pour sa consommation est une infraction administrative, sans prison. Depuis une loi de 2023, en détenir plus de dix jours de consommation moyenne n'est qu'un indice. Cet indice laisse penser que la drogue n'est pas pour soi, mais ne le prouve pas. Si l'usage personnel est démontré, les poursuites de la justice s'arrêtent. La personne est alors orientée vers une commission de dissuasion, chargée de décourager la consommation.",
                    sources: [
                        s('autre', "2016-03-15", "OFDT, note n° 2016-01 « Législations relatives à l'usage et à la détention de cannabis », note 10", "https://www.ofdt.fr/sites/ofdt/files/2023-11/field_media_document-4096-doc_num--explnum_id-22289-.pdf"),
                        s('autre', "2023-09-08", "Procuradoria-Geral Distrital de Lisboa, loi n° 30/2000, art. 2, version consolidée après la loi n° 55/2023 du 8 septembre 2023 (en portugais)", "https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=186&tabela=leis"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Garder la règle actuelle : interdiction et amende immédiate (amende forfaitaire) pour les consommateurs.',
                explain: "Consommer du cannabis resterait interdit. La police pourrait donner sur place une amende d'un montant fixé à l'avance ; une fois l'amende payée, il n'y aurait pas de procès.",
                cases: {
                    text: "En France, une loi du 23 mars 2019 permet de punir l'usage de drogues par une amende forfaitaire délictuelle. Son montant est fixé à l'avance, et elle vise un délit, une faute plus grave qu'une contravention. Elle a d'abord été testée en juin 2020. Elle a ensuite été étendue à tout le pays le 1er septembre 2020.",
                    sources: [
                        s('autre', "2021-04-01", "OFDT, Tendances n° 144 « Cinquante ans de réponse pénale à l'usage de stupéfiants (1970-2020) », avril 2021 (le 1er est utilisé)", "https://www.ofdt.fr/sites/ofdt/files/2023-08/field_media_document-3392-doc_num--explnum_id-31646-.pdf"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Durcir les sanctions contre les consommateurs comme contre les vendeurs.',
                explain: "Une personne qui consomme du cannabis risquerait une sanction plus lourde qu'aujourd'hui, tout comme les vendeurs : amende plus élevée ou prison plus longue.",
                cases: {
                    text: "Au Japon, depuis le 12 décembre 2024, consommer du cannabis est puni de 7 ans de prison au plus. La détention, c'est-à-dire le fait d'en posséder, est punie de la même peine. Si la détention vise à gagner de l'argent, la peine va de 1 à 10 ans de prison. Avant cette date, détenir du cannabis était puni de 5 ans de prison au plus.",
                    sources: [
                        s('autre', "2024-12-12", "e-Gov (Japon), loi sur les stupéfiants (麻薬及び向精神薬取締法), version en vigueur le 12/12/2024, art. 27, 66, 66-2 (en japonais)", "https://laws.e-gov.go.jp/law/328AC0000000014/20241212_505AC0000000084"),
                        s('autre', "2023-12-13", "e-Gov (Japon), loi sur le contrôle du cannabis (大麻取締法), version en vigueur le 13/12/2023, art. 24-2 (en japonais)", "https://laws.e-gov.go.jp/law/323AC0000000124/20231213_505AC0000000084"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('b', [at(LO_ASSOC, 'dossier « Drogue et société »')], 'faible : programme 2022, légalisation commerciale incertaine'),
            lfi: clear('a', [at(LFI_SYNTHESE, 'chap. 15')]),
            pcf: NC,
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 2 III')]),
            ps: clear('a', [at(PS_SECURITES, 'drogues')], 'légalisation sous contrôle de l\'État après une convention citoyenne'),
            ren: NC,
            modem: NC,
            hor: clear('d', [HOR_SURE, HOR_NARCO], 'faible : cannabis non traité en propre'),
            lr: NC,
            udr: NC,
            rn: NC,
            rec: NC,
        },
    },
    {
        id: 'petite-enfance',
        tier: 'affiner',
        theme: 'Familles et petite enfance',
        situation: "Une famille de votre entourage attend un bébé. Elle cherche un mode de garde et s'inquiète du coût de la vie. Que faire en priorité ?",
        options: [
            {
                id: 'a',
                label: 'Garantir par la loi une place d\'accueil à chaque enfant (crèche ou assistante maternelle).',
                explain: "La loi permettrait aux parents d'exiger des pouvoirs publics une place pour leur enfant, en crèche ou chez une assistante maternelle (personne autorisée à garder des enfants chez elle).",
                cases: {
                    text: "En Allemagne, depuis 2013, tout enfant de 1 à 3 ans a droit à une place de garde. Cette place peut être en crèche ou chez une assistante maternelle, une personne autorisée à garder des enfants. Ce droit est inscrit dans le code social allemand, livre VIII, article 24. Avant un an, l'enfant doit être accueilli, notamment si ses parents travaillent, étudient ou cherchent un emploi.",
                    sources: [
                        s('autre', "2024-04-26", "BMBFSFJ (ministère fédéral de la Famille, Allemagne), « Ausbau der Kindertagesbetreuung: Gesetze und Investitionsprogramme », 26 avril 2024 (en allemand)", "https://www.bmbfsfj.bund.de/bmbfsfj/themen/familie/kinderbetreuung/ausbau-der-kindertagesbetreuung-gesetze-und-investitionsprogramme-86394"),
                        s('autre', "1990-06-26", "Gesetze im Internet, Sozialgesetzbuch VIII, § 24 (page non datée ; date de la loi du 26 juin 1990 citée) (en allemand)", "https://www.gesetze-im-internet.de/sgb_8/__24.html"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Verser une allocation plus forte pour chaque enfant, dès le premier.',
                explain: "La famille recevrait chaque mois de la CAF (caisse d'allocations familiales) plus d'argent pour chaque enfant, y compris quand elle n'en a qu'un.",
                cases: {
                    text: "En Allemagne, une allocation appelée Kindergeld est versée pour chaque enfant, dès le premier. Elle ne dépend pas des revenus des parents. Au 1er janvier 2026, son montant est de 259 € par mois et par enfant. Elle est versée jusqu'aux 18 ans de l'enfant, et jusqu'à 25 ans s'il est en formation (études ou apprentissage).",
                    sources: [
                        s('autre', "2026-01-01", "BMBFSFJ (ministère fédéral de la Famille, Allemagne), « Kindergeld » (page datée du 01.01.2026) (en allemand)", "https://www.bmbfsfj.bund.de/bmbfsfj/themen/familie/familienleistungen/kindergeld"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Allonger et mieux payer les congés des parents après une naissance.',
                explain: "Chaque parent pourrait s'arrêter de travailler plus longtemps après une naissance, en touchant une part plus grande de son salaire pendant ce congé.",
                cases: {
                    text: "En France, depuis le 1er juillet 2026, chaque parent peut prendre un congé supplémentaire de naissance. Ce congé dure 1 ou 2 mois, au choix, en plus des congés déjà prévus après une naissance. Le premier mois, le parent touche 70 % de son salaire net, celui qu'il reçoit sur son compte. Le second mois, il touche 60 % de ce salaire. Chaque mois, la somme versée ne peut pas dépasser 4 005 €.",
                    sources: [
                        s('autre', "2026-06-03", "Service-public.gouv.fr, fiche F39685 « Congé supplémentaire de naissance d'un salarié du secteur privé » (vérifiée le 3 juin 2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F39685"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Baisser l\'impôt sur le revenu des familles avec enfants.',
                explain: "La famille paierait moins d'impôt sur le revenu, l'impôt payé chaque année sur ce que gagne le foyer. Cela concernerait les familles qui paient cet impôt.",
                cases: {
                    text: "En France, l'impôt sur le revenu tient compte des enfants par le quotient familial. Ce système divise les revenus du foyer en « parts » avant de calculer l'impôt. Un couple marié ou pacsé (lié par un Pacs, une union officielle) compte 2 parts. Chacun des deux premiers enfants ajoute une demi-part, puis chaque enfant à partir du troisième ajoute une part entière. La baisse d'impôt apportée par chaque demi-part ne peut pas dépasser 1 807 €.",
                    sources: [
                        s('autre', "2026-04-15", "Service-public.gouv.fr, fiche F2705 « Impôt sur le revenu - Quotient familial d'un couple marié ou pacsé » (vérifiée le 15 avril 2026, revenus 2025)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2705"),
                    ],
                },
            },
        ],
        programme: {
            lo: NC,
            lfi: clear('a', [at(NFP, 'p.9, 15')], NOTE_NFP),
            pcf: clear('b', [at(PCF_BASE, 'p.49'), PCF_ROUSSEL], 'faible : politique familiale universelle, sans mesure chiffrée'),
            eco: clear('c', [s('declaration', '2026-10-09', 'Public Sénat, politique familiale : que proposent les candidats', 'https://www.publicsenat.fr/actualites/politique/politique-familiale-allocations-creches-que-proposent-les-candidats-a-la-presidentielle')], 'faible : paraphrase de presse'),
            ps: clear('a', [at(PS_EPANOUIR, 'petite enfance')]),
            ren: clear('a', [at(REN_NOUVELLE_DONNE, 'p.29-30, droit opposable à la garde d\'enfants')]),
            modem: clear('b', [MODEM_BUDGET, MODEM_LIVRET]),
            hor: split(['b', 'd'], [HOR_ANNONCES]),
            lr: split(['b', 'c'], [RETAILLEAU_FAMILLE]),
            udr: clear('b', [UDR_JOURNEE]),
            rn: clear('d', [RN_CONTRE_BUDGET, at(RN_22_MESURES, 'n°8')]),
            rec: clear('d', [REC_TOUTSURMESFINANCES], NOTE_2022),
        },
    },
    {
        id: 'grand-age',
        tier: 'affiner',
        theme: 'Grand âge et dépendance',
        situation: 'Une personne âgée de votre entourage ne peut plus vivre seule. Une place en maison de retraite médicalisée (Ehpad) coûte souvent plus de 2 000 € par mois. Que faire en priorité ?',
        context: {
            text: "En 2019, la moitié des Ehpad faisaient payer plus de 2 004 € par mois pour une chambre seule (prix médian, analyse nationale de la CNSA publiée en 2021).",
            sources: [s('autre', '2021-04-01', 'CNSA, « Analyse statistique des prix 2019 des Ehpad » (avril 2021, mis en ligne en février 2024)', 'https://www.cnsa.fr/sites/default/files/2024-02/PUB_analyse_statistique_prix_2019_des_ehpad_vf.pdf')],
        },
        options: [
            {
                id: 'a',
                label: 'Faire payer la Sécurité sociale à 100 %, comme pour une affection de longue durée.',
                explain: "La Sécurité sociale paierait les frais liés au fait de ne plus pouvoir vivre seul, comme elle rembourse à 100 % les soins d'une maladie longue et grave.",
                cases: {
                    text: "En Écosse, une loi du 12 mars 2002 interdit en principe aux autorités locales de faire payer certains soins. Il s'agit des soins personnels : aide pour l'hygiène, pour les repas et pour les médicaments. Les soins infirmiers sont aussi concernés. Ces soins sont gratuits pour les adultes jugés éligibles, c'est-à-dire qui remplissent les conditions. D'autres aides et l'hébergement en établissement restent payants.",
                    sources: [
                        s('autre', "2002-03-12", "Parlement écossais, Community Care and Health (Scotland) Act 2002, art. 1 et annexe 1 (version d'origine), sanctionnée le 12 mars 2002 (en anglais)", "https://www.legislation.gov.uk/asp/2002/5/enacted"),
                        s('autre', "2026-03-09", "Gouvernement écossais, « Social care support » (page mise à jour le 9 mars 2026) (en anglais)", "https://www.gov.scot/policies/social-care/social-care-support/"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Créer un service public de l\'autonomie, qui gère des Ehpad et l\'aide à domicile.',
                explain: "Un service public, chargé des personnes qui ne peuvent plus vivre seules, gérerait lui-même des Ehpad (maisons de retraite médicalisées) et l'aide à domicile.",
                cases: {
                    text: "Au Danemark, les 98 communes financent l'aide aux personnes âgées avec l'argent des impôts. Depuis juillet 2025, la loi leur interdit de faire payer le travail du personnel d'aide à domicile. Elle les oblige aussi à proposer au moins deux prestataires au choix, c'est-à-dire deux organismes qui fournissent l'aide. Un seul de ces prestataires peut appartenir à la commune. En maison de retraite, le logement et les repas sont payants.",
                    sources: [
                        s('autre', "2017-01-01", "Ministère de la Santé du Danemark, « Healthcare in Denmark: an overview », version 1.2, ch. 1 et 5 (publication 2017, le 1er janvier est utilisé ; copie archivée) (en anglais)", "https://web.archive.org/web/20171206012627if_/http://www.sum.dk/Aktuelt/Publikationer/~/media/Filer%20-%20Publikationer_i_pdf/2016/Healthcare-in-dk-16-dec/Healthcare-english-V16-dec.ashx"),
                        s('autre', "2024-12-30", "Retsinformation (Danemark), Ældreloven, loi n° 1651 du 30 décembre 2024, §§ 18, 33 et 45 (en danois)", "https://www.retsinformation.dk/eli/lta/2024/1651"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Rendre obligatoire une assurance dépendance, incluse dans la complémentaire santé.',
                explain: "Chaque complémentaire santé (comme une mutuelle, qui rembourse en plus de la Sécurité sociale) devrait inclure une assurance qui verse de l'argent si l'on ne peut plus vivre seul.",
                cases: {
                    text: "En Allemagne, l'assurance dépendance, qui aide les personnes ne pouvant plus vivre seules, est obligatoire depuis le 1er janvier 1995. Elle est liée à l'assurance maladie principale, et non à une complémentaire. Les personnes couvertes par l'assurance maladie publique y sont inscrites. Les personnes couvertes par une assurance maladie privée prennent une assurance dépendance privée. Salariés et employeurs paient les cotisations (sommes prélevées sur les salaires), en grande partie à parts égales.",
                    sources: [
                        s('autre', "2026-09-14", "Ministère fédéral de la Santé (Allemagne), « Die Pflegeversicherung », Online-Ratgeber Pflege (page du 14 septembre 2026) (en allemand)", "https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung"),
                        s('autre', "1994-05-26", "Sozialgesetzbuch XI, § 1 (page non datée ; date de la loi du 26 mai 1994 citée) (en allemand)", "https://www.gesetze-im-internet.de/sgb_11/__1.html"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Miser d\'abord sur les proches, avec des aides publiques et un congé indemnisé pour les aidants.',
                explain: "La personne âgée serait d'abord aidée par ses proches (les aidants), qui recevraient des aides publiques. S'ils travaillent, ils pourraient s'arrêter un temps en touchant de l'argent.",
                cases: {
                    text: "En France, le congé de proche aidant existe depuis 2017. Il permet à un salarié de suspendre son travail pour aider un proche âgé ou ayant besoin d'aide au quotidien. Ce congé dure 3 mois par défaut, et 1 an au plus sur toute la carrière. L'allocation versée pendant ce congé est de 66,64 € par jour. Elle est versée 66 jours au plus pour chaque personne aidée.",
                    sources: [
                        s('autre', "2026-06-15", "Service-public.gouv.fr, « Congé de proche aidant » (page vérifiée le 15 juin 2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F16920"),
                    ],
                },
            },
        ],
        programme: {
            lo: clear('a', [at(LO_ASSOC, 'dossier « Handicap et dépendance »')], 'faible : programme 2022'),
            lfi: clear('b', [at(NFP, 'p.15, plan Grand âge')], 'faible : NFP 2024 seul, financement non précisé'),
            pcf: clear('a', [at(PCF_BASE, 'p.49')]),
            eco: clear('b', [at(ECO_PLATEFORME, 'chap. 2 I « Protéger le grand âge »')]),
            ps: clear('b', [at(PS_SECURITES, 'grand âge')]),
            ren: clear('c', [at(REN_NOUVELLE_DONNE, 'garantie dépendance dans le contrat santé responsable')], 'faible : le caractère obligatoire n\'est pas écrit'),
            modem: AMB,
            hor: NC,
            lr: NC,
            udr: NC,
            rn: clear('d', [at(RN_LIVRET_SANTE, 'p.14-17')], NOTE_2022),
            rec: AMB,
        },
    },
    {
        id: 'industrie-delocalisation',
        tier: 'affiner',
        theme: 'Emploi et industrie',
        situation: 'Une entreprise industrielle de votre région, qui a reçu des aides publiques, va produire à l\'étranger, où ses coûts sont plus bas. 300 emplois sont menacés. Que faire ?',
        context: {
            text: "Aujourd'hui, une entreprise peut licencier pour motif économique en cas de difficultés économiques, de mutations technologiques, de réorganisation nécessaire à la sauvegarde de sa compétitivité ou de cessation d'activité.",
            sources: [s('autre', "2018-04-01", "Code du travail, article L1233-3 (Code du travail numérique, version du 1er avril 2018)", "https://code.travail.gouv.fr/code-du-travail/l1233-3")],
        },
        options: [
            {
                id: 'a',
                label: 'Interdire les licenciements quand l\'entreprise fait des bénéfices, et exiger le remboursement des aides.',
                explain: "Une entreprise qui fait des bénéfices (elle gagne plus qu'elle ne dépense) ne pourrait pas licencier ces 300 salariés. Elle devrait aussi rendre l'argent public reçu.",
            },
            {
                id: 'b',
                label: 'Permettre à l\'État ou aux salariés de reprendre l\'entreprise, y compris par une nationalisation.',
                explain: "L'État ou les salariés pourraient devenir les nouveaux propriétaires de l'entreprise et poursuivre l'activité ici. Quand c'est l'État, on parle de nationalisation.",
            },
            {
                id: 'c',
                label: 'Baisser les impôts de production, payés même sans bénéfice, et simplifier les normes.',
                explain: "L'entreprise paierait moins d'impôts calculés sur son activité, ses locaux ou ses ventes, et non sur ses bénéfices. Les règles qu'elle doit respecter seraient plus simples.",
            },
            {
                id: 'd',
                label: 'Taxer les produits importés et réserver les achats publics aux entreprises françaises ou européennes.',
                explain: "Les produits venus d'autres pays seraient taxés à leur arrivée (droit de douane). L'État, les communes et les hôpitaux n'achèteraient qu'auprès d'entreprises françaises ou européennes.",
            },
        ],
        programme: {
            lo: clear('a', [
                s('programme-2022', '2022-03-22', 'Public Sénat, propositions emploi des candidats 2022', 'https://www.publicsenat.fr/actualites/politique/emploi-retrouvez-les-principales-propositions-des-candidats-a-la-presidentielle'),
                at(LO_BROCHURE, 'p.9-10'),
            ]),
            lfi: clear('a', [at(LFI_SYNTHESE, 'chap. 6 et 9'), at(NFP, 'p.18')]),
            pcf: split(['a', 'b'], [at(PCF_BASE, 'p.44-45')]),
            eco: clear('d', [at(ECO_PLATEFORME, 'chap. 1 II « Protéger et transformer l\'industrie »')]),
            ps: split(['b', 'd'], [at(PS_VIVRE_LIBRES, 'ch.3')]),
            ren: split(['c', 'd'], [REN_NOUVELLE_DONNE]),
            modem: clear('c', [MODEM_BUDGET, MODEM_LIVRET]),
            hor: clear('c', [HOR_PROSPERE]),
            lr: clear('c', [RETAILLEAU_INDUSTRIE]),
            udr: split(['c', 'd'], [at(UDR_ACTE_II, 'section « Supprimer les impôts de production » : CVAE, C3S et taxe sur les salaires'), at(UDR_PPLC, 'exposé des motifs')], 'faible : d est une priorité nationale dans les marchés publics, sans taxe à l\'import'),
            rn: split(['c', 'd'], [RN_CONTRE_BUDGET, at(RN_22_MESURES, 'n°18-19')], 'faible : d à moitié sourcée, priorité nationale sans taxe à l\'import'),
            rec: clear('c', [REC_PUBLICSENAT_2022, REC_KNAFO_IRDEME], NOTE_REC_2022_LIVRE),
        },
    },
    {
        id: 'discriminations-embauche',
        tier: 'affiner',
        theme: 'Discriminations et égalité',
        situation: 'Deux personnes ont le même diplôme et la même expérience. L\'une reçoit environ un tiers de réponses en moins, à cause de son nom. Que faire ?',
        context: {
            text: 'Dans un test sur 2 400 offres d\'emploi, les candidatures avec un nom évoquant une origine maghrébine ont été contactées 31,5 % moins souvent, à profil comparable.',
            sources: [s('autre', '2021-11-01', 'Dares Analyses n° 67, « Discrimination à l\'embauche des personnes d\'origine supposée maghrébine : quels enseignements d\'une grande étude par testing ? » (novembre 2021)', 'https://dares.travail-emploi.gouv.fr/sites/default/files/fc5a96e5fc19ccdcf46fd9d55339591b/Dares%20Analyses_testing_discrimination_embauche.pdf')],
        },
        options: [
            {
                id: 'a',
                label: 'Multiplier les contrôles par CV fictifs (testing) et sanctionner les entreprises qui discriminent.',
                explain: "Des contrôleurs enverraient plus souvent de faux CV (résumé d'un parcours), identiques sauf un détail comme le nom. Une entreprise qui écarte un candidat pour ce détail serait punie.",
                cases: {
                    text: "À Bruxelles, une ordonnance de 2017, c'est-à-dire une loi régionale, autorise les inspecteurs de l'emploi à tester les employeurs. Depuis 2025, cette règle figure dans le Code bruxellois de l'égalité. Les inspecteurs peuvent agir sous une fausse identité, avec deux candidatures semblables ou des appels mystères. Depuis juillet 2023, ils peuvent le faire même sans plainte. Si le test montre une différence de traitement, la discrimination est présumée, sauf preuve contraire, et peut être sanctionnée.",
                    sources: [
                        s('autre', "2017-11-21", "Moniteur belge (Justel), ordonnance bruxelloise du 16 novembre 2017 visant à lutter contre les discriminations en matière d'emploi, art. 2 (art. 4/3), publiée le 21 novembre 2017", "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2017111601&table_name=loi"),
                        s('autre', "2017-11-16", "Bruxelles Économie et Emploi, « Lutte contre la discrimination à l'embauche » (page non datée ; date de l'ordonnance du 16 novembre 2017 citée)", "https://economie-emploi.brussels/discrimination-recrutement"),
                        s('autre', "2023-06-29", "Moniteur belge (Justel), ordonnance bruxelloise du 1er juin 2023 portant modification de diverses dispositions visant à lutter contre les discriminations en matière d'emploi, art. 4, publiée le 29 juin 2023", "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2023060112&table_name=loi"),
                        s('autre', "2024-07-24", "Moniteur belge (Justel), décret et ordonnance conjoint du 23 mai 2024 portant le Code bruxellois de l'égalité, de la non-discrimination et de la promotion de la diversité, art. 34 et 46, publié le 24 juillet 2024", "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2024052318&table_name=loi"),
                    ],
                },
            },
            {
                id: 'b',
                label: 'Rendre le CV anonyme obligatoire dans les entreprises de plus de 50 salariés.',
                explain: "Le recruteur ne verrait ni le nom des candidats ni d'autres informations personnelles, comme la photo ou l'adresse. Ce serait obligatoire dans les entreprises de plus de 50 salariés.",
                cases: {
                    text: "En Belgique, selon le Sénat français (2009), l'administration fédérale (l'État belge) utilisait depuis 2005 le CV anonyme. Elle s'en servait pour recruter son personnel contractuel, c'est-à-dire ses agents sous contrat, non fonctionnaires. En France, une loi de 2006 l'imposait aux entreprises de 50 salariés et plus. Les décrets d'application, textes qui permettent d'appliquer une loi, n'ont pas été publiés. Depuis 2015, la loi prévoit seulement que le CV anonyme peut être pratiqué.",
                    sources: [
                        s('autre', "2009-12-01", "Sénat, « Le curriculum vitae anonyme », Documents de travail, Législation comparée n° LC 203 (décembre 2009 ; le 1er est utilisé)", "https://www.senat.fr/lc/lc203/lc203.pdf"),
                        s('autre', "2015-08-19", "Code du travail numérique, article L1221-7 (version mise à jour le 19 août 2015)", "https://code.travail.gouv.fr/code-du-travail/l1221-7"),
                    ],
                },
            },
            {
                id: 'c',
                label: 'Créer ou renforcer une autorité dédiée à l\'égalité, avec des moyens d\'enquête et un plan national.',
                explain: "Un organisme public chargé de l'égalité serait créé ou renforcé, avec des moyens pour enquêter sur ces cas. Un plan national fixerait des actions dans tout le pays.",
                cases: {
                    text: "En France, le Défenseur des droits, une autorité publique, traite notamment les cas de discrimination. Il ne peut pas sanctionner directement. Selon la loi organique de 2011, qui fixe son fonctionnement, il peut demander des explications. Il peut aussi faire venir la personne mise en cause et vérifier sur place. Si cette personne refuse de répondre, il peut saisir le juge, c'est-à-dire lui demander d'intervenir.",
                    sources: [
                        s('autre', "2023-09-28", "Défenseur des droits, « Protection des droits » (page du 28 septembre 2023)", "https://www.defenseurdesdroits.fr/protection-des-droits-372"),
                        s('autre', "2023-03-08", "Défenseur des droits, « Lutter contre les discriminations et promouvoir l'égalité » (page du 8 mars 2023)", "https://www.defenseurdesdroits.fr/lutter-contre-les-discriminations-et-promouvoir-legalite-185"),
                    ],
                },
            },
            {
                id: 'd',
                label: 'Garder la loi actuelle, qui punit déjà la discrimination, sans nouveau dispositif ni mesure ciblée.',
                explain: "Rien ne changerait : écarter un candidat pour son nom resterait puni de prison et d'amende. La personne pourrait porter plainte ou s'adresser au Défenseur des droits (autorité publique).",
                cases: {
                    text: "En France, refuser d'embaucher quelqu'un pour une raison discriminatoire, interdite par la loi, est puni. Pour une personne physique (un individu, pas une société), c'est jusqu'à 3 ans de prison et 45 000 € d'amende. La victime peut s'adresser gratuitement au Défenseur des droits, une autorité publique. Elle peut aussi porter plainte dans un délai de 6 ans.",
                    sources: [
                        s('autre', "2025-10-20", "Service-public.gouv.fr, « Discrimination au travail » (page vérifiée le 20 octobre 2025)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1642"),
                        s('autre', "2026-03-10", "Service-public.gouv.fr, « Discrimination » (page vérifiée le 10 mars 2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F19448"),
                    ],
                },
            },
        ],
        programme: {
            lo: NC,
            lfi: clear('c', [at(NFP, 'p.12, Commissariat à l\'égalité')], NOTE_NFP),
            pcf: clear('c', [at(NFP, 'p.12, Commissariat à l\'égalité')], 'faible : NFP 2024 seul, la base commune 2026 ne traite pas de l\'embauche'),
            eco: clear('c', [at(ECO_PLATEFORME, 'chap. 3 III')]),
            ps: split(['a', 'c'], [at(PS_REFAIRE_SOCIETE, 'anti-racisme')]),
            ren: clear('a', [at(REN_REGALIEN, 'p.64, testing en milieu professionnel')], 'faible : la moitié « sanctionner » n\'est pas dans le texte'),
            modem: clear('a', [ENSEMBLE_2024], NOTE_ENSEMBLE),
            hor: clear('a', [ENSEMBLE_2024], 'faible : plateforme de coalition Ensemble 2024, rien en 2027'),
            lr: NC,
            udr: NC,
            rn: AMB,
            rec: NC,
        },
    },
    {
        id: 'services-publics-proximite',
        tier: 'affiner',
        theme: 'Services publics de proximité',
        situation: 'Dans votre commune, le bureau de poste et un guichet pour les démarches (impôts, allocations), peu fréquentés, vont fermer. Les plus proches seront à 40 minutes de trajet. Que faire en priorité ?',
        options: [
            {
                id: 'a',
                label: 'Empêcher ces fermetures et recruter des agents : aucun habitant à plus de 30 minutes d\'un service public.',
                explain: "Le bureau de poste et le guichet resteraient ouverts, avec des agents recrutés en plus. Un service public serait toujours à 30 minutes au plus de chez soi.",
            },
            {
                id: 'b',
                label: 'Regrouper ces services dans un guichet unique France services, un par canton (groupe de communes).',
                explain: "Les habitants feraient leurs démarches dans un seul guichet France services par canton (groupe de communes), où des agents aident pour la poste, les impôts ou les allocations.",
            },
            {
                id: 'c',
                label: 'Donner plus de pouvoir et d\'argent aux élus locaux pour qu\'ils décident eux-mêmes.',
                explain: "Les élus locaux, comme le maire, recevraient plus d'argent et de pouvoirs. Ils choisiraient comment organiser les services proches des habitants.",
            },
            {
                id: 'd',
                label: 'Fermer les sites peu fréquentés et réorganiser le réseau, pour réduire les dépenses publiques.',
                explain: "Le bureau de poste et le guichet fermeraient, et le réseau de ces services serait réorganisé pour dépenser moins d'argent public. Les plus proches seraient à 40 minutes.",
            },
        ],
        programme: {
            lo: clear('a', [at(LO_ASSOC, 'dossier « déserts médicaux »'), LO_FETE], 'faible : texte de 2022 sur la santé de proximité, manque de moyens des services publics'),
            lfi: clear('a', [at(NFP, 'p.15'), LFI_RURALITES]),
            pcf: clear('a', [at(PCF_BASE, 'p.48-49')]),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 3 II et IV')]),
            ps: clear('a', [at(PS_REFAIRE_SOCIETE, 'services publics'), PS_PRIORITES], 'faible : extrait du Projet relu de façon automatisée, à confirmer mot à mot'),
            ren: clear('c', [FRANCEINFO_ZERO_DEFICIT, PUBLICSENAT_MEETING]),
            modem: clear('b', [MODEM_LIVRET, ENSEMBLE_2024]),
            hor: clear('c', [s('declaration', '2026-07-01', 'É. Philippe, « Élus de France, je nous appelle à croire en nous » (juillet 2026)', 'https://www.edouardphilippe.fr/pages/elus-de-france-je-nous-appelle-a-croire-en-nous')]),
            lr: NC,
            udr: AMB,
            rn: clear('a', [at(RN_22_MESURES, 'n°14-15')], NOTE_2022),
            rec: NC,
        },
    },
    {
        id: 'france-monde-commerce',
        tier: 'affiner',
        theme: 'Place de la France dans le monde',
        situation: 'Les États-Unis appliquent désormais des droits de douane de 15 % à la plupart des produits européens, dont le vin, le fromage ou le rhum français. Que faire ?',
        context: {
            text: "Depuis l'accord du 27 juillet 2025, les droits de douane américains sur la plupart des produits de l'UE sont plafonnés à 15 %.",
            sources: [s('autre', '2025-07-29', "Commission européenne, « L'accord commercial entre l'UE et les États-Unis expliqué »", 'https://france.representation.ec.europa.eu/informations/laccord-commercial-entre-lue-et-les-etats-unis-explique-2025-07-29_fr')],
        },
        options: [
            {
                id: 'a',
                label: 'Riposter avec l\'Union européenne, par exemple en taxant les grandes entreprises numériques américaines.',
                explain: "L'Union européenne, avec la France, taxerait à son tour des produits ou services américains. Par exemple, les grandes entreprises américaines d'internet paieraient une taxe en Europe.",
            },
            {
                id: 'b',
                label: 'Garder l\'accord actuel entre l\'Union européenne et les États-Unis, qui fixe ces droits à 15 %.',
                explain: "L'accord actuel serait gardé : le vin, le fromage et la plupart des produits européens resteraient taxés de 15 % au plus à leur entrée aux États-Unis (droit de douane).",
            },
            {
                id: 'c',
                label: 'Aider par des fonds nationaux les filières françaises touchées, sans attendre l\'Union européenne.',
                explain: "L'État français verserait de l'argent public aux entreprises des secteurs touchés, comme le vin, le fromage ou le rhum, sans attendre une décision commune des pays européens.",
            },
            {
                id: 'd',
                label: 'Développer le commerce avec d\'autres partenaires et prendre ses distances avec les États-Unis.',
                explain: "La France chercherait à vendre et à acheter davantage avec d'autres pays. Elle suivrait moins souvent les choix des États-Unis.",
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('d', [LFI_OTAN], 'faible : seule la moitié « distances avec les États-Unis » de d est sourcée'),
            pcf: clear('d', [at(PCF_BASE, 'p.30-32')], 'faible : seule la moitié « distances avec les États-Unis » de d est sourcée'),
            eco: clear('a', [at(ECO_PLATEFORME, 'chap. 1 II « Réencastrer le marché »')], 'faible : « dénoncer puis renégocier l\'accord » ne correspond exactement à aucune option'),
            ps: AMB,
            ren: clear('a', [at(REN_NOUVELLE_DONNE, 'droits de douane de 15 % et taxe européenne sur les grandes entreprises numériques')]),
            modem: clear('a', [at(MODEM_LIVRET, 'section 1 C')], 'faible : intérêts de l\'Union primant sur les intérêts nationaux, texte de 2024'),
            hor: NC,
            lr: AMB,
            udr: AMB,
            rn: AMB,
            rec: NC,
        },
    },
    {
        id: 'retraites-age',
        tier: 'affiner',
        theme: 'Retraites (âge de départ)',
        situation: "Deux proches, nés en 1966 et 2000, peuvent partir à la retraite dès 63 ans et 3 mois et dès 64 ans, selon la loi actuelle. Que faire de l'âge de départ ?",
        context: {
            text: "Pour les salariés du privé, l'âge minimum de départ dépend de l'année de naissance : 62 ans et 9 mois (nés de 1963 à mars 1965), 63 ans (avril à décembre 1965), puis 3 mois de plus par année, jusqu'à 64 ans dès 1969.",
            sources: [s('autre', '2026-08-14', "Service-public.gouv.fr, « À partir de quel âge un salarié peut-il partir en retraite ? » (page vérifiée le 14 août 2026)", 'https://www.service-public.gouv.fr/particuliers/vosdroits/F14043')],
        },
        options: [
            {
                id: 'a',
                label: "Abaisser à 60 ans l'âge légal de départ à la retraite.",
                explain: "L'âge légal est l'âge minimum fixé par la loi pour partir. Chacun pourrait partir dès 60 ans. Les pensions seraient versées plus longtemps : il faudrait plus d'argent pour les payer (cotisations, impôts ou économies ailleurs).",
            },
            {
                id: 'b',
                label: "Annuler la réforme de 2023 et abaisser l'âge légal de départ à 62 ans.",
                explain: "L'âge minimum fixé par la loi redeviendrait celui d'avant 2023 : 62 ans, et moins pour certaines carrières longues ou pénibles. Les pensions seraient versées plus longtemps : il faudrait plus d'argent pour les payer (cotisations, impôts ou économies ailleurs).",
            },
            {
                id: 'c',
                label: "Garder la règle actuelle : l'âge légal monte jusqu'à 64 ans pour les personnes nées en 1969 ou après.",
                explain: "Rien ne changerait : l'âge minimum fixé par la loi continuerait de monter selon l'année de naissance, jusqu'à 64 ans. Les départs anticipés actuels resteraient possibles (carrière commencée tôt, handicap...).",
            },
            {
                id: 'd',
                label: "Relever peu à peu l'âge de départ à la retraite jusqu'à 65 ans.",
                explain: "Il faudrait attendre 65 ans pour partir, sauf carrière commencée tôt, métier pénible ou mauvaise santé. Les pensions seraient versées moins longtemps : il faudrait moins d'argent pour les payer (cotisations, impôts ou économies ailleurs).",
            },
            {
                id: 'e',
                label: "Supprimer l'âge légal de départ : seule compterait la durée de cotisation pour calculer la pension.",
                explain: "La loi ne fixerait plus d'âge minimum pour partir. Partir tôt, avec peu d'années comptées pour la retraite, donnerait une pension plus faible ; partir plus tard donnerait une pension plus forte.",
            },
        ],
        programme: {
            lo: clear('a', [LO_RETRAITE_2022, at(LO_BROCHURE, 'p.5')], 'faible : 60 ans et 37,5 annuités comme « premier objectif » en 2022 ; la brochure 2027 dénonce le recul de l\'âge sans fixer d\'âge'),
            lfi: clear('a', [at(LFI_SYNTHESE, 'chap. 8 « Garantir une retraite digne »'), FRANCEINFO_DEBAT], '60 ans pour tous, après un premier retour à 62 ans (« dans un premier temps à 62 ans »)'),
            pcf: clear('a', [at(PCF_BASE, 'p.49'), at(PCF_ROUSSEL, 'p.4')]),
            eco: split(['a', 'b'], [at(ECO_PROGRAMME, 'p.116, chap. 31, mesure 1'), FRANCEINFO_RETRAITES], 'b : retour immédiat à 62 ans ; a : objectif de 60 ans, en priorité pour les carrières commencées tôt ou pénibles'),
            ps: clear('b', [at(PS_VIVRE_LIBRES, 'ch.1 « Pouvoir profiter de sa retraite »'), LCP_PRIMAIRE_PS, at(PP_ACTE_UN, 'p.43')], 'le candidat (Acte un) abroge la réforme de 2023 sans faire de l\'âge légal le centre de sa réforme'),
            ren: clear('e', [ATTAL_BLOIS, FRANCEINFO_RETRAITES]),
            modem: NC,
            hor: clear('d', [HOR_PROSPERE, FRANCEINFO_RETRAITES]),
            lr: AMB,
            udr: clear('c', [JDD_CIOTTI, ENTREVUE_CIOTTI], 'faible : entretien ; 64 ans n\'est chiffré que par Entrevue'),
            rn: clear('b', [RN_FRANCE24, FRANCEINFO_DEBAT, JDN_LE_PEN_RETRAITES, at(RN_PROJET_2024, 'p.14 (page 8 du PDF)'), at(RN_LIVRET_ENTREPRISE, 'p.44 (page 23 du PDF)')], 'M. Le Pen, candidate : 62 ans, 60 ans pour qui a commencé avant 20 ans ; J. Bardella a plaidé pour l\'abandon de la mesure d\'âge de départ (Journal du Net, 28 août 2026)'),
            rec: split(['c', 'd'], [REC_BFMTV, FRANCEINFO_RETRAITES, at(REC_PUBLICSENAT_2022, '64 ans')], 'faible : « 64 voire 65 ans » (É. Zemmour, BFMTV, 17 septembre 2026), propos rapportés par la presse ; 64 ans au programme 2022'),
        },
        votes: { scrutins: [468], mapping: { pour: 'c', contre: 'b', abstention: null } },
    },
    {
        id: 'petits-entrepreneurs',
        tier: 'affiner',
        theme: 'Travail indépendant (protection, cotisations)',
        situation: 'Une personne de votre entourage travaille sans être salariée : artisan, commerçant, micro-entrepreneur ou livreur via une application. Elle paie elle-même ses cotisations, qui financent sa santé et sa retraite. Que faire en priorité ?',
        context: {
            text: "Fin 2024, 4,3 millions de personnes exercent une activité non salariée en France. En 2025, 13,5 % des personnes en emploi ont le statut d'indépendant pour leur emploi principal.",
            sources: [
                s('autre', '2026-06-30', "Insee Première n° 2114, « Les revenus d'activité des non-salariés en 2024 » (30 juin 2026)", 'https://www.insee.fr/fr/statistiques/9013403'),
                s('autre', '2026-07-02', 'Insee Références, « Statuts d\'emploi » (2 juillet 2026)', 'https://www.insee.fr/fr/statistiques/8733045'),
            ],
        },
        options: [
            {
                id: 'a',
                label: 'Présumer salariés les livreurs, chauffeurs et autres travailleurs des plateformes, sauf si la plateforme prouve le contraire.',
                explain: "Les livreurs et chauffeurs qui passent par une application seraient considérés comme salariés, avec salaire minimum, congés et chômage. La plateforme paierait les cotisations d'employeur, sauf si elle prouve qu'ils sont indépendants.",
            },
            {
                id: 'b',
                label: "Créer une caisse de protection pour les indépendants aux petits revenus, payée aussi par leurs entreprises clientes et l'État.",
                explain: "Une caisse spéciale protégerait les indépendants qui vivent de leur seule activité, avec peu de revenus. Ils en paieraient la moitié. Les entreprises et plateformes qui les font travailler, et l'État, paieraient le reste.",
            },
            {
                id: 'c',
                label: 'Permettre aux indépendants qui le veulent de cotiser pour avoir droit aux allocations chômage.',
                explain: "Un indépendant pourrait choisir de payer une cotisation de plus. En échange, il toucherait des allocations chômage s'il arrête son activité. Il paierait lui-même cette protection.",
            },
            {
                id: 'd',
                label: 'Baisser les cotisations sociales payées par les indépendants.',
                explain: "Les indépendants paieraient moins de cotisations sociales et garderaient plus de ce qu'ils gagnent. La protection sociale recevrait moins, sauf si l'État compense.",
            },
            {
                id: 'e',
                label: 'Garder les règles actuelles de cotisations et de protection des indépendants.',
                explain: "Rien ne changerait : les indépendants paieraient les mêmes cotisations sociales et auraient la même protection qu'aujourd'hui pour leur santé et leur retraite.",
            },
        ],
        programme: {
            lo: clear('a', [LO_UBER_2024, LO_LIVREURS_2026], 'faible : soutient la reconnaissance des livreurs comme salariés et critique le rejet de la directive, sans proposer de loi ; rien sur artisans et commerçants'),
            lfi: clear('a', [LFI_PRESOMPTION, at(LFI_SYNTHESE, 'chap. 8 « Un emploi stable pour chacun »')]),
            pcf: clear('a', [at(PCF_BASE, 'p.7 (discours de clôture de F. Roussel), p.24 et p.40')]),
            eco: clear('a', [at(ECO_PROGRAMME, 'p.58, chap. 14, mesure 8')]),
            ps: split(['a', 'b'], [at(PS_VIVRE_LIBRES, 'ch.1')]),
            ren: clear('c', [at(REN_NOUVELLE_DONNE, 'p.23, plan « Tous entrepreneurs »')]),
            modem: clear('d', [at(MODEM_BUDGET, 'section 3')], 'faible : mesure du groupe pour le budget 2026, cotisations des « indépendants les plus modestes » seulement'),
            hor: NC,
            lr: NC,
            udr: NC,
            rn: clear('d', [at(RN_CONTRE_BUDGET, 'annexe p.7, annulation de la réforme de l\'ACRE')], 'faible : seule mesure relevée, l\'aide aux créateurs d\'entreprise (ACRE), contre-budget 2026 du groupe'),
            rec: clear('d', [REC_PUBLICSENAT_2022], 'faible : programme 2022 ; baisse de la CSG des indépendants, pas strictement des cotisations'),
        },
    },
    {
        id: 'pme-croissance',
        tier: 'affiner',
        theme: 'Entreprises qui grandissent (seuils de 11 et 50 salariés)',
        situation: 'Vous travaillez peut-être dans une entreprise de 45 salariés, ou la dirigez. À 50, les missions des élus du personnel s\'élargissent ; après cinq ans s\'ajoute la participation aux bénéfices. Que faire en priorité ?',
        context: {
            text: "La participation est obligatoire après 5 ans à 50 salariés. Depuis 2025, de 11 à 49 salariés, un bénéfice d'au moins 1 % du chiffre d'affaires 3 ans de suite impose : participation, intéressement, abondement d'épargne salariale ou prime.",
            sources: [s('autre', '2026-07-21', 'Service-public.gouv.fr, fiche F2141 « Participation » (page vérifiée le 21 juillet 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2141')],
        },
        options: [
            {
                id: 'a',
                label: "Étendre à toutes les entreprises l'obligation de partager une part des bénéfices avec les salariés (participation, intéressement ou prime).",
                explain: "Toutes les entreprises, même les plus petites, devraient reverser à leurs salariés une part de leurs bénéfices (ce qu'elles gagnent après leurs dépenses), par exemple sous forme de prime. Les propriétaires en garderaient moins.",
            },
            {
                id: 'b',
                label: "Relever les seuils d'effectif (11, 50 salariés) ou retarder les obligations qui en découlent.",
                explain: "Les obligations prévues à 50 salariés viendraient à 100 ou 250, ou après 5 ans. À 100, la participation ne serait plus obligatoire de 50 à 99 salariés. Les élus du personnel n'arriveraient qu'à 50, sauf accord d'entreprise.",
            },
            {
                id: 'c',
                label: 'Renforcer les pouvoirs des représentants des salariés et rétablir un comité santé-sécurité (CHSCT) dès 50 salariés.',
                explain: "Les représentants élus par les salariés pourraient bloquer ou retarder certaines décisions, comme des licenciements. Dès 50 salariés, un comité dédié suivrait la santé et la sécurité au travail. L'employeur aurait plus d'obligations.",
            },
            {
                id: 'd',
                label: "Garder la règle actuelle : mêmes seuils de 11 et 50 salariés, mêmes obligations qu'aujourd'hui.",
                explain: "Rien ne changerait : un comité social et économique (CSE) élu dès 11 salariés ; dès 50, des missions plus larges pour lui, et la participation obligatoire après 5 ans. Employeurs et salariés garderaient les mêmes règles.",
            },
        ],
        programme: {
            lo: AMB,
            lfi: clear('c', [at(LFI_SYNTHESE, 'chap. 3, droit de veto suspensif des comités d\'entreprise'), LFI_CHSCT]),
            pcf: clear('c', [at(PCF_BASE, 'p.40, 44-45'), PCF_MJCF_SANTE], 'faible : nouveaux pouvoirs des représentants dans la base commune ; CHSCT seulement dans un texte du MJCF publié par le PCF'),
            eco: clear('c', [at(ECO_PROGRAMME, 'p.60, chap. 15, mesure 3')]),
            ps: clear('c', [at(PS_VIVRE_LIBRES, 'ch.1'), at(PP_ACTE_UN, 'p.41')], 'règle « 1 € de dividende = 1 € de participation » dès 10 salariés, plus étroite que a'),
            ren: clear('a', [at(REN_NOUVELLE_DONNE, 'p.23, partage de la valeur')]),
            modem: clear('a', [at(MODEM_LIVRET, 'section « Bien vivre de son travail »'), MODEM_SOLIDARITES], 'faible : textes de 2024 et page non datée, aucun programme 2027'),
            hor: NC,
            lr: clear('b', [RETAILLEAU_100_REGLES, at(LR_PRODUIRE, 'p.10, règles n° 2 et 5')]),
            udr: clear('b', [at(UDR_ACTE_I, 'p.53')], 'texte du groupe (2025) : seuil de 50 porté à 250 salariés'),
            rn: clear('b', [at(RN_LIVRET_ENTREPRISE, 'p.25 (page 13 du PDF)')], 'faible : programme 2022 mis à jour en 2024 ; délai de 5 ans étendu à toutes les obligations, sans relèvement des seuils'),
            rec: NC,
        },
    },
];
