import { at, both, clear, hasAid, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// Positions partly reused from the quiz question `outre-mer-vie-chere` (questions.ts), sources reopened
// on 2026-10-16. Quiz a (price cap) is c here, quiz b (competition in import and retail) is e, quiz c
// (octroi de mer) is b, quiz d stays d.
// LO is not covered: its 2021 editorial asks for wage rises indexed on prices, nationally, not for wages
// and minimum benefits set on the local cost of living (option d), and no 2025-2026 text confirms it.
// Renaissance, Horizons and LR are not covered: their representatives back an "adaptation" of the octroi
// de mer (Outremers360, 28 August 2026) without saying whether it would be lowered.

const INSEE_PRIX_DOM = s('autre', '2023-07-11', 'Insee Première n° 1958 (11 juillet 2023)', 'https://www.insee.fr/fr/statistiques/7648939');
const CCOMPTES_OCTROI = s('autre', '2024-03-01', 'Cour des comptes, « L\'octroi de mer » (rapport d\'évaluation, mars 2024 ; le 1er est utilisé)', 'https://www.ccomptes.fr/sites/default/files/2024-03/20240305-L-octroi-de-mer.pdf');

const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (publiée le 17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const PCF_2022_MOYEN2 = s('programme-2022', '2022-01-01', 'Programme du PCF, « moyen 2 » (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/moyen_2');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société » (lu via archive.org, copie du 6 octobre 2026)', 'https://projet-socialiste.fr/projet/refaire-societe/');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_OCTROI = s('declaration', '2025-11-06', 'Communiqué du RN « Pour la refonte juste et courageuse de l\'octroi de mer ! »', 'https://rassemblementnational.fr/communiques/pour-la-refonte-juste-et-courageuse-de-loctroi-de-mer');
const OUTREMERS360_REF = s('declaration', '2026-08-28', 'Outremers360, « Présidentielle 2027 : à la REF, les représentants des candidats confrontés aux revendications des patrons ultramarins »', 'https://outremers360.com/bassin-atlantique-appli/presidentielle-2027-a-la-ref-les-representants-des-candidats-confrontes-aux-revendications-des-patrons-ultramarins');

const outremer = (p: Profile): boolean => p.zone === 'outremer';

export const measure: Measure = {
    id: 'outremer-octroi',
    theme: 'Outre-mer',
    title: 'Octroi de mer et prix des produits de base en Outre-mer',
    context: note(
        'En 2022, les prix étaient de 9 % à 16 % plus élevés dans les départements d\'Outre-mer qu\'en métropole, et de 30 % à 42 % pour l\'alimentation. La même année, l\'octroi de mer a rapporté 1 644 M€ aux collectivités de ces cinq territoires, soit 765 € par habitant, et 32 % en moyenne des produits de gestion des communes.',
        INSEE_PRIX_DOM,
        CCOMPTES_OCTROI,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder l\'octroi de mer, qui finance les communes, et le bouclier qualité-prix négocié.',
            explain: 'L\'octroi de mer taxe surtout les produits venus d\'ailleurs et finance les communes. Chaque année, le préfet négocie avec les magasins le prix d\'un panier de produits courants.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Baisser l\'octroi de mer sur une partie des produits importés, en compensant les collectivités.',
            explain: 'Certains produits venus d\'ailleurs ne paieraient plus l\'octroi de mer, ou moins. Les produits qui concurrencent la production locale resteraient taxés. Les communes recevraient une compensation pour leurs recettes perdues.',
            effects: [
                { when: outremer, direction: 'gain', weight: 2, why: 'Une partie des produits importés serait moins taxée ; la baisse en magasin dépendrait de ce que les distributeurs répercutent.' },
            ],
        },
        {
            id: 'c',
            label: 'Plafonner par la loi les prix d\'une liste de produits de base.',
            explain: 'Une loi fixerait un prix maximum pour certains produits du quotidien, comme des aliments de base. Les magasins ne pourraient pas les vendre plus cher.',
            effects: [
                { when: p => outremer(p) && p.status === 'patron', direction: 'mixed', weight: 1, why: 'Vous paieriez moins cher ces produits ; si votre activité en vend, leur prix de vente serait plafonné.' },
                { when: outremer, direction: 'gain', weight: 2, why: 'Le prix de certains produits de base, surtout alimentaires, ne pourrait plus dépasser un plafond fixé par la loi.' },
            ],
        },
        {
            id: 'd',
            label: 'Augmenter salaires et minima sociaux selon le coût de la vie local.',
            explain: 'Les salaires et les aides versées aux personnes aux revenus faibles (minima sociaux, comme le RSA) seraient plus élevés là où la vie coûte plus cher. Le montant n\'est pas fixé.',
            effects: [
                { when: p => outremer(p) && p.status === 'patron', direction: 'loss', weight: 2, why: 'Les salaires que vous versez augmenteraient selon le coût de la vie local ; le montant n\'est pas fixé.' },
                { when: p => outremer(p) && hasAid(p, 'rsa', 'aah', 'pa'), direction: 'gain', weight: 3, why: 'Vos aides (RSA, AAH ou prime d\'activité) seraient relevées selon le coût de la vie local ; le montant n\'est pas fixé.' },
                { when: p => outremer(p) && p.status === 'salarie', direction: 'gain', weight: 2, why: 'Votre salaire serait relevé selon le coût de la vie local ; le montant n\'est pas fixé.' },
            ],
        },
        {
            id: 'e',
            label: 'Faire jouer le droit de la concurrence contre les monopoles d\'importation et de distribution, et contrôler les marges.',
            explain: 'L\'État agirait contre les positions dominantes des importateurs et des distributeurs, et contrôlerait leurs marges. Aucun prix ne serait fixé par la loi.',
            effects: [
                // No price or margin level is set, so the effect on shelf prices is open
                { when: outremer, direction: 'mixed', weight: 1, why: 'Les prix en magasin pourraient baisser si la concurrence progresse ; l\'ampleur dépendrait des importateurs et des distributeurs.' },
            ],
        },
    ],
    programme: programme({
        lfi: clear('c', [at(LFI_SYNTHESE, 'chap. 7 « En finir avec l\'abandon des Outre-mer », encadrement des prix'), at(OUTREMERS360_REF, 'P. Gaillard pour J.-L. Mélenchon : encadrement des prix, réforme mais pas suppression de l\'octroi de mer')]),
        pcf: both(['b', 'c'], [at(PCF_2022_MOYEN2, '« abaisser les taxes sur les produits de première nécessité, sans pénaliser les collectivités qui ne doivent plus dépendre de l\'octroi de mer »'), at(NFP, 'p.4, bloquer les prix des biens de première nécessité et renforcer le bouclier qualité-prix pour les outre-mer')], 'faible : b = programme 2022 ; c = programme commun NFP 2024'),
        eco: both(['c', 'e'], [at(ECO_PROGRAMME, 'p.63, chap. 16, mesure 1 (encadrer les prix d\'un panier de biens essentiels ; renforcer le bouclier qualité-prix)'), at(ECO_PROGRAMME, 'p.152, chap. 46, mesure 1 (règles anti-trust contre les monopoles, contrôles sur les marges)')], 'le blocage des prix alimentaires n\'est envisagé qu\'en cas d\'inflation anormale ; veut aussi « réformer » l\'octroi de mer, sans dire dans quel sens'),
        ps: both(['c', 'e'], [at(PP_ACTE_UN, 'p.65, « Plafonner les prix des biens de première nécessité et des produits essentiels, pour aller au-delà du bouclier qualité-prix »'), at(PS_REFAIRE_SOCIETE, 'Outre-mer, « régulation des monopoles et des importations : renforcer les contrôles sur les marges »')]),
        rn: clear('b', [RN_OCTROI, at(RN_CONTRE_BUDGET, 'annexe, « Réforme de l\'octroi de mer » parmi les baisses de recettes (0,289 Md€)'), at(OUTREMERS360_REF, 'A. Rougé pour M. Le Pen')], 'exonérer les produits français et européens, taxer seulement ceux qui concurrencent la production locale, compenser intégralement les collectivités'),
    }),
};
