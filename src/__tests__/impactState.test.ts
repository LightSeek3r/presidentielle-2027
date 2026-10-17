import { describe, it, expect } from 'vitest';

import { activeCriteria, canLeave, initialState, isPristine, prune, reducer } from '../impactState.ts';
import type { ImpactAction, ImpactState } from '../impactState.ts';

const run = (actions: ImpactAction[], from: ImpactState = initialState()): ImpactState => actions.reduce(reducer, from);

describe('impact state', () => {
    it('starts pristine on step 1', () => {
        const state = initialState();
        expect(state.step).toBe(1);
        expect(isPristine(state)).toBe(true);
    });

    it('does not leave step 1 without an income', () => {
        expect(run([{ type: 'next' }]).step).toBe(1);
        expect(run([{ type: 'set', id: 'income', raw: 2 }, { type: 'next' }]).step).toBe(2);
    });

    it('requires status and age on step 2, household, children, housing and zone on step 3', () => {
        let state = run([{ type: 'set', id: 'income', raw: 2 }, { type: 'next' }]);
        expect(canLeave(state.profile, 2)).toBe(false);
        state = run([{ type: 'set', id: 'status', raw: 'salarie' }, { type: 'set', id: 'age', raw: 'a40' }], state);
        expect(canLeave(state.profile, 2)).toBe(true);
        state = run([{ type: 'next' }], state);
        expect(canLeave(state.profile, 3)).toBe(false);
        state = run([
            { type: 'set', id: 'household', raw: 'seul' }, { type: 'set', id: 'children', raw: '0' },
            { type: 'set', id: 'housing', raw: 'prop' }, { type: 'set', id: 'zone', raw: 'rural' },
        ], state);
        expect(canLeave(state.profile, 3)).toBe(true);
        expect(state.profile.children).toBe(0);
    });

    it('reveals a follow-up when its parent is set and clears it when the parent changes', () => {
        let state = run([{ type: 'set', id: 'status', raw: 'patron' }]);
        expect(activeCriteria(state.profile, 2).map(c => c.id)).toContain('employerSize');
        state = run([{ type: 'set', id: 'employerSize', raw: 'pme' }], state);
        expect(state.profile.employerSize).toBe('pme');
        state = run([{ type: 'set', id: 'status', raw: 'retraite' }], state);
        expect(state.profile.employerSize).toBeNull();
        expect(activeCriteria(state.profile, 2).map(c => c.id)).not.toContain('employerSize');
    });

    it('clears child ages and the child disability when there are no children any more', () => {
        let state = run([
            { type: 'set', id: 'children', raw: '2' },
            { type: 'toggle', id: 'childAges', value: 'school' },
            { type: 'toggle', id: 'disability', value: 'child' },
        ]);
        expect(state.profile.childAges).toEqual(['school']);
        state = run([{ type: 'set', id: 'children', raw: '0' }], state);
        expect(state.profile.childAges).toEqual([]);
        expect(state.profile.disability).toEqual([]);
    });

    it('drops the partner when the visitor lives alone', () => {
        const state = run([
            { type: 'set', id: 'household', raw: 'couple' },
            { type: 'set', id: 'partnerStatus', raw: 'salarie' },
            { type: 'set', id: 'partnerIncome', raw: 3 },
            { type: 'toggle', id: 'disability', value: 'partner' },
            { type: 'set', id: 'household', raw: 'seul' },
        ]);
        expect(state.profile.partnerStatus).toBeNull();
        expect(state.profile.partnerIncome).toBeNull();
        expect(state.profile.disability).toEqual([]);
    });

    it('toggles a multi answer and ignores toggling a single-choice field', () => {
        let state = run([{ type: 'toggle', id: 'aids', value: 'apl' }]);
        expect(state.profile.aids).toEqual([]); // aids is a follow-up: not asked of an empty profile, so pruned
        state = run([{ type: 'set', id: 'income', raw: 1 }, { type: 'set', id: 'status', raw: 'salarie' }, { type: 'toggle', id: 'aids', value: 'apl' }, { type: 'toggle', id: 'aids', value: 'rsa' }]);
        expect(state.profile.aids).toEqual(['apl', 'rsa']);
        state = run([{ type: 'toggle', id: 'aids', value: 'apl' }], state);
        expect(state.profile.aids).toEqual(['rsa']);
        expect(run([{ type: 'toggle', id: 'status', value: 'salarie' }]).profile.status).toBeNull();
    });

    it('stores a toggle answer as a boolean and lets it be cleared', () => {
        let state = run([{ type: 'set', id: 'ald', raw: true }]);
        expect(state.profile.ald).toBe(true);
        state = run([{ type: 'set', id: 'ald', raw: null }], state);
        expect(state.profile.ald).toBeNull();
    });

    it('does not jump forward past an unanswered step', () => {
        expect(run([{ type: 'goto', step: 3 }]).step).toBe(1);
        expect(run([{ type: 'goto', step: 1 }]).step).toBe(1);
    });

    it('resets everything', () => {
        const state = run([{ type: 'set', id: 'income', raw: 3 }, { type: 'reset' }]);
        expect(isPristine(state)).toBe(true);
    });

    it('prune leaves a coherent profile alone', () => {
        const state = run([{ type: 'set', id: 'income', raw: 3 }]);
        expect(prune(state.profile)).toEqual(state.profile);
    });
});
