import type { Answer, Answers, Dataset, OptionId, PartyId, Question } from './data/types.ts';

// Pure state machine of the quiz (the reducer behind the website's quiz screens). No browser API here.

export type Step = 'intro' | 'self' | 'question' | 'affiner-prompt' | 'results';

export type SelfPlacement = PartyId | 'none' | 'skip' | null;

export interface QuizState {
    step: Step;
    // Index in the active question sequence (core, then affiner when chosen)
    index: number;
    selfPlacement: SelfPlacement;
    answers: Answers;
    includeAffiner: boolean;
    // True while the current question is answered with two choices (checkboxes)
    nuance: boolean;
    // Seed of the options shuffle, stable for the session
    seed: number;
}

export type QuizAction =
    | { type: 'start' }
    | { type: 'setSelf'; value: Exclude<SelfPlacement, null> }
    | { type: 'answer'; questionId: string; picks: OptionId[] }
    | { type: 'toggleNuance'; questionId: string }
    | { type: 'skip'; questionId: string }
    | { type: 'toggleImportant'; questionId: string }
    | { type: 'next' }
    | { type: 'prev' }
    | { type: 'chooseAffiner'; value: boolean }
    | { type: 'reset'; seed: number };

// Shape of the question bank the reducer needs: ids in sequence order, core questions first.
export interface QuizLayout {
    ids: string[];
    coreCount: number;
}

export const STEPS: readonly Step[] = ['intro', 'self', 'question', 'affiner-prompt', 'results'];

// Core questions first, then the optional ones; the order inside each tier is the file order.
export const sequenceOf = (questions: Question[], includeAffiner: boolean): Question[] => [
    ...questions.filter(q => q.tier === 'core'),
    ...(includeAffiner ? questions.filter(q => q.tier === 'affiner') : []),
];

export const layoutOf = (dataset: Pick<Dataset, 'questions'>): QuizLayout => {
    const sequence = sequenceOf(dataset.questions, true);
    return { ids: sequence.map(q => q.id), coreCount: sequence.filter(q => q.tier === 'core').length };
};

export const initialState = (seed: number): QuizState => ({
    step: 'intro',
    index: 0,
    selfPlacement: null,
    answers: {},
    includeAffiner: false,
    nuance: false,
    seed,
});

// Nothing worth keeping: the stored copy is removed rather than rewritten.
export const isPristine = (state: QuizState): boolean =>
    state.step === 'intro' && state.selfPlacement === null && Object.keys(state.answers).length === 0;

const sequenceLength = (state: QuizState, layout: QuizLayout): number =>
    state.includeAffiner ? layout.ids.length : layout.coreCount;

const nuanceAt = (answers: Answers, layout: QuizLayout, index: number): boolean => {
    const id = layout.ids[index];
    return id !== undefined && (answers[id]?.picks.length ?? 0) === 2;
};

const goToQuestion = (state: QuizState, layout: QuizLayout, index: number): QuizState => ({
    ...state,
    step: 'question',
    index,
    nuance: nuanceAt(state.answers, layout, index),
});

const blank = (): Answer => ({ picks: [], skipped: false, important: false });

const withAnswer = (state: QuizState, questionId: string, change: (answer: Answer) => Answer): QuizState => ({
    ...state,
    answers: { ...state.answers, [questionId]: change(state.answers[questionId] ?? blank()) },
});

export const createReducer = (layout: QuizLayout) => (state: QuizState, action: QuizAction): QuizState => {
    switch (action.type) {
        case 'start':
            return { ...state, step: 'self', index: 0 };

        case 'setSelf':
            return { ...state, selfPlacement: action.value };

        case 'answer':
            // At most two picks: the second one is the nuance
            return withAnswer(state, action.questionId, answer => ({
                ...answer,
                picks: action.picks.slice(0, 2),
                skipped: false,
            }));

        case 'toggleNuance': {
            const nuance = !state.nuance;
            const next = { ...state, nuance };
            // Leaving the nuance mode keeps a single choice
            return nuance
                ? next
                : withAnswer(next, action.questionId, answer => ({ ...answer, picks: answer.picks.slice(0, 1) }));
        }

        case 'skip':
            return {
                ...withAnswer(state, action.questionId, () => ({ picks: [], skipped: true, important: false })),
                nuance: false,
            };

        case 'toggleImportant':
            return withAnswer(state, action.questionId, answer =>
                answer.skipped ? answer : { ...answer, important: !answer.important });

        case 'next': {
            if (state.step === 'self') {
                return layout.coreCount > 0 ? goToQuestion(state, layout, 0) : { ...state, step: 'results' };
            }
            if (state.step !== 'question') return state;
            if (state.index + 1 < sequenceLength(state, layout)) return goToQuestion(state, layout, state.index + 1);
            if (!state.includeAffiner && layout.ids.length > layout.coreCount) return { ...state, step: 'affiner-prompt' };
            return { ...state, step: 'results' };
        }

        case 'prev':
            switch (state.step) {
                case 'self':
                    return { ...state, step: 'intro' };
                case 'question':
                    if (state.index === 0) return { ...state, step: 'self' };
                    if (state.includeAffiner && state.index === layout.coreCount) return { ...state, step: 'affiner-prompt' };
                    return goToQuestion(state, layout, state.index - 1);
                case 'affiner-prompt':
                    return goToQuestion(state, layout, layout.coreCount - 1);
                case 'results': {
                    const length = sequenceLength(state, layout);
                    return length > 0 ? goToQuestion(state, layout, length - 1) : { ...state, step: 'self' };
                }
                default:
                    return state;
            }

        case 'chooseAffiner':
            return action.value
                ? goToQuestion({ ...state, includeAffiner: true }, layout, layout.coreCount)
                : { ...state, includeAffiner: false, step: 'results' };

        case 'reset':
            return initialState(action.seed);

        default:
            return state;
    }
};

// Keeps only what the current question bank can interpret: known question ids, known option ids,
// at most two picks. Applied to state read back from the session.
export const sanitize = (state: QuizState, dataset: Pick<Dataset, 'questions'>): QuizState => {
    const layout = layoutOf(dataset);
    const answers: Answers = {};
    for (const question of dataset.questions) {
        const stored = state.answers[question.id];
        if (!stored) continue;
        const known = new Set(question.options.map(o => o.id));
        answers[question.id] = {
            picks: stored.skipped ? [] : stored.picks.filter(p => known.has(p)).slice(0, 2),
            skipped: stored.skipped,
            important: stored.skipped ? false : stored.important,
        };
    }
    const length = state.includeAffiner ? layout.ids.length : layout.coreCount;
    const index = Math.min(Math.max(0, state.index), Math.max(0, length - 1));
    const step: Step = state.step === 'question' && length === 0 ? 'self' : state.step;
    return { ...state, answers, index, step, nuance: step === 'question' && nuanceAt(answers, layout, index) };
};
