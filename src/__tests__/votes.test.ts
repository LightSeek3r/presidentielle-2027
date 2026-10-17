import { describe, it, expect } from 'vitest';
import { MIN_VOTERS, voteDistribution } from '../data/votes.ts';
import type { Party, Question, VoteMapping, VotesData } from '../data/types.ts';
import { FIXTURE, FIXTURE_QUESTIONS, FIXTURE_VOTES, group, programme, scrutin } from './fixtures.ts';

const party = (id: 'lfi' | 'lo' | 'ps'): Party => FIXTURE.parties.find(p => p.id === id)!;

const MAPPING: VoteMapping = { pour: 'a', contre: 'c', abstention: 'b' };

const question = (scrutins: number[], mapping: VoteMapping = MAPPING): Question => ({
    id: 'v',
    tier: 'core',
    theme: 'test',
    situation: 'Situation.',
    options: ['a', 'b', 'c'].map(id => ({ id, label: id })),
    programme: programme({}),
    votes: { scrutins, mapping },
});

// One group "LFI-NFP" per scrutin, keyed by scrutin number
const votesOf = (byScrutin: Record<number, ReturnType<typeof group>>): VotesData => ({
    extractedAt: null,
    legislature: 17,
    scrutins: Object.fromEntries(Object.entries(byScrutin).map(([n, g]) => [n, scrutin({ 'LFI-NFP': g })])),
});

describe('voteDistribution', () => {
    it('is proportional to the mapped counts', () => {
        const dist = voteDistribution(question([1]), party('lfi'), votesOf({ 1: group(6, 2, 2, 40) }))!;
        expect(dist.a).toBeCloseTo(0.6);
        expect(dist.c).toBeCloseTo(0.2);
        expect(dist.b).toBeCloseTo(0.2);
        expect(Object.values(dist).reduce((s, x) => s + x, 0)).toBeCloseTo(1);
    });

    it('drops unmapped ballots and non-voters', () => {
        const mapping: VoteMapping = { pour: 'a', contre: 'c', abstention: null };
        const dist = voteDistribution(question([1], mapping), party('lfi'), votesOf({ 1: group(6, 2, 100, 100) }))!;
        expect(dist).toEqual({ a: 0.75, c: 0.25 });
    });

    it('adds up ballots mapped to the same option', () => {
        const mapping: VoteMapping = { pour: 'a', contre: 'a', abstention: null };
        expect(voteDistribution(question([1], mapping), party('lfi'), votesOf({ 1: group(1, 4, 0) }))).toEqual({ a: 1 });
    });

    it('ignores a scrutin with fewer than MIN_VOTERS mapped votes', () => {
        expect(MIN_VOTERS).toBe(3);
        expect(voteDistribution(question([1]), party('lfi'), votesOf({ 1: group(1, 1, 0) }))).toBeNull();
        expect(voteDistribution(question([1]), party('lfi'), votesOf({ 1: group(1, 2, 0) }))).toEqual({ a: 1 / 3, c: 2 / 3 });
        // Many non-voters and unmapped ballots do not make up for it
        const mapping: VoteMapping = { pour: 'a', contre: null, abstention: null };
        expect(voteDistribution(question([1], mapping), party('lfi'), votesOf({ 1: group(2, 50, 50, 50) }))).toBeNull();
    });

    it('averages the scrutins with equal weight, whatever the group size', () => {
        const dist = voteDistribution(question([1, 2]), party('lfi'), votesOf({ 1: group(100, 0, 0), 2: group(0, 3, 0) }))!;
        expect(dist).toEqual({ a: 0.5, c: 0.5 });
    });

    it('averages only the usable scrutins', () => {
        const votes = votesOf({ 1: group(100, 0, 0), 2: group(1, 0, 0) });
        expect(voteDistribution(question([1, 2]), party('lfi'), votes)).toEqual({ a: 1 });
    });

    it('is null when no scrutin is usable or present', () => {
        expect(voteDistribution(question([1, 2]), party('lfi'), votesOf({ 1: group(1, 0, 0) }))).toBeNull();
        expect(voteDistribution(question([99]), party('lfi'), votesOf({ 1: group(9, 0, 0) }))).toBeNull();
        // The scrutin exists but has no row for the group of the party
        expect(voteDistribution(question([1]), party('ps'), votesOf({ 1: group(9, 0, 0) }))).toBeNull();
    });

    it('is null for a party without group and for a question without votes', () => {
        expect(party('lo').group).toBeUndefined();
        expect(voteDistribution(FIXTURE_QUESTIONS[0], party('lo'), FIXTURE_VOTES)).toBeNull();
        const noVotes = FIXTURE_QUESTIONS.find(q => q.id === 'q10')!;
        expect(voteDistribution(noVotes, party('lfi'), FIXTURE_VOTES)).toBeNull();
    });

    it('prefers the organe reference over the abbreviation when both are present', () => {
        const lfi: Party = { ...party('lfi'), group: { abbrev: 'LFI-NFP', organeRef: 'PO800490' } };
        const votes: VotesData = {
            extractedAt: null,
            legislature: 17,
            scrutins: {
                '1': scrutin({ 'LFI-NFP': group(0, 9, 0), PO800490: group(9, 0, 0) }),
            },
        };
        expect(voteDistribution(question([1]), lfi, votes)).toEqual({ a: 1 });
        // Falls back to the abbreviation when the reference is not in the data
        const withoutRef: VotesData = { ...votes, scrutins: { '1': scrutin({ 'LFI-NFP': group(0, 9, 0) }) } };
        expect(voteDistribution(question([1]), lfi, withoutRef)).toEqual({ c: 1 });
    });

    it('reads the fixture as designed', () => {
        const by = (id: string, p: 'lfi' | 'ps') =>
            voteDistribution(FIXTURE_QUESTIONS.find(q => q.id === id)!, party(p), FIXTURE_VOTES);
        expect(by('q1', 'lfi')).toEqual({ a: 1 });
        expect(by('q1', 'ps')).toEqual({ a: 0.5, b: 0.5 });
        expect(by('q9', 'lfi')).toEqual({ a: 0.5, b: 0.5 });
    });
});
