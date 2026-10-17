import { PARTIES } from '../data/parties.ts';
import type { Dataset, GroupVotes, Position, Question, ScrutinVotes, Source, PartyId, VoteMapping, VotesData } from '../data/types.ts';

// Small hand-made dataset: 4 parties (lfi, ps, rn have a group, lo has none), 10 questions.
//
// Programme ("dit"):          Q1-Q6      Q7            Q8     Q9     Q10
//   lfi                       a          a             b      a      a
//   ps                        b          split a+b     b      b      b
//   rn                        c          c             c      b      none (ambigu)
//   lo                        a          none          c      none   c
//   unbacked options          d          -             a      c      d, e
//
// Votes ("fait", standard scrutin): lfi -> a, ps -> a 50% / b 50%, rn -> c, lo none.
//   Q1-Q7: pour -> a, contre -> c, abstention -> b, standard scrutins
//   Q8:    pour -> d only, so d is backed by votes alone (rn: no usable vote)
//   Q9:    two scrutins that cancel out for lfi and ps (a 50% / b 50%), rn -> b
//   Q10:   no votes

export const SOURCE: Source = {
    url: 'https://example.org/programme',
    label: 'Programme de test',
    date: '2026-01-15',
    kind: 'programme-2027',
};

const clear = (option: string): Position => ({ backs: [option], kind: 'clear', sources: [SOURCE] });
const split = (...options: string[]): Position => ({ backs: options, kind: 'split', sources: [SOURCE] });
const none = (reason: 'non-couvert' | 'ambigu' | 'absent'): Position => ({ backs: null, reason });

// Fills the parties that are not in the fixture with an "absent" position
export const programme = (known: Partial<Record<PartyId, Position>>): Record<PartyId, Position> => {
    const filled = {} as Record<PartyId, Position>;
    for (const party of PARTIES) filled[party.id] = known[party.id] ?? none('absent');
    return filled;
};

export const group = (pour: number, contre: number, abstentions: number, nonVotants = 0): GroupVotes => ({
    pour,
    contre,
    abstentions,
    nonVotants,
});

export const scrutin = (groupes: Record<string, GroupVotes>): ScrutinVotes => ({
    date: '2025-03-01',
    titre: 'Scrutin de test',
    url: 'https://example.org/scrutin',
    groupes,
});

const STANDARD = scrutin({
    'LFI-NFP': group(70, 0, 0, 5),
    SOC: group(10, 0, 10),
    RN: group(0, 60, 0, 2),
});

const abc: VoteMapping = { pour: 'a', contre: 'c', abstention: 'b' };

const opts = (...ids: string[]) => ids.map(id => ({ id, label: `Option ${id}` }));

const standard = (id: string, scrutinNumber: number): Question => ({
    id,
    tier: 'core',
    theme: 'test',
    situation: `Situation de test ${id}.`,
    options: opts('a', 'b', 'c', 'd'),
    programme: programme({ lfi: clear('a'), ps: clear('b'), rn: clear('c'), lo: clear('a') }),
    votes: { scrutins: [scrutinNumber], mapping: { ...abc } },
});

export const FIXTURE_QUESTIONS: Question[] = [
    standard('q1', 101),
    standard('q2', 102),
    standard('q3', 103),
    standard('q4', 104),
    standard('q5', 105),
    standard('q6', 106),
    {
        id: 'q7',
        tier: 'core',
        theme: 'test',
        situation: 'Situation de test q7.',
        options: opts('a', 'b', 'c'),
        programme: programme({ lfi: clear('a'), ps: split('a', 'b'), rn: clear('c'), lo: none('non-couvert') }),
        votes: { scrutins: [107], mapping: { ...abc } },
    },
    {
        id: 'q8',
        tier: 'affiner',
        theme: 'test',
        situation: 'Situation de test q8.',
        options: opts('a', 'b', 'c', 'd'),
        programme: programme({ lfi: clear('b'), ps: clear('b'), rn: clear('c'), lo: clear('c') }),
        votes: { scrutins: [108], mapping: { pour: 'd', contre: null, abstention: null } },
    },
    {
        id: 'q9',
        tier: 'affiner',
        theme: 'test',
        situation: 'Situation de test q9.',
        options: opts('a', 'b', 'c'),
        programme: programme({ lfi: clear('a'), ps: clear('b'), rn: clear('b') }),
        votes: { scrutins: [109, 110], mapping: { pour: 'a', contre: 'b', abstention: null } },
    },
    {
        id: 'q10',
        tier: 'affiner',
        theme: 'test',
        situation: 'Situation de test q10.',
        options: opts('a', 'b', 'c', 'd', 'e'),
        programme: programme({ lfi: clear('a'), ps: clear('b'), rn: none('ambigu'), lo: clear('c') }),
    },
];

export const FIXTURE_VOTES: VotesData = {
    extractedAt: '2026-10-01T00:00:00Z',
    legislature: 17,
    scrutins: {
        '101': STANDARD,
        '102': STANDARD,
        '103': STANDARD,
        '104': STANDARD,
        '105': STANDARD,
        '106': STANDARD,
        '107': STANDARD,
        '108': STANDARD,
        '109': scrutin({ 'LFI-NFP': group(50, 0, 0), SOC: group(30, 0, 0), RN: group(0, 20, 0) }),
        '110': scrutin({ 'LFI-NFP': group(0, 50, 0), SOC: group(0, 30, 0), RN: group(0, 20, 0) }),
    },
};

export const FIXTURE: Dataset = {
    parties: PARTIES.filter(p => ['lfi', 'ps', 'rn', 'lo'].includes(p.id)),
    questions: FIXTURE_QUESTIONS,
    scrutins: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
    votes: FIXTURE_VOTES,
    finalists: {
        mode: 'sondages',
        parties: ['rn', 'lfi'],
        asOf: '2026-10-11',
        polls: [
            {
                institut: 'Institut test',
                commanditaire: 'Commanditaire test',
                dates: '1 au 3 octobre 2026',
                echantillon: 1000,
                marge: '3 points',
                noticeUrl: 'https://example.org/notice',
                url: 'https://example.org/sondage',
            },
        ],
    },
};
