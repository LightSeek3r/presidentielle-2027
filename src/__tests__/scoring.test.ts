import { describe, it, expect } from 'vitest';
import {
    FAIT_RULE,
    MIN_ANSWERED,
    MIN_VOTES,
    answerToDist,
    canShowResults,
    noPartyShare,
    overlap,
    positionToDist,
    rankWithTies,
    scoreAll,
    scoreDimension,
} from '../scoring.ts';
import type { PartyResult } from '../scoring.ts';
import type { Answer, Answers, Dataset, PartyId, Question } from '../data/types.ts';
import { FIXTURE, FIXTURE_QUESTIONS } from './fixtures.ts';

const pick = (...picks: string[]): Answer => ({ picks, skipped: false, important: false });
const skip: Answer = { picks: [], skipped: true, important: false };

// Answers that reproduce a party's programme exactly (null positions are left unanswered)
const answersMatching = (partyId: PartyId): Answers => {
    const answers: Answers = {};
    for (const q of FIXTURE_QUESTIONS) {
        const position = q.programme[partyId];
        if (position.backs) answers[q.id] = pick(...position.backs);
    }
    return answers;
};

const resultFor = (answers: Answers, partyId: PartyId) =>
    scoreAll(FIXTURE, answers).find(r => r.partyId === partyId)!;

const q = (id: string): Question => FIXTURE_QUESTIONS.find(x => x.id === id)!;

describe('distributions', () => {
    it('answerToDist: nothing, one pick, two picks', () => {
        expect(answerToDist(skip)).toEqual({});
        expect(answerToDist(undefined)).toEqual({});
        expect(answerToDist({ picks: [], skipped: false, important: false })).toEqual({});
        expect(answerToDist({ picks: ['a'], skipped: true, important: false })).toEqual({});
        expect(answerToDist(pick('a'))).toEqual({ a: 1 });
        expect(answerToDist(pick('a', 'b'))).toEqual({ a: 0.5, b: 0.5 });
    });

    it('positionToDist: clear, split, null', () => {
        expect(positionToDist(q('q1').programme.lfi)).toEqual({ a: 1 });
        expect(positionToDist(q('q7').programme.ps)).toEqual({ a: 0.5, b: 0.5 });
        expect(positionToDist(q('q7').programme.lo)).toBeNull();
        expect(positionToDist(undefined)).toBeNull();
    });

    it('overlap is the shared mass', () => {
        expect(overlap({ a: 1 }, { a: 1 })).toBe(1);
        expect(overlap({ a: 1 }, { b: 1 })).toBe(0);
        expect(overlap({ a: 0.5, b: 0.5 }, { a: 1 })).toBe(0.5);
        expect(overlap({ a: 0.5, b: 0.5 }, { a: 0.5, b: 0.5 })).toBe(1);
        expect(overlap({}, { a: 1 })).toBe(0);
    });
});

