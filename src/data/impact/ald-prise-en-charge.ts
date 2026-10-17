import { at, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure } from '../impactTypes.ts';

const DREES_ALD = s('autre', '2026-10-07', 'DREES, Études et Résultats n°1388, « Le dispositif affection de longue durée (ALD) en 2025 »', 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/261007-dispositif-affection-de-longue-duree-ALD-en-2025');
const AMELI_EXO = s('autre', '2026-09-30', 'Ameli, « La prise en charge exonérante de l’ALD » (mise à jour du 30 septembre 2026)', 'https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/affection-longue-duree-ald/prise-en-charge-ald-exonerante');
const AMELI_FIN = s('autre', '2026-01-12', 'Ameli, « La fin de la période d’ALD » (mise à jour du 12 janvier 2026)', 'https://www.ameli.fr/assure/droits-demarches/maladie-accident-hospitalisation/affection-longue-duree-ald/fin-periode-ald');

const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-06-01', 'Synthèse des contributions, « déjà au programme » (juin 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const PCF_BASE = s('motion', '2026-07-15', 'Base commune du 40e congrès (CommunisteS n°1095)', 'https://assets.nationbuilder.com/pcf/pages/42499/attachments/original/1784128307/document_1095_CommunisteS_40e_Congre%CC%80s.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_SECURITES = s('programme-2027', '2026-06-25', 'Projet socialiste « Être en sécurité(s) »', 'https://projet-socialiste.fr/projet/etre-en-securites/');

export const measure: Measure = {
    id: 'ald-prise-en-charge',
    theme: 'Santé',
    title: 'Affections de longue durée : remboursement à 100 % et sortie du dispositif',
    context: note(
        'En 2025, 15 millions de personnes sont en affection de longue durée (ALD) ; elles représentent 67 % des 189 Md€ de dépenses de santé remboursables. Les soins liés à l’ALD sont remboursés à 100 % du tarif de la Sécurité sociale (hors dépassements, franchises, participations forfaitaires et forfait hospitalier), pour une durée renouvelable tant que l’état de santé le justifie.',
        DREES_ALD,
        AMELI_EXO,
        AMELI_FIN,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder le remboursement à 100 % des soins liés à l’ALD, renouvelé tant que l’état de santé le justifie.',
            explain: 'C’est la règle actuelle : l’ALD est accordée pour une durée fixée par le médecin, puis renouvelée sans limite tant que des soins actifs sont nécessaires.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Faire sortir de l’ALD les patients guéris ou en rémission, après une transition de 3 mois.',
            explain: 'Aujourd’hui, l’ALD n’est plus renouvelée quand les soins actifs s’arrêtent. Les patients en rémission en sortiraient aussi, après 3 mois de transition, et seraient remboursés au taux habituel.',
            effects: [
                {
                    when: p => p.ald === true,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Si votre maladie est en rémission, vos soins ne seraient plus remboursés à 100 % après 3 mois de transition. Sinon, rien ne change.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Contrôler systématiquement que chaque patient remplit les critères médicaux de l’ALD.',
            explain: 'L’Assurance maladie vérifierait chaque dossier d’ALD. Les patients qui remplissent les critères garderaient leur prise en charge à 100 % ; les autres seraient remboursés au taux habituel.',
            effects: [
                {
                    when: p => p.ald === true,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Votre dossier d’ALD serait vérifié : rien ne change si les critères médicaux sont remplis ; sinon, remboursement au taux habituel.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Rembourser à 100 % tous les soins de tous les assurés par la Sécurité sociale.',
            explain: 'La Sécurité sociale paierait aussi la part aujourd’hui laissée au patient ou à sa mutuelle, pour tous les assurés et pour tous les soins remboursables.',
            effects: [
                {
                    when: p => p.ald === true,
                    direction: 'gain',
                    weight: 1,
                    why: 'Vos soins sans lien avec votre ALD seraient eux aussi remboursés à 100 %.',
                },
                {
                    when: () => true,
                    direction: 'gain',
                    weight: 2,
                    why: 'Vos soins remboursables seraient payés en totalité par la Sécurité sociale, sans part laissée à votre charge ou à votre mutuelle.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('d', [at(LFI_SYNTHESE, 'chap. 15 « Une approche de santé globale », « Instaurer le 100% Sécu »')]),
        pcf: clear('d', [at(PCF_BASE, 'p.49, « prendre en charge les soins à 100 % »')]),
        eco: clear('d', [at(ECO_PROGRAMME, 'p.111, chap. 29, proposition 4, « prise en charge à 100 % par l’Assurance maladie », mutuelles limitées « aux seuls soins optionnels »')], 'faible : 100 % des « soins essentiels nécessaires au maintien de l’autonomie et de la qualité de vie », pas de tous les soins'),
        ps: clear('d', [at(PS_SECURITES, '« Se faire soigner », « Grande Sécu »')], 'faible : remboursement intégral limité à un panier de soins et de médicaments essentiels'),
        modem: clear('b', [at(MODEM_BUDGET, 'p.5, « sortie de l’ALD (affection longue durée) des patients en rémission ou guéris avec une période transitoire de sortie de 3 mois »')], 'proposition du budget 2026'),
        rn: clear('c', [at(RN_CONTRE_BUDGET, 'p.7, « Contrôler systématiquement l’éligibilité à l’ALD », 0,45 Md€')]),
    }),
};
