import { at, both, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure } from '../impactTypes.ts';

const VM1 = s('autre', '2026-10-05', 'PLF 2027, Évaluation des voies et moyens, tome I (date du fichier PDF)', 'https://www.budget.gouv.fr/documentation/file-download/34339');
const IS_TAUX = s('autre', '2026-02-17', 'Entreprendre.service-public, fiche F23575 « Impôt sur les sociétés » (vérifiée le 17 février 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23575');
const CFE = s('autre', '2026-04-02', 'Entreprendre.service-public, fiche F23547 « Cotisation foncière des entreprises » (vérifiée le 2 avril 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23547');

// Parties
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const LFI_CONTRE_BUDGET = s('declaration', '2026-10-14', 'LCP, contre-budget de LFI pour 2027', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const PCF_BUDGET = s('declaration', '2026-09-18', 'PCF, « Budget 2027 : Lecornu annonce une saignée sociale au service du capital »', 'https://www.pcf.fr/budget_2027_lecornu_annonce_une_saignee_sociale_au_service_du_capital');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-11', 'Projet socialiste « Refaire société » (mis en ligne le 11 juin 2026)', 'https://projet-socialiste.fr/projet/refaire-societe/');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const ATTAL_REF = s('declaration', '2026-08-27', 'Site de campagne de G. Attal, « À La REF : Gabriel Attal, grand gagnant du premier débat de la présidentielle 2027 »', 'https://attalpresident.fr/actualites/a-la-ref-gabriel-attal-grand-gagnant-du-premier-debat-de-la-presidentielle-2027');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const RETAILLEAU_INDUSTRIE = s('programme-2027', '2026-09-01', 'Projet Retailleau, thème industrie-entreprises (février à septembre 2026)', 'https://www.avecretailleau.fr/projet/theme/industrie-entreprises');
const LR_COMPTES_PUBLICS = s('programme-2027', '2026-10-12', 'Projet Retailleau, fiches presse « Rétablir l’ordre dans les comptes publics » (12 octobre 2026)', 'https://www.avecretailleau.fr/api/media/file/20261011_Fiches_presse_comptes_publics_mise_en_page%20(1).pdf');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');
const REC_KNAFO_IRDEME = s('autre', '2026-09-19', 'IRDEME, livre de S. Knafo « Le Casse du siècle » (livre d\'une dirigeante, pas programme du candidat)', 'https://irdeme.org/les-15-resolutions-de-sarah-knafo-ne-sont-pas-toutes-des-solutions/');

const IS_WHY = 'Le taux d’impôt sur vos bénéfices dépendrait de la taille ou du bénéfice de l’entreprise ; le barème n’est pas publié.';

export const measure: Measure = {
    id: 'impots-entreprises',
    theme: 'Employeurs',
    title: 'Impôts des entreprises : CVAE, CFE, C3S et impôt sur les sociétés',
    context: note(
        'En 2025, l’impôt sur les sociétés a rapporté 59,9 Md€ net, la contribution exceptionnelle des entreprises de plus de 1 Md€ de chiffre d’affaires 7,5 Md€ et la CVAE 4,0 Md€. La CVAE doit disparaître en 2030 ; le PLF 2027 propose de prolonger la contribution exceptionnelle, à taux réduit.',
        at(VM1, 'p.25-32'), IS_TAUX, CFE,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder le calendrier : CVAE supprimée en 2030, IS à 25 % (15 % jusqu’à 42 500 €).',
            explain: 'La CVAE baisse jusqu’à sa fin en 2030 ; la CFE reste due. Les bénéfices des sociétés sont taxés à 25 %, et à 15 % jusqu’à 42 500 € si le chiffre d’affaires ne dépasse pas 10 M€.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Baisser fortement les impôts de production : supprimer CVAE et C3S, selon les projets aussi la CFE.',
            explain: 'Des impôts payés même sans bénéfice baisseraient ou disparaîtraient : la CVAE (sur la valeur ajoutée), la C3S (sur le chiffre d’affaires des grandes entreprises) et, selon les projets, la CFE (sur les locaux), en tout ou pour l’industrie.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'gain', weight: 3, why: 'Votre entreprise paierait moins d’impôts de production, même sans bénéfice : plus de CVAE au-delà de 500 000 € de chiffre d’affaires.' },
                { when: p => p.status === 'patron' && p.employerSize === 'pme', direction: 'gain', weight: 2, why: 'Votre entreprise ne paierait plus la CVAE si son chiffre d’affaires dépasse 500 000 € ; selon les projets, plus la CFE non plus.' },
                // mixed: below 500 000 € of turnover only the CFE is at stake, and only some projects remove it for every firm
                { when: p => p.status === 'patron' || p.status === 'indep', direction: 'mixed', weight: 1, why: 'Selon les projets et votre chiffre d’affaires, vous ne paieriez plus la CFE, ni la CVAE au-delà de 500 000 €.' },
            ],
        },
        {
            id: 'c',
            label: 'Prolonger la contribution exceptionnelle sur les bénéfices des grandes entreprises.',
            explain: 'Les très grandes entreprises, au-delà de 1,5 milliard d’euros de chiffre d’affaires, continueraient de payer un supplément d’impôt sur leurs bénéfices.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'loss', weight: 1, why: 'Seulement si votre entreprise dépasse 1,5 milliard d’euros de chiffre d’affaires : son impôt sur les bénéfices resterait majoré.' },
            ],
        },
        {
            id: 'd',
            label: 'Rendre l’impôt sur les sociétés progressif.',
            explain: 'Le taux d’impôt sur les bénéfices monterait avec la taille ou le bénéfice de l’entreprise, au lieu d’un taux unique de 25 %. Le barème n’est pas fixé.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'mixed', weight: 2, why: IS_WHY },
                { when: p => p.status === 'patron', direction: 'mixed', weight: 1, why: IS_WHY },
            ],
        },
        {
            id: 'e',
            label: 'Rétablir la CVAE au lieu de la supprimer en 2030.',
            explain: 'La CVAE, qui baisse chaque année jusqu’à sa fin prévue en 2030, serait rétablie. Elle reste due au-delà de 500 000 € de chiffre d’affaires.',
            effects: [
                { when: p => p.status === 'patron' && p.employerSize === 'eti', direction: 'loss', weight: 2, why: 'Votre entreprise continuerait de payer la CVAE, due au-delà de 500 000 € de chiffre d’affaires, au lieu de la voir disparaître.' },
                { when: p => p.status === 'patron' || (p.status === 'indep' && p.indepRegime === 'reel'), direction: 'loss', weight: 1, why: 'Si votre chiffre d’affaires dépasse 500 000 €, la CVAE resterait due au lieu de disparaître en 2030.' },
            ],
        },
    ],
    programme: programme({
        lfi: clear('d', [at(LFI_SYNTHESE, 'chap. 6, « Rendre l\'impôt sur les sociétés progressif »'), at(LFI_CONTRE_BUDGET, '« rendre plus progressif l\'impôt sur les sociétés (3 milliards) »')], 'la CVAE n\'est pas mentionnée'),
        pcf: clear('c', [at(PCF_BUDGET, '« la contribution exceptionnelle des grandes entreprises serait réduite de 2,5 milliards d’euros […]. C’est inacceptable »')], 'refuse la baisse de la contribution prévue au PLF 2027 ; le programme de 2022 rendait l’impôt sur les sociétés progressif, sans confirmation en 2025-2026'),
        eco: clear('e', [at(ECO_PROGRAMME, 'p.68, ch. 17 « Rétablir la CVAE » ; p.55, ch. 13-1 (taux réduit d\'IS des TPE-PME)')], 'baisse aussi le taux réduit d’IS des TPE-PME ; veut un impôt minimal sur les sociétés de plus de 1 Md€ de chiffre d’affaires et « réformer la surtaxe sur l’IS » (p.66), sans dire qu’elle serait prolongée'),
        ps: clear('d', [at(PS_REFAIRE_SOCIETE, '« Basculer vers un impôt progressif sur les sociétés », lu via archive.org (6 octobre 2026)')], 'la CVAE n’est pas mentionnée ; O. Faure demande aussi de ne pas réduire la contribution exceptionnelle (franceinfo, 18 septembre 2026, propos rapportés)'),
        ren: clear('b', [
            at(REN_NOUVELLE_DONNE, 'p.6, « refuserons toute hausse d’impôt sur les entreprises et baisserons encore les impôts de production » ; p.14'),
            at(ATTAL_REF, '« mener enfin à terme la suppression de la CVAE »'),
        ], 'impôts de production ramenés sous 3 % de la valeur ajoutée, sans liste des impôts ni calendrier'),
        modem: both(['b', 'c'], [at(MODEM_BUDGET, 'p.6 « Reconduire temporairement (un an) et partiellement (6 mds€) la surtaxe » ; p.7 « Accélérer le calendrier de suppression de la CVAE »')], 'propositions pour le budget 2026, faites ensemble : surtaxe reconduite un an et en partie ; suppression de la CVAE accélérée, ni C3S ni CFE citées'),
        hor: clear('b', [at(HOR_PROSPERE, '« 50 Md€ de baisses d\'impôts de production contre 50 Md€ d\'aides publiques improductives en moins »')], 'sans liste des impôts ni calendrier'),
        lr: clear('b', [
            at(RETAILLEAU_INDUSTRIE, 'FAQ, « en supprimant la C3S, la CVAE […] et en exonérant la part industrielle de la CFE »'),
            at(LR_COMPTES_PUBLICS, 'fiche 14, « Impôts de production supprimés », chiffrage à l’horizon 2032'),
        ], 'CFE exonérée pour sa seule part industrielle ; mise en œuvre sur le quinquennat'),
        udr: clear('b', [at(UDR_ACTE_II, 'p.22, CVAE : « suppression intégrale et immédiate » ; C3S : « Nous l’abolissons »')], 'texte du groupe (2025) ; supprime aussi la taxe sur les salaires ; la CFE n’est pas citée'),
        rn: clear('b', [at(RN_CONTRE_BUDGET, 'suppression de la CFE, de la CVAE et de la C3S'), at(RN_BARDELLA_FETE, '« Nous mettrons fin à la lourdeur des impôts de production »')]),
        rec: clear('b', [REC_KNAFO_IRDEME], 'faible : livre d\'une dirigeante, pas programme du candidat'),
    }),
};
