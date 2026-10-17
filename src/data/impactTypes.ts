// Data model of the 2027 "Impact pour moi" page. Types and small constants only.
// A measure is a household-level policy; an effect says what it does to a given situation.

import type { PartyId, Position, SourcedNote } from './types.ts';

// ---------------------------------------------------------------------------------------------
// Profile: what the visitor tells us. Every field is null (or empty) until answered.
// ---------------------------------------------------------------------------------------------

export type Status = 'salarie' | 'public' | 'indep' | 'patron' | 'chomeur' | 'retraite' | 'etudiant';

// The other adult of the household; patrons and the self-employed are grouped, the rest is "autre"
export type PartnerStatus = 'salarie' | 'public' | 'indep' | 'retraite' | 'autre';

// 18-24, 25-39, 40-54, 55-64, 65+
export type AgeBand = 'a18' | 'a25' | 'a40' | 'a55' | 'a65';

export type EmployerSize = 'tpe' | 'pme' | 'eti'; // 1-10, 11-49, 50+ employees

export type Household = 'seul' | 'couple';

export type ChildAge = 'under3' | 'school' | 'student'; // under 3, 3-17, 18-25 still at home

export type Disability = 'self' | 'partner' | 'child';

export type Housing = 'loc-prive' | 'loc-social' | 'prop-credit' | 'prop' | 'heberge' | 'residence';

export type Zone = 'tendue' | 'detendue' | 'rural' | 'outremer';

export type Heating = 'elec' | 'gaz' | 'fioul' | 'bois' | 'collectif';

export type Car = 'quotidien' | 'occasionnel' | 'non';

export type OtherIncome = 'capital' | 'activite2' | 'pension-alim';

// Share of the year the car is driven: under 8 000 km, 8 000 to 15 000 km, over 15 000 km
export type Kilometres = 'low' | 'mid' | 'high';

// Energy performance class of the home: A to D, E, F or G
export type Dpe = 'ok' | 'e' | 'fg' | 'unknown';

export type IndepRegime = 'micro' | 'reel';

export type Aid = 'bourse' | 'apl' | 'pa' | 'rsa' | 'are' | 'aah' | 'af' | 'css' | 'cheque-energie';

export interface Profile {
    // Index into INCOME_BANDS (individual net monthly income)
    income: number | null;
    // Index into WEALTH_MATERIAL_BANDS / WEALTH_IMMATERIAL_BANDS
    wealthMaterial: number | null;
    wealthImmaterial: number | null;

    status: Status | null;
    age: AgeBand | null;
    employerSize: EmployerSize | null;
    indepRegime: IndepRegime | null;

    household: Household | null;
    // Same vocabulary as `status` and `income` for the other adult of the household
    partnerStatus: PartnerStatus | null;
    partnerIncome: number | null;
    // 0, 1, 2, or 3 meaning "3 or more"
    children: number | null;
    childAges: ChildAge[];
    disability: Disability[];
    ald: boolean | null; // long-term illness covered at 100 %

    housing: Housing | null;
    zone: Zone | null;
    landlord: boolean | null;
    dpe: Dpe | null;
    heating: Heating | null;
    car: Car | null;
    kilometres: Kilometres | null;
    otherIncome: OtherIncome[];
    aids: Aid[];
}

export type ProfileKey = keyof Profile;

export const EMPTY_PROFILE: Profile = {
    income: null, wealthMaterial: null, wealthImmaterial: null,
    status: null, age: null, employerSize: null, indepRegime: null,
    household: null, partnerStatus: null, partnerIncome: null, children: null, childAges: [], disability: [],
    ald: null,
    housing: null, zone: null, landlord: null, dpe: null, heating: null, car: null, kilometres: null, otherIncome: [], aids: [],
};

// ---------------------------------------------------------------------------------------------
// Criteria: the questions of the stepper, as data. Main ones are always asked; follow-ups only when
// `when` holds, which is also how a hidden answer is cleared (see impactState.ts).
// ---------------------------------------------------------------------------------------------

export type CriterionKind = 'steps' | 'chips' | 'multi' | 'toggle';

export interface CriterionOption {
    value: string;
    label: string;
}

export interface Criterion {
    // The Profile field it fills
    id: ProfileKey;
    // 1 income and patrimony, 2 situation, 3 household
    step: 1 | 2 | 3;
    tier: 'main' | 'followup';
    kind: CriterionKind;
    label: string;
    help?: string;
    // Toggle only: what the recap line says when the answer is yes
    recap?: string;
    // steps: ordered labels; chips and multi: options (toggle needs none: Oui / Non)
    steps?: string[];
    options?: CriterionOption[];
    // Follow-ups: when it is asked, and the short reason shown to the visitor
    when?: (profile: Profile) => boolean;
    because?: string;
    // Main criteria needed before moving to the next step
    required?: boolean;
}

// ---------------------------------------------------------------------------------------------
// Measures and effects
// ---------------------------------------------------------------------------------------------

export type Predicate = (profile: Profile) => boolean;

export type Direction = 'gain' | 'loss' | 'mixed';

export interface Effect {
    // First matching effect wins; no match = "ne vous concerne pas"
    when: Predicate;
    direction: Direction;
    // 1 low, 2 medium, 3 high: only used to order items inside a group
    weight: 1 | 2 | 3;
    // Plain French, 25 words at most, written for the reader ("Votre loyer...")
    why: string;
    // Order of magnitude per year in euros, only when a documented barème or costing exists
    euro?: {
        perYear: [number, number] | ((profile: Profile) => [number, number]);
        basis: SourcedNote;
    };
}

export interface MeasureOption {
    id: string;
    // The measure as a party would write it, 20 words at most
    label: string;
    // What it means in practice
    explain?: string;
    effects: Effect[];
}

export interface Measure {
    id: string;
    theme: string;
    // Neutral title, 14 words at most; no value judgement
    title: string;
    // One or two sentences of context with official sources
    context: SourcedNote;
    // 2 to 5 options, the first being the reference ("status quo") when it exists
    options: MeasureOption[];
    // Same semantics as in the quiz: which option(s) each party backs, sourced
    programme: Record<PartyId, Position>;
}

// ---------------------------------------------------------------------------------------------
// Output of the engine
// ---------------------------------------------------------------------------------------------

export interface ResolvedOption {
    option: MeasureOption;
    // Null when this option has no effect on the profile
    effect: Effect | null;
    euro: [number, number] | null;
}

// What one party's position on one measure does to the profile. A party that splits between several
// options yields one entry with every option listed; its direction is "mixed" unless they all agree.
export interface ResolvedEffect {
    measure: Measure;
    direction: Direction;
    weight: 1 | 2 | 3;
    options: ResolvedOption[];
    // True when the party backs several options
    split: boolean;
    // True when it proposes them together, as one package
    cumulative: boolean;
}

// A party's sheet for one profile. There is deliberately no total and no score.
export interface PartySheet {
    gains: ResolvedEffect[];
    losses: ResolvedEffect[];
    mixed: ResolvedEffect[];
    // Backed by the party but without effect on this profile
    notConcerned: Measure[];
    // The party backs the reference option (keep the current rule), which changes nothing
    keepsRule: Measure[];
    // No usable position (null positions, whatever the reason): never counted as neutral
    unknown: Measure[];
    // Measures with a documented position for the party, out of all measures: the sheets of two parties
    // are only comparable together with these counts
    documented: number;
    total: number;
}
