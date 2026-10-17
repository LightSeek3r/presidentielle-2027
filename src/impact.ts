import { CRITERIA, INCOME_BANDS } from './data/impactCriteria.ts';
import type {
    Measure, MeasureOption, PartySheet, Profile, ResolvedEffect, ResolvedOption,
} from './data/impactTypes.ts';
import type { PartyId } from './data/types.ts';

// Pure engine of the "Impact pour moi" page. No React, no browser API.
// There is deliberately no total, no score and no ordering across measures by personal gain:
// each party's sheet lists its measures grouped by direction, and that is all.

/** Enough answers to say anything about the visitor. */
export const isReady = (profile: Profile): boolean =>
    profile.income !== null && profile.status !== null && profile.age !== null;

/** Sum of the incomes of the adults of the household, from the band representatives. */
export const householdMonthlyIncome = (profile: Profile): number => {
    const own = profile.income === null ? 0 : INCOME_BANDS[profile.income].mid;
    const partner = profile.household === 'couple' && profile.partnerIncome !== null ? INCOME_BANDS[profile.partnerIncome].mid : 0;
    return own + partner;
};

/** First effect of the option whose condition holds, with its euro range for this profile. */
export const resolveOption = (profile: Profile, option: MeasureOption): ResolvedOption => {
    const effect = option.effects.find(e => e.when(profile)) ?? null;
    let euro: [number, number] | null = null;
    if (effect?.euro) {
        const { perYear } = effect.euro;
        euro = typeof perYear === 'function' ? perYear(profile) : perYear;
    }
    return { option, effect, euro };
};

/**
 * What a party's stance on a measure means for the profile. Null when the stance is unknown, the
 * party does not back any option, or no backed option concerns the profile.
 */
export const resolveMeasure = (profile: Profile, measure: Measure, backs: string[], cumulative = false): ResolvedEffect | null => {
    const options = backs
        .map(id => measure.options.find(o => o.id === id))
        .filter((o): o is MeasureOption => o !== undefined)
        .map(o => resolveOption(profile, o));
    const concerned = options.filter(o => o.effect !== null);
    if (concerned.length === 0) return null;

    const directions = new Set(concerned.map(o => o.effect!.direction));
    // A party that hesitates between options leaves the outcome open unless they all agree for this
    // visitor; a party that proposes them together (cumulative) is judged on the options that concern the visitor
    const direction = directions.size === 1 && (cumulative || concerned.length === options.length) ? [...directions][0] : 'mixed';
    const weight = Math.max(...concerned.map(o => o.effect!.weight)) as 1 | 2 | 3;
    return { measure, direction, weight, options, split: options.length > 1, cumulative: cumulative && options.length > 1 };
};

/** A party's measures sorted into what helps, what costs, what is open, what is irrelevant. */
export const partySheet = (profile: Profile, partyId: PartyId, measures: Measure[]): PartySheet => {
    const sheet: PartySheet = { gains: [], losses: [], mixed: [], notConcerned: [], keepsRule: [], unknown: [], documented: 0, total: measures.length };
    for (const measure of measures) {
        const position = measure.programme[partyId];
        if (position.backs === null) {
            sheet.unknown.push(measure);
            continue;
        }
        sheet.documented += 1;
        const resolved = resolveMeasure(profile, measure, position.backs, position.kind === 'split' && position.cumulative === true);
        if (!resolved) {
            const reference = position.backs.length === 1 && position.backs[0] === measure.options[0].id;
            (reference ? sheet.keepsRule : sheet.notConcerned).push(measure);
        }
        else if (resolved.direction === 'gain') sheet.gains.push(resolved);
        else if (resolved.direction === 'loss') sheet.losses.push(resolved);
        else sheet.mixed.push(resolved);
    }
    const byWeight = (a: ResolvedEffect, b: ResolvedEffect): number => b.weight - a.weight;
    sheet.gains.sort(byWeight);
    sheet.losses.sort(byWeight);
    sheet.mixed.sort(byWeight);
    return sheet;
};

/** The answers given, as short labels for the recap line ("Salarié du privé", "2 enfants"...). */
export const describeProfile = (profile: Profile): string[] => {
    const labels: string[] = [];
    for (const c of CRITERIA) {
        const value = profile[c.id];
        if (value === null || (Array.isArray(value) && value.length === 0)) continue;
        if (c.kind === 'steps') {
            if (c.id === 'income') labels.push(`Revenu : ${c.steps?.[value as number]}`);
            else if (c.id === 'partnerIncome') labels.push(`Revenu du conjoint : ${c.steps?.[value as number]}`);
            else if (c.id === 'wealthMaterial' && (value as number) > 0) labels.push(`Patrimoine matériel : ${c.steps?.[value as number]}`);
            else if (c.id === 'wealthImmaterial' && (value as number) > 0) labels.push(`Patrimoine immatériel : ${c.steps?.[value as number]}`);
        } else if (c.kind === 'toggle') {
            if (value === true && c.recap) labels.push(c.recap);
        } else if (c.id === 'children') {
            if ((value as number) > 0) labels.push(`${value === 3 ? '3 enfants ou plus' : `${value} enfant${value === 1 ? '' : 's'}`}`);
        } else {
            const picked = Array.isArray(value) ? value : [value];
            picked.forEach(v => {
                const option = c.options?.find(o => o.value === v);
                if (option) labels.push(option.label);
            });
        }
    }
    return labels;
};
