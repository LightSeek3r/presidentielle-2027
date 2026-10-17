import { describe, it, expect } from 'vitest';

import type { Question } from '../data/types.ts';
import { createReducer, initialState, isPristine, layoutOf, sanitize, sequenceOf } from '../quizState.ts';
import type { QuizAction, QuizState } from '../quizState.ts';
import { newSeed, shuffleWithSeed } from '../shuffle.ts';
import { FIXTURE_QUESTIONS } from './fixtures.ts';

// Three core questions and two optional ones, from the shared fixture
const core = FIXTURE_QUESTIONS.slice(0, 3).map(q => ({ ...q, tier: 'core' as const }));
const extra = FIXTURE_QUESTIONS.slice(3, 5).map(q => ({ ...q, tier: 'affiner' as const }));
const questions: Question[] = [...core, ...extra];
const dataset = { questions };
const layout = layoutOf(dataset);
const reduce = createReducer(layout);

const run = (actions: QuizAction[], from: QuizState = initialState(1)): QuizState => actions.reduce(reduce, from);
const pick = (i: number, ...picks: string[]): QuizAction => ({ type: 'answer', questionId: questions[i].id, picks });

describe('quiz layout', () => {
    it('puts core questions first and counts them', () => {
        expect(layout.coreCount).toBe(3);
        expect(layout.ids).toHaveLength(5);
        expect(sequenceOf(questions, false)).toHaveLength(3);
        expect(sequenceOf(questions, true)).toHaveLength(5);
    });
});

describe('quiz reducer', () => {
    it('walks intro, self placement, questions, then the optional prompt', () => {
        let state = run([{ type: 'start' }]);
        expect(state.step).toBe('self');
        state = run([{ type: 'setSelf', value: 'lfi' }, { type: 'next' }], state);
        expect(state).toMatchObject({ step: 'question', index: 0, selfPlacement: 'lfi' });
        state = run([{ type: 'next' }, { type: 'next' }, { type: 'next' }], state);
        expect(state.step).toBe('affiner-prompt');
    });

    it('goes straight to the results when there is nothing to refine', () => {
        const small = createReducer(layoutOf({ questions: core }));
        const state = [{ type: 'start' }, { type: 'next' }, { type: 'next' }, { type: 'next' }, { type: 'next' }]
            .reduce((s, a) => small(s, a as QuizAction), initialState(1));
        expect(state.step).toBe('results');
    });

    it('goes on with the optional questions or to the results', () => {
        const atPrompt = run([{ type: 'start' }, { type: 'next' }, { type: 'next' }, { type: 'next' }, { type: 'next' }]);
        expect(run([{ type: 'chooseAffiner', value: true }], atPrompt)).toMatchObject({ step: 'question', index: 3, includeAffiner: true });
        expect(run([{ type: 'chooseAffiner', value: false }], atPrompt)).toMatchObject({ step: 'results', includeAffiner: false });
        const last = run([{ type: 'chooseAffiner', value: true }, { type: 'next' }, { type: 'next' }], atPrompt);
        expect(last.step).toBe('results');
    });

    it('takes the optional questions from the results, keeping the answers given so far', () => {
        const atResults = run([
            { type: 'start' }, { type: 'next' }, pick(0, 'a'), { type: 'next' }, { type: 'next' }, { type: 'next' },
            { type: 'chooseAffiner', value: false },
        ]);
        expect(atResults).toMatchObject({ step: 'results', includeAffiner: false });
        const refining = run([{ type: 'chooseAffiner', value: true }], atResults);
        expect(refining).toMatchObject({ step: 'question', index: 3, includeAffiner: true });
        expect(refining.answers[questions[0].id].picks).toEqual(['a']);
        expect(run([{ type: 'next' }, { type: 'next' }], refining).step).toBe('results');
    });

    it('goes back step by step', () => {
        const atPrompt = run([{ type: 'start' }, { type: 'next' }, { type: 'next' }, { type: 'next' }, { type: 'next' }]);
        expect(run([{ type: 'prev' }], atPrompt)).toMatchObject({ step: 'question', index: 2 });
        const inExtra = run([{ type: 'chooseAffiner', value: true }], atPrompt);
        expect(run([{ type: 'prev' }], inExtra).step).toBe('affiner-prompt');
        expect(run([{ type: 'start' }, { type: 'prev' }]).step).toBe('intro');
        expect(run([{ type: 'start' }, { type: 'next' }, { type: 'prev' }]).step).toBe('self');
    });

    it('keeps at most two picks and unskips on answer', () => {
        const state = run([
            { type: 'start' }, { type: 'next' },
            { type: 'skip', questionId: questions[0].id },
            pick(0, 'a', 'b', 'c'),
        ]);
        expect(state.answers[questions[0].id]).toEqual({ picks: ['a', 'b'], skipped: false, important: false });
    });

    it('clears the importance when a question is skipped and ignores it afterwards', () => {
        const id = questions[0].id;
        let state = run([pick(0, 'a'), { type: 'toggleImportant', questionId: id }]);
        expect(state.answers[id].important).toBe(true);
        state = run([{ type: 'skip', questionId: id }, { type: 'toggleImportant', questionId: id }], state);
        expect(state.answers[id]).toEqual({ picks: [], skipped: true, important: false });
    });

    it('drops the second pick when the nuance is switched off', () => {
        const id = questions[0].id;
        let state = run([{ type: 'toggleNuance', questionId: id }, pick(0, 'a', 'b')]);
        expect(state.nuance).toBe(true);
        state = run([{ type: 'toggleNuance', questionId: id }], state);
        expect(state.nuance).toBe(false);
        expect(state.answers[id].picks).toEqual(['a']);
    });

    it('reopens a nuanced answer in nuance mode', () => {
        const state = run([
            { type: 'start' }, { type: 'next' },
            { type: 'toggleNuance', questionId: questions[0].id }, pick(0, 'a', 'b'),
            { type: 'next' }, { type: 'prev' },
        ]);
        expect(state).toMatchObject({ step: 'question', index: 0, nuance: true });
    });

    it('resets to a pristine intro with the new seed', () => {
        const state = run([{ type: 'start' }, pick(0, 'a'), { type: 'reset', seed: 42 }]);
        expect(state).toEqual(initialState(42));
        expect(isPristine(state)).toBe(true);
        expect(isPristine(run([{ type: 'start' }]))).toBe(false);
    });
});

