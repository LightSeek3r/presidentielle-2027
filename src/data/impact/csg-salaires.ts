import { at, clear, isWorking, note, programme, s, split } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';
import { BAREME_PLF2027, ENGINE, ENGINE_SOURCES, SP_CSG, TAXABLE_UPLIFT, foyerSets, householdRange, taxEstimable, taxOf } from './ir-bareme.ts';

const INSEE_EMPLOI = s('autre', '2026-10-14', 'Insee Résultats, « L’emploi en France en 2024 », tableau T103 (emploi salarié en fin d’année)', 'https://www.insee.fr/fr/statistiques/9054145');
const SMIC_2026 = s('autre', '2026-05-18', 'info.gouv.fr, « Le Smic revalorisé le 1er juin 2026 »', 'https://www.info.gouv.fr/actualite/le-smic-revalorise-le-1er-juin-2026');

// Parties
const LFI_SYNTHESE_6 = s('programme-2027', '2026-07-17', 'Synthèse des contributions, chapitre 6 « Partage des richesses », mesures « déjà présentes dans le programme actuel »', 'https://melenchon2027.fr/programme/synthese-des-contributions/chapitre-6-partage-des-richesses/');
const PCF_CAHIER_SECU = s('programme-2027', '2025-12-18', 'PCF, cahier thématique « Sécurité sociale » des Jours heureux (mis en ligne le 18 décembre 2025)', 'https://assets.nationbuilder.com/pcf/pages/36196/attachments/original/1766073347/document_-_cahier_se%CC%81cu_v2.pdf');
const PCF_2022_MOYEN_1 = s('programme-2022', '2022-01-01', 'Programme du PCF, « moyen 1 » (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/moyen_1');
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const LCP_CSG = s('declaration', '2026-10-14', 'LCP, « Budget de la Sécu : la CSG progressive voulue par les socialistes rejetée par les députés »', 'https://lcp.fr/actualites/budget-de-la-secu-la-csg-progressive-voulue-par-les-socialistes-rejetee-par-les-deputes');
const FRANCEINFO_DEBAT = s('declaration', '2026-08-27', 'franceinfo, premier débat des principaux candidats (Medef)', 'https://www.franceinfo.fr/elections/presidentielle/dette-publique-retraites-reindustrialisation-ce-qu-il-faut-retenir-du-premier-debat-des-principaux-candidats-a-la-presidentielle_8165342.html');
const PUBLICSENAT_MEETING = s('declaration', '2026-05-30', 'Public Sénat, premier meeting de G. Attal', 'https://www.publicsenat.fr/actualites/politique/un-an-pour-convaincre-pour-son-premier-grand-meeting-gabriel-attal-mise-sur-lespoir-et-joue-sa-difference-avec-edouard-philippe');
const MODEM_BUDGET = s('declaration', '2025-10-29', 'Dossier « Propositions budgétaires 2026 » du groupe Les Démocrates', 'https://www.mouvementdemocrate.fr/system/files/documents/Dossier%20de%20presse%20budget%202026%20%283%29.pdf');
const HOR_PROSPERE = s('programme-2027', '2026-01-01', 'Priorités « Pour une France plus prospère » (non daté, © 2026)', 'https://www.edouardphilippe.fr/priorites/pour-une-france-plus-prospere');
const LR_COMPTES_PUBLICS = s('programme-2027', '2026-10-12', 'Projet Retailleau, fiches presse « Rétablir l’ordre dans les comptes publics » (12 octobre 2026)', 'https://www.avecretailleau.fr/api/media/file/20261011_Fiches_presse_comptes_publics_mise_en_page%20(1).pdf');
const LR_POUVOIR_ACHAT = s('programme-2027', '2026-09-24', 'Projet Retailleau, mesure 24 « Rendre 500 euros par an à tous les salariés » (mise à jour du 24 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/rendre-30-milliards-d-euros-aux-salaries-et-aux-entreprises');
const UDR_ACTE_II = s('motion', '2025-04-08', 'Livret du groupe UDR « Pour une révolution fiscale » (Acte II du Grand Forum des libertés, colloque du 8 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3492/attachments/original/Livret_Colloque_-_Pour_une_re%CC%81volution_Fiscale_-_8_avril__2025_compressed_%281%29.pdf?1744211352');
const CONTREPOINTS_UDR = s('declaration', '2026-06-25', 'Contrepoints, « L’UDR d’Éric Ciotti veut libérer l’économie »', 'https://contrepoints.org/ludr-deric-ciotti-veut-liberer-leconomie/');
const RN_BARDELLA_FETE = s('declaration', '2026-05-02', 'Discours de J. Bardella, Fête de la Nation', 'https://rassemblementnational.fr/discours/fete-de-la-nation-discours-de-jordan-bardella');
const REC_PUBLICSENAT_2022 = s('programme-2022', '2022-03-23', 'Public Sénat, programme d\'É. Zemmour 2022', 'https://www.publicsenat.fr/actualites/politique/presidentielle-2022-eric-zemmour-detaille-son-programme-et-assume-le-terme');
const REC_TOUTSURMESFINANCES = s('programme-2022', '2022-01-01', 'Toutsurmesfinances, programme d\'É. Zemmour 2022 (mis à jour en septembre 2025)', 'https://www.toutsurmesfinances.com/argent/a/eric-zemmour-programme');
const REC_KNAFO = s('autre', '2026-09-07', 'Yahoo Finance, livre de S. Knafo (livre d\'une dirigeante, pas programme du candidat)', 'https://fr.finance.yahoo.com/actualites/130-milliards-d%C3%A9conomies-sarah-knafo-103113554.html');

