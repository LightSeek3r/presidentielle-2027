// FICTIONAL TEST DATA, NOT REAL POSITIONS.
//
// Twelve invented parties, "Parti A" to "Parti L", for the demonstration datasets of the tests. They
// stand for no real party, in any order. The engine works with any party id; only the TypeScript
// type `PartyId` lists the real ids, so the fictional ids are cast to it here and nowhere else.

import type { Party, PartyId } from '../../src/data/types.ts';

export const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'] as const;
export type Letter = typeof LETTERS[number];

/** The id of a fictional party: parti('a') is "parti-a". */
export const parti = (letter: Letter): PartyId => `parti-${letter}` as PartyId;

/** Fictional parties in table order. Parti A and Parti L have no group of deputies. */
export const FICTIONAL_ORDER: PartyId[] = LETTERS.map(parti);

export const FICTIONAL_PARTIES: Party[] = LETTERS.map((letter, i) => ({
    id: parti(letter),
    label: `Parti ${letter.toUpperCase()} (fictif)`,
    shortLabel: letter.toUpperCase(),
    gradient: ['#555555', '#333333'],
    ...(i === 0 || i === LETTERS.length - 1 ? {} : { group: { abbrev: `G${letter.toUpperCase()}` } }),
}));
