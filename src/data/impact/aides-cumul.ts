import { at, both, clear, hasAid, hasChildren, note, programme, s, singleParent } from '../impactHelpers.ts';
import type { Aid, Measure, Profile } from '../impactTypes.ts';

const MS2025 = s('autre', '2025-12-04', 'DREES, Minima sociaux et prestations de solidarité, édition 2025', 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/Drees-Pano-MS%202025.pdf');

const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const RN_BOURSORAMA = s('declaration', '2026-10-06', 'Boursorama (Reuters), « Marine Le Pen veut ramener le déficit budgétaire à 3% d’ici 2030 »', 'https://www.boursorama.com/actualite-economique/actualites/marine-le-pen-veut-ramener-le-deficit-budgetaire-a-3-d-ici-2030-e234d02e0ea563e2766ea6142c4a1bdc');
const RETAILLEAU_PLAFOND = s('programme-2027', '2026-09-11', 'Projet Retailleau, mesure 28 « Plafonner les aides sociales à 70 % du SMIC » (mise à jour du 11 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/plafonner-les-aides-sociales-a-70-du-smic');
const RETAILLEAU_RIA = s('programme-2027', '2026-09-11', 'Projet Retailleau, mesure 26 « Permettre à ceux qui reprennent un emploi de gagner plus » (mise à jour du 11 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/faire-gagner-plus-a-ceux-qui-reprennent-un-emploi');
const LR_COMPTES_PUBLICS = s('programme-2027', '2026-10-12', 'Projet Retailleau, fiches presse « Rétablir l’ordre dans les comptes publics » (12 octobre 2026)', 'https://www.avecretailleau.fr/api/media/file/20261011_Fiches_presse_comptes_publics_mise_en_page%20(1).pdf');
const LR_TRAVAIL = s('programme-2027', '2025-12-01', 'Brochure LR « Le travail gagnant » (décembre 2025)', 'https://republicains.fr/wp-content/uploads/2026/01/51705_LesRepublicains_Brochures_A5-40P_DEF.pdf');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société »', 'https://projet-socialiste.fr/projet/refaire-societe/');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');

// Social aids in the profile vocabulary; unemployment insurance (are) is an insurance income, not an aid
const SOCIAL_AIDS: Aid[] = ['apl', 'pa', 'rsa', 'aah', 'af', 'css', 'cheque-energie'];

// Aids counted in the 70 % cap: disability (aah) and unemployment insurance are left out of it
const CAPPED_AIDS: Aid[] = ['apl', 'pa', 'rsa', 'af', 'css', 'cheque-energie'];
const cappedCount = (p: Profile): number => p.aids.filter(a => CAPPED_AIDS.includes(a)).length;

const CAP_WHY = 'Selon le total de vos aides, inconnu ici : inchangées, ou réduites au-delà d’environ 1 035 € par mois et par adulte.';

export const measure: Measure = {
    id: 'aides-cumul',
    theme: 'Solidarité',
    title: 'Prime d’activité et cumul des aides : fusion et plafond',
    context: note(
        'Fin 2024, 1,84 million de foyers touchaient le RSA, 4,81 millions la prime d’activité et 5,8 millions une aide au logement, chaque aide ayant son propre calcul.',
        at(MS2025, 'fiches 23, 30 et 34'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder des aides séparées (RSA, prime d’activité, aides au logement), chacune avec son barème.',
            explain: 'Le RSA, la prime d’activité et les aides au logement gardent chacun leurs règles et leur montant, calculés séparément.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Fusionner le RSA, la prime d’activité et d’autres aides en une allocation sociale unique.',
            explain: 'Plusieurs aides seraient remplacées par une seule allocation, avec un seul calcul. Les aides incluses et les montants dépendraient du barème choisi, que la mesure ne fixe pas.',
            effects: [
                {
                    when: p => hasAid(p, 'rsa', 'pa'),
                    direction: 'mixed',
                    weight: 2,
                    why: 'Votre montant dépendrait du barème de la nouvelle allocation, que la mesure ne fixe pas : il pourrait monter ou baisser.',
                },
                {
                    when: p => hasAid(p, 'apl'),
                    direction: 'mixed',
                    weight: 1,
                    why: 'Votre aide au logement ne changerait que si elle entrait dans l’allocation unique, ce que les propositions ne précisent pas toutes.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Plafonner le total des aides non contributives à 70 % du SMIC net par adulte.',
            explain: 'Le total des aides versées sans cotisation préalable (RSA, aides au logement, aides locales) ne dépasserait pas environ 1 035 € par mois et par adulte. Handicap, dépendance et vieillesse seraient exclus.',
            effects: [
                {
                    when: p => hasAid(p, 'rsa') && singleParent(p),
                    direction: 'loss',
                    weight: 3,
                    why: 'Le total de vos aides serait plafonné à environ 1 035 € par mois et par adulte, seuil plus vite atteint avec des enfants.',
                },
                {
                    when: p => hasAid(p, 'rsa'),
                    direction: 'mixed',
                    weight: 1,
                    why: CAP_WHY,
                },
                {
                    when: p => hasAid(p, 'apl', 'pa', 'af', 'css', 'cheque-energie') && (hasChildren(p) || cappedCount(p) >= 2),
                    direction: 'mixed',
                    weight: 1,
                    why: CAP_WHY,
                },
            ],
        },
        {
            id: 'd',
            label: 'Verser automatiquement les aides auxquelles on a droit, sans démarche.',
            explain: 'Les aides seraient calculées et versées d’office, à partir des revenus déjà connus de l’administration, sans demande à faire.',
            effects: [
                {
                    when: p => hasAid(p, ...SOCIAL_AIDS),
                    direction: 'gain',
                    weight: 1,
                    why: 'Vos aides seraient calculées et versées sans démarche, à partir des revenus déjà connus de l’administration.',
                },
                {
                    when: p => p.income !== null && p.income <= 1 && p.status !== null && p.aids.every(a => a === 'are'),
                    direction: 'gain',
                    weight: 1,
                    why: 'Si vous avez droit à une aide sans l’avoir demandée, elle vous serait versée sans démarche.',
                },
            ],
        },
    ],
    programme: programme({
        eco: clear('d', [at(ECO_PROGRAMME, 'proposition 32-4, p.119')]),
        ps: clear('d', [at(PS_REFAIRE_SOCIETE, 'pauvreté'), at(PP_ACTE_UN, 'p.53, « Automatiser l’accès aux droits »')]),
        modem: clear('b', [at(MODEM_BUDGET, 'p.5')], 'le dossier ne précise pas quelles aides seraient fusionnées'),
        lr: both(['b', 'c'], [
            RETAILLEAU_PLAFOND,
            RETAILLEAU_RIA,
            at(LR_COMPTES_PUBLICS, 'fiche 8, « Revenu d’incitation à l’activité, fusionnant RSA, prime d’activité et ASS » et « Compte social unique »'),
            at(LR_TRAVAIL, 'p.14 et 29'),
        ], 'proposés ensemble : b = revenu d’incitation fusionnant RSA, prime d’activité et ASS, hors aides au logement ; c = plafond à 70 % du SMIC net par adulte'),
        udr: both(['b', 'c', 'd'], [
            at(UDR_ACTE_II, 'p.43, « regrouper toutes les aides sociales en une seule allocation versée […] de manière automatique », « plafonnée à 70 % du SMIC net par individu »'),
            at(UDR_ACTE_II, 'p.7, « Allocation sociale unique »'),
        ], 'texte du groupe (avril 2025) : RSA, prime d’activité, ASS et aides diverses ; AAH hors plafond ; aides au logement non nommées'),
        rn: clear('b', [RN_BOURSORAMA], 'faible : presse seulement (annonce du 6 octobre 2026), aides fusionnées non précisées'),
    }),
};
