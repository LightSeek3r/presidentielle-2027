import { describe, it, expect } from 'vitest';
import { barycentre, bestBelowThreshold, isBlackout, isSecondRoundHidden, orderFinalists, segmentPosition } from '../secondRound.ts';
import type { Vertex } from '../secondRound.ts';
import { BLACKOUTS } from '../data/finalists.ts';

const TRIANGLE: Vertex[] = [[0, 0], [6, 0], [0, 6]];

describe('barycentre', () => {
    it('is the centroid for equal scores', () => {
        const p = barycentre([50, 50, 50], TRIANGLE)!;
        expect(p.x).toBeCloseTo(2);
        expect(p.y).toBeCloseTo(2);
        expect(p.allZero).toBe(false);
    });

    it('sits on the vertex when only one score is non-zero', () => {
        expect(barycentre([0, 40, 0], TRIANGLE)).toEqual({ x: 6, y: 0, allZero: false });
        expect(barycentre([0, 0, 10], TRIANGLE)).toEqual({ x: 0, y: 6, allZero: false });
    });

    it('weights vertices by score', () => {
        const p = barycentre([20, 60, 20], TRIANGLE)!;
        expect(p.x).toBeCloseTo(3.6);
        expect(p.y).toBeCloseTo(1.2);
    });

    it('returns the centroid flagged allZero when every score is 0', () => {
        const p = barycentre([0, 0, 0], TRIANGLE)!;
        expect(p.allZero).toBe(true);
        expect(p.x).toBeCloseTo(2);
        expect(p.y).toBeCloseTo(2);
    });

    it('is null when a score is missing, or when scores and vertices do not match', () => {
        expect(barycentre([50, null, 50], TRIANGLE)).toBeNull();
        expect(barycentre([null, null, null], TRIANGLE)).toBeNull();
        expect(barycentre([50, 50], TRIANGLE)).toBeNull();
        expect(barycentre([], [])).toBeNull();
    });
});

describe('segmentPosition', () => {
    it('places the point between two finalists', () => {
        expect(segmentPosition([50, 50])).toEqual({ t: 0.5, allZero: false });
        expect(segmentPosition([30, 70])!.t).toBeCloseTo(0.7);
        expect(segmentPosition([40, 0])).toEqual({ t: 0, allZero: false });
        expect(segmentPosition([0, 40])).toEqual({ t: 1, allZero: false });
    });

    it('handles zero and missing scores', () => {
        expect(segmentPosition([0, 0])).toEqual({ t: 0.5, allZero: true });
        expect(segmentPosition([null, 40])).toBeNull();
    });
});

describe('bestBelowThreshold', () => {
    it('is true when no score reaches the threshold', () => {
        expect(bestBelowThreshold([0.3, 0.2, 0.39], 0.4)).toBe(true);
        expect(bestBelowThreshold([0.3, 0.4], 0.4)).toBe(false);
        expect(bestBelowThreshold([0.1, 0.9], 0.4)).toBe(false);
    });

    it('ignores missing scores and says nothing without any score', () => {
        expect(bestBelowThreshold([null, 0.2], 0.4)).toBe(true);
        expect(bestBelowThreshold([null, 0.5], 0.4)).toBe(false);
        expect(bestBelowThreshold([null, null], 0.4)).toBe(false);
        expect(bestBelowThreshold([], 0.4)).toBe(false);
    });
});

