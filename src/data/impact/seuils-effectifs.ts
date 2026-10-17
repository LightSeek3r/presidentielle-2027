import { at, clear, note, programme, s, AMB } from '../impactHelpers.ts';
import type { Measure } from '../impactTypes.ts';

// Positions reused from the quiz question `pme-croissance` (questions.ts), sources reopened on 2026-10-16.
// Quiz a (profit sharing) is c here, quiz b stays b, quiz c (staff representatives) is d, quiz d (status quo) is a.

const F2141 = s('autre', '2026-07-21', 'Service-public.gouv.fr, fiche F2141 « Participation » (page vérifiée le 21 juillet 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2141');
const URSSAF_TAILLE = s('autre', '2025-09-17', 'Urssaf, open data « Nombre d\'établissements employeurs, effectifs salariés et masse salariale du secteur privé par tranche de taille d\'entreprise », année 2024', 'https://open.urssaf.fr/api/explore/v2.1/catalog/datasets/nombre-etab-effectifs-salaries-et-masse-salariale-secteur-prive-tranche-ent/records?refine=annee%3A2024&limit=20');

const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (publiée le 17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const LFI_CHSCT = s('declaration', '2025-12-27', 'Communiqué du groupe LFI et de la délégation FI au Parlement européen, « En France comme en Europe, aucun salarié ne devrait mourir au travail ! »', 'https://lafranceinsoumise.fr/2025/12/27/en-france-comme-en-europe-aucun-salarie-ne-devrait-mourir-au-travail/');
const PCF_BASE = s('motion', '2026-07-15', 'Base commune du 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const PCF_HUMA = s('declaration', '2026-09-15', 'PCF, discours de Fabien Roussel à la Fête de l\'Humanité 2026', 'https://www.pcf.fr/fete_de_lhumanite_2026_discours_de_fabien_roussel');
const PCF_MJCF_SANTE = s('declaration', '2026-05-06', 'MJCF, « Jeunes morts au travail : en finir avec l\'hécatombe » (CommunisteS n°1085, pcf.fr)', 'https://www.pcf.fr/jeunes_morts_au_travail_en_finir_avec_hecatombe');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre libres » (lu via archive.org, copie du 6 octobre 2026)', 'https://projet-socialiste.fr/projet/vivre-libres/');
const PP_ACTE_UN = s('programme-2027', '2026-03-25', 'Place publique, « Acte un » (non daté, date du fichier PDF)', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const MODEM_LIVRET = s('motion', '2024-01-01', 'Livret de contributions, congrès de Blois (2024, mois non précisé)', 'https://www.mouvementdemocrate.fr/system/files/documents/C24_LivretContributions_Web_0.pdf');
const MODEM_SOLIDARITES = s('autre', '2026-01-01', 'Page « Solidarités » du MoDem (non datée, date indicative)', 'https://www.mouvementdemocrate.fr/solidarites-7924');
const RETAILLEAU_100_REGLES = s('programme-2027', '2026-09-11', 'Projet Retailleau, mesure 30 « Supprimer 100 règles qui pénalisent le plus les entreprises » (mise à jour du 11 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/supprimer-100-regles-qui-penalisent-le-plus-les-entreprises');
const UDR_ACTE_I = s('motion', '2025-04-10', 'Livret du groupe UDR « Acte I du Grand Forum des Libertés » (PDF du 10 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3524/attachments/original/Livret_Acte_I_Grand_Forum_des_Liberte%CC%81s_compressed.pdf?1744280025');
const RN_LIVRET_ENTREPRISE = s('programme-2022', '2024-09-06', 'Livret RN « La France entreprend » (version 2022 mise à jour, PDF du 6 septembre 2024)', 'https://rassemblementnational.fr/documents/WEB-GRN-LIVRET-ENTREPRISE.pdf');

export const measure: Measure = {
    id: 'seuils-effectifs',
    theme: 'Employeurs, travail',
    title: 'Obligations des entreprises à 11 et 50 salariés',
    context: note(
        'La participation aux bénéfices est obligatoire après 5 ans à 50 salariés. Depuis 2025, de 11 à 49 salariés, 3 ans de bénéfice d\'au moins 1 % du chiffre d\'affaires imposent un dispositif de partage. En 2024, 4,4 millions de salariés du privé travaillaient dans une entreprise de 10 à 49 salariés, 1,7 million dans une entreprise de 50 à 99.',
        F2141,
        URSSAF_TAILLE,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder les seuils de 11 et 50 salariés et leurs obligations.',
            explain: 'Un comité social et économique (CSE) est élu dès 11 salariés. À 50, ses missions s\'élargissent, et la participation aux bénéfices devient obligatoire après 5 ans.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Relever les seuils de 11 et 50 salariés, par exemple à 50, 100 ou 250, ou retarder leurs obligations.',
            explain: 'Les obligations prévues à 50 salariés viendraient à 100 ou 250, ou 5 ans après le passage du seuil. Le CSE n\'arriverait qu\'à 50 salariés, sauf accord d\'entreprise.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'pme', direction: 'gain', weight: 2, why: 'Votre entreprise pourrait dépasser 50 salariés sans nouvelles obligations tout de suite, et le CSE pourrait n\'être obligatoire qu\'à 50.' },
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'gain', weight: 1, why: 'Sous le nouveau seuil (100 ou 250 salariés), certaines obligations liées aux 50 salariés seraient levées ou retardées.' },
                { when: p => p.status === 'patron' && p.employerSize === 'tpe', direction: 'gain', weight: 1, why: 'En passant 11 salariés, votre entreprise n\'aurait pas tout de suite à organiser l\'élection d\'un CSE.' },
                // An employee's firm size is not asked, hence mixed
                { when: p => p.status === 'salarie', direction: 'mixed', weight: 1, why: 'Selon la taille de votre entreprise et la version retenue, vos élus du personnel ou la participation obligatoire pourraient être retardés ou supprimés.' },
            ],
        },
        {
            id: 'c',
            label: 'Étendre à toutes les entreprises le partage obligatoire d\'une part des bénéfices.',
            explain: 'Toutes les entreprises, même celles de moins de 11 salariés, devraient mettre en place une participation, un intéressement, un abondement d\'épargne salariale ou une prime de partage de la valeur.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'tpe', direction: 'loss', weight: 2, why: 'Votre entreprise devrait reverser à ses salariés une part de ses bénéfices, ce qui n\'est pas obligatoire aujourd\'hui sous 11 salariés.' },
                // Some projects only cover firms under 11 employees, so the 11-49 band may not change
                { when: p => p.status === 'patron' && p.employerSize === 'pme', direction: 'mixed', weight: 1, why: 'Selon le projet, votre entreprise devrait partager ses bénéfices même sans 3 années de bénéfice d\'au moins 1 % du chiffre d\'affaires.' },
                // An employee's firm size is not asked, hence mixed
                { when: p => p.status === 'salarie', direction: 'mixed', weight: 1, why: 'Si votre entreprise compte moins de 50 salariés et fait des bénéfices, une part pourrait vous revenir ; au-delà, rien ne change.' },
            ],
        },
        {
            id: 'd',
            label: 'Renforcer les pouvoirs des élus du personnel et rétablir un comité santé-sécurité dès 50 salariés.',
            explain: 'Selon les projets, les élus du personnel donneraient un avis qui s\'impose sur certains choix, ou pourraient suspendre un temps des licenciements. Dès 50 salariés, un comité suivrait la santé et la sécurité au travail.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'loss', weight: 2, why: 'Votre entreprise aurait un comité santé-sécurité à réunir, et les élus du personnel auraient plus de poids sur certaines décisions, selon le projet.' },
                { when: p => p.status === 'patron' && p.employerSize === 'pme', direction: 'loss', weight: 1, why: 'Les élus de votre CSE auraient plus de pouvoirs sur certaines décisions de l\'entreprise.' },
                // An employee's firm size is not asked, hence mixed
                { when: p => p.status === 'salarie', direction: 'mixed', weight: 1, why: 'Si votre entreprise compte au moins 11 salariés, vos élus auraient plus de pouvoirs ; dès 50 salariés, un comité santé-sécurité existerait.' },
            ],
        },
    ],
    programme: programme({
        lo: AMB,
        lfi: clear('d', [at(LFI_SYNTHESE, 'chap. 3, droit de veto suspensif des comités d\'entreprise sur les plans de licenciements'), at(LFI_CHSCT, 'restauration des CHSCT')]),
        pcf: clear('d', [at(PCF_BASE, 'p.40, 44-45, nouveaux pouvoirs des représentants'), at(PCF_HUMA, '« nous rétablirons les CHSCT et les délégués du personnel »'), PCF_MJCF_SANTE]),
        eco: clear('d', [at(ECO_PROGRAMME, 'p.60, chap. 15, mesure 3 (pouvoirs des CSE, commissions santé-sécurité dès 50 salariés)')]),
        ps: clear('d', [at(PS_VIVRE_LIBRES, 'ch.1, CHSCT réinstallés'), at(PP_ACTE_UN, 'p.41')], 'règle « 1 € de dividende = au moins 1 € de participation ou d\'intéressement » dès 10 salariés : plus étroite que c'),
        ren: clear('c', [at(REN_NOUVELLE_DONNE, 'p.23, partage de la valeur pour les entreprises de moins de 10 salariés')]),
        modem: clear('c', [at(MODEM_LIVRET, 'section « Bien vivre de son travail »'), MODEM_SOLIDARITES], 'faible : textes de 2024 et page non datée, aucun programme 2027'),
        lr: clear('b', [at(RETAILLEAU_100_REGLES, 'seuil de 50 relevé à 100, seuil du CSE relevé à 50 sauf accord')]),
        udr: clear('b', [at(UDR_ACTE_I, 'p.53, seuil de 50 porté à 250 salariés')]),
        rn: clear('b', [at(RN_LIVRET_ENTREPRISE, 'p.25 (page 13 du PDF)')], 'faible : programme 2022 mis à jour en 2024 ; délai de 5 ans étendu à toutes les obligations, sans relèvement des seuils'),
    }),
};
