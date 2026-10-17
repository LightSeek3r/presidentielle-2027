import type { Measure, MeasureOption } from '../../src/data/impactTypes.ts';
import type { PartyId, Position, Source } from '../../src/data/types.ts';
import { FICTIONAL_ORDER } from './fictional.ts';

// FICTIONAL TEST DATA, NOT REAL POSITIONS.
//
// Demonstration measures for the tests of the impact engine. The measures, their effects and the
// positions of the twelve parties ("Parti A" to "Parti L", see fictional.ts) are all invented.

const SOURCE: Source = { url: 'https://example.org/demo', label: 'Source fictive (démonstration)', date: '2026-01-15', kind: 'autre' };
const NOTE = { text: 'Contexte fictif.', sources: [SOURCE] };

const ORDER: PartyId[] = FICTIONAL_ORDER;

// 'b' = backs option b, 'a+b' = split, '?' = not covered
const stances = (codes: string): Measure['programme'] =>
    Object.fromEntries(codes.split(' ').map((code, i): [PartyId, Position] => {
        if (code === '?') return [ORDER[i], { backs: null, reason: 'non-couvert' }];
        const backs = code.split('+');
        return [ORDER[i], { backs, kind: backs.length > 1 ? 'split' : 'clear', sources: [SOURCE] }];
    })) as Measure['programme'];

const option = (id: string, label: string, effects: MeasureOption['effects'] = []): MeasureOption => ({ id, label, effects });

export const DEMO_IMPACT_BANNER = 'Mesures fictives de démonstration : aucun programme réel.';

export const DEMO_IMPACT: Measure[] = [
    {
        id: 'demo-smic', theme: 'Salaires', title: 'Relever le SMIC de 10 % par la loi', context: NOTE,
        options: [
            option('a', 'Garder le SMIC indexé sur l’inflation'),
            option('b', 'Relever le SMIC de 10 %', [
                { when: p => (p.status === 'salarie' || p.status === 'public') && (p.income ?? 9) <= 2, direction: 'gain', weight: 3, why: 'Votre salaire de base monte, surtout près du SMIC.', euro: { perYear: [900, 1800], basis: NOTE } },
                { when: p => p.status === 'patron' && p.employerSize === 'tpe', direction: 'loss', weight: 2, why: 'Votre masse salariale augmente, surtout si vos salariés sont près du SMIC.' },
            ]),
        ],
        programme: stances('b b b b b a a a a a a a'),
    },
    {
        id: 'demo-cotisations', theme: 'Travail', title: 'Baisser les cotisations des employeurs', context: NOTE,
        options: [
            option('a', 'Garder les cotisations actuelles'),
            option('b', 'Baisser les cotisations des employeurs', [
                { when: p => p.status === 'patron', direction: 'gain', weight: 2, why: 'Le coût du travail baisse dans votre entreprise.' },
                { when: p => p.status === 'salarie' || p.status === 'public', direction: 'mixed', weight: 1, why: 'Peu d’effet direct sur votre net ; dépend de la compensation prévue.' },
            ]),
        ],
        programme: stances('a a a a a b b b b a ? ?'),
    },
    {
        id: 'demo-loyers', theme: 'Logement', title: 'Encadrer les loyers dans toutes les zones tendues', context: NOTE,
        options: [
            option('a', 'Garder l’encadrement actuel'),
            option('b', 'Étendre l’encadrement des loyers', [
                { when: p => p.housing === 'loc-prive' && p.zone === 'tendue', direction: 'gain', weight: 2, why: 'Votre loyer ne peut plus dépasser un plafond à la relocation.' },
                { when: p => p.landlord === true, direction: 'loss', weight: 2, why: 'Le loyer que vous pouvez demander est plafonné.' },
            ]),
        ],
        programme: stances('b b b b b+a a a a a a ? ?'),
    },
    {
        id: 'demo-pensions', theme: 'Retraites', title: 'Indexer toutes les pensions sur l’inflation', context: NOTE,
        options: [
            option('a', 'Garder la règle actuelle'),
            option('b', 'Indexer toutes les pensions sur les prix', [
                { when: p => p.status === 'retraite', direction: 'gain', weight: 2, why: 'Votre pension suit les prix, sans décrochage.', euro: { perYear: p => ((p.income ?? 0) >= 4 ? [300, 900] : [150, 500]), basis: NOTE } },
            ]),
        ],
        programme: stances('b b b b b a a a b b b b'),
    },
    {
        id: 'demo-allocation', theme: 'Aides', title: 'Fusionner APL, prime d’activité et RSA', context: NOTE,
        options: [
            option('a', 'Garder les aides séparées'),
            option('b', 'Fusionner en une allocation unique', [
                { when: p => p.aids.some(a => ['apl', 'pa', 'rsa'].includes(a)), direction: 'mixed', weight: 2, why: 'Selon le barème choisi, certains gagnent et d’autres perdent.' },
            ]),
        ],
        programme: stances('a a a a b b b b b ? ? ?'),
    },
];
