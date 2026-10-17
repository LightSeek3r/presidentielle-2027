import { CRITERIA, CRITERIA_BY_ID } from './data/impactCriteria.ts';
import { EMPTY_PROFILE } from './data/impactTypes.ts';
import type { Criterion, Profile, ProfileKey } from './data/impactTypes.ts';

// Pure state of the "Impact pour moi" stepper. No browser API here.

export type ImpactStep = 1 | 2 | 3 | 4;

export interface ImpactState {
    step: ImpactStep;
    profile: Profile;
}

export type ImpactAction =
    | { type: 'set'; id: ProfileKey; raw: string | number | boolean | null }
    | { type: 'toggle'; id: ProfileKey; value: string }
    | { type: 'next' }
    | { type: 'prev' }
    | { type: 'goto'; step: ImpactStep }
    | { type: 'reset' };

export const initialState = (): ImpactState => ({ step: 1, profile: { ...EMPTY_PROFILE, childAges: [], disability: [], otherIncome: [], aids: [] } });

/** Whether the criterion is asked for this profile. */
export const isActive = (criterion: Criterion, profile: Profile): boolean =>
    criterion.tier === 'main' || (criterion.when?.(profile) ?? true);

export const activeCriteria = (profile: Profile, step: 1 | 2 | 3): Criterion[] =>
    CRITERIA.filter(c => c.step === step && isActive(c, profile));

const isEmpty = (value: unknown): boolean => value === null || (Array.isArray(value) && value.length === 0);

/** Answers that stopped applying (and options that no longer make sense) are dropped, not hidden. */
export const prune = (profile: Profile): Profile => {
    const next: Profile = { ...profile };
    const record = next as unknown as Record<ProfileKey, unknown>;
    for (const c of CRITERIA) {
        if (!isActive(c, next)) record[c.id] = c.kind === 'multi' ? [] : null;
    }
    // A partner or a child can only be disabled if there is one
    if (next.household !== 'couple') next.disability = next.disability.filter(d => d !== 'partner');
    if ((next.children ?? 0) === 0) next.disability = next.disability.filter(d => d !== 'child');
    return next;
};

// Chip values are strings; a few profile fields are numbers
const coerce = (criterion: Criterion, raw: string | number | boolean | null): unknown => {
    if (raw === null) return criterion.kind === 'multi' ? [] : null;
    if (criterion.kind === 'steps') return typeof raw === 'number' ? raw : Number(raw);
    if (criterion.kind === 'toggle') return Boolean(raw);
    if (criterion.id === 'children') return Number(raw);
    return String(raw);
};

const requiredFor = (profile: Profile, step: 1 | 2 | 3): ProfileKey[] =>
    activeCriteria(profile, step).filter(c => c.required).map(c => c.id);

/** Whether the visitor may leave a step: every required answer of the step is given. */
export const canLeave = (profile: Profile, step: ImpactStep): boolean =>
    step === 4 || requiredFor(profile, step).every(id => !isEmpty(profile[id]));

export const reducer = (state: ImpactState, action: ImpactAction): ImpactState => {
    switch (action.type) {
        case 'set': {
            const criterion = CRITERIA_BY_ID[action.id];
            if (!criterion) return state;
            const profile = { ...state.profile, [action.id]: coerce(criterion, action.raw) };
            return { ...state, profile: prune(profile) };
        }
        case 'toggle': {
            const criterion = CRITERIA_BY_ID[action.id];
            if (criterion?.kind !== 'multi') return state;
            const current = state.profile[action.id] as string[];
            const value = current.includes(action.value) ? current.filter(v => v !== action.value) : [...current, action.value];
            return { ...state, profile: prune({ ...state.profile, [action.id]: value }) };
        }
        case 'next':
            return state.step < 4 && canLeave(state.profile, state.step) ? { ...state, step: (state.step + 1) as ImpactStep } : state;
        case 'prev':
            return state.step > 1 ? { ...state, step: (state.step - 1) as ImpactStep } : state;
        case 'goto':
            // Only back to a step already answered, or forward when everything before it is
            return action.step <= state.step || ([1, 2, 3] as const).filter(s => s < action.step).every(s => canLeave(state.profile, s))
                ? { ...state, step: action.step }
                : state;
        case 'reset':
            return initialState();
    }
};

/** Whether anything was answered (an untouched state is not worth storing). */
export const isPristine = (state: ImpactState): boolean =>
    state.step === 1 && CRITERIA.every(c => isEmpty(state.profile[c.id]));
