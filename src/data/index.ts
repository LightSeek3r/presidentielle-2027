import type { Dataset, VotesData } from './types.ts';
import { PARTIES } from './parties.ts';
import { QUESTIONS } from './questions.ts';
import { FINALISTS } from './finalists.ts';
import scrutins from './scrutins.json' with { type: 'json' };
import votes from './votes.generated.json' with { type: 'json' };

export const DATASET: Dataset = {
    parties: PARTIES,
    questions: QUESTIONS,
    scrutins,
    votes: votes as VotesData,
    finalists: FINALISTS,
};

export * from './types.ts';
export * from './meta.ts';
export { PARTIES } from './parties.ts';
export { QUESTIONS } from './questions.ts';
export { FINALISTS, BLACKOUTS } from './finalists.ts';
