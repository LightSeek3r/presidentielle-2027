// Data model of the 2027 presidential quiz. Types only, no runtime code.

// LO, LFI, PCF, Les Écologistes, PS / Place publique, Renaissance, MoDem, Horizons, LR, UDR, RN, Reconquête
export type PartyId = 'lo' | 'lfi' | 'pcf' | 'eco' | 'ps' | 'ren' | 'modem' | 'hor' | 'lr' | 'udr' | 'rn' | 'rec';

export type OptionId = string;

export interface Party {
    id: PartyId;
    label: string;
    shortLabel: string;
    // Two hex stops, dark enough for white text and logos (contrast >= 3:1 on both stops)
    gradient: [string, string];
    // File name of the party's logo on the website (logos are not part of this repository)
    logo?: string;
    // Assemblée nationale group used for the "fait" dimension. Absent for parties without deputies.
    group?: { abbrev: string; organeRef?: string };
}

export type SourceKind = 'programme-2027' | 'plateforme-2024' | 'programme-2022' | 'motion' | 'declaration' | 'autre';

export interface Source {
    url: string;
    label: string;
    // ISO yyyy-mm-dd
    date: string;
    kind: SourceKind;
}

export type AbsentReason = 'non-couvert' | 'ambigu' | 'absent';

// "split" spreads the party uniformly over its backs (at least 2 options).
// "cumulative" (split only, used by the impact page): the party proposes all its backs together, as one
// package, instead of hesitating between them.
export type Position =
    | { backs: OptionId[]; kind: 'clear' | 'split'; sources: Source[]; note?: string; cumulative?: boolean }
    | { backs: null; reason: AbsentReason };

export interface VoteMapping {
    pour: OptionId | null;
    contre: OptionId | null;
    abstention: OptionId | null;
}

// Vote of a Member of the European Parliament, shown for information on a question for a party
// that has no deputies. Never scored, never ranked.
export interface EuropeanVote {
    party: PartyId;
    // Neutral, at most 30 words
    summary: string;
    // 1 to 8 votes the summary is based on
    votes: {
        title: string;
        // ISO yyyy-mm-dd
        date: string;
        // https link to the vote (howtheyvote.eu or europarl)
        url: string;
    }[];
}

// A short factual note and the official sources it rests on
export interface SourcedNote {
    text: string;
    sources: Source[];
}

export interface QuestionOption {
    id: OptionId;
    label: string;
    // Plain-French explanation of what the option means in practice, shown behind the (i) button
    explain?: string;
    // Where this measure has been applied: where, when, what. Neutral, information only, never scored.
    cases?: SourcedNote;
}

export interface Question {
    id: string;
    tier: 'core' | 'affiner';
    theme: string;
    situation: string;
    // One or more official sources; several when the text cites several countries or laws
    context?: SourcedNote;
    options: QuestionOption[];
    programme: Record<PartyId, Position>;
    votes?: { scrutins: number[]; mapping: VoteMapping };
    // Information only, for parties without deputies. Ignored by the scoring.
    europeanVotes?: EuropeanVote[];
}

export interface Answer {
    // 0..2 option ids; 2 picks = 50/50 nuance
    picks: OptionId[];
    skipped: boolean;
    important: boolean;
}

// Answers keyed by question id
export type Answers = Record<string, Answer>;

// A probability distribution (or partial mass) over the options of one question
export type Dist = Record<OptionId, number>;

export interface GroupVotes {
    pour: number;
    contre: number;
    abstentions: number;
    nonVotants: number;
}

export interface ScrutinVotes {
    date: string;
    titre: string;
    // Outcome code of the scrutin (adopté, rejeté...), information only
    sort?: string;
    url: string;
    // Keyed by group abbreviation or by organe reference
    groupes: Record<string, GroupVotes>;
}

// Shape of votes.generated.json (written by a Node script, read-only here)
export interface VotesData {
    extractedAt: string | null;
    // Where the data comes from, information only
    source?: string;
    legislature: number;
    scrutins: Record<string, ScrutinVotes>;
}

export interface Poll {
    institut: string;
    commanditaire: string;
    dates: string;
    echantillon: number;
    marge: string;
    noticeUrl: string;
    url: string;
}

export interface FinalistsConfig {
    mode: 'sondages' | 'qualifies';
    // 2 or 3 parties
    parties: PartyId[];
    // ISO date
    asOf: string;
    polls: Poll[];
}

export interface Blackout {
    // UTC ISO timestamps
    start: string;
    end: string;
}

export interface Dataset {
    parties: Party[];
    questions: Question[];
    // Contents of scrutins.json
    scrutins: number[];
    votes: VotesData;
    finalists: FinalistsConfig;
}
