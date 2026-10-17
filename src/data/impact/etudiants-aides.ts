import { at, both, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure } from '../impactTypes.ts';

const SIES_BOURSIERS = s('autre', '2026-10-01', 'MESRE-SIES, Note Flash n°23 « Les boursiers sur critères sociaux en 2025-2026 » (octobre 2026, le 1er du mois est utilisé)', 'https://www.enseignementsup-recherche.gouv.fr/sites/default/files/2026-09/2026-09_NF_SIES_23_Boursiers%202025-2026.pdf');

// Parties
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const PCF_PROGRAMME_2022 = s('programme-2022', '2022-01-01', 'Programme du PCF, objectif 3 (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/objectif_3');
const PCF_CLOTURE = s('declaration', '2026-07-15', 'Discours de clôture de F. Roussel, 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-11', 'Projet socialiste « Refaire société » (mis en ligne le 11 juin 2026)', 'https://projet-socialiste.fr/projet/refaire-societe/');
const PS_SEPANOUIR = s('programme-2027', '2026-06-11', 'Projet socialiste « S’épanouir à égalité » (mis en ligne le 11 juin 2026)', 'https://projet-socialiste.fr/projet/sepanouir-a-egalite/');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const LCP_RN_JEUNES = s('declaration', '2026-10-06', 'LCP, mesures de M. Le Pen pour les jeunes (conférence de presse du 6 octobre 2026)', 'https://lcp.fr/actualites/permis-de-conduire-gratuit-exoneration-d-impot-jusqu-a-30-ans-comment-le-rn-veut');

export const measure: Measure = {
    id: 'etudiants-aides',
    theme: 'Jeunesse',
    title: 'Aides aux étudiants : bourses selon les parents ou allocation d’autonomie',
    context: note(
        'En 2025-2026, 656 000 étudiants reçoivent une bourse sur critères sociaux, soit 34,5 % des étudiants des formations éligibles. Selon les revenus et les charges de la famille, elle va de 145 à 634 € par mois.',
        at(SIES_BOURSIERS, 'p.1'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder les bourses sur critères sociaux, selon le revenu des parents.',
            explain: 'L’étudiant reçoit une bourse si les revenus de ses parents sont assez bas. Son montant dépend de ces revenus et des charges de la famille. Certains projets revalorisent ou réforment ce barème, sans montant fixé.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Verser une allocation d’autonomie à tous les étudiants, sans condition de revenu des parents.',
            explain: 'Chaque étudiant recevrait une somme chaque mois pendant ses études, que ses parents soient aisés ou modestes.',
            effects: [
                { when: p => p.status === 'etudiant', direction: 'gain', weight: 3, why: 'Vous recevriez une allocation chaque mois pendant vos études, quel que soit le revenu de vos parents.' },
                { when: p => p.childAges.includes('student'), direction: 'gain', weight: 1, why: 'Votre enfant étudiant recevrait une allocation, quel que soit le revenu de votre foyer.' },
            ],
        },
        {
            id: 'c',
            label: 'Ouvrir dès 18 ans un minimum social (garantie ou revenu d’autonomie) aux jeunes, sous condition de ressources.',
            explain: 'Un jeune aux ressources faibles pourrait toucher une allocation mensuelle avant 25 ans, âge d’accès au RSA aujourd’hui. Les montants proposés varient, de 50 % du SMIC net à un niveau supérieur au seuil de pauvreté.',
            effects: [
                // Housed by someone else: probably still attached to the parents' tax household, which some projects exclude
                { when: p => p.age === 'a18' && p.income === 0 && p.household === 'seul' && p.housing !== null && p.housing !== 'heberge', direction: 'gain', weight: 2, why: 'Avec de faibles ressources, vous pourriez toucher une allocation avant 25 ans, l’âge d’accès au RSA aujourd’hui.' },
                { when: p => p.status === 'etudiant', direction: 'mixed', weight: 2, why: 'Une allocation serait versée sous condition de ressources, les vôtres ou celles de vos parents selon les projets ; le seuil n’est pas fixé.' },
                { when: p => p.age === 'a18' && p.income === 0 && p.household === 'seul', direction: 'mixed', weight: 1, why: 'Vous pourriez toucher une allocation avant 25 ans si vous n’êtes plus rattaché au foyer fiscal de vos parents, ou selon leurs revenus.' },
            ],
        },
        {
            id: 'd',
            label: 'Créer une prime d’activité pour les étudiants qui travaillent.',
            explain: 'Un étudiant qui a un emploi recevrait chaque mois une prime en plus de son salaire.',
            effects: [
                { when: p => p.status === 'etudiant', direction: 'gain', weight: 2, why: 'Si vous travaillez pendant vos études, vous pourriez toucher une prime d’activité réservée aux étudiants.' },
            ],
        },
    ],
    programme: programme({
        lfi: clear('c', [at(LFI_SYNTHESE, 'chap. 5, « La garantie d’autonomie au-dessus du seuil de pauvreté pour les étudiants détachés du foyer fiscal »')], 'garantie d\'autonomie au-dessus du seuil de pauvreté pour les étudiants détachés du foyer fiscal'),
        pcf: clear('b', [
            at(PCF_PROGRAMME_2022, 'proposition 37, « Un revenu, fixé à 850 euros par mois, pour tous les étudiants et toutes les étudiantes »'),
            at(PCF_CLOTURE, 'p.11, « une allocation autonomie pendant les études »'),
        ], 'montant et universalité dans le programme 2022, confirmés par le discours de juillet 2026 (allocation d’autonomie pendant les études, sans montant)'),
        eco: both(['a', 'c'], [at(ECO_PROGRAMME, 'p.126, ch. 35-3 (bourses) et 35-2, p.119, ch. 32-1 (garantie d\'autonomie à 50 % du SMIC net dès 18 ans)')], 'proposés ensemble : bourses « revalorisées et refondues » pour les jeunes rattachés à leur famille ; garantie d’autonomie pour les jeunes indépendants fiscalement'),
        ps: clear('c', [
            at(PS_SEPANOUIR, '« une Allocation d’Autonomie dès 18 ans, pour tous les jeunes en études ou en transition vers l’emploi, conditionnée aux revenus parentaux », lu via archive.org (6 octobre 2026)'),
            at(PS_REFAIRE_SOCIETE, '« Mettre fin à la grande pauvreté », revenu d’autonomie pour les 18-25 ans, lu via archive.org (6 octobre 2026)'),
        ], 'allocation d\'autonomie dès 18 ans pour les jeunes en études ou en transition vers l’emploi, conditionnée aux revenus des parents'),
        ren: clear('a', [at(REN_NOUVELLE_DONNE, 'p.42-43, « Aller au bout de la réforme des bourses »')], 'bourses gardées et réformées : barème au quotient familial, aide au logement intégrée'),
        rn: clear('d', [LCP_RN_JEUNES]),
    }),
};
