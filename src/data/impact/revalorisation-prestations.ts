import { at, clear, hasAid, note, programme, s } from '../impactHelpers.ts';
import type { Effect, Measure } from '../impactTypes.ts';

const EP27 = s('autre', '2026-10-01', 'PLF 2027, évaluations préalables des articles, article 74', 'https://www.budget.gouv.fr/documentation/file-download/33505');

const LO_BROCHURE = s('programme-2027', '2026-06-26', 'Brochure LO Présidentielle 2027', 'https://www.lutte-ouvriere.org/medias/document/fichiers/2026/06/brochure_caravane_2026-01_-_couleur.pdf');
const LFI_CONTRE_BUDGET = s('declaration', '2026-10-14', 'LCP, contre-budget de LFI présenté par É. Coquerel', 'https://lcp.fr/actualites/contre-budget-lfi-propose-1064-milliards-d-euros-de-recettes-supplementaires-et-817');
const LFI_SYNTHESE = s('programme-2027', '2026-07-17', 'Synthèse des contributions, « déjà au programme » (17 juillet 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const FRANCEINFO_ZERO_DEFICIT = s('declaration', '2026-07-03', 'franceinfo, « Zéro déficit en 2037 » (G. Attal)', 'https://www.franceinfo.fr/politique/gabriel-attal/zero-deficit-en-2037-gabriel-attal-devoile-une-serie-de-mesures-pour-retablir-les-finances-publiques-en-vue-de-la-presidentielle_8091860.html');
const ATTAL_PARISIEN = s('declaration', '2026-07-03', 'Site de campagne de G. Attal, « Dans Le Parisien : Gabriel Attal vise le zéro déficit en 2037 »', 'https://attalpresident.fr/actualites/dans-le-parisien-gabriel-attal-vise-le-zero-deficit-en-2037');
const MODEM_FESNEAU_BUDGET = s('declaration', '2026-10-15', 'MoDem, M. Fesneau (président du groupe Les Démocrates), « Rien ne serait pire que de ne pas avoir de budget », entretien aux Échos relayé par le MoDem', 'https://www.mouvementdemocrate.fr/nos-parlementaires/marc-fesneau-rien-ne-serait-pire-que-de-ne-pas-avoir-de-budget-image-8524-image');
const RN_CONTRE_BUDGET = s('autre', '2025-10-23', 'Contre-budget 2026 du groupe RN', 'https://rassemblementnational.fr/documents/GRN-CONTRE-BUDGET-2026.pdf');

const NOTE_NFP = 'faible : programme commun NFP 2024 seul';

const freezeHousing: Effect = {
    when: p => hasAid(p, 'apl'),
    direction: 'loss',
    weight: 2,
    why: 'Votre aide au logement ne suivrait pas, pendant un an, la hausse annuelle des loyers de référence.',
};

const FREEZE_WHY = 'Votre aide garderait le même montant pendant un an, sans la hausse annuelle prévue au 1er avril.';

export const measure: Measure = {
    id: 'revalorisation-prestations',
    theme: 'Solidarité',
    title: 'Revalorisation annuelle des prestations : RSA, aides au logement, AAH, allocations familiales',
    context: note(
        'La prime d’activité suit les prix chaque 1er avril (+0,8 % en 2026, 2,3 % prévus en 2027) et les aides au logement les loyers chaque 1er octobre. Le PLF 2027 propose de ne revaloriser ni l’une ni les autres en 2027.',
        at(EP27, 'p.596-601'),
    ),
    options: [
        {
            id: 'a',
            label: 'Revaloriser chaque année au rythme des prix (+0,8 % au 1er avril 2026).',
            explain: 'Chaque année, ces aides augmentent comme les prix, ou comme les loyers de référence pour les aides au logement.',
            effects: [],
        },
        {
            id: 'b',
            label: 'Geler les prestations pendant un an.',
            explain: 'Les montants resteraient identiques pendant un an, même si les prix montent.',
            effects: [
                { when: p => hasAid(p, 'rsa', 'aah', 'af', 'pa'), direction: 'loss', weight: 2, why: FREEZE_WHY },
                freezeHousing,
            ],
        },
        {
            id: 'c',
            label: 'Revaloriser au-delà des prix, par exemple +10 % pour les aides au logement.',
            explain: 'Les aides augmenteraient plus vite que les prix, par exemple de 10 % pour les aides au logement.',
            effects: [
                {
                    when: p => hasAid(p, 'apl'),
                    direction: 'gain',
                    weight: 3,
                    why: 'Votre aide au logement augmenterait plus vite que les loyers de référence, jusqu’à 10 % dans les propositions chiffrées.',
                },
                {
                    when: p => hasAid(p, 'rsa', 'aah', 'af', 'pa'),
                    direction: 'gain',
                    weight: 2,
                    why: 'Votre aide augmenterait plus vite que les prix ; le gain dépend du taux retenu, que l’option ne fixe pas.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Geler pendant un an les prestations, sauf l’AAH et les prestations familiales.',
            explain: 'Le RSA, la prime d’activité et les aides au logement garderaient le même montant pendant un an ; l’AAH et les allocations familiales continueraient de suivre les prix.',
            effects: [
                { when: p => hasAid(p, 'rsa', 'pa'), direction: 'loss', weight: 2, why: FREEZE_WHY },
                freezeHousing,
            ],
        },
    ],
    programme: programme({
        lo: clear('c', [at(LO_BROCHURE, 'p.9')]),
        lfi: clear('c', [LFI_CONTRE_BUDGET, at(LFI_SYNTHESE, 'chap. 9')]),
        pcf: clear('c', [at(NFP, 'p.4')], NOTE_NFP),
        eco: clear('c', [at(ECO_PROGRAMME, 'propositions 32-1 et 32-2, p.119')]),
        ps: clear('c', [at(NFP, 'p.4')], NOTE_NFP),
        ren: clear('b', [at(ATTAL_PARISIEN, '« Dès le budget 2028, une "année blanche" gèlera temporairement les prestations sociales »'), FRANCEINFO_ZERO_DEFICIT], '« année blanche » dès le budget 2028, petites retraites épargnées'),
        modem: clear('d', [at(MODEM_FESNEAU_BUDGET, 'année blanche générale « en préservant l’allocation adulte handicapé et les prestations familiales »')]),
        rn: clear('a', [at(RN_CONTRE_BUDGET, '« Indexation des retraites et dégel des prestations »')]),
    }),
};
