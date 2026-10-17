import { at, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure } from '../impactTypes.ts';

const PLFSS27_ANNEXE4 = s('autre', '2026-10-09', 'PLFSS 2027, annexe 4 « Exonérations et exemptions de cotisations » (date du fichier PDF)', 'https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/PLFSS/2027/PLFSS2027-Annexe4-VDEF.pdf');

// Parties
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const FRANCEINFO_DEBAT = s('declaration', '2026-08-27', 'franceinfo, premier débat des principaux candidats (Medef)', 'https://www.franceinfo.fr/elections/presidentielle/dette-publique-retraites-reindustrialisation-ce-qu-il-faut-retenir-du-premier-debat-des-principaux-candidats-a-la-presidentielle_8165342.html');
const PCF_CAHIER_SECU = s('programme-2027', '2025-12-18', 'PCF, cahier thématique « Sécurité sociale » des Jours heureux (mis en ligne le 18 décembre 2025)', 'https://assets.nationbuilder.com/pcf/pages/36196/attachments/original/1766073347/document_-_cahier_se%CC%81cu_v2.pdf');
const PCF_FRANCHISES = s('declaration', '2026-07-23', 'PCF, « Franchises médicales : le gouvernement choisit de faire payer les malades » (F. Roussel)', 'https://www.pcf.fr/franchises_le_gouvernement_fait_payer_les_malades');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-11', 'Projet socialiste « Refaire société » (mis en ligne le 11 juin 2026)', 'https://projet-socialiste.fr/projet/refaire-societe/');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const ATTAL_BATIMENT = s('declaration', '2026-09-29', 'Site de campagne de G. Attal, « Gabriel Attal veut libérer l’accès au logement et relancer le secteur du bâtiment »', 'https://attalpresident.fr/actualites/gabriel-attal-veut-liberer-l-acces-au-logement-et-relancer-le-secteur-du-batiment');
const MODEM_FESNEAU = s('declaration', '2026-10-15', 'MoDem, M. Fesneau (président du groupe Les Démocrates), « Rien ne serait pire que de ne pas avoir de budget », entretien aux Échos relayé par le MoDem', 'https://www.mouvementdemocrate.fr/nos-parlementaires/marc-fesneau-rien-ne-serait-pire-que-de-ne-pas-avoir-de-budget-image-8524-image');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const HOR_ANNONCES = s('declaration', '2026-10-08', '« Trois principales annonces d\'Édouard Philippe à l\'Heure de vérité »', 'https://www.edouardphilippe.fr/actualites/trois-principales-annonces-dedouard-philippe-a-lheure-de-verite');
const RETAILLEAU_INDUSTRIE = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème industrie-entreprises (février à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/industrie-entreprises');
const RETAILLEAU_ZERO_COTISATION = s('programme-2027', '2026-09-11', 'Projet Retailleau, mesure 25 « Exonérer totalement les heures supplémentaires de cotisations sociales » (mise à jour du 11 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/rapprocher-le-brut-du-net-avec-le-seuil-zero-cotisation');
const LR_COMPTES_PUBLICS = s('programme-2027', '2026-10-12', 'Projet Retailleau, fiches presse « Rétablir l’ordre dans les comptes publics » (12 octobre 2026)', 'https://www.avecretailleau.fr/api/media/file/20261011_Fiches_presse_comptes_publics_mise_en_page%20(1).pdf');
const RN_PROJET_2024 = s('plateforme-2024', '2024-06-25', 'Projet de gouvernement du RN, législatives 2024 (PDF du 25 juin 2024)', 'https://rassemblementnational.fr/documents/202406-programme.pdf');
const RN_22_MESURES = s('programme-2022', '2022-01-01', 'Les 22 mesures du RN (2022)', 'https://rassemblementnational.fr/22-mesures');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');

export const measure: Measure = {
    id: 'allegements-patronaux',
    theme: 'Employeurs',
    title: 'Allègements de cotisations patronales sur les salaires jusqu’à 3 SMIC',
    context: note(
        'Les allègements généraux de cotisations patronales ont coûté 65,0 Md€ aux régimes de base de la Sécurité sociale en 2025. Depuis le 1er janvier 2026, une réduction unique et dégressive s’applique aux salaires inférieurs à 3 SMIC ; le PLFSS 2027 garde son barème calculé sur le SMIC du 1er janvier 2026.',
        at(PLFSS27_ANNEXE4, 'p.22-23, tableau 6 et p.36'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder la réduction dégressive jusqu’à 3 SMIC (réforme de 2026).',
            explain: 'Au niveau du SMIC, l’employeur ne paie presque aucune cotisation. La réduction diminue quand le salaire monte et s’arrête à 3 SMIC. En 2027, son barème resterait calculé sur le SMIC du 1er janvier 2026.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Supprimer les allègements au-delà de 1,6 SMIC et conditionner les autres à des hausses de salaire.',
            explain: 'Au-dessus de 1,6 SMIC, l’employeur paierait toutes ses cotisations. En dessous, il ne garderait la réduction qu’en augmentant les salaires inférieurs à 2 000 € net.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'loss', weight: 3, why: 'Vos cotisations augmenteraient sur les salaires au-dessus de 1,6 SMIC ; les autres réductions dépendraient de hausses de salaire.' },
                { when: p => p.status === 'patron', direction: 'loss', weight: 2, why: 'Vos cotisations augmenteraient sur les salaires au-dessus de 1,6 SMIC ; les autres réductions dépendraient de hausses de salaire.' },
                { when: p => p.status === 'salarie' && p.income !== null && p.income <= 2, direction: 'mixed', weight: 1, why: 'Si vous gagnez moins de 2 000 € net, votre employeur ne garderait la réduction qu’en vous augmentant ; l’effet dépend de sa réponse.' },
            ],
        },
        {
            id: 'c',
            label: 'Baisser encore les cotisations patronales, et selon les projets les supprimer au-delà d’un seuil d’heures travaillées.',
            explain: 'L’employeur paierait moins de cotisations sur les salaires. Selon les projets, aucune cotisation, patronale voire salariale, ne serait due au-delà d’un seuil : 35 ou 37 heures par semaine, ou 1 623 heures par an.',
            effects: [
                { when: p => p.status === 'patron', direction: 'gain', weight: 2, why: 'Vos cotisations patronales baisseraient ; selon les projets, elles ne seraient plus dues au-delà d’un seuil d’heures travaillées.' },
                // mixed: depends on the project and on hours worked, which the profile does not give
                { when: p => p.status === 'salarie', direction: 'mixed', weight: 1, why: 'Selon les projets, vos heures au-delà d’un seuil seraient aussi sans cotisations salariales, voire sans impôt, si votre entreprise allonge la durée du travail.' },
            ],
        },
        {
            id: 'd',
            label: 'Exonérer de cotisations patronales les hausses de salaire.',
            explain: 'Quand un employeur augmente un salaire, il ne paierait pas de cotisations sur la hausse.',
            effects: [
                { when: p => p.status === 'patron', direction: 'gain', weight: 2, why: 'Si vous augmentez vos salariés, vous ne paieriez pas de cotisations patronales sur la hausse.' },
            ],
        },
        {
            id: 'e',
            label: 'Réduire une partie des allègements et conditionner les autres à des engagements d’emploi ou de salaire.',
            explain: 'Selon les projets, les allègements seraient supprimés sur une partie des salaires (par exemple entre 2 et 3,5 SMIC) ou réservés aux employeurs qui embauchent ou augmentent les salaires. Seuils et conditions ne sont pas fixés.',
            effects: [
                { when: p => p.status === 'patron', direction: 'mixed', weight: 2, why: 'Vos cotisations pourraient augmenter sur une partie des salaires, ou dépendre de vos embauches et hausses de salaire ; seuils non fixés.' },
                { when: p => p.status === 'salarie', direction: 'mixed', weight: 1, why: 'Votre employeur pourrait devoir embaucher ou augmenter les salaires pour garder ses allègements ; l’effet sur votre paie dépend de sa réponse.' },
            ],
        },
    ],
    programme: programme({
        lfi: clear('e', [
            at(LFI_SYNTHESE, 'chap. 6, « Conditionner les aides publiques aux entreprises à des contreparties sociales et écologiques »'),
            at(FRANCEINFO_DEBAT, 'J.-L. Mélenchon, « plus aucune aide [aux entreprises] sans contrepartie »'),
            at(NFP, 'p.16, « moduler les cotisations sociales patronales » ; p.18, « Conditionner les aides aux entreprises »'),
        ], 'faible : conditionnalité des aides publiques en général, sans que les allègements de cotisations soient nommés ; modulation des cotisations dans le texte commun NFP 2024'),
        pcf: clear('e', [
            at(PCF_CAHIER_SECU, 'p.39, « suppression progressive des exonérations de cotisations patronales », à « conditionner […] à des conditions précises effectives de création d’emplois »'),
            at(PCF_FRANCHISES, '« remettre en cause les dizaines de milliards d’euros d’exonérations de cotisations patronales »'),
        ], 'suppression progressive et conditionnée à l’emploi, sans seuil chiffré'),
        eco: clear('b', [at(ECO_PROGRAMME, 'p.67, ch. 17-10 « Supprimer les exonérations de cotisations inutiles car supérieures à 1,6 smic » ; p.55, ch. 13-3')]),
        ps: clear('e', [at(PS_REFAIRE_SOCIETE, '« Supprimer les exonérations sociales qui n’ont pas d’effet sur l’emploi, entre 2 et 3,5 SMIC », lu via archive.org (6 octobre 2026)')], 'suppression entre 2 et 3,5 SMIC, pour 11 Md€ par an'),
        ren: clear('c', [
            at(REN_NOUVELLE_DONNE, 'p.14, « une baisse du coût du travail […] grâce à une réforme des allégements de charges sociales »'),
            at(FRANCEINFO_DEBAT, 'G. Attal, « revenir sur ces hausses du coût du travail qui sont intervenues depuis 2024 »'),
            at(ATTAL_BATIMENT, 'opposition à « toute nouvelle augmentation du coût du travail »'),
        ], 'aucune mesure sur les heures au-delà d’un seuil'),
        modem: clear('a', [at(MODEM_FESNEAU, '« nous soutenions déjà la réforme des allégements de charge. Cette année, nous sommes pour leur neutralisation face à l’inflation »')], 'soutient la réforme de 2026 et le gel de son barème ; « à terme, il faudra baisser le coût du travail »'),
        hor: clear('c', [
            at(HOR_PROSPERE, '« zéro cotisation patronale au-delà de la 37ème heure »'),
            at(HOR_ANNONCES, 'heures au-delà de 35 heures « défiscalisées et exonérées de cotisation », « plus une seule cotisation pour les entreprises au-delà de 37 heures »'),
        ]),
        lr: clear('c', [
            at(RETAILLEAU_INDUSTRIE, 'FAQ, « plus de 25 milliards d\'euros d\'allègements sur le coût du travail »'),
            at(LR_COMPTES_PUBLICS, 'fiche 14, « Cotisations patronales sur toute l’échelle des salaires »'),
            at(RETAILLEAU_ZERO_COTISATION, 'au-delà de 1 623 heures par an, « plus aucune cotisation sociale, ni salariale ni patronale »'),
        ]),
        rn: clear('d', [
            at(RN_PROJET_2024, 'p.8, augmenter les salaires de 10 % jusqu’à trois fois le SMIC, en les exonérant de l’augmentation des cotisations patronales pendant trois à cinq ans'),
            at(RN_22_MESURES, 'n°5'),
            at(RN_BARDELLA_FETE, '« une fiscalité incitative, à augmenter les salaires »'),
        ], 'exonération pendant trois à cinq ans (projet de 2024) ; le discours de 2026 ne la chiffre pas'),
    }),
};
