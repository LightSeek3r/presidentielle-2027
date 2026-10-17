import { at, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';
import { BAREME_2026, foyerSets, householdKnown, incomeSamples, irTax } from './ir-bareme.ts';

const hasCapital = (p: Profile): boolean => p.otherIncome.includes('capital');

// Marginal income-tax rate of the household on 1 000 € more of taxable income, over its income bands
// and both ways a couple can file (QF cap and décote included, as in ir-bareme.ts). Filing apart, the
// capital income may be declared by either partner, so both returns are sampled.
const marginalRates = (p: Profile): number[] | null => {
    if (!householdKnown(p)) return null;
    const partners = p.household === 'couple' ? incomeSamples(p.partnerIncome!) : [0];
    return incomeSamples(p.income!).flatMap(own => partners.flatMap(partner =>
        foyerSets(p, own, partner).flatMap(set => set.map(f =>
            (irTax({ ...f, income: f.income + 1000 }, BAREME_2026) - irTax(f, BAREME_2026)) / 1000))));
};

const TOP_OF_11 = 0.11;
const RATE_30 = 0.3;
// Rounding margin on the marginal rates computed above
const EPS = 0.001;

const SP_PRELEVEMENTS = s('autre', '2026-06-30', 'Service-public, fiche F2329 « Prélèvements sociaux sur les revenus du patrimoine et les placements » (vérifiée le 30 juin 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2329');
const SP_BAREME = s('autre', '2026-04-15', 'Service-public, fiche F1419 « Barème de l’impôt sur le revenu » (vérifiée le 15 avril 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419');
const VM1 = s('autre', '2026-10-05', 'PLF 2027, Évaluation des voies et moyens, tome I (PDF du 5 octobre 2026)', 'https://www.budget.gouv.fr/documentation/file-download/34339');

// Parties
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE_6 = s('programme-2027', '2026-07-17', 'Synthèse des contributions, chapitre 6, « déjà présentes dans le programme actuel »', 'https://melenchon2027.fr/programme/synthese-des-contributions/chapitre-6-partage-des-richesses/');
const LCP_CONTRE_BUDGET_LFI = s('declaration', '2026-10-14', 'LCP, contre-budget de LFI pour 2027', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const PCF_2022_MOYEN_1 = s('programme-2022', '2022-01-01', 'Programme du PCF, « moyen 1 » (page non datée, cycle 2022 ; le 1er janvier est utilisé)', 'https://www.pcf.fr/moyen_1');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_REFAIRE_SOCIETE = s('programme-2027', '2026-06-25', 'Projet socialiste « Refaire société »', 'https://projet-socialiste.fr/projet/refaire-societe/');
const UDR_AMENDEMENT = s('motion', '2025-10-21', 'Amendement n° I-1665 de huit députés du groupe UDR au PLF 2026 (G. Verny et autres), PFU porté de 12,8 % à 7,8 %', 'https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/1665');
const PUBLICSENAT_RN = s('declaration', '2025-10-21', 'Public Sénat, « Budget 2026 : le RN s’éloigne de la gauche sur la fiscalité »', 'https://www.publicsenat.fr/actualites/economie/budget-2026-le-rn-seloigne-de-la-gauche-sur-la-fiscalite');
const REN_NOUVELLE_DONNE = s('programme-2027', '2025-07-21', 'Convention Renaissance « Nouvelle donne économique et climatique »', 'https://doc.parti.re/Conventions-thematiques_Nouvelle-donne.pdf');
const ATTAL_REF = s('declaration', '2026-08-27', 'Site de campagne de G. Attal, « À La REF : Gabriel Attal, grand gagnant du premier débat de la présidentielle 2027 »', 'https://attalpresident.fr/actualites/a-la-ref-gabriel-attal-grand-gagnant-du-premier-debat-de-la-presidentielle-2027');
const ATTAL_AFER = s('declaration', '2026-09-29', 'Site de campagne de G. Attal, « Aux Assises de l’AFER, Gabriel Attal défend une épargne qui finance l’économie française »', 'https://attalpresident.fr/actualites/aux-assises-de-l-afer-gabriel-attal-defend-une-epargne-qui-finance-l-economie-francaise');

export const measure: Measure = {
    id: 'revenus-capital-pfu',
    theme: 'Patrimoine',
    title: 'Imposition des dividendes, intérêts et plus-values',
    context: note(
        'Depuis 2026, dividendes, intérêts et plus-values sont taxés à 31,4 % par le prélèvement forfaitaire unique (12,8 % d’impôt sur le revenu et 18,6 % de prélèvements sociaux), ou au barème si le foyer le choisit. Cette part d’impôt a rapporté 7,9 milliards d’euros en 2025.',
        SP_PRELEVEMENTS, at(VM1, 'p. 15 et 18, ligne « PFO/PFU » du tableau de l’impôt sur le revenu'), SP_BAREME,
    ),
    options: [
        {
            id: 'a',
            label: 'Garder le prélèvement forfaitaire de 31,4 % (30 % pour l’assurance-vie).',
            explain: 'Les revenus de l’épargne et des placements sont taxés à un taux unique. Chacun peut choisir à la place le barème de l’impôt sur le revenu, s’il lui est plus favorable.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Supprimer le prélèvement forfaitaire : revenus du capital taxés au barème de l’impôt sur le revenu.',
            explain: 'Dividendes, intérêts et plus-values s’ajouteraient aux salaires et pensions, et seraient taxés comme eux, de 0 à 45 % selon les revenus du foyer, en plus des prélèvements sociaux.',
            effects: [
                {
                    when: p => hasCapital(p) && Math.min(...(marginalRates(p) ?? [0])) >= RATE_30 - EPS,
                    direction: 'loss', weight: 2,
                    why: 'Votre tranche d’impôt est d’au moins 30 % : vos revenus du capital seraient plus taxés qu’à 31,4 %.',
                },
                {
                    // The décote zone (marginal rate about 16 %) is left out: interest would cost more there
                    when: p => hasCapital(p) && Math.max(...(marginalRates(p) ?? [1])) <= TOP_OF_11 + EPS,
                    direction: 'gain', weight: 1,
                    why: 'Votre tranche d’impôt est de 11 % au plus : au barème, vos revenus du capital seraient moins taxés, sauf si vous le choisissez déjà.',
                },
                {
                    when: p => hasCapital(p) && p.income !== null && p.household !== null,
                    direction: 'mixed', weight: 1,
                    why: 'Selon votre taux marginal d’impôt, incertain dans vos tranches de revenus, vos revenus du capital seraient moins ou plus taxés qu’à 31,4 %.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Relever le prélèvement forfaitaire de 3 points, Livret A et LDDS restant exonérés.',
            explain: 'Le taux passerait de 31,4 % à 34,4 % sur les dividendes, intérêts et plus-values, voire plus si la CSG sur ces revenus augmente aussi. Livret A et LDDS resteraient sans impôt.',
            effects: [
                { when: p => hasCapital(p) && (p.wealthImmaterial ?? 0) >= 3, direction: 'loss', weight: 2, why: 'Vous paieriez au moins 3 € de plus pour 100 € de dividendes, d’intérêts ou de plus-values, hors Livret A et LDDS.' },
                { when: hasCapital, direction: 'loss', weight: 1, why: 'Vous paieriez au moins 3 € de plus pour 100 € de dividendes, d’intérêts ou de plus-values, hors Livret A et LDDS.' },
            ],
        },
        {
            id: 'd',
            label: 'Baisser la part d’impôt du prélèvement forfaitaire, de 12,8 % à 7,8 %.',
            explain: 'Le taux total passerait de 31,4 % à 26,4 % sur les dividendes, intérêts et plus-values. Les prélèvements sociaux ne changeraient pas.',
            effects: [
                { when: p => hasCapital(p) && (p.wealthImmaterial ?? 0) >= 3, direction: 'gain', weight: 2, why: 'Vous paieriez 5 € de moins pour 100 € de dividendes, d’intérêts ou de plus-values taxés au taux unique.' },
                { when: hasCapital, direction: 'gain', weight: 1, why: 'Vous paieriez 5 € de moins pour 100 € de dividendes, d’intérêts ou de plus-values taxés au taux unique.' },
            ],
        },
    ],
    programme: programme({
        lfi: clear('b', [at(LFI_SYNTHESE_6, '« Supprimer la flat tax »'), at(LCP_CONTRE_BUDGET_LFI, '« suppression de la flat tax (9 milliards) »'), at(NFP, 'p. 13')]),
        pcf: clear('b', [at(NFP, 'p. 13'), at(PCF_2022_MOYEN_1, 'proposition 127, « Le régime du prélèvement forfaitaire unique sera simultanément aboli »')], 'faible : programme 2022 et texte commun NFP 2024 ; rien de 2026 sur le prélèvement forfaitaire'),
        eco: clear('c', [at(ECO_PROGRAMME, 'ch. 17-11, p. 68, « Augmenter la flat tax (PFU) de 3 points » et la CSG sur les revenus du capital de 3 points')], '+3 points de PFU et +3 points de CSG sur le capital : leur cumul n’est pas précisé'),
        ps: clear('b', [at(PS_REFAIRE_SOCIETE, '« Supprimer le prélèvement forfaitaire unique (« flat tax ») », lu via archive.org (6 octobre 2026)')], 'propose aussi d’augmenter la CSG sur les revenus du capital'),
        ren: clear('a', [at(ATTAL_REF, '« flat tax et suppression de l’ISF […] refuse tout retour en arrière »'), at(ATTAL_AFER, 'défend « la stabilité de la fiscalité de l’assurance-vie »'), at(REN_NOUVELLE_DONNE, 'p. 12, flat tax présentée comme une avancée ; p. 17, PFU divisé par deux sur l’assurance-vie de long terme')], 'la convention de 2025 module le PFU de l’assurance-vie selon la durée ; le candidat écarte en 2026 tout retour sur la flat tax'),
        udr: clear('d', [UDR_AMENDEMENT], 'amendement de huit députés du groupe au PLF 2026, rejeté le 3 novembre 2025 ; aucun texte du parti sur le PFU'),
        rn: clear('a', [PUBLICSENAT_RN], 'faible : presse, refus de relever le taux en 2025 et déclaration de J. Bardella de 2024'),
    }),
};
