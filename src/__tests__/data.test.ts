import { describe, it, expect } from 'vitest';
import { DATASET } from '../data/index.ts';
import { BLACKOUTS } from '../data/finalists.ts';
import { CONTENT_READY, CURRENT_SHARE_LAYOUT, DATA_VERSION, LEGISLATURE, PUBLISHED_AT, SHARE_LAYOUTS } from '../data/meta.ts';
import { PARTIES } from '../data/parties.ts';
import { MIN_CORE_WITH_VOTES, contentCompletenessErrors, explanationErrors, contentCompletenessWarnings, validateDataset } from '../data/validate.ts';
import type { Dataset, EuropeanVote, PartyId } from '../data/types.ts';
import { FIXTURE, SOURCE, programme } from './fixtures.ts';

// WCAG 2.x relative luminance and contrast ratio
const channel = (value: number): number => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string): number => {
    const n = parseInt(hex.slice(1), 16);
    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const contrastWithWhite = (hex: string): number => 1.05 / (luminance(hex) + 0.05);

// Deep copy of the fixture that the test can break on purpose
const broken = (mutate: (d: Dataset) => void): string[] => {
    const copy = structuredClone(FIXTURE);
    mutate(copy);
    return validateDataset(copy);
};

describe('real dataset', () => {
    it('is valid', () => {
        expect(validateDataset(DATASET)).toEqual([]);
    });

    it('gives every option a plain-language explanation', () => {
        expect(explanationErrors(DATASET)).toEqual([]);
    });

    it('declares its version, legislature and publication date', () => {
        expect(DATA_VERSION).toBe('2026-10-v1.1');
        expect(LEGISLATURE).toBe(17);
        expect(PUBLISHED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(DATASET.votes.legislature).toBe(LEGISLATURE);
    });

    it.skipIf(!CONTENT_READY)('is content-complete once CONTENT_READY is set', () => {
        expect(contentCompletenessErrors(DATASET)).toEqual([]);
        expect(contentCompletenessWarnings(DATASET)).toEqual([]);
    });
});

describe('parties', () => {
    const ids: PartyId[] = ['lo', 'lfi', 'pcf', 'eco', 'ps', 'ren', 'modem', 'hor', 'lr', 'udr', 'rn', 'rec'];

    it('lists the 12 parties once, in the order of the first share layout', () => {
        expect(PARTIES.map(p => p.id).sort()).toEqual([...ids].sort());
        expect(SHARE_LAYOUTS[CURRENT_SHARE_LAYOUT]).toEqual(PARTIES.map(p => p.id));
    });

    it('has the 17th legislature groups, none for lo and rec', () => {
        const groups = Object.fromEntries(PARTIES.map(p => [p.id, p.group?.abbrev]));
        expect(groups).toEqual({
            lo: undefined,
            lfi: 'LFI-NFP',
            pcf: 'GDR',
            eco: 'EcoS',
            ps: 'SOC',
            ren: 'EPR',
            modem: 'Dem',
            hor: 'HOR',
            lr: 'DR',
            udr: 'UDR',
            rn: 'RN',
            rec: undefined,
        });
        // Every group is found in every generated scrutin, by organeRef or (UDR, which changed
        // organeRef mid-legislature and is renamed by build-votes) by its abbreviation
        for (const [n, scrutin] of Object.entries(DATASET.votes.scrutins)) {
            for (const party of PARTIES.filter(p => p.group)) {
                const key = party.group!.organeRef ?? party.group!.abbrev;
                expect(scrutin.groupes[key], `${party.id} in scrutin ${n}`).toBeDefined();
            }
        }
    });

    it('has labels and well-formed hex gradients', () => {
        for (const party of PARTIES) {
            expect(party.label.trim()).not.toBe('');
            expect(party.shortLabel.trim()).not.toBe('');
            party.gradient.forEach(stop => expect(stop).toMatch(/^#[0-9A-Fa-f]{6}$/));
        }
    });

    it('keeps white text readable (contrast >= 3:1) on both gradient stops', () => {
        for (const party of PARTIES) {
            for (const stop of party.gradient) {
                expect(contrastWithWhite(stop), `${party.id} ${stop}`).toBeGreaterThanOrEqual(3);
            }
        }
    });

    it('computes contrast correctly', () => {
        expect(contrastWithWhite('#FFFFFF')).toBeCloseTo(1);
        expect(contrastWithWhite('#000000')).toBeCloseTo(21);
        expect(contrastWithWhite('#767676')).toBeCloseTo(4.54, 1);
    });
});

describe('finalists and blackouts', () => {
    it('has well-formed blackout windows', () => {
        for (const { start, end } of BLACKOUTS) {
            expect(start).toMatch(/Z$/);
            expect(end).toMatch(/Z$/);
            expect(Date.parse(start)).toBeLessThan(Date.parse(end));
        }
        expect(Date.parse(BLACKOUTS[0].end)).toBeLessThan(Date.parse(BLACKOUTS[1].start));
    });
});

describe('validateDataset on the fixture', () => {
    it('accepts the fixture', () => {
        expect(validateDataset(FIXTURE)).toEqual([]);
    });

    it('catches a missing source', () => {
        const errors = broken(d => {
            const position = d.questions[0].programme.lfi;
            if (position.backs) position.sources = [];
        });
        expect(errors).toEqual(['question q1 / lfi: no source']);
    });

    it('checks every source of a context, and catches a context without one', () => {
        const none = broken(d => {
            d.questions[0].context = { text: 'Contexte.', sources: [] };
        });
        expect(none).toEqual(['question q1 context: no source']);
        const second = broken(d => {
            d.questions[0].context = { text: 'Contexte.', sources: [SOURCE, { ...SOURCE, url: 'http://example.org' }] };
        });
        expect(second).toHaveLength(1);
        expect(second[0]).toContain('context source 2');
    });

    it('catches a non-https or undated or future source', () => {
        const errors = broken(d => {
            const position = d.questions[0].programme.lfi;
            if (position.backs) {
                position.sources = [
                    { ...SOURCE, url: 'http://example.org' },
                    { ...SOURCE, date: '2026-13-40' },
                    { ...SOURCE, date: '2099-01-01' },
                ];
            }
        });
        expect(errors).toHaveLength(3);
        expect(errors[0]).toContain('https');
        expect(errors[1]).toContain('ISO');
        expect(errors[2]).toContain('after');
    });

    it('catches a bad option reference in a position', () => {
        const errors = broken(d => {
            const position = d.questions[1].programme.ps;
            if (position.backs) position.backs = ['zzz'];
        });
        expect(errors).toEqual(['question q2 / ps: unknown option "zzz"']);
    });

    it('catches a bad option reference in a vote mapping', () => {
        const errors = broken(d => {
            d.questions[0].votes!.mapping.pour = 'zzz';
        });
        expect(errors).toEqual(['question q1: vote mapping "pour" targets unknown option "zzz"']);
    });

    it('catches a scrutin that is not in scrutins.json', () => {
        const errors = broken(d => {
            d.questions[0].votes!.scrutins = [101, 999];
        });
        expect(errors).toEqual(['question q1: scrutin 999 is not in scrutins.json']);
    });

    it('catches 6 options and 2 options', () => {
        const six = broken(d => {
            d.questions[0].options = ['a', 'b', 'c', 'd', 'e', 'f'].map(id => ({ id, label: id }));
        });
        expect(six).toEqual(['question q1: needs 3 to 5 options (has 6)']);
        const two = broken(d => {
            d.questions[6].options = d.questions[6].options.slice(0, 2);
        });
        expect(two.some(e => e.includes('needs 3 to 5 options (has 2)'))).toBe(true);
    });

    it('catches a duplicate option id and a duplicate question id', () => {
        const errors = broken(d => {
            d.questions[0].options[1].id = 'a';
            d.questions[1].id = 'q1';
        });
        expect(errors).toContain('question q1: duplicate option id "a"');
        expect(errors).toContain('duplicate question id "q1"');
    });

    it('catches a situation of 36 words and an option of 21 words', () => {
        const words = (n: number) => Array.from({ length: n }, (_, i) => `mot${i}`).join(' ');
        expect(broken(d => { d.questions[0].situation = words(35); })).toEqual([]);
        expect(broken(d => { d.questions[0].situation = words(36); })).toEqual(['question q1: situation has more than 35 words']);
        expect(broken(d => { d.questions[0].options[0].label = words(20); })).toEqual([]);
        expect(broken(d => { d.questions[0].options[0].label = words(21); })).toEqual(['question q1: option "a" has more than 20 words']);
    });

    it('catches clear/split inconsistencies', () => {
        const errors = broken(d => {
            const clear = d.questions[0].programme.lfi;
            if (clear.backs) clear.backs = ['a', 'b'];
            const split = d.questions[6].programme.ps;
            if (split.backs) split.backs = ['a'];
        });
        expect(errors).toContain('question q1 / lfi: a clear position backs exactly 1 option (has 2)');
        expect(errors).toContain('question q7 / ps: a split position backs at least 2 options (has 1)');
    });

    it('catches a missing programme entry for a party', () => {
        const errors = broken(d => {
            delete (d.questions[0].programme as Partial<Record<PartyId, unknown>>).rn;
        });
        expect(errors).toEqual(['question q1 / rn: missing programme entry']);
    });

    it('catches invalid finalists', () => {
        expect(broken(d => { d.finalists.parties = ['rn']; })[0]).toContain('needs 2 or 3 parties');
        expect(broken(d => { d.finalists.parties = ['rn', 'lfi', 'ps', 'lo']; })[0]).toContain('needs 2 or 3 parties');
        expect(broken(d => { d.finalists.parties = ['rn', 'hor']; })).toEqual(['finalists: unknown party "hor"']);
        expect(broken(d => { d.finalists.parties = ['rn', 'rn']; })).toEqual(['finalists: duplicate party']);
    });

    it('requires full legal mentions on polls in sondages mode only', () => {
        const incomplete = (d: Dataset) => {
            d.finalists.polls[0].institut = '';
            d.finalists.polls[0].marge = ' ';
            d.finalists.polls[0].noticeUrl = '';
        };
        const errors = broken(incomplete);
        expect(errors).toEqual([
            'finalists poll #1: institut is empty',
            'finalists poll #1: marge is empty',
            'finalists poll #1: noticeUrl must be https',
        ]);
        expect(broken(d => { incomplete(d); d.finalists.mode = 'qualifies'; })).toEqual([]);
    });
});

describe('european votes', () => {
    const entry: EuropeanVote = {
        party: 'lo',
        summary: 'Son eurodéputé a voté pour le texte.',
        votes: [{ title: 'Texte de test', date: '2026-03-01', url: 'https://howtheyvote.eu/votes/1' }],
    };
    const vote = entry.votes[0];
    const withEntries = (...entries: EuropeanVote[]): string[] => broken(d => {
        d.questions[0].europeanVotes = entries;
    });

    it('accepts a vote for a party without deputies', () => {
        expect(withEntries(entry)).toEqual([]);
    });

    it('rejects an unknown party and a party that has deputies', () => {
        const unknown = withEntries({ ...entry, party: 'rec' });
        expect(unknown).toHaveLength(1);
        expect(unknown[0]).toContain('unknown party');
        const deputies = withEntries({ ...entry, party: 'rn' });
        expect(deputies).toHaveLength(1);
        expect(deputies[0]).toContain('has deputies');
    });

    it('rejects an empty summary and a summary of 31 words', () => {
        const empty = withEntries({ ...entry, summary: '  ' });
        expect(empty).toHaveLength(1);
        expect(empty[0]).toContain('summary is empty');
        const long = withEntries({ ...entry, summary: Array(31).fill('mot').join(' ') });
        expect(long).toHaveLength(1);
        expect(long[0]).toContain('more than 30 words');
        expect(withEntries({ ...entry, summary: Array(30).fill('mot').join(' ') })).toEqual([]);
    });

    it('rejects a non-https url, a bad date and a future date', () => {
        const http = withEntries({ ...entry, votes: [{ ...vote, url: 'http://howtheyvote.eu' }] });
        expect(http).toHaveLength(1);
        expect(http[0]).toContain('https');
        const bad = withEntries({ ...entry, votes: [{ ...vote, date: '2026-13-40' }] });
        expect(bad).toHaveLength(1);
        expect(bad[0]).toContain('ISO');
        const future = withEntries({ ...entry, votes: [{ ...vote, date: '2099-01-01' }] });
        expect(future).toHaveLength(1);
        expect(future[0]).toContain('after');
    });

    it('rejects an empty vote title', () => {
        const errors = withEntries({ ...entry, votes: [{ ...vote, title: '' }] });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('title');
    });

    it('accepts 8 votes and rejects none or 9', () => {
        const many = (n: number) => withEntries({ ...entry, votes: Array.from({ length: n }, (_, i) => ({ ...vote, url: `https://howtheyvote.eu/votes/${i + 1}` })) });
        expect(many(8)).toEqual([]);
        const none = many(0);
        expect(none).toHaveLength(1);
        expect(none[0]).toContain('1 to 8 votes');
        const nine = many(9);
        expect(nine).toHaveLength(1);
        expect(nine[0]).toContain('1 to 8 votes');
    });

    it('reports a problem on any vote of a list', () => {
        const errors = withEntries({ ...entry, votes: [vote, { ...vote, title: ' ' }] });
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('vote #2');
    });

    it('rejects two entries for the same party on one question', () => {
        const errors = withEntries(entry, entry);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('duplicate party');
    });
});

describe('contentCompletenessErrors', () => {
    it('flags what is missing from an unfinished dataset', () => {
        const errors = contentCompletenessErrors(FIXTURE);
        expect(errors).toEqual([
            'needs 18 to 22 core questions (has 7)',
            `needs at least ${MIN_CORE_WITH_VOTES} core questions with votes (has 7)`,
        ]);
    });

    it('requires a poll in sondages mode only', () => {
        const noPolls = { ...FIXTURE, finalists: { ...FIXTURE.finalists, polls: [] } };
        expect(contentCompletenessErrors(noPolls)).toContain('finalists: sondages mode needs at least 1 poll');
        const qualified = { ...noPolls, finalists: { ...noPolls.finalists, mode: 'qualifies' as const } };
        expect(contentCompletenessErrors(qualified)).not.toContain('finalists: sondages mode needs at least 1 poll');
    });

    it('accepts a dataset with 20 core questions, the minimum of them with votes', () => {
        const base = FIXTURE.questions[0];
        const questions = Array.from({ length: 20 }, (_, i) => ({
            ...base,
            id: `c${i}`,
            votes: i < MIN_CORE_WITH_VOTES ? base.votes : undefined,
        }));
        expect(contentCompletenessErrors({ ...FIXTURE, questions })).toEqual([]);
        const tooFew = questions.slice(0, 17);
        expect(contentCompletenessErrors({ ...FIXTURE, questions: tooFew })[0]).toContain('has 17');
        const fewVotes = questions.map((q, i) => ({ ...q, votes: i < MIN_CORE_WITH_VOTES - 1 ? base.votes : undefined }));
        expect(contentCompletenessErrors({ ...FIXTURE, questions: fewVotes })).toEqual([
            `needs at least ${MIN_CORE_WITH_VOTES} core questions with votes (has ${MIN_CORE_WITH_VOTES - 1})`,
        ]);
    });

    it('lists the questions on which every party has the same position', () => {
        expect(contentCompletenessWarnings(FIXTURE)).toEqual([]);
        const same = { ...FIXTURE.questions[0], id: 'same', programme: programme({}) };
        const unanimous = {
            ...FIXTURE.questions[0],
            id: 'unanimous',
            programme: programme(Object.fromEntries(PARTIES.map(p => [p.id, FIXTURE.questions[0].programme.lfi]))),
        };
        const warnings = contentCompletenessWarnings({ ...FIXTURE, questions: [...FIXTURE.questions, same, unanimous] });
        expect(warnings).toEqual([
            'question same: all parties have the same programme position',
            'question unanimous: all parties have the same programme position',
        ]);
    });
});

describe('option cases', () => {
    const casesOn = (d: Dataset, ...ids: string[]) => {
        for (const option of d.questions[0].options) {
            if (ids.includes(option.id)) option.cases = { text: 'Cas.', sources: [SOURCE] };
        }
    };

    it('accepts cases on every option of a question', () => {
        const ids = FIXTURE.questions[0].options.map(o => o.id);
        expect(broken(d => casesOn(d, ...ids))).toEqual([]);
    });

    it('rejects cases on only some options of a question', () => {
        const errors = broken(d => casesOn(d, d.questions[0].options[0].id));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('expected none or all');
    });

    it('checks the sources and the text of a case', () => {
        const ids = FIXTURE.questions[0].options.map(o => o.id);
        const errors = broken(d => {
            casesOn(d, ...ids);
            d.questions[0].options[0].cases = { text: ' ', sources: [{ ...SOURCE, url: 'http://example.org' }] };
        });
        expect(errors).toHaveLength(2);
        expect(errors.join()).toContain('cases: text is empty');
        expect(errors.join()).toContain('cases source 1');
    });
});

describe('option explanations', () => {
    it('accepts a short explanation and rejects an empty or very long one', () => {
        expect(broken(d => { d.questions[0].options[0].explain = 'En clair.'; })).toEqual([]);
        expect(broken(d => { d.questions[0].options[0].explain = '  '; })[0]).toContain('empty explanation');
        expect(broken(d => { d.questions[0].options[0].explain = Array(41).fill('mot').join(' '); })[0]).toContain('more than 40 words');
    });

    it('reports options without an explanation as an error', () => {
        const errors = explanationErrors(FIXTURE);
        expect(errors.some(e => e.includes('has no plain-language explanation'))).toBe(true);
    });
});

describe('questions added in version 1.1', () => {
    const added = ['retraites-age', 'petits-entrepreneurs', 'pme-croissance'];

    it('come last, in this order, in the "affiner" tier, with unique ids', () => {
        const ids = DATASET.questions.map(q => q.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.slice(-added.length)).toEqual(added);
        expect(ids[ids.length - added.length - 1]).toBe('france-monde-commerce');
        for (const id of added) expect(DATASET.questions.find(q => q.id === id)!.tier).toBe('affiner');
    });

    it('have 5, 5 and 4 options, each explained, without precedents', () => {
        const byId = (id: string) => DATASET.questions.find(q => q.id === id)!;
        expect(added.map(id => byId(id).options.length)).toEqual([5, 5, 4]);
        for (const id of added) {
            for (const option of byId(id).options) {
                expect(option.explain?.trim(), `${id} ${option.id}`).toBeTruthy();
                expect(option.cases, `${id} ${option.id}`).toBeUndefined();
            }
        }
    });

    it('map scrutin 468 on retraites-age to existing options: pour keeps 64 (c), contre restores 62 (b)', () => {
        const q = DATASET.questions.find(x => x.id === 'retraites-age')!;
        expect(q.votes).toEqual({ scrutins: [468], mapping: { pour: 'c', contre: 'b', abstention: null } });
        const optionIds = q.options.map(o => o.id);
        for (const option of Object.values(q.votes!.mapping)) if (option !== null) expect(optionIds).toContain(option);
        expect(DATASET.scrutins).toContain(468);
    });

    it('find scrutin 468 in the generated votes, with the 12 group keys and the official totals', () => {
        const scrutin = DATASET.votes.scrutins['468'];
        expect(scrutin.date).toBe('2024-11-28');
        expect(Object.keys(scrutin.groupes)).toHaveLength(12);
        for (const party of PARTIES.filter(p => p.group)) {
            expect(scrutin.groupes[party.group!.organeRef ?? party.group!.abbrev], party.id).toBeDefined();
        }
        const total = (key: 'pour' | 'contre' | 'abstentions') => Object.values(scrutin.groupes).reduce((sum, g) => sum + g[key], 0);
        expect([total('pour'), total('contre'), total('abstentions')]).toEqual([100, 241, 1]);
    });
});
