import { describe, it, expect } from 'vitest';

import { CRITERIA, INCOME_BANDS } from '../data/impactCriteria.ts';
import { IMPACT_MEASURES } from '../data/impact.ts';
import { EMPTY_PROFILE } from '../data/impactTypes.ts';
import type { Measure, Profile } from '../data/impactTypes.ts';
import { PUBLISHED_AT } from '../data/meta.ts';
import { positionErrors } from '../data/validate.ts';
import { criteriaErrors, publicationErrors, publicationStatus, validateImpact } from '../data/validateImpact.ts';
import { describeProfile, householdMonthlyIncome, isReady, partySheet, resolveMeasure } from '../impact.ts';
import { FICTIONAL_ORDER, parti } from '../../test/fixtures/fictional.ts';
import { DEMO_IMPACT } from '../../test/fixtures/impactDemo.ts';

const profile = (patch: Partial<Profile> = {}): Profile => ({
    ...EMPTY_PROFILE, childAges: [], disability: [], otherIncome: [], aids: [], ...patch,
});

// structuredClone cannot copy the functions of an effect, so copy the levels that get edited
const cloneMeasure = (m: Measure): Measure => ({
    ...m,
    context: { ...m.context, sources: m.context.sources.map(s => ({ ...s })) },
    options: m.options.map(o => ({ ...o, effects: o.effects.map(e => ({ ...e })) })),
});

const measure = (id: string): Measure => {
    const found = DEMO_IMPACT.find(m => m.id === id);
    if (!found) throw new Error(`no demo measure ${id}`);
    return found;
};

describe('data', () => {
    it('has a valid criteria graph', () => {
        expect(criteriaErrors()).toEqual([]);
    });

    it('has valid real measures', () => {
        expect(validateImpact(IMPACT_MEASURES)).toEqual([]);
    });

    it('has a valid demo list', () => {
        // validateImpact checks positions against the real party list, which the fictional parties of
        // the demo are not in: keep its errors about the measures, and check the fictional positions apart
        const aboutRealParties = /missing programme entry|parties must be spread/;
        expect(validateImpact(DEMO_IMPACT).filter(e => !aboutRealParties.test(e))).toEqual([]);
        for (const m of DEMO_IMPACT) {
            const options = new Set(m.options.map(o => o.id));
            expect(FICTIONAL_ORDER.flatMap(id => positionErrors(m.programme[id], options, `${m.id} / ${id}`))).toEqual([]);
        }
    });

    it('catches a euro range written backwards', () => {
        const copy = cloneMeasure(DEMO_IMPACT[0]);
        const bad: Measure = {
            ...copy,
            options: copy.options.map(o => ({
                ...o,
                effects: o.effects.map(e => (e.euro ? { ...e, euro: { ...e.euro, perYear: [5, 1] as [number, number] } } : e)),
            })),
        };
        expect(validateImpact([bad]).join('\n')).toContain('not a valid min <= max');
    });

    it('catches a source dated after the publication date', () => {
        const copy = cloneMeasure(DEMO_IMPACT[0]);
        copy.context.sources[0].date = '2099-01-01';
        expect(validateImpact([copy]).join('\n')).toContain(`after ${PUBLISHED_AT}`);
    });

    it('keeps income bands ascending', () => {
        const mids = INCOME_BANDS.map(b => b.mid);
        expect([...mids].sort((a, b) => a - b)).toEqual(mids);
    });

    it('never asks a follow-up of an empty profile', () => {
        const asked = CRITERIA.filter(c => c.tier === 'followup' && c.when?.(profile()));
        expect(asked).toEqual([]);
    });
});