// Net-to-gross ratio of the full-time SMIC (1 477,93 / 1 867,02); slightly lower for high private wages
const NET_RATIO = 1477.93 / 1867.02;
const CSG_BASE = 0.9825;

const csgPerMonth = (net: number, rate: number): number => (net / NET_RATIO) * CSG_BASE * rate;

// Gain from removing the 9,2 % CSG, minus the income tax due on the 6,8 points no longer deducted
const removalRange = (p: Profile): [number, number] =>
    householdRange(p, (own, partner) => {
        const before = foyerSets(p, own, partner, BAREME_PLF2027);
        // The 6,8 deductible points become taxable: added to the taxable wage, before the 10 % deduction
        const after = foyerSets(p, own + csgPerMonth(own, 0.068) / TAXABLE_UPLIFT, partner, BAREME_PLF2027);
        return before.map((set, i) => 12 * csgPerMonth(own, 0.092) - (taxOf(after[i], BAREME_PLF2027) - taxOf(set, BAREME_PLF2027)));
    });

const worksWithIncome = (p: Profile, test: (band: number) => boolean): boolean =>
    isWorking(p) && p.income !== null && test(p.income);

const partnerBand = (p: Profile, test: (band: number) => boolean): boolean =>
    p.household === 'couple' && p.partnerIncome !== null && test(p.partnerIncome);

const sideActivity = (p: Profile): boolean => !isWorking(p) && p.status !== null && p.otherIncome.includes('activite2');

