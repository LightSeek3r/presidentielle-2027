import { PUBLISHED_AT } from './meta.ts';
import type { Dataset, Position, Question, Source, SourcedNote } from './types.ts';

// 11 for V1 (decided 2026-10-12): under the strict coding rule only 11 core themes have a
// univocal scrutin since the CC struck down the under-15 social media law. Back to 12 once the
// autumn 2026 budget votes are in (V2).
export const MIN_CORE_WITH_VOTES = 11;

export const MAX_SITUATION_WORDS = 35;
export const MAX_OPTION_WORDS = 20;
export const MAX_EXPLAIN_WORDS = 40;
export const MAX_EUROPEAN_SUMMARY_WORDS = 30;
export const MAX_EUROPEAN_VOTES = 8;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isIsoDate = (value: unknown): value is string => {
    if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const isHttps = (value: unknown): boolean => {
    if (typeof value !== 'string') return false;
    try {
        return new URL(value).protocol === 'https:';
    } catch {
        return false;
    }
};

export const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

export const nonEmpty = (value: unknown): boolean => typeof value === 'string' && value.trim() !== '';

export const sourceErrors = (source: Source, where: string): string[] => {
    const errors: string[] = [];
    if (!isHttps(source.url)) errors.push(`${where}: source url must be https (${source.url})`);
    if (!isIsoDate(source.date)) errors.push(`${where}: source date must be an ISO yyyy-mm-dd date (${source.date})`);
    else if (source.date > PUBLISHED_AT) errors.push(`${where}: source date ${source.date} is after ${PUBLISHED_AT}`);
    if (!nonEmpty(source.label)) errors.push(`${where}: source label is empty`);
    return errors;
};

export const noteErrors = (note: SourcedNote, where: string): string[] => {
    const errors: string[] = [];
    if (!nonEmpty(note.text)) errors.push(`${where}: text is empty`);
    if (note.sources.length === 0) errors.push(`${where}: no source`);
    note.sources.forEach((source, i) => errors.push(...sourceErrors(source, `${where} source ${i + 1}`)));
    return errors;
};

// Showing precedents for some options of a question and not others would tilt it, so it is all or none
const casesCoverageErrors = (question: Question): string[] => {
    const withCases = question.options.filter(option => option.cases).length;
    return withCases === 0 || withCases === question.options.length
        ? []
        : [`question ${question.id}: cases on ${withCases} of ${question.options.length} options, expected none or all`];
};

export const positionErrors = (position: Position | undefined, optionIds: Set<string>, where: string): string[] => {
    if (!position) return [`${where}: missing programme entry`];
    if (position.backs === null) return [];
    const errors: string[] = [];
    const { backs, kind, sources } = position;
    if (new Set(backs).size !== backs.length) errors.push(`${where}: duplicate options in backs`);
    for (const option of backs) {
        if (!optionIds.has(option)) errors.push(`${where}: unknown option "${option}"`);
    }
    if (kind === 'clear' && backs.length !== 1) errors.push(`${where}: a clear position backs exactly 1 option (has ${backs.length})`);
    if (kind === 'split' && backs.length < 2) errors.push(`${where}: a split position backs at least 2 options (has ${backs.length})`);
    if (!sources || sources.length === 0) errors.push(`${where}: no source`);
    else sources.forEach(source => errors.push(...sourceErrors(source, where)));
    return errors;
};

const europeanVoteErrors = (question: Question, dataset: Dataset): string[] => {
    const errors: string[] = [];
    const seen = new Set<string>();
    (question.europeanVotes ?? []).forEach((entry, i) => {
        const where = `question ${question.id} / european vote #${i + 1}`;
        const party = dataset.parties.find(p => p.id === entry.party);
        if (!party) errors.push(`${where}: unknown party "${entry.party}"`);
        else if (party.group) errors.push(`${where}: party "${entry.party}" has deputies, so no European vote is shown for it`);
        if (seen.has(entry.party)) errors.push(`${where}: duplicate party "${entry.party}"`);
        seen.add(entry.party);
        if (!nonEmpty(entry.summary)) errors.push(`${where}: summary is empty`);
        else if (wordCount(entry.summary) > MAX_EUROPEAN_SUMMARY_WORDS) {
            errors.push(`${where}: summary has more than ${MAX_EUROPEAN_SUMMARY_WORDS} words`);
        }
        if (entry.votes.length < 1 || entry.votes.length > MAX_EUROPEAN_VOTES) {
            errors.push(`${where}: needs 1 to ${MAX_EUROPEAN_VOTES} votes (has ${entry.votes.length})`);
        }
        entry.votes.forEach((vote, k) => {
            const voteWhere = `${where} / vote #${k + 1}`;
            if (!nonEmpty(vote.title)) errors.push(`${voteWhere}: vote title is empty`);
            if (!isHttps(vote.url)) errors.push(`${voteWhere}: vote url must be https (${vote.url})`);
            if (!isIsoDate(vote.date)) errors.push(`${voteWhere}: vote date must be an ISO yyyy-mm-dd date (${vote.date})`);
            else if (vote.date > PUBLISHED_AT) errors.push(`${voteWhere}: vote date ${vote.date} is after ${PUBLISHED_AT}`);
        });
    });
    return errors;
};

const questionErrors = (question: Question, dataset: Dataset): string[] => {
    const errors: string[] = [];
    const q = `question ${question.id}`;
    const optionIds = new Set<string>();

    if (wordCount(question.situation) > MAX_SITUATION_WORDS) {
        errors.push(`${q}: situation has more than ${MAX_SITUATION_WORDS} words`);
    }
    if (question.options.length < 3 || question.options.length > 5) {
        errors.push(`${q}: needs 3 to 5 options (has ${question.options.length})`);
    }
    for (const option of question.options) {
        if (optionIds.has(option.id)) errors.push(`${q}: duplicate option id "${option.id}"`);
        optionIds.add(option.id);
        if (wordCount(option.label) > MAX_OPTION_WORDS) {
            errors.push(`${q}: option "${option.id}" has more than ${MAX_OPTION_WORDS} words`);
        }
        if (!nonEmpty(option.label)) errors.push(`${q}: option "${option.id}" has an empty label`);
        if (option.explain !== undefined) {
            if (!nonEmpty(option.explain)) errors.push(`${q}: option "${option.id}" has an empty explanation`);
            else if (wordCount(option.explain) > MAX_EXPLAIN_WORDS) errors.push(`${q}: option "${option.id}" explanation has more than ${MAX_EXPLAIN_WORDS} words`);
        }
        if (option.cases) errors.push(...noteErrors(option.cases, `${q} option "${option.id}" cases`));
    }
    if (question.context) errors.push(...noteErrors(question.context, `${q} context`));
    errors.push(...casesCoverageErrors(question));

    for (const party of dataset.parties) {
        errors.push(...positionErrors(question.programme[party.id], optionIds, `${q} / ${party.id}`));
    }

    if (question.votes) {
        const { scrutins, mapping } = question.votes;
        if (scrutins.length === 0) errors.push(`${q}: votes without any scrutin`);
        for (const n of scrutins) {
            if (!dataset.scrutins.includes(n)) errors.push(`${q}: scrutin ${n} is not in scrutins.json`);
        }
        for (const [vote, option] of Object.entries(mapping)) {
            if (option !== null && !optionIds.has(option)) errors.push(`${q}: vote mapping "${vote}" targets unknown option "${option}"`);
        }
        if (mapping.pour === null && mapping.contre === null && mapping.abstention === null) {
            errors.push(`${q}: vote mapping maps nothing`);
        }
    }
    errors.push(...europeanVoteErrors(question, dataset));
    return errors;
};

// Structural and editorial errors of a dataset; an empty array means it is valid.
export const validateDataset = (dataset: Dataset): string[] => {
    const errors: string[] = [];
    const partyIds = new Set<string>();
    for (const party of dataset.parties) {
        if (partyIds.has(party.id)) errors.push(`duplicate party id "${party.id}"`);
        partyIds.add(party.id);
    }

    const questionIds = new Set<string>();
    for (const question of dataset.questions) {
        if (questionIds.has(question.id)) errors.push(`duplicate question id "${question.id}"`);
        questionIds.add(question.id);
        errors.push(...questionErrors(question, dataset));
    }

    const { finalists } = dataset;
    if (finalists.parties.length < 2 || finalists.parties.length > 3) {
        errors.push(`finalists: needs 2 or 3 parties (has ${finalists.parties.length})`);
    }
    if (new Set(finalists.parties).size !== finalists.parties.length) errors.push('finalists: duplicate party');
    for (const id of finalists.parties) {
        if (!partyIds.has(id)) errors.push(`finalists: unknown party "${id}"`);
    }
    if (!isIsoDate(finalists.asOf)) errors.push(`finalists: asOf must be an ISO date (${finalists.asOf})`);
    if (finalists.mode === 'sondages') {
        finalists.polls.forEach((poll, i) => {
            const where = `finalists poll #${i + 1}`;
            for (const field of ['institut', 'commanditaire', 'dates', 'marge'] as const) {
                if (!nonEmpty(poll[field])) errors.push(`${where}: ${field} is empty`);
            }
            if (!(poll.echantillon > 0)) errors.push(`${where}: echantillon must be a positive number`);
            if (!isHttps(poll.noticeUrl)) errors.push(`${where}: noticeUrl must be https`);
            if (!isHttps(poll.url)) errors.push(`${where}: url must be https`);
        });
    }
    return errors;
};

const positionKey = (position: Position | undefined): string =>
    !position || position.backs === null ? 'none' : [...position.backs].sort().join('+');

// Requirements that only apply once the content is written (see CONTENT_READY).
export const contentCompletenessErrors = (dataset: Dataset): string[] => {
    const errors: string[] = [];
    const core = dataset.questions.filter(q => q.tier === 'core');
    if (core.length < 18 || core.length > 22) errors.push(`needs 18 to 22 core questions (has ${core.length})`);
    const withVotes = core.filter(q => q.votes && q.votes.scrutins.length > 0).length;
    if (withVotes < MIN_CORE_WITH_VOTES) errors.push(`needs at least ${MIN_CORE_WITH_VOTES} core questions with votes (has ${withVotes})`);
    if (dataset.finalists.mode === 'sondages' && dataset.finalists.polls.length < 1) {
        errors.push('finalists: sondages mode needs at least 1 poll');
    }
    return errors;
};

// Every option needs its plain-language explanation. Kept apart from the completeness rules so
// that test fixtures stay minimal.
export const explanationErrors = (dataset: Dataset): string[] =>
    dataset.questions.flatMap(question =>
        question.options
            .filter(option => !nonEmpty(option.explain))
            .map(option => `question ${question.id}: option "${option.id}" has no plain-language explanation`));

// Questions that cannot discriminate between parties: every party has the same position.
export const contentCompletenessWarnings = (dataset: Dataset): string[] =>
    dataset.questions
        .filter(q => new Set(dataset.parties.map(p => positionKey(q.programme[p.id]))).size === 1)
        .map(q => `question ${q.id}: all parties have the same programme position`);
