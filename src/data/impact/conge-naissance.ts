import { at, clear, isWorking, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

// Context
const SP_CONGE = s('autre', '2026-06-03', 'Service-public.gouv.fr, fiche F39685 « Congé supplémentaire de naissance d\'un salarié du secteur privé » (vérifiée le 3 juin 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39685');
const INSEE_BILAN = s('autre', '2026-01-13', 'Insee Première n°2087, « Bilan démographique 2025 »', 'https://www.insee.fr/fr/statistiques/8719824');

// Parties
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const PCF_2022_OBJ5 = s('programme-2022', '2022-01-01', 'Programme du PCF, objectif 5 (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/objectif_5');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_EPANOUIR = s('programme-2027', '2026-06-11', 'Projet socialiste « S\'épanouir à égalité » (publié le 11 juin 2026)', 'https://projet-socialiste.fr/projet/sepanouir-a-egalite/');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const RETAILLEAU_CONGE = s('programme-2027', '2026-09-12', 'Projet Retailleau, mesure 79 « Prolonger le congé jusqu\'aux six mois de l\'enfant » (mise à jour le 12 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/prolonger-le-conge-jusqu-aux-six-mois-de-l-enfant');
const LR_DEMO = s('declaration', '2026-04-30', 'Les Républicains, « Sortir de l\'hiver démographique » (entretien de B. Retailleau à l\'AFP)', 'https://republicains.fr/actualites/2026/04/30/sortir-de-lhiver-demographique/');

// MoDem and Horizons stay non-couvert: their only text (Ensemble 2024, p.8: 3 months per parent, « mieux
// indemnisé que le congé parental actuel ») states neither the total length nor the pay of option c.
// LO criticises the pay of the current leave without backing any option.

// A birth is likelier at these ages or with a toddler at home; the profile does not say whether one is planned.
// Job seekers can take the leave too (F39685).
const familyAge = (p: Profile): boolean => p.age === 'a25' || p.age === 'a40' || p.childAges.includes('under3');
const concerned = (p: Profile): boolean => (isWorking(p) || p.status === 'chomeur') && familyAge(p);
const toddler = (p: Profile): boolean => concerned(p) && p.childAges.includes('under3');
const partnerConcerned = (p: Profile): boolean =>
    p.household === 'couple' && (p.partnerStatus === 'salarie' || p.partnerStatus === 'public' || p.partnerStatus === 'indep') && familyAge(p);

const PARTNER_WHY = 'En cas de naissance, votre conjoint aurait droit à un congé plus long ou mieux payé.';

export const measure: Measure = {
    id: 'conge-naissance',
    theme: 'Famille',
    title: 'Congé de naissance : durée et indemnisation de chaque parent',
    context: note(
        'Depuis le 1er juillet 2026, chaque parent peut ajouter 1 ou 2 mois de congé de naissance aux congés de maternité ou de paternité, payés 70 % puis 60 % du salaire net, au plus 4 005 € par mois. 645 000 bébés sont nés en France en 2025.',
        SP_CONGE,
        INSEE_BILAN,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder 1 à 2 mois par parent, payés 70 % puis 60 % du salaire net.',
            explain: 'Ce congé s\'ajoute aux congés de maternité et de paternité. Il est ouvert aux salariés, aux agents publics, aux indépendants et aux demandeurs d\'emploi.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Allonger le congé jusqu\'aux 6 mois de l\'enfant, payé 70 % du salaire.',
            explain: 'L\'un ou l\'autre parent pourrait rester en congé jusqu\'aux six mois de l\'enfant, payé 70 % de son salaire dans la limite du plafond de la Sécurité sociale, au lieu de deux mois au plus aujourd\'hui.',
            effects: [
                {
                    when: toddler,
                    direction: 'gain',
                    weight: 2,
                    why: 'En cas de naissance, l\'un des parents pourrait rester en congé jusqu\'aux six mois de l\'enfant, payé 70 % du salaire.',
                },
                {
                    when: concerned,
                    direction: 'gain',
                    weight: 1,
                    why: 'En cas de naissance, l\'un des parents pourrait rester en congé jusqu\'aux six mois de l\'enfant, payé 70 % du salaire.',
                },
                { when: partnerConcerned, direction: 'gain', weight: 1, why: PARTNER_WHY },
            ],
        },
        {
            id: 'c',
            label: 'Créer 6 mois de congé de naissance, payés 70 % du plafond Sécu (environ 2 800 € par mois).',
            explain: 'Ce congé s\'ajouterait aux congés de maternité et de paternité, sans pouvoir être prolongé. Le partage des six mois entre les parents n\'est pas précisé.',
            effects: [
                {
                    when: toddler,
                    direction: 'gain',
                    weight: 2,
                    why: 'En cas de naissance, votre foyer aurait six mois de congé de naissance, payés 70 % du plafond Sécu, environ 2 800 € par mois.',
                },
                {
                    when: concerned,
                    direction: 'gain',
                    weight: 1,
                    why: 'En cas de naissance, votre foyer aurait six mois de congé de naissance, payés 70 % du plafond Sécu, environ 2 800 € par mois.',
                },
                { when: partnerConcerned, direction: 'gain', weight: 1, why: PARTNER_WHY },
            ],
        },
        {
            id: 'd',
            label: 'Donner 16 semaines à chaque parent payées 100 %, puis 3 mois à 80 %.',
            explain: 'Le second parent aurait le même congé que la mère : 16 semaines payées au salaire de base. Le congé de naissance passerait ensuite à trois mois par parent, payés 80 % du revenu.',
            effects: [
                {
                    when: toddler,
                    direction: 'gain',
                    weight: 3,
                    why: 'En cas de naissance, chaque parent aurait 16 semaines payées à 100 %, puis trois mois à 80 %.',
                },
                {
                    when: concerned,
                    direction: 'gain',
                    weight: 1,
                    why: 'En cas de naissance, chaque parent aurait 16 semaines payées à 100 %, puis trois mois à 80 %.',
                },
                { when: partnerConcerned, direction: 'gain', weight: 1, why: PARTNER_WHY },
            ],
        },
        {
            id: 'e',
            label: 'Rendre le congé d\'accueil de l\'enfant identique pour les deux parents, durée et paie non fixées.',
            explain: 'Le second parent aurait le même congé que la mère. Les textes ne fixent ni la durée ni l\'indemnisation.',
            effects: [
                {
                    when: p => concerned(p) || partnerConcerned(p),
                    direction: 'mixed',
                    weight: 1,
                    why: 'En cas de naissance, les deux parents auraient le même congé ; l\'effet pour vous dépend de la durée et de la paie retenues.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('e', [
            at(LFI_SYNTHESE, 'chap. 10, « Remplacer les congés paternité et maternité par des congés parentaux et les rendre identiques pour les deux parents »'),
            at(NFP, 'p.21, « Rendre identique pour les deux parents le congé d\'accueil de l\'enfant »'),
        ]),
        pcf: clear('e', [
            at(NFP, 'p.21, « Rendre identique pour les deux parents le congé d\'accueil de l\'enfant »'),
            at(PCF_2022_OBJ5, 'proposition 80, « un congé parental s\'alignant sur la durée actuelle du congé maternité »'),
        ], 'faible : programme commun NFP 2024 et programme de 2022, sans texte propre plus récent'),
        eco: clear('d', [at(ECO_PROGRAMME, 'p.124, chap. 34, proposition 4 « Instaurer l\'égalité des congés de parentalité »')]),
        ps: clear('e', [at(PS_EPANOUIR, '« des congés de paternité et de maternité réellement égaux, en durée comme en obligation »')]),
        ren: clear('c', [at(REN_NOUVELLE_DONNE, 'p.29, congé de naissance « de 6 mois en plus des congés paternité et maternité, rémunéré à 70% du plafond de la Sécurité sociale »')]),
        lr: clear('b', [at(RETAILLEAU_CONGE, '« indemnisé à 70 % de sa rémunération antérieure, dans la limite du plafond de la Sécurité sociale »'), LR_DEMO]),
    }),
};
