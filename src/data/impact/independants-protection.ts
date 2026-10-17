import { at, both, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// Positions reused from the quiz question `petits-entrepreneurs` (questions.ts), sources reopened on
// 2026-10-16. Quiz c (voluntary unemployment insurance) is b here, quiz d (lower contributions) is c,
// quiz b (fund for low-income self-employed) is d, quiz a (platform workers presumed employees) is e.
// Reconquête is not covered: its 2022 programme lowers the CSG, not the contributions of option c.

const INSEE_NON_SALARIES = s('autre', '2026-06-30', 'Insee Première n° 2114, « Les revenus d\'activité des non-salariés en 2024 » (30 juin 2026)', 'https://www.insee.fr/fr/statistiques/9013403');
const F37353 = s('autre', '2026-02-21', 'Entreprendre.service-public.gouv.fr, fiche F37353, cotisations du micro-entrepreneur (page vérifiée le 21 février 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F37353');
const F23994 = s('autre', '2026-04-01', 'Entreprendre.service-public.gouv.fr, fiche F23994, allocation des travailleurs indépendants (page vérifiée le 1er avril 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23994');

const LO_UBER_2024 = s('declaration', '2024-02-21', 'Lutte ouvrière n°2899, « Uber, Deliveroo : le soutien des gouvernements »', 'https://www.lutte-ouvriere.org/portail/journal/2024-02-21-uber-deliveroo-le-soutien-des-gouvernements_729469.html');
const LO_LIVREURS_2026 = s('declaration', '2026-04-28', 'Lutte ouvrière n°3013, « Livreurs à vélo : l\'esclavage moderne »', 'https://lutte-ouvriere.org/journal/article/livreurs-velo-lesclavage-moderne-193894.html');
const LFI_PRESOMPTION = s('declaration', '2026-09-22', 'Communiqué du groupe LFI, « Le gouvernement refuse de transposer la directive sur la présomption de salariat »', 'https://lafranceinsoumise.fr/2026/09/22/le-gouvernement-refuse-de-transposer-la-directive-sur-la-presomption-de-salariat/');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (publiée le 17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const PCF_2022_OBJ1 = s('programme-2022', '2022-01-01', 'Programme du PCF, « objectif 1 » (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/objectif_1');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre libres » (lu via archive.org, copie du 6 octobre 2026)', 'https://projet-socialiste.fr/projet/vivre-libres/');

const indep = (p: Profile): boolean => p.status === 'indep';
// Bands 0-1: under 1 800 € net a month
const modest = (p: Profile): boolean => p.income !== null && p.income <= 1;

export const measure: Measure = {
    id: 'independants-protection',
    theme: 'Indépendants',
    title: 'Cotisations, chômage et statut des indépendants et micro-entrepreneurs',
    context: note(
        'Fin 2024, 4,3 millions de personnes ont une activité non salariée, dont 2,05 millions de micro-entrepreneurs, au revenu moyen de 680 € par mois. Un micro-entrepreneur cotise de 12,3 % à 25,6 % de son chiffre d\'affaires. Après une liquidation ou une activité non viable, l\'allocation des travailleurs indépendants verse 26,30 € par jour pendant 182 jours, sous conditions.',
        INSEE_NON_SALARIES,
        F37353,
        F23994,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder les taux actuels (12,3 à 25,6 % en micro) et l\'allocation de 26,30 € par jour pendant 6 mois.',
            explain: 'Rien ne changerait. L\'allocation des travailleurs indépendants n\'est versée qu\'après une liquidation, un redressement ou une baisse forte des revenus, et à qui a gagné plus de 10 000 € une des deux dernières années.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Ouvrir une assurance chômage volontaire aux indépendants.',
            explain: 'Un indépendant pourrait choisir de payer une cotisation de plus. En échange, il toucherait des allocations chômage s\'il arrête son activité. Il paierait lui-même cette protection.',
            effects: [
                { when: p => indep(p) && p.indepRegime === 'micro', direction: 'gain', weight: 2, why: 'Vous pourriez cotiser en plus pour être indemnisé si votre activité s\'arrête ; l\'allocation actuelle exige plus de 10 000 € de revenu annuel.' },
                { when: indep, direction: 'gain', weight: 2, why: 'Vous pourriez cotiser en plus pour être mieux indemnisé si votre activité s\'arrête, au-delà de 26,30 € par jour pendant 6 mois.' },
                // partnerStatus 'indep' also covers company heads, who are not self-employed
                { when: p => p.partnerStatus === 'indep', direction: 'gain', weight: 1, why: 'Votre conjoint, s\'il est indépendant, pourrait cotiser en plus pour être indemnisé si son activité s\'arrête.' },
            ],
        },
        {
            id: 'c',
            label: 'Baisser les cotisations des indépendants aux revenus modestes.',
            explain: 'Les indépendants qui gagnent peu paieraient moins de cotisations sociales et garderaient plus de ce qu\'ils gagnent. Le niveau de revenu concerné et l\'ampleur de la baisse ne sont pas fixés.',
            effects: [
                { when: p => indep(p) && modest(p) && p.indepRegime === 'micro', direction: 'gain', weight: 2, why: 'Le taux appliqué à votre chiffre d\'affaires (12,3 à 25,6 %) baisserait ; la baisse exacte n\'est pas fixée.' },
                { when: p => indep(p) && modest(p), direction: 'gain', weight: 2, why: 'Avec un revenu modeste, vos cotisations sociales baisseraient ; la baisse exacte n\'est pas fixée.' },
                { when: p => indep(p) && p.income === 2, direction: 'gain', weight: 1, why: 'Selon le seuil de revenu retenu, que la mesure ne fixe pas, vos cotisations sociales pourraient baisser.' },
                { when: p => p.partnerStatus === 'indep' && p.partnerIncome !== null && p.partnerIncome <= 1, direction: 'gain', weight: 1, why: 'Les cotisations sociales de votre conjoint, s\'il est indépendant au revenu modeste, baisseraient.' },
            ],
        },
        {
            id: 'd',
            label: 'Créer une caisse des indépendants précaires, payée aussi par leurs entreprises clientes et l\'État.',
            explain: 'Une caisse protégerait les indépendants qui vivent de leur seule activité, avec peu de revenus. Ils en paieraient la moitié, les entreprises et plateformes qui les font travailler 30 %, l\'État 20 %.',
            effects: [
                { when: p => indep(p) && modest(p) && p.indepRegime === 'micro', direction: 'gain', weight: 3, why: 'Comme micro-entrepreneur aux revenus modestes, vous seriez protégé par une caisse financée pour moitié par vos clients et l\'État.' },
                { when: p => indep(p) && modest(p), direction: 'gain', weight: 2, why: 'Vous seriez protégé par une caisse financée pour moitié par les entreprises qui vous font travailler et par l\'État.' },
                { when: p => p.status === 'patron', direction: 'loss', weight: 1, why: 'Si votre entreprise confie durablement du travail à des indépendants, elle paierait une part de leur caisse.' },
                { when: p => p.partnerStatus === 'indep' && p.partnerIncome !== null && p.partnerIncome <= 1, direction: 'gain', weight: 1, why: 'Votre conjoint, s\'il est indépendant aux revenus modestes, serait protégé par une caisse cofinancée par ses clients et l\'État.' },
            ],
        },
        {
            id: 'e',
            label: 'Présumer salariés les travailleurs des plateformes, comme les livreurs et chauffeurs, sauf preuve contraire.',
            explain: 'Un livreur ou un chauffeur qui passe par une application serait considéré comme salarié, sauf si la plateforme prouve qu\'il est indépendant. Il aurait alors les droits d\'un salarié : salaire minimum, congés, chômage.',
            effects: [
                // Whether the visitor works through a platform is not asked
                { when: indep, direction: 'mixed', weight: 1, why: 'Si vous travaillez par une plateforme, vous seriez présumé salarié : droits d\'un salarié, mais fin du statut d\'indépendant.' },
            ],
        },
    ],
    programme: programme({
        lo: clear('e', [LO_UBER_2024, LO_LIVREURS_2026], 'faible : soutient la reconnaissance des livreurs comme salariés et critique le rejet de la directive, sans proposer de loi'),
        lfi: clear('e', [at(LFI_PRESOMPTION, 'reproche au projet du gouvernement : « aucune présomption de salariat n\'est retenue »'), at(LFI_SYNTHESE, 'chap. 8 « Un emploi stable pour chacun », requalification des travailleurs des plateformes en contrat salarié')]),
        pcf: clear('e', [at(PCF_2022_OBJ1, 'plateformes, « Une loi leur accordera un statut, avec toutes les garanties inscrites dans le droit du travail »')], 'faible : programme 2022, sans texte de 2025 ou 2026 qui le confirme'),
        eco: clear('e', [at(ECO_PROGRAMME, 'p.58, chap. 14, mesure 8 « Transposer dans la loi française la directive européenne sur la présomption de salariat »')]),
        ps: both(['d', 'e'], [at(PS_VIVRE_LIBRES, 'ch.1, « Caisse de sécurité sociale des indépendants précaires » ; « Transposer la directive européenne qui reconnaît la présomption de salariat »')], 'caisse : 50 % par les cotisations des indépendants, 30 % par les donneurs d\'ordre, 20 % par l\'État'),
        ren: clear('b', [at(REN_NOUVELLE_DONNE, 'p.23, plan « Tous entrepreneurs »')]),
        modem: clear('c', [at(MODEM_BUDGET, 'section 3, « Rapprocher le salaire net du brut » des indépendants les plus modestes')], 'faible : mesure du groupe pour le budget 2026, sans mécanisme ni chiffre'),
    }),
};
