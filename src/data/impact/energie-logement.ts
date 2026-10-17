import { at, both, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

const CRE_TVA_2025 = s('autre', '2025-06-19', 'CRE, délibération n°2025-155 portant proposition des tarifs réglementés de vente de l’électricité', 'https://www.cre.fr/fileadmin/Documents/Deliberations/2025/250619_2025-155_Proposition_TRVE_inf_36.pdf');
const CRE_AOUT_2026 = s('autre', '2026-07-16', 'CRE, communiqué de presse sur les tarifs réglementés de l’électricité au 1er août 2026', 'https://www.cre.fr/fileadmin/Documents/Communiques_de_presse/2026/260716_CP_TRVE_Aout_2026.pdf');
const CRE_TRVE = s('autre', '2026-01-20', 'CRE, « Comprendre les tarifs réglementés de vente d’électricité » (mise à jour du 20 janvier 2026)', 'https://www.cre.fr/consommateurs/comprendre-les-tarifs-reglementes-de-vente-delectricite-trve.html');
const INSEE_CONSO_2024 = s('autre', '2025-06-11', 'Insee Première n°2056, la consommation des ménages en 2024', 'https://www.insee.fr/fr/statistiques/8582021?sommaire=8071406');
const SP_CHEQUE = s('autre', '2025-10-17', 'Service-public.gouv.fr, fiche F33667 « Chèque énergie » (vérifiée le 17 octobre 2025)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F33667');

const RN_AMENDEMENT_TVA = s('motion', '2025-10-21', 'Amendement n°I-792 de M. Le Pen au projet de loi de finances pour 2026', 'https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/792');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_BARDELLA_NIMES = s('declaration', '2026-03-04', 'Discours de J. Bardella à Nîmes', 'https://rassemblementnational.fr/discours/discours-de-jordan-bardella-a-nimes');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const ECO_BOUCLIER = s('declaration', '2026-09-12', 'Les Écologistes, dossier de presse « Pouvoir d’achat : notre bouclier social et environnemental » (septembre 2026)', 'https://lesecologistes.fr/document/2jMAmmuTuvrct5nbKLuPd2/dp-bouclier-social-pour-envoi.pdf');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_TRV = s('declaration', '2025-10-09', 'Communiqué du groupe LFI, « Toujours plus de marché et de nucléaire »', 'https://lafranceinsoumise.fr/2025/10/09/toujours-plus-de-marche-et-de-nucleaire-halte-aux-obsessions-macronistes-qui-feront-encore-grimper-les-factures-delectricite/');
const LFI_LESCURE = s('declaration', '2025-11-28', 'Communiqué du groupe LFI, « Prix de l’électricité : Lescure improvise et refuse les vraies solutions »', 'https://lafranceinsoumise.fr/2025/11/28/prix-de-lelectricite-lescure-improvise-et-refuse-les-vraies-solutions/');
const LFI_1ER_MAI = s('declaration', '2026-04-23', 'La France insoumise, « Bloquer les prix, libérer nos vies : le 1er mai dans la rue »', 'https://lafranceinsoumise.fr/2026/04/23/bloquer-les-prix-liberer-nos-vies-le-1er-mai-dans-la-rue/');
const PCF_CONGRES = s('motion', '2026-07-15', 'CommunisteS n°1095, 40e congrès (base commune et discours de F. Roussel)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const PCF_URGENCE = s('declaration', '2026-04-08', 'PCF, « Face à l’explosion des prix, le Gouvernement doit déclarer l’état d’urgence énergétique ! » (F. Roussel)', 'https://www.pcf.fr/face_explosion_des_prix_le_gouvernement_doit_declarer_l_etat_d_urgence_energetique');
const PCF_2022_OBJ4 = s('programme-2022', '2022-01-01', 'Programme du PCF, objectif 4 (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/objectif_4');
const RETAILLEAU_ELECTRICITE = s('programme-2027', '2026-09-22', 'Projet Retailleau, mesure n°88 « Stabiliser le prix de l’électricité » (mise à jour du 22 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/stabiliser-le-prix-de-l-electricite');
const RETAILLEAU_CHARGES_ELEC = s('programme-2027', '2026-09-22', 'Projet Retailleau, mesure n°89 « Réduire les charges sur l’électricité et revoir le DPE » (mise à jour du 22 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/reduire-les-charges-sur-l-electricite-et-revoir-le-dpe');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const REC_KNAFO_IRDEME = s('autre', '2026-09-19', 'IRDEME, livre de S. Knafo « Le Casse du siècle » (livre d’une dirigeante, pas programme du candidat)', 'https://irdeme.org/les-15-resolutions-de-sarah-knafo-ne-sont-pas-toutes-des-solutions/');

// Households that pay their own electricity bill
const hasMeter = (p: Profile): boolean => p.housing !== null && p.housing !== 'heberge';
// The 2025 VAT change on the subscription applies to mainland France only
const mainland = (p: Profile): boolean => p.zone !== null && p.zone !== 'outremer';

export const measure: Measure = {
    id: 'energie-logement',
    theme: 'Énergie',
    title: 'Taxes sur l’électricité et le gaz, et chèque énergie',
    context: note(
        'Depuis le 1er août 2025, la TVA est de 20 % sur toute la facture d’électricité, abonnement compris. L’accise sur l’électricité est de 30,62 €/MWh depuis le 1er août 2026. En 2024, les ménages ont dépensé 68,5 Md€ en électricité, gaz et autres combustibles. Le chèque énergie va de 48 à 277 € par an.',
        CRE_TVA_2025,
        CRE_AOUT_2026,
        INSEE_CONSO_2024,
        SP_CHEQUE,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder la TVA à 20 %, l’accise de 30,62 €/MWh sur l’électricité et le chèque énergie actuel.',
            explain: 'Les taxes sur l’électricité et le gaz restent celles de 2026. Le chèque énergie, de 48 à 277 € par an, reste réservé aux ménages aux revenus modestes.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Baisser la TVA à 5,5 % sur l’électricité, le gaz et le fioul.',
            explain: 'La TVA passerait de 20 % à 5,5 % sur ces énergies. Les factures baisseraient d’environ 12 %, si la baisse est répercutée sur les prix.',
            effects: [
                { when: p => hasMeter(p) && p.zone === 'outremer', direction: 'mixed', weight: 1, why: 'Outre-mer, la TVA sur l’énergie est déjà réduite ou nulle : la baisse serait faible ou sans effet.' },
                {
                    when: p => hasMeter(p) && p.heating === 'elec', direction: 'gain', weight: 3,
                    why: 'Votre facture d’électricité, chauffage compris, baisserait d’environ 12 %.',
                    euro: {
                        perYear: [165, 342],
                        basis: note(
                            'Facture TTC des profils types de la CRE chauffés à l’électricité (6,4 à 14 MWh par an, 114 à 236 € par mois) × (1 − 1,055 / 1,20), soit 12,1 % de moins.',
                            at(CRE_TRVE, 'tableau des factures indicatives (hypothèses MNE)'),
                        ),
                    },
                },
                { when: p => hasMeter(p) && (p.heating === 'gaz' || p.heating === 'fioul'), direction: 'gain', weight: 3, why: 'Vos factures d’électricité et de chauffage au gaz ou au fioul baisseraient d’environ 12 %.' },
                { when: p => hasMeter(p) && (p.heating === 'bois' || p.heating === 'collectif'), direction: 'gain', weight: 2, why: 'Votre facture d’électricité baisserait d’environ 12 % ; pour le chauffage, l’effet dépend de l’énergie utilisée.' },
                { when: p => hasMeter(p), direction: 'gain', weight: 2, why: 'Votre facture d’électricité baisserait d’environ 12 %, celle de gaz ou de fioul aussi si vous en utilisez.' },
            ],
        },
        {
            id: 'c',
            label: 'Alléger les taxes et charges sur l’électricité : TVA sur l’abonnement, accise ou certificats d’économies d’énergie.',
            explain: 'Selon les projets, la TVA sur l’abonnement reviendrait à 5,5 % comme avant août 2025, l’accise sur l’électricité baisserait, ou l’électricité sortirait des certificats d’économies d’énergie.',
            effects: [
                { when: p => hasMeter(p) && p.zone === 'outremer', direction: 'mixed', weight: 1, why: 'Outre-mer, les taxes sur l’électricité diffèrent : l’effet dépend de votre territoire et de la charge allégée.' },
                { when: p => hasMeter(p) && mainland(p) && p.heating === 'elec', direction: 'gain', weight: 2, why: 'Votre facture d’électricité, chauffage compris, baisserait ; le montant dépend de la taxe ou de la charge allégée.' },
                { when: p => hasMeter(p) && mainland(p), direction: 'gain', weight: 1, why: 'Votre facture d’électricité baisserait ; le montant dépend de la taxe ou de la charge allégée.' },
            ],
        },
        {
            id: 'd',
            label: 'Vendre l’électricité aux ménages à son coût de production.',
            explain: 'Le prix de l’électricité serait calculé sur le coût de production des centrales françaises, et non plus en partie sur les prix du marché européen.',
            effects: [
                { when: p => hasMeter(p) && p.heating === 'elec', direction: 'mixed', weight: 2, why: 'Votre facture, chauffage compris, suivrait un coût de production que la mesure ne chiffre pas : l’effet dépend de ce coût.' },
                { when: p => hasMeter(p), direction: 'mixed', weight: 1, why: 'Votre facture d’électricité suivrait un coût de production que la mesure ne chiffre pas : l’effet dépend de ce coût.' },
            ],
        },
        {
            id: 'e',
            label: 'Bloquer par décret le prix de l’énergie (électricité, gaz) payé par les ménages.',
            explain: 'Un décret fixerait un prix maximum de l’électricité et du gaz pour les ménages, même si les prix de marché augmentent. Le niveau de ce plafond n’est pas fixé.',
            effects: [
                { when: p => hasMeter(p) && (p.heating === 'elec' || p.heating === 'gaz'), direction: 'gain', weight: 2, why: 'Le prix de votre énergie de chauffage et de votre électricité ne pourrait plus dépasser le plafond fixé par décret.' },
                { when: p => hasMeter(p), direction: 'gain', weight: 1, why: 'Le prix de votre électricité ne pourrait plus dépasser le plafond fixé par décret.' },
            ],
        },
    ],
    programme: programme({
        lfi: both(['d', 'e'], [
            at(LFI_TRV, 'tarifs réglementés « calculés sur les coûts du système électrique français »'),
            LFI_LESCURE,
            at(LFI_1ER_MAI, '« Pour le blocage des prix des carburants et de l’énergie »'),
            at(NFP, 'p.4, « Bloquer les prix des biens de première nécessité dans l’alimentation, l’énergie et les carburants par décret »'),
        ], 'faible : communiqués et appel du parti (2025-2026), pas le programme 2027 ; la gratuité des premiers kilowattheures (contrat NFP 2024) n’a pas d’option ici'),
        pcf: both(['b', 'd'], [
            at(PCF_URGENCE, '« baissons tout de suite de 25 à 30 % les factures d’électricité en baissant la TVA et en sortant du marché européen de l’énergie »'),
            at(PCF_CONGRES, 'p.9 et p.47, sortie du marché européen de l’électricité, maîtrise des prix'),
            at(PCF_2022_OBJ4, '« la TVA sur les consommations sera fixée à 5,5 % »'),
        ], 'baisse de TVA et sortie du marché européen proposées ensemble en avril 2026 ; le taux de 5,5 % vient du programme de 2022, et le texte de 2026 ne cite que l’électricité'),
        eco: clear('c', [
            at(ECO_PROGRAMME, 'p.16, « Diminuer la fiscalité sur l’électricité en unifiant le socle de l’accise pour le gaz et l’électricité en diminuant la TVA sur l’abonnement électrique »'),
            at(ECO_BOUCLIER, 'p.7 du PDF, « en réduisant les taxes sur l’électricité et en harmonisant la fiscalité du gaz et de l’électricité »'),
        ], 'le découplage du prix de l’électricité de celui du gaz, aussi proposé, ne fixe pas le prix au coût de production (option d)'),
        ps: both(['c', 'd'], [
            at(PP_ACTE_UN, 'p.17, « Fixer une partie de la facture […] sur le coût de production de notre électricité nucléaire et renouvelable » ; « Annuler la hausse de taxe sur l’électricité imposée en 2024 »'),
        ], 'une partie seulement de la facture serait fixée sur le coût de production'),
        modem: clear('a', [at(MODEM_BUDGET, 'p.7, « Baisse de la TVA sur l’énergie ? → tuer l’investissement de la filière nucléaire »')], 'faible : rejet de la baisse de TVA dans le dossier budgétaire 2026 du groupe, sans proposition propre'),
        lr: both(['c', 'd'], [
            at(RETAILLEAU_CHARGES_ELEC, '« Sortir l’électricité du périmètre des certificats d’économies d’énergie »'),
            at(RETAILLEAU_ELECTRICITE, '« Un prix indexé sur nos coûts de production, plus sur les marchés »'),
        ]),
        rn: both(['b', 'd'], [
            at(RN_AMENDEMENT_TVA, 'exposé sommaire, TVA à 5,5 % sur le gaz, l’électricité, le fioul et les carburants'),
            at(RN_CONTRE_BUDGET, 'p.3'),
            at(RN_BARDELLA_NIMES, '« nous devons rétablir un prix national de l’électricité, fondé sur nos coûts réels de production »'),
        ]),
        rec: clear('d', [at(REC_KNAFO_IRDEME, 'point 5')], 'faible : livre d’une dirigeante, résumé par un think tank'),
    }),
};
