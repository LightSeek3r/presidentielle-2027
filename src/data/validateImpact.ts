import { CRITERIA } from './impactCriteria.ts';
import { EMPTY_PROFILE } from './impactTypes.ts';
import type { Effect, Measure, Profile } from './impactTypes.ts';
import type { PartyId, Position } from './types.ts';
import { PARTIES } from './parties.ts';
import { noteErrors, nonEmpty, positionErrors, wordCount } from './validate.ts';

export const MAX_MEASURE_TITLE_WORDS = 14;
export const MAX_IMPACT_OPTION_WORDS = 20;
export const MAX_WHY_WORDS = 25;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 5;

/** Structural checks of the criteria graph (the stepper). */
export const criteriaErrors = (): string[] => {
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const c of CRITERIA) {
        const where = `criterion ${c.id}`;
        if (seen.has(c.id)) errors.push(`${where}: duplicate`);
        seen.add(c.id);
        if (!(c.id in EMPTY_PROFILE)) errors.push(`${where}: not a Profile field`);
        if (c.kind === 'steps' && (c.steps?.length ?? 0) < 2) errors.push(`${where}: steps needs at least 2 labels`);
        if ((c.kind === 'chips' || c.kind === 'multi') && (c.options?.length ?? 0) < 2) errors.push(`${where}: needs at least 2 options`);
        const values = (c.options ?? []).map(o => o.value);
        if (new Set(values).size !== values.length) errors.push(`${where}: duplicate option values`);
        if (c.tier === 'followup') {
            if (!c.when) errors.push(`${where}: a follow-up needs a "when"`);
            else if (c.when(EMPTY_PROFILE)) errors.push(`${where}: a follow-up must not be asked of an empty profile`);
            if (!nonEmpty(c.because)) errors.push(`${where}: a follow-up needs a "because"`);
            if (c.required) errors.push(`${where}: a follow-up cannot be required`);
        } else if (c.when) {
            errors.push(`${where}: a main criterion has no "when"`);
        }
        if (c.kind === 'toggle' && !nonEmpty(c.recap)) errors.push(`${where}: a toggle needs a "recap"`);
    }
    return errors;
};

// A spread of profiles to run `when` and euro functions on: they must never throw nor give nonsense
const SAMPLES: Profile[] = (() => {
    const base = { ...EMPTY_PROFILE, childAges: [], disability: [], otherIncome: [], aids: [] };
    const out: Profile[] = [base];
    for (const income of [0, 3, 7]) {
        for (const status of ['salarie', 'patron', 'retraite', 'chomeur'] as const) {
            out.push({ ...base, income, status, age: 'a40', household: 'couple', partnerIncome: 2, children: 2, housing: 'prop', wealthMaterial: 4, wealthImmaterial: 3, aids: ['apl'], disability: ['child'] });
        }
    }
    return out;
})();

const effectErrors = (effect: Effect, where: string): string[] => {
    const errors: string[] = [];
    if (!nonEmpty(effect.why)) errors.push(`${where}: "why" is empty`);
    else if (wordCount(effect.why) > MAX_WHY_WORDS) errors.push(`${where}: "why" has more than ${MAX_WHY_WORDS} words`);
    for (const profile of SAMPLES) {
        try {
            effect.when(profile);
        } catch {
            errors.push(`${where}: "when" throws on a sample profile`);
            break;
        }
    }
    if (effect.euro) {
        errors.push(...noteErrors(effect.euro.basis, `${where} / euro basis`));
        const { perYear } = effect.euro;
        const ranges = typeof perYear === 'function' ? SAMPLES.filter(p => effect.when(p)).map(perYear) : [perYear];
        for (const [min, max] of ranges) {
            if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) errors.push(`${where}: euro range [${min}, ${max}] is not a valid min <= max`);
        }
    }
    return errors;
};