export const measure: Measure = {
    id: 'csg-salaires',
    theme: 'Travail',
    title: 'Taux de CSG prélevé sur les salaires et revenus d’activité',
    context: note(
        'La CSG prélève 9,2 % sur 98,25 % du salaire brut, dont 6,8 points sont déduits du revenu imposable. Fin 2024, la France comptait 27,1 millions de salariés.',
        SP_CSG, at(INSEE_EMPLOI, 'T103'),
    ),
    options: [
        {
            id: 'a',
            label: 'Garder la CSG à 9,2 % sur tous les salaires et revenus d’activité.',
            explain: 'Le même taux s’applique quel que soit le salaire. Au SMIC, la CSG représente environ 170 € par mois.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Rendre la CSG progressive : taux réduit sur les bas salaires, plus élevé sur les hauts salaires.',
            explain: 'Exemple examiné à l’Assemblée en octobre 2026 : environ 0,5 % au SMIC au lieu de 9,2 %, et 10,2 % au-delà de 4 167 € net par mois.',
            effects: [
                {
                    when: p => worksWithIncome(p, band => band <= 2) && (p.household === 'seul' || partnerBand(p, band => band <= 2)),
                    direction: 'gain', weight: 3,
                    why: 'La CSG sur votre revenu d’activité baisserait nettement : environ 0,5 % au SMIC au lieu de 9,2 % dans le barème débattu.',
                },
                {
                    when: p => worksWithIncome(p, band => band >= 5) && (p.children ?? 0) === 0 && (p.household === 'seul' || partnerBand(p, band => band >= 5)),
                    direction: 'loss', weight: 2,
                    why: 'Le taux de CSG sur votre revenu d’activité passerait de 9,2 % à 10,2 % au-delà de 4 167 € net par mois.',
                },
                {
                    when: p => worksWithIncome(p, () => true) && p.household === 'seul' && (p.children ?? 0) === 0,
                    direction: 'mixed', weight: 1,
                    why: 'Autour de votre revenu, l’effet dépend du barème final : baisse jusqu’à environ 2 700 € net, hausse au-delà de 4 167 €.',
                },
                {
                    when: p => worksWithIncome(p, () => true),
                    direction: 'mixed', weight: 1,
                    why: 'Le taux dépendrait des revenus et des enfants du foyer : baisse jusqu’à environ 2 700 € net, hausse au-delà de 4 167 €.',
                },
                {
                    when: sideActivity,
                    direction: 'mixed', weight: 1,
                    why: 'La CSG sur votre activité secondaire baisserait ou monterait selon le montant de votre revenu d’activité.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Baisser la CSG ou les cotisations salariales pour augmenter le salaire net, sans hausse pour les hauts salaires.',
            explain: 'Selon les projets, la baisse vise tous les salaires ou seulement les plus bas. Personne ne paierait plus.',
            effects: [
                {
                    when: p => worksWithIncome(p, band => band <= 3),
                    direction: 'gain', weight: 2,
                    why: 'Votre revenu net d’activité augmenterait ; l’ampleur dépend de la baisse retenue, qui n’est pas fixée.',
                },
                {
                    when: p => worksWithIncome(p, () => true),
                    direction: 'gain', weight: 1,
                    why: 'Selon le projet, la baisse vise tous les salaires ou seulement les plus bas : gain possible pour vous, sans hausse.',
                },
                {
                    when: sideActivity,
                    direction: 'gain', weight: 1,
                    why: 'Le revenu net de votre activité secondaire pourrait augmenter un peu.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Supprimer la CSG sur les salaires et revenus d’activité.',
            explain: 'Plus aucune CSG ne serait prélevée sur les salaires et revenus d’activité. La part aujourd’hui déduite de l’impôt ne le serait plus, ce qui augmente un peu l’impôt sur le revenu.',
            effects: [
                {
                    when: p => p.status === 'salarie' && taxEstimable(p),
                    direction: 'gain', weight: 3,
                    why: 'La CSG de 9,2 % ne serait plus prélevée sur votre salaire : votre revenu net augmente d’autant, moins un peu d’impôt.',
                    euro: {
                        perYear: removalRange,
                        basis: note(
                            `CSG de 9,2 % sur 98,25 % du brut, brut estimé à partir du rapport net/brut du SMIC (79 %), moins l’impôt sur le revenu dû sur les 6,8 points qui ne sont plus déduits (barème proposé pour 2027) ; ${ENGINE}.`,
                            SMIC_2026, ...ENGINE_SOURCES,
                        ),
                    },
                },
                {
                    when: p => isWorking(p) && p.income !== null,
                    direction: 'gain', weight: 3,
                    why: 'La CSG de 9,2 % ne serait plus prélevée sur vos revenus d’activité : votre revenu net augmente.',
                },
                {
                    when: sideActivity,
                    direction: 'gain', weight: 1,
                    why: 'La CSG ne serait plus prélevée sur votre activité secondaire.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('b', [at(LFI_SYNTHESE_6, '« Faire la révolution fiscale »')]),
        pcf: split(['b', 'd'], [
            at(NFP, 'p. 13, CSG progressive'),
            at(PCF_CAHIER_SECU, 'p. 36, la CSG « ne peut donc pas disparaître du jour au lendemain, mais on doit s’inscrire dans une dynamique de suppression »'),
            at(PCF_2022_MOYEN_1, 'proposition 126, « faire progressivement disparaître la CSG »'),
        ], 'faible : b repose sur le NFP 2024 ; d est une suppression progressive, sans calendrier, au profit des cotisations sociales'),
        eco: clear('b', [at(ECO_PROGRAMME, 'p. 67, proposition 17.9')]),
        ps: clear('b', [LCP_CSG, at(FRANCEINFO_DEBAT, 'R. Glucksmann')]),
        ren: clear('c', [PUBLICSENAT_MEETING, at(FRANCEINFO_DEBAT, 'G. Attal')]),
        modem: clear('c', [at(MODEM_BUDGET, 'section 3 « Croissance partagée »')]),
        hor: clear('c', [HOR_PROSPERE, at(FRANCEINFO_DEBAT, 'É. Philippe')]),
        lr: clear('c', [
            at(LR_POUVOIR_ACHAT, '« Baisser les cotisations de 30 milliards d’euros par an. La moitié revient directement aux salariés »'),
            at(LR_COMPTES_PUBLICS, 'fiche 14, « Cotisations salariales en moins, dès le premier euro »'),
        ], 'baisse des cotisations de tous les salariés, environ 500 € nets par an au salaire médian ; la CSG n’est pas citée'),
        udr: clear('d', [
            at(UDR_ACTE_II, 'p. 6 et 13, « Supprimer la CSG et la CRDS sur les salaires »'),
            at(CONTREPOINTS_UDR, '« la suppression de la CSG et la CRDS sur les salaires »'),
        ], 'vise les salaires et supprime aussi la CRDS (0,5 %) ; rien trouvé sur les revenus des indépendants'),
        rn: clear('c', [RN_BARDELLA_FETE]),
        rec: split(['c', 'd'], [REC_PUBLICSENAT_2022, REC_TOUTSURMESFINANCES, REC_KNAFO], 'faible : c repose sur le programme 2022, d sur le livre d’une dirigeante'),
    }),
};
