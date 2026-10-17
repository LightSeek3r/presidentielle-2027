import { at, clear, note, programme, s } from '../impactHelpers.ts';
import type { Measure, Profile } from '../impactTypes.ts';

const SENAT_ESSENTIEL = s('autre', '2026-10-14', 'Sénat, commission des affaires économiques, « L’essentiel » sur la proposition de loi « rapports locatifs » (14 octobre 2026)', 'https://www.senat.fr/lessentiel/ppl25-217.pdf');
const SP_ENCADREMENT = s('autre', '2026-08-01', 'Service-public.gouv.fr, fiche F1314 « Encadrement des loyers en zone tendue » (vérifiée le 1er août 2026)', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1314');

const NFP = s('plateforme-2024', '2024-06-01', 'Contrat de législature du Nouveau Front populaire (juin 2024)', 'https://melenchon2027.fr/wp-content/uploads/2026/04/PROGRAMME-FRONT-POPULAIRE.pdf');
const LFI_SYNTHESE = s('programme-2027', '2026-06-01', 'Synthèse des contributions, « déjà au programme » (juin 2026)', 'https://melenchon2027.fr/synthese-des-contributions/');
const PCF_CAHIER_LOGEMENT = s('programme-2027', '2025-12-18', 'PCF, cahier thématique « Logement » des Jours heureux (mis en ligne le 18 décembre 2025)', 'https://assets.nationbuilder.com/pcf/pages/36197/attachments/original/1766073372/document_-_cahier_logement_ppp.pdf');
const ECO_PROGRAMME = s('programme-2027', '2026-07-01', 'Programme des Écologistes « Pour une prospérité écologique » (juillet 2026, le 1er du mois est utilisé)', 'https://lesecologistes.fr/document/3N4JsAEmq6vsx42IITGNZa/vdef-programme-1.pdf');
const PS_PPL = s('motion', '2025-12-11', 'Proposition de loi d’I. Echaniz (groupe socialiste), texte adopté par l’Assemblée nationale n°196', 'https://www.assemblee-nationale.fr/dyn/17/textes/l17t0196_texte-adopte-seance');
const PS_VIVRE_LIBRES = s('programme-2027', '2026-06-25', 'Projet socialiste « Vivre libres »', 'https://projet-socialiste.fr/projet/vivre-libres/');
const AN_SEANCE_PPL = s('declaration', '2025-12-11', 'Assemblée nationale, compte rendu de la 2e séance du 11 décembre 2025 (proposition de loi Echaniz)', 'https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/deuxieme-seance-du-jeudi-11-decembre-2025');
const RETAILLEAU_LOYERS = s('programme-2027', '2026-09-12', 'Projet Retailleau, mesure 68 « Supprimer l’encadrement des loyers » (mise à jour du 12 septembre 2026)', 'https://www.avecretailleau.fr/projet/mesure/supprimer-l-encadrement-des-loyers');
const UDR_ACTE_I = s('motion', '2025-04-10', 'Livret du groupe UDR « Acte I du Grand Forum des Libertés » (PDF du 10 avril 2025)', 'https://assets.nationbuilder.com/amisdericciotti/mailings/3524/attachments/original/Livret_Acte_I_Grand_Forum_des_Liberte%CC%81s_compressed.pdf?1744280025');

// The visitor's commune is unknown: "tendue" is the closest field, so effects stay conditional.
// "Ville moyenne ou périphérie" also holds covered communes (Plaine Commune, Est Ensemble, Pays basque...).
const tenantInTightArea = (p: Profile): boolean => p.housing === 'loc-prive' && p.zone === 'tendue';
const tenantInMidTown = (p: Profile): boolean => p.housing === 'loc-prive' && p.zone === 'detendue';

export const measure: Measure = {
    id: 'encadrement-loyers',
    theme: 'Logement',
    title: 'Encadrement des loyers du parc privé',
    context: note(
        'Depuis la loi Élan de 2018, les loyers sont encadrés à titre expérimental dans 70 communes (Paris, Lyon, Lille, Bordeaux, Montpellier...). Selon l’évaluation remise en mai 2026, l’encadrement y a réduit les loyers de 2 à 4 % en deux ans, pour 181 M€ de recettes fiscales en moins par an et un effet redistributif limité ; son effet sur l’offre de logements n’a pas pu être mesuré. L’expérimentation prend fin le 23 novembre 2026. L’Assemblée a voté en décembre 2025 un texte qui la rend permanente ; le 14 octobre 2026, la commission du Sénat l’a remplacé par une prolongation de deux ans, sans extension.',
        SENAT_ESSENTIEL,
        SP_ENCADREMENT,
    ),
    options: [
        {
            id: 'a',
            label: 'Laisser l’expérimentation s’arrêter fin novembre 2026, comme le prévoit la loi actuelle.',
            explain: 'C’est la loi actuelle, et elle change d’elle-même : l’expérimentation prend fin le 23 novembre 2026. Ensuite, le loyer d’un nouveau bail ne serait plus plafonné par un loyer de référence, même dans les villes qui l’appliquent.',
            effects: [
                {
                    when: tenantInTightArea,
                    direction: 'loss',
                    weight: 2,
                    why: 'Si votre commune encadre aujourd’hui les loyers, votre prochain bail ne serait plus plafonné par un loyer de référence.',
                },
                {
                    when: tenantInMidTown,
                    direction: 'loss',
                    weight: 1,
                    why: 'Si votre commune encadre aujourd’hui les loyers, comme certaines communes de banlieue, votre prochain bail ne serait plus plafonné.',
                },
                {
                    when: p => p.landlord === true,
                    direction: 'gain',
                    weight: 2,
                    why: 'Si votre logement loué est dans une commune encadrée, le loyer d’un nouveau bail ne serait plus plafonné.',
                },
            ],
        },
        {
            id: 'b',
            label: 'Rendre l’encadrement permanent dans les villes qui le demandent.',
            explain: 'L’encadrement ne serait plus limité dans le temps. Les communes et intercommunalités qui le souhaitent pourraient l’appliquer par délibération ; les autres n’en auraient pas.',
            effects: [
                {
                    when: p => tenantInTightArea(p) || tenantInMidTown(p),
                    direction: 'gain',
                    weight: 1,
                    why: 'Là où l’encadrement existe, il resterait ; si votre commune ne l’applique pas encore, elle pourrait décider de le faire.',
                },
                {
                    when: p => p.landlord === true,
                    direction: 'loss',
                    weight: 1,
                    why: 'Si votre logement loué est dans une commune qui l’applique, le loyer d’un nouveau bail resterait plafonné.',
                },
            ],
        },
        {
            id: 'c',
            label: 'Rendre l’encadrement obligatoire dans toutes les zones tendues.',
            explain: 'Toutes les communes où il est difficile de se loger devraient appliquer un loyer de référence par quartier, qu’elles le demandent ou non.',
            effects: [
                {
                    when: tenantInTightArea,
                    direction: 'gain',
                    weight: 2,
                    why: 'Le loyer de votre prochain bail serait plafonné par un loyer de référence, même si votre commune ne l’a pas demandé.',
                },
                {
                    when: tenantInMidTown,
                    direction: 'gain',
                    weight: 1,
                    why: 'Si votre commune est classée en zone tendue, le loyer de votre prochain bail serait plafonné par un loyer de référence.',
                },
                {
                    when: p => p.landlord === true,
                    direction: 'loss',
                    weight: 2,
                    why: 'Si votre logement loué est en zone tendue, le loyer d’un nouveau bail serait plafonné par un loyer de référence.',
                },
            ],
        },
        {
            id: 'd',
            label: 'Prolonger l’expérimentation de deux ans dans les mêmes communes, sans l’étendre à d’autres.',
            explain: 'Les communes qui encadrent aujourd’hui les loyers pourraient continuer deux ans de plus ; aucune autre ne pourrait commencer. Le Parlement déciderait ensuite de la suite, au vu d’une nouvelle évaluation.',
            effects: [
                // Mixed: nothing changes for two years, and what follows is left to a later law
                {
                    when: p => tenantInTightArea(p) || tenantInMidTown(p),
                    direction: 'mixed',
                    weight: 1,
                    why: 'Si votre commune encadre aujourd’hui les loyers, le plafond resterait deux ans de plus ; la suite dépendrait d’une nouvelle loi.',
                },
                {
                    when: p => p.landlord === true,
                    direction: 'mixed',
                    weight: 1,
                    why: 'Si votre logement loué est dans une commune encadrée, le plafond resterait deux ans de plus ; la suite dépendrait d’une nouvelle loi.',
                },
            ],
        },
    ],
    programme: programme({
        lfi: clear('c', [at(LFI_SYNTHESE, 'chap. 7, « Étendre et pérenniser l’encadrement des loyers sur tout le territoire »'), at(NFP, 'p.16, « encadrement des loyers de manière obligatoire dans les zones tendues »')], 'va plus loin : la synthèse vise tout le territoire'),
        pcf: clear('c', [at(PCF_CAHIER_LOGEMENT, 'p.29, « Nous voulons pérenniser cet encadrement des loyers, et le mettre en place sur toutes les zones tendues »'), at(NFP, 'p.16')]),
        eco: clear('c', [at(ECO_PROGRAMME, 'p.20, « généralisation, l’amélioration et la pérennisation de l’encadrement des loyers »')]),
        ps: clear('b', [at(PS_PPL, 'art. 1er, dispositif permanent mis en œuvre sur délibération'), at(PS_VIVRE_LIBRES, '« encadrant les loyers »')]),
        hor: clear('d', [at(AN_SEANCE_PPL, 'F. Jolivet, « Le groupe Horizons & indépendants soutiendra cet amendement » (prolongation de deux ans)')], 'faible : position du groupe en séance (11 décembre 2025), aucun texte du parti ou du candidat trouvé'),
        lr: clear('a', [RETAILLEAU_LOYERS], 'propose aussi d’abroger les mécanismes de plafonnement prévus par la loi de 1989'),
        udr: clear('a', [at(UDR_ACTE_I, 'p.44, « Le groupe UDR propose l’abrogation des lois SRU, DALO et de l’encadrement des loyers »')], 'abroge aussi la loi SRU et le DALO'),
    }),
};
