import { describe, it, expect } from 'vitest';

import { DEMO_DATASET } from '../../test/fixtures/demo.ts';
import { parti } from '../../test/fixtures/fictional.ts';
import { validateDataset } from '../data/validate.ts';
import { sequenceOf } from '../quizState.ts';
import { canShowResults, rankWithTies, scoreAll } from '../scoring.ts';
import type { Answers } from '../data/types.ts';

// The development dataset stands in for the real question bank, so it has to be a valid one
// that scores like one.
describe('development demo dataset', () => {
    it('passes the dataset validation', () => {
        expect(validateDataset(DEMO_DATASET)).toEqual([]);
    });

    it('has about ten core questions and three optional ones, all clearly marked as demo', () => {
        const core = DEMO_DATASET.questions.filter(q => q.tier === 'core');
        const extra = DEMO_DATASET.questions.filter(q => q.tier === 'affiner');
        expect(core).toHaveLength(10);
        expect(extra).toHaveLength(3);
        expect(DEMO_DATASET.questions.every(q => q.theme.startsWith('Démo'))).toBe(true);
    });

    it('gives displayable scores on both dimensions once the core is answered', () => {
        const questions = sequenceOf(DEMO_DATASET.questions, false);
        const answers: Answers = {};
        for (const q of questions) answers[q.id] = { picks: [q.options[0].id], skipped: false, important: false };
        expect(canShowResults(answers)).toBe(true);
        const results = scoreAll({ ...DEMO_DATASET, questions }, answers);
        const dit = rankWithTies(results, 'dit').filter(g => !g.insufficient);
        const fait = rankWithTies(results, 'fait').filter(g => !g.insufficient);
        expect(dit.flatMap(g => g.results)).toHaveLength(12);
        // Parties without a group have no "fait" score
        expect(fait.flatMap(g => g.results).length).toBeGreaterThanOrEqual(8);
        expect(results.find(r => r.partyId === parti('a'))?.fait.rounded).toBeNull();
    });
});