const measureErrors = (measure: Measure): string[] => {
    const errors: string[] = [];
    const m = `measure ${measure.id}`;
    if (wordCount(measure.title) > MAX_MEASURE_TITLE_WORDS) errors.push(`${m}: title has more than ${MAX_MEASURE_TITLE_WORDS} words`);
    errors.push(...noteErrors(measure.context, `${m} / context`));
    if (measure.options.length < MIN_OPTIONS || measure.options.length > MAX_OPTIONS) {
        errors.push(`${m}: needs ${MIN_OPTIONS} to ${MAX_OPTIONS} options (has ${measure.options.length})`);
    }
    const optionIds = new Set<string>();
    for (const option of measure.options) {
        if (optionIds.has(option.id)) errors.push(`${m}: duplicate option id "${option.id}"`);
        optionIds.add(option.id);
        if (wordCount(option.label) > MAX_IMPACT_OPTION_WORDS) errors.push(`${m}: option "${option.id}" has more than ${MAX_IMPACT_OPTION_WORDS} words`);
        option.effects.forEach((effect, i) => errors.push(...effectErrors(effect, `${m} / ${option.id} effect #${i + 1}`)));
    }
    const backed = new Set<string>();
    for (const party of PARTIES) {
        const position = measure.programme[party.id];
        errors.push(...positionErrors(position, optionIds, `${m} / ${party.id}`));
        if (position?.backs) position.backs.forEach(id => backed.add(id));
    }
    // A measure every party answers the same way tells nothing
    if (backed.size < 2) errors.push(`${m}: parties must be spread over at least 2 options`);
    return errors;
};

/** All the structural errors of a measure list; empty means valid. */
export const validateImpact = (measures: Measure[]): string[] => {
    const errors: string[] = [];
    const ids = new Set<string>();
    for (const measure of measures) {
        if (ids.has(measure.id)) errors.push(`duplicate measure id "${measure.id}"`);
        ids.add(measure.id);
        errors.push(...measureErrors(measure));
    }
    return errors;
};

// ── Publication rule ──────────────────────────────────────────────────────────────────────
// From the neutrality review of the impact page, applied the same way to every measure.
// P1 (literal coding) and P4 (old sources) need a human reading; P2 and P3 are checked here.

export const MIN_BACKED_OPTIONS = 3;
export const MIN_BLOCS = 2;

type Bloc = 'gauche' | 'centre' | 'droite';

const BLOC_OF: Record<PartyId, Bloc> = {
    lo: 'gauche', lfi: 'gauche', pcf: 'gauche', eco: 'gauche', ps: 'gauche',
    ren: 'centre', modem: 'centre', hor: 'centre',
    lr: 'droite', udr: 'droite', rn: 'droite', rec: 'droite',
};

const isWeak = (position: Position): boolean => position.backs !== null && /^faible/i.test(position.note ?? '');

export interface PublicationStatus {
    id: string;
    // Options backed by at least one solid party position
    backedOptions: number;
    // Blocs with at least one solid party position
    blocs: Bloc[];
    errors: string[];
}

export const publicationStatus = (measure: Measure): PublicationStatus => {
    const options = new Set<string>();
    const blocs = new Set<Bloc>();
    for (const party of PARTIES) {
        const position = measure.programme[party.id];
        if (!position || position.backs === null || isWeak(position)) continue;
        position.backs.forEach(id => options.add(id));
        blocs.add(BLOC_OF[party.id]);
    }
    const errors: string[] = [];
    if (options.size < MIN_BACKED_OPTIONS) errors.push(`${measure.id}: P2, ${options.size} option(s) backed by a solid position (needs ${MIN_BACKED_OPTIONS})`);
    if (blocs.size < MIN_BLOCS) errors.push(`${measure.id}: P3, solid positions in ${blocs.size} bloc(s) (needs ${MIN_BLOCS})`);
    return { id: measure.id, backedOptions: options.size, blocs: [...blocs], errors };
};

export const publicationErrors = (measures: Measure[]): string[] => measures.flatMap(m => publicationStatus(m).errors);