describe('engine', () => {
    it('is not ready until income, status and age are known', () => {
        expect(isReady(profile())).toBe(false);
        expect(isReady(profile({ income: 1, status: 'salarie' }))).toBe(false);
        expect(isReady(profile({ income: 1, status: 'salarie', age: 'a40' }))).toBe(true);
    });

    it('resolves the first matching effect with its euro range', () => {
        const smic = measure('demo-smic');
        const worker = profile({ income: 1, status: 'salarie', age: 'a40' });
        const resolved = resolveMeasure(worker, smic, ['b']);
        expect(resolved?.direction).toBe('gain');
        expect(resolved?.options[0].euro).toEqual([900, 1800]);
    });

    it('evaluates a euro function on the profile', () => {
        const pensions = measure('demo-pensions');
        const rich = resolveMeasure(profile({ status: 'retraite', income: 5 }), pensions, ['b']);
        const modest = resolveMeasure(profile({ status: 'retraite', income: 1 }), pensions, ['b']);
        expect(rich?.options[0].euro).toEqual([300, 900]);
        expect(modest?.options[0].euro).toEqual([150, 500]);
    });

    it('returns null when the backed option does not concern the profile', () => {
        expect(resolveMeasure(profile({ status: 'etudiant', income: 0 }), measure('demo-smic'), ['b'])).toBeNull();
        // The reference option has no effects at all
        expect(resolveMeasure(profile({ status: 'salarie', income: 1 }), measure('demo-smic'), ['a'])).toBeNull();
    });

    it('turns a split between a concerning and a non-concerning option into "mixed"', () => {
        const loyers = measure('demo-loyers');
        const tenant = profile({ housing: 'loc-prive', zone: 'tendue' });
        const resolved = resolveMeasure(tenant, loyers, ['b', 'a']);
        expect(resolved?.direction).toBe('mixed');
        expect(resolved?.split).toBe(true);
    });

    it('sorts a sheet and never counts an unknown position as neutral', () => {
        const measures = DEMO_IMPACT;
        const worker = profile({ income: 1, status: 'salarie', age: 'a40', aids: ['apl'] });
        const ps = partySheet(worker, parti('e'), measures);
        expect(ps.gains.map(g => g.measure.id)).toContain('demo-smic');
        expect(ps.mixed.map(g => g.measure.id)).toContain('demo-allocation');
        // Parti F has a position on every demo measure
        const ren = partySheet(worker, parti('f'), measures);
        expect(ren.unknown.map(m => m.id)).toEqual([]);
        const rn = partySheet(worker, parti('k'), measures);
        expect(rn.unknown.map(m => m.id)).toContain('demo-allocation');
        expect(rn.notConcerned.map(m => m.id)).not.toContain('demo-allocation');
    });

    it('has no total or score in a sheet', () => {
        const sheet = partySheet(profile({ income: 1, status: 'salarie', age: 'a40' }), parti('b'), DEMO_IMPACT);
        expect(Object.keys(sheet).sort()).toEqual(['documented', 'gains', 'keepsRule', 'losses', 'mixed', 'notConcerned', 'total', 'unknown']);
    });

    it('adds the incomes of a couple', () => {
        expect(householdMonthlyIncome(profile({ income: 1 }))).toBe(1500);
        expect(householdMonthlyIncome(profile({ income: 1, household: 'couple', partnerIncome: 3 }))).toBe(4500);
        expect(householdMonthlyIncome(profile({ income: 1, household: 'seul', partnerIncome: 3 }))).toBe(1500);
    });

    it('describes only what was answered', () => {
        const labels = describeProfile(profile({ income: 2, status: 'patron', employerSize: 'pme', children: 2, ald: true, wealthMaterial: 0 }));
        expect(labels).toContain('Chef d’entreprise');
        expect(labels).toContain('2 enfants');
        expect(labels).toContain('ALD');
        expect(labels.join(' ')).not.toContain('Patrimoine matériel');
    });
});

describe('publication rule', () => {
    it('applies P2 and P3 to every published measure', () => {
        // A measure that fails the rule is not published
        expect(publicationErrors(IMPACT_MEASURES)).toEqual([]);
    });

    it('flags a measure backed on two options or by one bloc only', () => {
        // In-memory variants of a published measure, never written anywhere: every documented position
        // moved to one option, then only the left bloc's positions kept
        const real = cloneMeasure(IMPACT_MEASURES[0]);
        const oneOption = { ...real, programme: Object.fromEntries(Object.entries(real.programme).map(([id, p]) =>
            [id, p.backs === null ? p : { ...p, backs: [real.options[0].id], kind: 'clear' }])) } as Measure;
        expect(publicationStatus(oneOption).errors.join(' | ')).toContain('P2');
        const left = ['lo', 'lfi', 'pcf', 'eco', 'ps'];
        const oneBloc = { ...real, programme: Object.fromEntries(Object.entries(real.programme).map(([id, p]) =>
            [id, left.includes(id) ? p : { backs: null, reason: 'non-couvert' }])) } as Measure;
        expect(publicationStatus(oneBloc).errors.join(' | ')).toContain('P3');
    });
});

describe('cumulative packages', () => {
    const waiting = (): Measure => ({
        ...cloneMeasure(measure('demo-cotisations')),
        options: [
            { id: 'a', label: 'Garder', effects: [] },
            { id: 'b', label: 'B', effects: [{ when: p => p.status === 'salarie', direction: 'loss', weight: 2, why: 'Vous perdez avec B.' }] },
            { id: 'c', label: 'C', effects: [{ when: p => p.status === 'public', direction: 'loss', weight: 2, why: 'Vous perdez avec C.' }] },
        ],
    });

    it('judges a package on the options that concern the visitor', () => {
        const employee = profile({ status: 'salarie' });
        expect(resolveMeasure(employee, waiting(), ['b', 'c'], true)?.direction).toBe('loss');
        expect(resolveMeasure(employee, waiting(), ['b', 'c'], true)?.cumulative).toBe(true);
    });

    it('leaves a hesitation between options open', () => {
        expect(resolveMeasure(profile({ status: 'salarie' }), waiting(), ['b', 'c'])?.direction).toBe('mixed');
    });

    it('still reports mixed when the options of a package disagree for the visitor', () => {
        const m = waiting();
        m.options[2].effects = [{ when: p => p.status === 'salarie', direction: 'gain', weight: 2, why: 'Vous gagnez avec C.' }];
        expect(resolveMeasure(profile({ status: 'salarie' }), m, ['b', 'c'], true)?.direction).toBe('mixed');
    });
});

describe('sheet groups', () => {
    it('puts a party that keeps the reference option apart from the measures that do not concern the visitor', () => {
        const sheet = partySheet(profile({ status: 'etudiant', income: 0, age: 'a18' }), parti('f'), DEMO_IMPACT);
        // Parti F backs the reference option "a" of the demo SMIC measure
        expect(sheet.keepsRule.map(m => m.id)).toContain('demo-smic');
        expect(sheet.notConcerned.map(m => m.id)).not.toContain('demo-smic');
    });
});
