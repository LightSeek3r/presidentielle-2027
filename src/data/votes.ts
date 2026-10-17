import type { Dist, GroupVotes, Party, Question, VotesData } from './types.ts';

// A group must have expressed at least this many votes mapped to an option in a scrutin,
// otherwise the scrutin says nothing reliable about it and is ignored for that group.
export const MIN_VOTERS = 3;

const groupVotes = (votes: VotesData, scrutin: number, party: Party): GroupVotes | undefined => {
    const groupes = votes.scrutins[String(scrutin)]?.groupes;
    if (!groupes || !party.group) return undefined;
    const { organeRef, abbrev } = party.group;
    return (organeRef ? groupes[organeRef] : undefined) ?? groupes[abbrev];
};

// Distribution of one group's votes in one scrutin over the options of the question,
// proportional to the counts of the mapped ballots. Unmapped ballots (null mapping,
// non-voters) are dropped. null when too few mapped votes were expressed.
const scrutinDist = (mapping: NonNullable<Question['votes']>['mapping'], counts: GroupVotes): Dist | null => {
    const mass: Dist = {};
    let total = 0;
    const add = (option: string | null, count: number) => {
        if (option === null || !(count > 0)) return;
        mass[option] = (mass[option] ?? 0) + count;
        total += count;
    };
    add(mapping.pour, counts.pour);
    add(mapping.contre, counts.contre);
    add(mapping.abstention, counts.abstentions);
    if (total < MIN_VOTERS) return null;
    const dist: Dist = {};
    for (const option of Object.keys(mass)) dist[option] = mass[option] / total;
    return dist;
};

// "Fait" position of a party on a question: the average over the question's scrutins of its
// group's vote distribution. null ("absent") when the question has no votes, the party has no
// group, or no scrutin is usable for that group.
export const voteDistribution = (question: Question, party: Party, votes: VotesData): Dist | null => {
    if (!question.votes || !party.group) return null;
    const usable: Dist[] = [];
    for (const scrutin of question.votes.scrutins) {
        const counts = groupVotes(votes, scrutin, party);
        const dist = counts ? scrutinDist(question.votes.mapping, counts) : null;
        if (dist) usable.push(dist);
    }
    if (usable.length === 0) return null;
    const average: Dist = {};
    for (const dist of usable) {
        for (const option of Object.keys(dist)) {
            average[option] = (average[option] ?? 0) + dist[option] / usable.length;
        }
    }
    return average;
};
