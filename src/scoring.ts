import { voteDistribution } from './data/votes.ts';
import type { Answer, Answers, Dataset, Dist, PartyId, Position, Question } from './data/types.ts';

// Pure scoring of a quiz run. Two scores per party, both on 0..100:
// - dit: how close the user's answers are to the party's programme
// - fait: how close they are to the votes of the party's Assemblée nationale group

// Minimum number of answered questions before results are shown
export const MIN_ANSWERED = 8;
// Minimum number of questions a score must rest on, and minimum share of the answered
// weight that the party covers, for the score to be displayed
export const MIN_SCORED = 6;
export const MIN_COVERAGE = 0.5;
// "Fait" rests on the few questions that have a usable roll-call vote (6 to 10 of the 20 core
// questions, fewer for centre and right groups because the strict rule often codes only one side
// of a vote). A coverage share would hide it almost always, so it needs only enough votes, and
// the UI always says how many it rests on.
export const MIN_VOTES = 5;

export interface SufficiencyRule {
    minScored: number;
    minCoverage: number;
}

export const DIT_RULE: SufficiencyRule = { minScored: MIN_SCORED, minCoverage: MIN_COVERAGE };
export const FAIT_RULE: SufficiencyRule = { minScored: MIN_VOTES, minCoverage: 0 };
// Parties whose rounded scores differ by at most this many points are shown as tied
export const TIE_MARGIN = 5;

export type Dimension = 'dit' | 'fait';

export interface DimScore {
    // Weighted mean overlap in 0..1, null when nothing could be compared
    raw: number | null;
    // Number of questions compared
    n: number;
    coveredWeight: number;
    answeredWeight: number;
    sufficient: boolean;
}

export interface RoundedScore extends DimScore {
    // 0..100 by steps of 5, null when raw is null or the score is not sufficient
    rounded: number | null;
}

export interface PartyResult {
    partyId: PartyId;
    label: string;
    dit: RoundedScore;
    fait: RoundedScore;
}

export type ScoringDataset = Pick<Dataset, 'parties' | 'questions' | 'votes'>;

export const isAnswered = (answer: Answer | undefined): answer is Answer =>
    !!answer && !answer.skipped && answer.picks.length > 0;

export const answerToDist = (answer: Answer | undefined): Dist => {
    if (!isAnswered(answer)) return {};
    const picks = answer.picks.slice(0, 2);
    const dist: Dist = {};
    for (const pick of picks) dist[pick] = (dist[pick] ?? 0) + 1 / picks.length;
    return dist;
};

export const positionToDist = (position: Position | undefined): Dist | null => {
    if (!position || position.backs === null || position.backs.length === 0) return null;
    const dist: Dist = {};
    for (const option of position.backs) dist[option] = (dist[option] ?? 0) + 1 / position.backs.length;
    return dist;
};

// Shared probability mass of two distributions: 1 = identical, 0 = disjoint
export const overlap = (u: Dist, p: Dist): number => {
    let total = 0;
    for (const option of Object.keys(u)) total += Math.min(u[option], p[option] ?? 0);
    return total;
};

export const scoreDimension = (
    questions: Question[],
    answers: Answers,
    getPartyDist: (question: Question) => Dist | null,
    rule: SufficiencyRule = DIT_RULE,
): DimScore => {
    let n = 0;
    let coveredWeight = 0;
    let answeredWeight = 0;
    let weightedOverlap = 0;
    for (const question of questions) {
        const answer = answers[question.id];
        if (!isAnswered(answer)) continue;
        const weight = answer.important ? 2 : 1;
        answeredWeight += weight;
        const partyDist = getPartyDist(question);
        if (!partyDist) continue;
        n += 1;
        coveredWeight += weight;
        weightedOverlap += weight * overlap(answerToDist(answer), partyDist);
    }
    return {
        raw: coveredWeight > 0 ? weightedOverlap / coveredWeight : null,
        n,
        coveredWeight,
        answeredWeight,
        sufficient: n >= rule.minScored && answeredWeight > 0 && coveredWeight / answeredWeight >= rule.minCoverage,
    };
};

const withRounding = (score: DimScore): RoundedScore => ({
    ...score,
    rounded: score.raw === null || !score.sufficient ? null : Math.round(score.raw * 100 / 5) * 5,
});

export const scoreAll = (dataset: ScoringDataset, answers: Answers): PartyResult[] =>
    dataset.parties.map(party => ({
        partyId: party.id,
        label: party.label,
        dit: withRounding(scoreDimension(dataset.questions, answers, q => positionToDist(q.programme[party.id]))),
        fait: withRounding(scoreDimension(dataset.questions, answers, q => voteDistribution(q, party, dataset.votes), FAIT_RULE)),
    }));

// Share (0..1) of the user's answers, unweighted, that lands on options no party backs,
// neither in its programme nor in its group's votes.
export const noPartyShare = (dataset: ScoringDataset, answers: Answers): number => {
    let answered = 0;
    let unbacked = 0;
    for (const question of dataset.questions) {
        const answer = answers[question.id];
        if (!isAnswered(answer)) continue;
        const backed = new Set<string>();
        for (const party of dataset.parties) {
            const programme = question.programme[party.id];
            if (programme && programme.backs) programme.backs.forEach(option => backed.add(option));
            const votes = voteDistribution(question, party, dataset.votes);
            if (votes) Object.keys(votes).forEach(option => votes[option] > 0 && backed.add(option));
        }
        const dist = answerToDist(answer);
        answered += 1;
        for (const option of Object.keys(dist)) if (!backed.has(option)) unbacked += dist[option];
    }
    return answered === 0 ? 0 : unbacked / answered;
};

export interface RankGroup {
    // Parties tied within TIE_MARGIN of the group leader, alphabetical
    results: PartyResult[];
    // Parties without a displayable score, always the last group
    insufficient: boolean;
}

// Groups items already sorted by descending rounded score. Ties are grouped greedily from the
// top: an item joins the current group when it is within TIE_MARGIN of that group's leader (not
// of the previous item), so A 80 / B 76 / C 72 gives [A, B] then [C]. Shared by the ranking and
// by the second-round sentence so both apply the very same rule.
export const groupTied = <T>(sorted: T[], scoreOf: (item: T) => number): T[][] => {
    const groups: T[][] = [];
    let leader = 0;
    for (const item of sorted) {
        const last = groups[groups.length - 1];
        if (last && leader - scoreOf(item) <= TIE_MARGIN) {
            last.push(item);
        } else {
            leader = scoreOf(item);
            groups.push([item]);
        }
    }
    return groups;
};

// Ranks parties on one dimension, ties grouped by groupTied.
export const rankWithTies = (results: PartyResult[], dim: Dimension): RankGroup[] => {
    const byLabel = (a: PartyResult, b: PartyResult) => a.label.localeCompare(b.label, 'fr');
    const scored = results.filter(r => r[dim].rounded !== null);
    const unscored = results.filter(r => r[dim].rounded === null);
    scored.sort((a, b) => (b[dim].rounded as number) - (a[dim].rounded as number) || byLabel(a, b));

    const groups: RankGroup[] = groupTied(scored, r => r[dim].rounded as number)
        .map(results => ({ results, insufficient: false }));
    if (unscored.length > 0) groups.push({ results: unscored.sort(byLabel), insufficient: true });
    return groups;
};

export const countAnswered = (answers: Answers): number => Object.values(answers).filter(isAnswered).length;

export const canShowResults = (answers: Answers): boolean => countAnswered(answers) >= MIN_ANSWERED;
