import { at, both, clear, isWorking, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

const drives = (p: Profile): boolean => p.car === 'quotidien' || p.car === 'occasionnel';

// Social leasing 2026: a job (over 10 km from home by car, or over 8 000 km a year for work) and an RFR
// per part <= 16 880 €. The profile has no RFR: a band ceiling of 1 800 € net per adult is a rough proxy,
// and "8 000 km or more" stands for the commute condition.
const leasingEligible = (p: Profile): boolean =>
    isWorking(p)
    && drives(p)
    && (p.kilometres === 'mid' || p.kilometres === 'high')
    && p.income !== null && p.income <= 1
    && (p.household === 'seul' || (p.household === 'couple' && p.partnerIncome !== null && p.partnerIncome <= 1));

const MALUS_CO2 = s('autre', '2026-02-21', 'Service-public, fiche F35947 « Malus CO2 » (vérifiée le 21 février 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F35947');
const MALUS_POIDS = s('autre', '2026-03-01', 'Service-public, fiche F35950 « Malus au poids » (vérifiée le 1er mars 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F35950');
const LEASING = s('autre', '2026-07-16', 'Ministère de la Transition écologique, « Leasing social » (mis à jour le 16 juillet 2026)', 'https://www.ecologie.gouv.fr/leasing-social');
const CC_ZFE = s('autre', '2026-05-21', 'Conseil constitutionnel, décision n° 2026-903 DC, § 58 à 64', 'https://www.conseil-constitutionnel.fr/decision/2026/2026903DC.htm');

// Parties
const LFI_ZFE_2025 = s('declaration', '2025-04-03', 'Communiqué du groupe LFI-NFP, « ZFE - À la simplification économique nous préférons la planification écologique ! »', 'https://lafranceinsoumise.fr/2025/04/03/zfe-a-la-simplification-economique-nous-preferons-la-planification-ecologique/');
const LFI_ZFE_2026 = s('declaration', '2026-05-22', 'La France insoumise, « Les zones à faible émission font leur retour, et toujours sans alternative »', 'https://lafranceinsoumise.fr/2026/05/22/les-zones-a-faible-emission-font-leur-retour-et-toujours-sans-alternative/');
const PCF_CAHIER_MOBILITE = s('programme-2027', '2025-12-18', 'PCF, cahier thématique « Mobilité » des Jours heureux (mis en ligne le 18 décembre 2025)', 'https://assets.nationbuilder.com/pcf/pages/36198/attachments/original/1766073432/document_-_cahier_mobilite_ppp.pdf');
const PCF_AUTO = s('declaration', '2026-10-14', 'PCF, « Produire en France et répondre aux besoins » (CommunisteS n°1104)', 'https://www.pcf.fr/produire_en_france_et_repondre_aux_besoins');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-11', 'Projet socialiste « Vivre libres » (mis en ligne le 11 juin 2026)', 'https://projet-socialiste.fr/projet/vivre-libres/');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const ATTAL_RTL = s('declaration', '2026-09-25', 'Site de campagne de G. Attal, « Sur RTL : « Je suis candidat pour gagner cette élection présidentielle » »', 'https://attalpresident.fr/actualites/gabriel-attal-sur-rtl-je-suis-candidat-pour-gagner-cette-election-presidentielle');
const LCP_ZFE = s('declaration', '2026-10-09', 'LCP, niche du RN sur la suppression des ZFE (séance du 8 octobre 2026)', 'https://lcp.fr/actualites/zfe-le-rn-ne-parvient-pas-a-faire-voter-leur-suppression-lors-de-sa-niche-parlementaire');
const UDR_ACTE_I = s('motion', '2025-04-10', 'Livret du groupe UDR « Acte I du Grand Forum des Libertés » (PDF du 10 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3524/attachments/original/Livret_Acte_I_Grand_Forum_des_Liberte%CC%81s_compressed.pdf?1744280025');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');
const REC_TOUTSURMESFINANCES = s('programme-2022', '2022-01-01', 'Toutsurmesfinances, programme d\'É. Zemmour 2022 (mis à jour le 4 septembre 2025)', 'https://www.toutsurmesfinances.com/argent/a/eric-zemmour-programme');
const REC_MONTAIGNE_2022 = s('programme-2022', '2022-01-01', 'Institut Montaigne, programme d\'É. Zemmour 2022 (ZFE)', 'https://www.institutmontaigne.org/presidentielle-2022/eric-zemmour/mettre-fin-aux-interdictions-de-circuler-en-ville-en-fonction-du-type-de-vehicule');

export const measure: Measure = {
    id: 'vehicule-malus-zfe',
    theme: 'Transport',
    title: 'Malus automobile, location sociale de voitures électriques et zones à faibles émissions',
    context: note(
        'En 2026, le malus frappe les voitures neuves dès 108 g de CO2 par km et dès 1 500 kg. La location sociale, relancée le 16 juillet 2026, vise au moins 50 000 ménages modestes, pour 200 € par mois au plus. La suppression des ZFE votée en 2026 a été censurée par le Conseil constitutionnel le 21 mai 2026 : elles restent dans la loi.',
        MALUS_CO2, MALUS_POIDS, LEASING, CC_ZFE,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder malus (108 g, 1 500 kg), location sociale d’environ 50 000 voitures par an, ZFE.',
            explain: 'Une voiture neuve polluante ou lourde reste taxée à l’achat. Des ménages modestes qui travaillent peuvent louer une voiture électrique à prix réduit. Les zones à faibles émissions (ZFE) restent prévues par la loi.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Supprimer les ZFE ; selon les projets, supprimer aussi la hausse annuelle prévue du malus.',
            explain: 'Les zones où les voitures anciennes les plus polluantes sont interdites disparaîtraient. Selon les projets, le malus sur les voitures neuves ne suivrait plus la hausse prévue chaque année.',
            effects: [
                { when: p => drives(p) && p.zone === 'tendue', direction: 'gain', weight: 2, why: 'Votre voiture pourrait circuler dans votre agglomération quel que soit son âge.' },
                { when: p => drives(p) && p.zone === 'detendue', direction: 'gain', weight: 1, why: 'Si votre agglomération a une ZFE, votre voiture pourrait y circuler quel que soit son âge.' },
                // No effect for the malus part: it is in one project only, and the profile does not say whether a new car is bought
            ],
        },
        {
            id: 'c',
            label: 'Ouvrir à beaucoup plus de ménages une voiture électrique à petit prix, en location sociale ou prêt à taux zéro.',
            explain: 'Selon les projets, jusqu’à un million de voitures électriques seraient proposées aux ménages modestes, pour environ 100 € par mois, en location ou avec un prêt sans intérêts.',
            effects: [
                { when: leasingEligible, direction: 'gain', weight: 2, why: 'Avec un revenu modeste et une voiture pour aller travailler, vous auriez plus de chances d’obtenir une voiture électrique à petit prix.' },
            ],
        },
        {
            id: 'd',
            label: 'Laisser chaque collectivité décider de sa ZFE, avec des aides pour changer de voiture.',
            explain: 'Chaque ville ou agglomération choisirait de créer ou non une zone interdite aux voitures anciennes les plus polluantes. Des aides publiques seraient prévues pour changer de véhicule.',
            effects: [
                { when: p => drives(p) && (p.zone === 'tendue' || p.zone === 'detendue'), direction: 'mixed', weight: 1, why: 'Selon le choix de votre agglomération, une ZFE existerait ou non ; des aides aideraient à changer de voiture.' },
            ],
        },
        {
            id: 'e',
            label: 'Suspendre les ZFE tant qu’il n’existe pas d’alternative à la voiture, et aider à changer de véhicule.',
            explain: 'Les zones à faibles émissions seraient mises en pause tant que transports en commun et autres solutions ne sont pas proposés. Des aides à la transition seraient rétablies pour les ménages les plus modestes.',
            effects: [
                { when: p => drives(p) && p.zone === 'tendue', direction: 'gain', weight: 2, why: 'Votre voiture ancienne pourrait continuer à circuler dans votre agglomération tant que des alternatives n’existent pas.' },
                { when: p => drives(p) && p.zone === 'detendue', direction: 'gain', weight: 1, why: 'Si votre agglomération a une ZFE, votre voiture ancienne pourrait y circuler tant que des alternatives n’existent pas.' },
            ],
        },
    ],
    programme: programme({
        lfi: clear('e', [
            at(LFI_ZFE_2026, 'proposition de loi « visant à suspendre les ZFE tant que des alternatives à la voiture ne sont pas proposées »'),
            at(LFI_ZFE_2025, '« instaurer un moratoire sur les ZFE conditionné au développement d’alternatives » ; « réinstaurer des aides à la transition »'),
        ], 'malus non abordé'),
        pcf: clear('c', [
            at(PCF_CAHIER_MOBILITE, 'p.17, location sociale « trop restreinte » ; prêt à taux zéro « ouvert à une large partie des ménages »'),
            at(PCF_AUTO, '« 1 million de petits véhicules électriques par an […] en prêt à taux zéro à 100 euros par mois »'),
        ], 'prêt à taux zéro plutôt que location ; malus « plus sévère avec les très gros véhicules » sans seuil ; ZFE jugées « bien souvent injustes socialement » (p.12), sans demande de suppression'),
        eco: clear('c', [at(ECO_PROGRAMME, 'p.23, ch. 3-1 (location sociale d’un million de véhicules) ; p.66 et p.108')], 'veut aussi un malus au poids dès 1 300 kg (p.66), qu’aucune option ne porte ; ZFE gardées « en modifiant les conditions » (p.108 : aides, dérogations pour petits rouleurs et professionnels)'),
        ps: clear('c', [
            at(PS_VIVRE_LIBRES, 'ch. 2 « Se déplacer », « mise en location d’1 million de véhicules accessibles à 100 euros par mois », lu via archive.org (6 octobre 2026)'),
            at(PP_ACTE_UN, 'p.16, « déploiement à grande échelle du leasing social »'),
        ], 'malus au poids non abordé'),
        ren: both(['c', 'd'], [
            at(REN_NOUVELLE_DONNE, 'p.65 « Rétablir les ZFE pour les collectivités volontaires » et « L’extension du leasing social » ; p.63, location sociale étendue aux voitures d’occasion'),
            at(ATTAL_RTL, '« l’amplification du leasing social »'),
        ], 'proposés ensemble ; location sociale centrée sur les voitures électriques d’occasion, sans nombre fixé'),
        lr: clear('b', [at(LCP_ZFE, 'groupe de la Droite républicaine, « par la voix d’Alexandre Portier »')], 'faible : position du groupe rapportée par la presse ; malus non abordé'),
        udr: clear('b', [at(UDR_ACTE_I, 'p.43, « supprimant le ZAN, les ZFE » ; p.7')], 'texte du groupe (2025) ; malus non abordé'),
        rn: clear('b', [LCP_ZFE, at(RN_CONTRE_BUDGET, '« Suppression hausse malus Auto »'), RN_BARDELLA_FETE]),
        rec: clear('b', [at(REC_TOUTSURMESFINANCES, 'transports, « la fin des zones à faibles émissions (ZFE) »'), REC_MONTAIGNE_2022], 'faible : programme 2022, sans confirmation de 2025-2026 ; malus non abordé'),
    }),
};