describe('sanitize', () => {
    it('drops unknown questions and options and clamps the position', () => {
        const dirty: QuizState = {
            ...initialState(7),
            step: 'question',
            index: 99,
            answers: {
                [questions[0].id]: { picks: ['a', 'nope', 'b'], skipped: false, important: true },
                ghost: { picks: ['a'], skipped: false, important: false },
            },
        };
        const clean = sanitize(dirty, dataset);
        expect(Object.keys(clean.answers)).toEqual([questions[0].id]);
        expect(clean.answers[questions[0].id].picks).toEqual(['a', 'b']);
        expect(clean.index).toBe(2);
    });
});

describe('options shuffle', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];

    it('is deterministic for a seed and a question', () => {
        expect(shuffleWithSeed(items, 12345, 'q1')).toEqual(shuffleWithSeed(items, 12345, 'q1'));
    });

    it('keeps every option exactly once and does not touch the input', () => {
        const shuffled = shuffleWithSeed(items, 99, 'q1');
        expect([...shuffled].sort()).toEqual(items);
        expect(items).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('varies with the seed and with the question', () => {
        const orders = new Set<string>();
        for (let seed = 1; seed <= 30; seed++) orders.add(shuffleWithSeed(items, seed, 'q1').join(''));
        expect(orders.size).toBeGreaterThan(10);
        expect(shuffleWithSeed(items, 7, 'q1')).not.toEqual(shuffleWithSeed(items, 7, 'q2-other'));
    });

    it('draws new seeds as unsigned 32-bit integers', () => {
        const seed = newSeed();
        expect(Number.isInteger(seed) && seed >= 0 && seed < 2 ** 32).toBe(true);
    });
});
