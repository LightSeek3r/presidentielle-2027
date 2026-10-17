import { INCOME_BANDS, WEALTH_IMMATERIAL_BANDS, WEALTH_MATERIAL_BANDS } from './impactCriteria.ts';
import type { Profile } from './impactTypes.ts';
import type { AbsentReason, OptionId, PartyId, Position, Source, SourceKind, SourcedNote } from './types.ts';

// Building blocks shared by the files of data/impact/. Same helpers as the quiz bank (questions.ts),
// plus predicates and amounts read off a Profile.

// ── Sources and positions ─────────────────────────────────────────────────────────────────

export const s = (kind: SourceKind, date: string, label: string, url: string): Source => ({ url, label, date, kind });

// Same source, with the passage or page it is used for
export const at = (source: Source, where: string): Source => ({ ...source, label: `${source.label}, ${where}` });

export const note = (text: string, ...sources: Source[]): SourcedNote => ({ text, sources });

export const clear = (option: OptionId, sources: Source[], text?: string): Position => ({
    backs: [option], kind: 'clear', sources, ...(text ? { note: text } : {}),
});

export const split = (backs: OptionId[], sources: Source[], text?: string): Position => ({
    backs, kind: 'split', sources, ...(text ? { note: text } : {}),
});

/** The party proposes all these options together, as one package (not a hesitation between them). */
export const both = (backs: OptionId[], sources: Source[], text?: string): Position => ({
    backs, kind: 'split', cumulative: true, sources, ...(text ? { note: text } : {}),
});

// No usable position: "non-couvert" (the party says nothing on it that we found), "ambigu" (says
// several things), "absent" (does not apply to this party)
export const none = (reason: AbsentReason): Position => ({ backs: null, reason });
export const NC: Position = none('non-couvert');
export const AMB: Position = none('ambigu');

/** Every party must have an entry; the ones left out are "non-couvert". */
export const programme = (positions: Partial<Record<PartyId, Position>>): Record<PartyId, Position> => ({
    lo: NC, lfi: NC, pcf: NC, eco: NC, ps: NC, ren: NC, modem: NC, hor: NC, lr: NC, udr: NC, rn: NC, rec: NC,
    ...positions,
});

// ── Predicates and amounts ────────────────────────────────────────────────────────────────

/** Representative monthly net income of the visitor (band middle), or null when unanswered. */
export const monthlyIncome = (p: Profile): number | null => (p.income === null ? null : INCOME_BANDS[p.income].mid);

export const partnerMonthlyIncome = (p: Profile): number | null =>
    p.household === 'couple' && p.partnerIncome !== null ? INCOME_BANDS[p.partnerIncome].mid : null;

/** Monthly net income of the adults of the household (band middles). */
export const householdMonthlyIncome = (p: Profile): number | null => {
    const own = monthlyIncome(p);
    if (own === null) return null;
    return own + (partnerMonthlyIncome(p) ?? 0);
};

/** Lower bound of the wealth in each family, in euros. */
export const wealthFloor = (p: Profile): { material: number; immaterial: number; total: number } => {
    const material = p.wealthMaterial === null ? 0 : WEALTH_MATERIAL_BANDS[p.wealthMaterial].min;
    const immaterial = p.wealthImmaterial === null ? 0 : WEALTH_IMMATERIAL_BANDS[p.wealthImmaterial].min;
    return { material, immaterial, total: material + immaterial };
};

/** Representative total wealth (band middles), in euros. */
export const wealthMid = (p: Profile): number =>
    (p.wealthMaterial === null ? 0 : WEALTH_MATERIAL_BANDS[p.wealthMaterial].mid)
    + (p.wealthImmaterial === null ? 0 : WEALTH_IMMATERIAL_BANDS[p.wealthImmaterial].mid);

export const isEmployee = (p: Profile): boolean => p.status === 'salarie' || p.status === 'public';
export const isWorking = (p: Profile): boolean => isEmployee(p) || p.status === 'indep' || p.status === 'patron';
export const isRetired = (p: Profile): boolean => p.status === 'retraite';
export const isOwner = (p: Profile): boolean => p.housing === 'prop' || p.housing === 'prop-credit';
export const isTenant = (p: Profile): boolean => p.housing === 'loc-prive' || p.housing === 'loc-social';
export const hasChildren = (p: Profile): boolean => (p.children ?? 0) > 0;
export const hasAid = (p: Profile, ...aids: Profile['aids']): boolean => aids.some(a => p.aids.includes(a));
export const inCouple = (p: Profile): boolean => p.household === 'couple';
export const singleParent = (p: Profile): boolean => p.household === 'seul' && hasChildren(p);