describe('scoreDimension', () => {
    const lfiDit = (question: Question) => positionToDist(question.programme.lfi);

    it('scores 100 for answers identical to the programme, split included', () => {
        for (const id of ['lfi', 'ps', 'rn', 'lo'] as PartyId[]) {
            const answers = answersMatching(id);
            const dit = resultFor(answers, id).dit;
            expect(dit.raw).toBe(1);
            expect(dit.rounded).toBe(100);
        }
        expect(resultFor(answersMatching('ps'), 'ps').dit.n).toBe(10);
    });

    it('a 50/50 nuance gets 0.5 against a clear position and 1 against the matching split', () => {
        const answers = { q7: pick('a', 'b') };
        const clearScore = scoreDimension(FIXTURE_QUESTIONS, answers, question => positionToDist(question.programme.lfi));
        const splitScore = scoreDimension(FIXTURE_QUESTIONS, answers, question => positionToDist(question.programme.ps));
        expect(clearScore.raw).toBe(0.5);
        expect(splitScore.raw).toBe(1);
    });

    it('an option backed by nobody lowers the score', () => {
        const answers = { ...answersMatching('lfi'), q1: pick('d') };
        const result = resultFor(answers, 'lfi');
        expect(result.dit.raw).toBeCloseTo(9 / 10);
    });

    it('returns null when everything is skipped or nothing is covered', () => {
        const allSkipped: Answers = Object.fromEntries(FIXTURE_QUESTIONS.map(x => [x.id, skip]));
        for (const result of scoreAll(FIXTURE, allSkipped)) {
            expect(result.dit.raw).toBeNull();
            expect(result.dit.rounded).toBeNull();
            expect(result.fait.raw).toBeNull();
            expect(result.fait.sufficient).toBe(false);
        }
        expect(scoreDimension(FIXTURE_QUESTIONS, {}, lfiDit).raw).toBeNull();
        expect(scoreDimension(FIXTURE_QUESTIONS, { q7: pick('a') }, question => positionToDist(question.programme.lo)).raw).toBeNull();
    });

    it('ignores "important" on a skipped question', () => {
        const answers: Answers = {
            q1: { picks: [], skipped: true, important: true },
            q2: pick('a'),
        };
        const score = scoreDimension(FIXTURE_QUESTIONS, answers, lfiDit);
        expect(score).toMatchObject({ raw: 1, n: 1, coveredWeight: 1, answeredWeight: 1 });
    });

    it('doubles the weight of an important answer', () => {
        const matching = { picks: ['a'], skipped: false, important: true };
        const answers: Answers = { q1: matching, q2: pick('d') };
        const weighted = scoreDimension(FIXTURE_QUESTIONS, answers, lfiDit);
        expect(weighted.raw).toBeCloseTo(2 / 3);
        expect(weighted.coveredWeight).toBe(3);

        const unweighted = scoreDimension(FIXTURE_QUESTIONS, { q1: pick('a'), q2: pick('d') }, lfiDit);
        expect(unweighted.raw).toBe(0.5);
    });

    it('only counts questions the user answered and the party covers', () => {
        // q7: lo is not covered; q8: unanswered
        const answers: Answers = { q1: pick('a'), q7: pick('a') };
        const score = scoreDimension(FIXTURE_QUESTIONS, answers, question => positionToDist(question.programme.lo));
        expect(score).toMatchObject({ n: 1, coveredWeight: 1, answeredWeight: 2, raw: 1 });
    });

    it('needs 6 compared questions and half of the answered weight to be sufficient', () => {
        const everything = answersMatching('lfi');
        const fiveOnly: Answers = { q1: pick('a'), q2: pick('a'), q3: pick('a'), q4: pick('a'), q5: pick('a') };
        const five = scoreDimension(FIXTURE_QUESTIONS, fiveOnly, lfiDit);
        expect(five.n).toBe(5);
        expect(five.sufficient).toBe(false);
        expect(resultFor(fiveOnly, 'lfi').dit.rounded).toBeNull();
        expect(resultFor(fiveOnly, 'lfi').dit.raw).toBe(1);

        expect(scoreDimension(FIXTURE_QUESTIONS, everything, lfiDit).sufficient).toBe(true);

        // Covered: q1..q6 (weight 6). Answered: all ten, q7..q10 important (weight 6 + 8 = 14).
        const coversOnlySix = (question: Question) =>
            ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].includes(question.id) ? { a: 1 } : null;
        const heavy: Answers = {};
        for (const x of FIXTURE_QUESTIONS) heavy[x.id] = { picks: ['a'], skipped: false, important: !['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].includes(x.id) };
        const low = scoreDimension(FIXTURE_QUESTIONS, heavy, coversOnlySix);
        expect(low.n).toBe(6);
        expect(low.coveredWeight / low.answeredWeight).toBeLessThan(0.5);
        expect(low.sufficient).toBe(false);

        const light: Answers = {};
        for (const x of FIXTURE_QUESTIONS) light[x.id] = pick('a');
        const ok = scoreDimension(FIXTURE_QUESTIONS, light, coversOnlySix);
        expect(ok.coveredWeight / ok.answeredWeight).toBe(0.6);
        expect(ok.sufficient).toBe(true);
    });

    it('fait only needs MIN_VOTES compared votes, whatever the share of answers they cover', () => {
        const coversFive = (question: Question) =>
            ['q1', 'q2', 'q3', 'q4', 'q5'].includes(question.id) ? { a: 1 } : null;
        const all: Answers = {};
        for (const x of FIXTURE_QUESTIONS) all[x.id] = pick('a');
        const fait = scoreDimension(FIXTURE_QUESTIONS, all, coversFive, FAIT_RULE);
        expect(fait.n).toBe(MIN_VOTES);
        expect(fait.coveredWeight / fait.answeredWeight).toBe(0.5);
        expect(fait.sufficient).toBe(true);
        // Same coverage under the programme rule: 5 questions are not enough
        expect(scoreDimension(FIXTURE_QUESTIONS, all, coversFive).sufficient).toBe(false);
        const four: Answers = { q1: pick('a'), q2: pick('a'), q3: pick('a'), q4: pick('a') };
        expect(scoreDimension(FIXTURE_QUESTIONS, four, coversFive, FAIT_RULE).sufficient).toBe(false);
    });

    it('a party without group has no fait score', () => {
        const lo = resultFor(answersMatching('lfi'), 'lo');
        expect(lo.fait).toMatchObject({ raw: null, n: 0, sufficient: false, rounded: null });
    });
});

describe('scoreAll rounding', () => {
    const q1to6a = (): Answers => Object.fromEntries(['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].map(id => [id, pick('a')]));

    it('rounds to the nearest 5, halves up', () => {
        // 7 of 8 questions match lfi: 87.5 -> 90
        const sevenOfEight = { ...q1to6a(), q7: pick('a'), q8: pick('d') };
        expect(resultFor(sevenOfEight, 'lfi').dit.rounded).toBe(90);
        // 6 of 8: 75 exactly
        const sixOfEight = { ...q1to6a(), q7: pick('b'), q8: pick('a') };
        expect(resultFor(sixOfEight, 'lfi').dit.rounded).toBe(75);
        // 7.5 of 8: 93.75 -> 95
        const nuanced = { ...q1to6a(), q1: pick('a', 'b'), q7: pick('a'), q8: pick('b') };
        expect(resultFor(nuanced, 'lfi').dit.raw).toBeCloseTo(7.5 / 8);
        expect(resultFor(nuanced, 'lfi').dit.rounded).toBe(95);
        // 5 of 8: 62.5 -> 65
        const fiveOfEight = { ...q1to6a(), q6: pick('d'), q7: pick('b'), q8: pick('a') };
        expect(resultFor(fiveOfEight, 'lfi').dit.rounded).toBe(65);
    });

    it('computes fait from the votes of the group', () => {
        // lfi group voted "pour" (a) in q1..q7 and "pour" (d) in q8
        const answers: Answers = { ...q1to6a(), q7: pick('a') };
        const fait = resultFor(answers, 'lfi').fait;
        expect(fait.raw).toBe(1);
        expect(fait.rounded).toBe(100);
        // ps group split a/b: a clear answer a gets 50
        const ps = resultFor(answers, 'ps').fait;
        expect(ps.raw).toBe(0.5);
        expect(ps.rounded).toBe(50);
        // rn never expressed an usable vote on q8
        expect(resultFor({ ...answers, q8: pick('d') }, 'rn').fait.n).toBe(7);
    });
});

const result = (label: string, dit: number | null, fait: number | null = null): PartyResult => {
    const score = (rounded: number | null) => ({ raw: null, n: 0, coveredWeight: 0, answeredWeight: 0, sufficient: rounded !== null, rounded });
    return { partyId: label.toLowerCase() as PartyId, label, dit: score(dit), fait: score(fait) };
};

const labels = (groups: ReturnType<typeof rankWithTies>) => groups.map(g => g.results.map(r => r.label));

describe('rankWithTies', () => {
    it('groups from the leader, not from the previous party', () => {
        const groups = rankWithTies([result('C', 72), result('A', 80), result('B', 76)], 'dit');
        expect(labels(groups)).toEqual([['A', 'B'], ['C']]);
    });

    it('includes a party exactly 5 points behind the leader, not 6', () => {
        expect(labels(rankWithTies([result('A', 80), result('B', 75)], 'dit'))).toEqual([['A', 'B']]);
        expect(labels(rankWithTies([result('A', 80), result('B', 74)], 'dit'))).toEqual([['A'], ['B']]);
    });

    it('breaks ties alphabetically in French', () => {
        const groups = rankWithTies([result('Zeta', 50), result('Écologistes', 50), result('Alpha', 50)], 'dit');
        expect(labels(groups)).toEqual([['Alpha', 'Écologistes', 'Zeta']]);
    });

    it('puts insufficient scores last, in their own bucket', () => {
        const groups = rankWithTies([result('N2', null), result('A', 10), result('N1', null), result('B', 90)], 'dit');
        expect(labels(groups)).toEqual([['B'], ['A'], ['N1', 'N2']]);
        expect(groups.map(g => g.insufficient)).toEqual([false, false, true]);
    });

    it('ranks on the requested dimension', () => {
        const groups = rankWithTies([result('A', 100, 10), result('B', 10, 100)], 'fait');
        expect(labels(groups)).toEqual([['B'], ['A']]);
    });

    it('handles empty and all-insufficient input', () => {
        expect(rankWithTies([], 'dit')).toEqual([]);
        const groups = rankWithTies([result('A', null)], 'dit');
        expect(groups).toHaveLength(1);
        expect(groups[0].insufficient).toBe(true);
    });
});

describe('noPartyShare', () => {
    it('is 0 without answers', () => {
        expect(noPartyShare(FIXTURE, {})).toBe(0);
        expect(noPartyShare(FIXTURE, { q1: skip })).toBe(0);
    });

    it('averages, unweighted, the mass put on options nobody backs', () => {
        expect(noPartyShare(FIXTURE, { q1: pick('d') })).toBe(1);
        expect(noPartyShare(FIXTURE, { q1: pick('a') })).toBe(0);
        expect(noPartyShare(FIXTURE, { q1: pick('a', 'd') })).toBe(0.5);
        expect(noPartyShare(FIXTURE, { q1: pick('d'), q2: pick('a') })).toBe(0.5);
        expect(noPartyShare(FIXTURE, { q1: { ...pick('d'), important: true }, q2: pick('a') })).toBe(0.5);
    });

    it('counts an option backed by the votes only as backed', () => {
        // q8: "d" is backed by the vote of two groups only, "a" by nobody
        expect(noPartyShare(FIXTURE, { q8: pick('d') })).toBe(0);
        expect(noPartyShare(FIXTURE, { q8: pick('a') })).toBe(1);
    });

    it('counts an option backed by the programme only as backed', () => {
        // q10 has no votes: "a" is backed by lfi's programme, "d" and "e" by nobody
        expect(noPartyShare(FIXTURE, { q10: pick('a') })).toBe(0);
        expect(noPartyShare(FIXTURE, { q10: pick('d', 'e') })).toBe(1);
    });
});

describe('european votes', () => {
    it('are ignored by the scoring', () => {
        const answers: Answers = { q1: pick('a'), q2: pick('b'), q3: pick('c'), q4: pick('a'), q5: pick('b'), q6: pick('c'), q7: pick('a') };
        const withEurope: Dataset = {
            ...FIXTURE,
            questions: FIXTURE.questions.map(question => ({
                ...question,
                europeanVotes: [{
                    party: 'lo',
                    summary: 'Son eurodéputé a voté pour le texte.',
                    votes: [{ title: 'Texte de test', date: '2026-03-01', url: 'https://howtheyvote.eu/votes/1' }],
                }],
            })),
        };
        expect(scoreAll(withEurope, answers)).toEqual(scoreAll(FIXTURE, answers));
        expect(noPartyShare(withEurope, answers)).toBe(noPartyShare(FIXTURE, answers));
    });
});

describe('canShowResults', () => {
    const answered = (n: number): Answers => Object.fromEntries(Array.from({ length: n }, (_, i) => [`x${i}`, pick('a')]));

    it('needs MIN_ANSWERED answered questions', () => {
        expect(MIN_ANSWERED).toBe(8);
        expect(canShowResults(answered(7))).toBe(false);
        expect(canShowResults(answered(8))).toBe(true);
    });

    it('does not count skipped questions', () => {
        expect(canShowResults({ ...answered(7), skipped: skip })).toBe(false);
        expect(canShowResults({ ...answered(8), skipped: skip })).toBe(true);
    });
});