describe('blackouts', () => {
    const [first, second] = BLACKOUTS;
    const at = (iso: string) => new Date(iso);
    const ms = (iso: string, delta: number) => new Date(Date.parse(iso) + delta);

    it('covers Friday 00:00 Paris to Sunday 20:00 Paris for both rounds', () => {
        expect(first).toEqual({ start: '2027-04-15T22:00:00Z', end: '2027-04-18T18:00:00Z' });
        expect(second).toEqual({ start: '2027-04-29T22:00:00Z', end: '2027-05-02T18:00:00Z' });
        // 2027-04-16 is a Friday, 2027-04-18 a Sunday, in Paris summer time (UTC+2)
        expect(new Date('2027-04-16T00:00:00+02:00').getTime()).toBe(Date.parse(first.start));
        expect(new Date('2027-04-18T20:00:00+02:00').getTime()).toBe(Date.parse(first.end));
        expect(new Date('2027-04-30T00:00:00+02:00').getTime()).toBe(Date.parse(second.start));
        expect(new Date('2027-05-02T20:00:00+02:00').getTime()).toBe(Date.parse(second.end));
        expect(at('2027-04-16T12:00:00+02:00').getUTCDay()).toBe(5);
        expect(at('2027-04-18T12:00:00+02:00').getUTCDay()).toBe(0);
    });

    it('starts inclusive and ends exclusive, to the millisecond', () => {
        for (const window of BLACKOUTS) {
            expect(isBlackout(ms(window.start, -1), BLACKOUTS)).toBe(false);
            expect(isBlackout(at(window.start), BLACKOUTS)).toBe(true);
            expect(isBlackout(ms(window.end, -1), BLACKOUTS)).toBe(true);
            expect(isBlackout(at(window.end), BLACKOUTS)).toBe(false);
        }
    });

    it('is false between and outside the windows', () => {
        expect(isBlackout(at('2026-10-11T00:00:00Z'), BLACKOUTS)).toBe(false);
        expect(isBlackout(at('2027-04-23T12:00:00Z'), BLACKOUTS)).toBe(false);
        expect(isBlackout(at('2027-06-01T00:00:00Z'), BLACKOUTS)).toBe(false);
        expect(isBlackout(at('2027-04-17T12:00:00Z'), [])).toBe(false);
    });
});

describe('isSecondRoundHidden', () => {
    const sondages = { mode: 'sondages' } as const;
    const qualifies = { mode: 'qualifies' } as const;
    const hidden = (iso: string, finalists: { mode: 'sondages' | 'qualifies' }) =>
        isSecondRoundHidden(new Date(iso), finalists, BLACKOUTS);

    it('shows poll-based finalists before the first silence', () => {
        expect(hidden('2026-10-11T00:00:00Z', sondages)).toBe(false);
        expect(hidden('2027-04-15T21:59:59.999Z', sondages)).toBe(false);
    });

    it('hides them from the first silence on, even between the two rounds and afterwards', () => {
        expect(hidden('2027-04-15T22:00:00Z', sondages)).toBe(true);
        expect(hidden('2027-04-17T00:00:00Z', sondages)).toBe(true);
        expect(hidden('2027-04-18T18:00:00Z', sondages)).toBe(true);
        expect(hidden('2027-04-23T12:00:00Z', sondages)).toBe(true);
        expect(hidden('2027-05-03T00:00:00Z', sondages)).toBe(true);
    });

    it('shows qualified finalists except during a silence', () => {
        expect(hidden('2026-10-11T00:00:00Z', qualifies)).toBe(false);
        expect(hidden('2027-04-15T21:59:59.999Z', qualifies)).toBe(false);
        expect(hidden('2027-04-16T12:00:00Z', qualifies)).toBe(true);
        expect(hidden('2027-04-18T17:59:59.999Z', qualifies)).toBe(true);
        expect(hidden('2027-04-18T18:00:00Z', qualifies)).toBe(false);
        expect(hidden('2027-04-23T12:00:00Z', qualifies)).toBe(false);
        expect(hidden('2027-05-01T12:00:00Z', qualifies)).toBe(true);
        expect(hidden('2027-05-03T00:00:00Z', qualifies)).toBe(false);
    });

    it('never hides on timing alone without any blackout configured', () => {
        expect(isSecondRoundHidden(new Date('2027-04-17T00:00:00Z'), sondages, [])).toBe(false);
    });
});

describe('orderFinalists', () => {
    it('sorts by label, not by the poll order', () => {
        const labels = orderFinalists([
            { label: 'Rassemblement national' }, { label: 'Horizons' }, { label: 'La France insoumise' },
        ]).map(p => p.label);
        expect(labels).toEqual(['Horizons', 'La France insoumise', 'Rassemblement national']);
    });

    it('does not mutate its input and sorts accents like French', () => {
        const input = [{ label: 'Zeta' }, { label: 'Écologistes' }, { label: 'Alpha' }];
        expect(orderFinalists(input).map(p => p.label)).toEqual(['Alpha', 'Écologistes', 'Zeta']);
        expect(input[0].label).toBe('Zeta');
    });
});
