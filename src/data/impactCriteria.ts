import type { Criterion, Profile } from './impactTypes.ts';

// The stepper of the "Impact pour moi" page, as data. Main criteria are always asked; a follow-up is
// asked only when `when` holds, so the visitor sees what matters for their situation and nothing else.
// A follow-up that stops applying is cleared by `prune` (impactState.ts), never kept hidden.

export interface Band {
    label: string;
    // Lower bound and a representative value, in euros (net monthly for incomes, total for wealth)
    min: number;
    mid: number;
}

// Individual net monthly income
export const INCOME_BANDS: Band[] = [
    { label: 'Moins de 1 200 €', min: 0, mid: 900 },
    { label: '1 200 à 1 800 €', min: 1200, mid: 1500 },
    { label: '1 800 à 2 500 €', min: 1800, mid: 2150 },
    { label: '2 500 à 3 500 €', min: 2500, mid: 3000 },
    { label: '3 500 à 5 000 €', min: 3500, mid: 4250 },
    { label: '5 000 à 8 000 €', min: 5000, mid: 6500 },
    { label: '8 000 à 15 000 €', min: 8000, mid: 11500 },
    { label: 'Plus de 15 000 €', min: 15000, mid: 20000 },
];

// Property, savings, vehicles, gold, net of debts
export const WEALTH_MATERIAL_BANDS: Band[] = [
    { label: 'Aucun', min: 0, mid: 0 },
    { label: 'Moins de 50 k€', min: 1, mid: 20_000 },
    { label: '50 à 200 k€', min: 50_000, mid: 120_000 },
    { label: '200 à 500 k€', min: 200_000, mid: 350_000 },
    { label: '500 k€ à 2 M€', min: 500_000, mid: 1_000_000 },
    { label: '2 à 10 M€', min: 2_000_000, mid: 5_000_000 },
    { label: '10 à 100 M€', min: 10_000_000, mid: 30_000_000 },
    { label: 'Plus de 100 M€', min: 100_000_000, mid: 150_000_000 },
];

// Securities, company shares, intellectual property, goodwill
export const WEALTH_IMMATERIAL_BANDS: Band[] = [
    { label: 'Aucun', min: 0, mid: 0 },
    { label: 'Moins de 50 k€', min: 1, mid: 20_000 },
    { label: '50 à 500 k€', min: 50_000, mid: 200_000 },
    { label: '500 k€ à 5 M€', min: 500_000, mid: 2_000_000 },
    { label: '5 à 50 M€', min: 5_000_000, mid: 15_000_000 },
    { label: 'Plus de 50 M€', min: 50_000_000, mid: 80_000_000 },
];

export const AGE_LABELS = { a18: '18 à 24 ans', a25: '25 à 39 ans', a40: '40 à 54 ans', a55: '55 à 64 ans', a65: '65 ans et plus' } as const;

const working = (p: Profile): boolean => p.status === 'salarie' || p.status === 'public' || p.status === 'indep' || p.status === 'patron';

export const CRITERIA: Criterion[] = [
    // ── Step 1: income and patrimony ────────────────────────────────────────────────────────
    {
        id: 'income', step: 1, tier: 'main', kind: 'steps', required: true,
        label: 'Votre revenu net mensuel',
        help: 'Le vôtre, pas celui du foyer. Salaire, pension, allocations ou revenu d’activité, après cotisations.',
        steps: INCOME_BANDS.map(b => b.label),
    },
    {
        id: 'wealthMaterial', step: 1, tier: 'main', kind: 'steps',
        label: 'Votre patrimoine matériel',
        help: 'Celui de votre foyer (vous et votre conjoint) : immobilier, épargne, véhicules, or, nets de vos dettes.',
        steps: WEALTH_MATERIAL_BANDS.map(b => b.label),
    },
    {
        id: 'wealthImmaterial', step: 1, tier: 'main', kind: 'steps',
        label: 'Votre patrimoine immatériel',
        help: 'Celui de votre foyer : titres, assurance-vie, parts d’entreprise, brevets, droits d’auteur, fonds de commerce.',
        steps: WEALTH_IMMATERIAL_BANDS.map(b => b.label),
    },

    // ── Step 2: situation ───────────────────────────────────────────────────────────────────
    {
        id: 'status', step: 2, tier: 'main', kind: 'chips', required: true,
        label: 'Votre situation',
        options: [
            { value: 'salarie', label: 'Salarié du privé' },
            { value: 'public', label: 'Agent public' },
            { value: 'indep', label: 'Indépendant' },
            { value: 'patron', label: 'Chef d’entreprise' },
            { value: 'chomeur', label: 'Sans emploi' },
            { value: 'retraite', label: 'Retraité' },
            { value: 'etudiant', label: 'Étudiant' },
        ],
    },
    {
        id: 'age', step: 2, tier: 'main', kind: 'chips', required: true,
        label: 'Votre âge',
        options: Object.entries(AGE_LABELS).map(([value, label]) => ({ value, label })),
    },
    {
        id: 'employerSize', step: 2, tier: 'followup', kind: 'chips',
        label: 'Combien de salariés dans votre entreprise ?',
        options: [
            { value: 'tpe', label: '1 à 10 salariés' },
            { value: 'pme', label: '11 à 49 salariés' },
            { value: 'eti', label: '50 salariés et plus' },
        ],
        when: p => p.status === 'patron',
        because: 'Chef d’entreprise',
    },
    {
        id: 'indepRegime', step: 2, tier: 'followup', kind: 'chips',
        label: 'Quel est votre régime ?',
        options: [
            { value: 'micro', label: 'Micro-entrepreneur' },
            { value: 'reel', label: 'Régime réel' },
        ],
        when: p => p.status === 'indep',
        because: 'Indépendant',
    },

    // ── Step 3: household ───────────────────────────────────────────────────────────────────
    {
        id: 'household', step: 3, tier: 'main', kind: 'chips', required: true,
        label: 'Vivez-vous seul ou en couple ?',
        options: [
            { value: 'seul', label: 'Seul' },
            { value: 'couple', label: 'En couple' },
        ],
    },
    {
        id: 'partnerStatus', step: 3, tier: 'followup', kind: 'chips',
        label: 'Et votre conjoint ?',
        options: [
            { value: 'salarie', label: 'Salarié du privé' },
            { value: 'public', label: 'Agent public' },
            { value: 'indep', label: 'Indépendant ou chef d’entreprise' },
            { value: 'retraite', label: 'Retraité' },
            { value: 'autre', label: 'Autre (sans emploi, étudiant...)' },
        ],
        when: p => p.household === 'couple',
        because: 'En couple',
    },
    {
        id: 'partnerIncome', step: 3, tier: 'followup', kind: 'steps',
        label: 'Son revenu net mensuel',
        steps: INCOME_BANDS.map(b => b.label),
        when: p => p.household === 'couple',
        because: 'En couple',
    },
    {
        id: 'children', step: 3, tier: 'main', kind: 'chips', required: true,
        label: 'Combien d’enfants à charge ?',
        options: [
            { value: '0', label: 'Aucun' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3 ou plus' },
        ],
    },
    {
        id: 'childAges', step: 3, tier: 'followup', kind: 'multi',
        label: 'Leur âge',
        help: 'Plusieurs réponses possibles.',
        options: [
            { value: 'under3', label: 'Moins de 3 ans' },
            { value: 'school', label: '3 à 17 ans' },
            { value: 'student', label: '18 à 25 ans, encore à charge' },
        ],
        when: p => (p.children ?? 0) > 0,
        because: 'Enfants à charge',
    },
    {
        id: 'disability', step: 3, tier: 'main', kind: 'multi',
        label: 'Un handicap reconnu dans le foyer ?',
        help: 'Reconnaissance de la MDPH (AAH, RQTH, carte d’invalidité). Laissez vide si non.',
        options: [
            { value: 'self', label: 'Vous' },
            { value: 'partner', label: 'Votre conjoint' },
            { value: 'child', label: 'Un enfant' },
        ],
    },
    {
        id: 'ald', step: 3, tier: 'main', kind: 'toggle',
        label: 'Une maladie de longue durée prise en charge à 100 % (ALD) ?',
        recap: 'ALD',
    },
    {
        id: 'housing', step: 3, tier: 'main', kind: 'chips', required: true,
        label: 'Votre logement',
        options: [
            { value: 'loc-prive', label: 'Locataire (privé)' },
            { value: 'loc-social', label: 'Locataire (HLM)' },
            { value: 'prop-credit', label: 'Propriétaire, crédit en cours' },
            { value: 'prop', label: 'Propriétaire, sans crédit' },
            { value: 'heberge', label: 'Hébergé' },
            { value: 'residence', label: 'Résidence étudiante ou foyer' },
        ],
    },
    {
        id: 'zone', step: 3, tier: 'main', kind: 'chips', required: true,
        label: 'Où habitez-vous ?',
        options: [
            { value: 'tendue', label: 'Grande ville ou sa proche banlieue, logement difficile à trouver' },
            { value: 'detendue', label: 'Ville moyenne' },
            { value: 'rural', label: 'Campagne' },
            { value: 'outremer', label: 'Outre-mer' },
        ],
    },
    {
        id: 'landlord', step: 3, tier: 'followup', kind: 'toggle',
        label: 'Louez-vous un bien à quelqu’un ?',
        recap: 'Bailleur',
        when: p => p.housing !== null,
        because: 'Logement renseigné',
    },
    {
        id: 'heating', step: 3, tier: 'followup', kind: 'chips',
        label: 'Comment vous chauffez-vous ?',
        options: [
            { value: 'elec', label: 'Électricité' },
            { value: 'gaz', label: 'Gaz' },
            { value: 'fioul', label: 'Fioul' },
            { value: 'bois', label: 'Bois, granulés' },
            { value: 'collectif', label: 'Chauffage collectif' },
        ],
        when: p => p.housing !== null && p.housing !== 'heberge',
        because: 'Logement renseigné',
    },
    {
        id: 'dpe', step: 3, tier: 'followup', kind: 'chips',
        label: 'Classe énergétique de votre logement (DPE)',
        help: 'Étiquette de A à G, sur le diagnostic de performance énergétique.',
        options: [
            { value: 'ok', label: 'A à D' },
            { value: 'e', label: 'E' },
            { value: 'fg', label: 'F ou G' },
            { value: 'unknown', label: 'Je ne sais pas' },
        ],
        when: p => p.housing !== null && p.housing !== 'heberge',
        because: 'Logement renseigné',
    },
    {
        id: 'car', step: 3, tier: 'main', kind: 'chips',
        label: 'Utilisez-vous une voiture ?',
        options: [
            { value: 'quotidien', label: 'Tous les jours' },
            { value: 'occasionnel', label: 'Parfois' },
            { value: 'non', label: 'Non' },
        ],
    },
    {
        id: 'kilometres', step: 3, tier: 'followup', kind: 'chips',
        label: 'Combien de kilomètres par an ?',
        options: [
            { value: 'low', label: 'Moins de 8 000' },
            { value: 'mid', label: '8 000 à 15 000' },
            { value: 'high', label: 'Plus de 15 000' },
        ],
        when: p => p.car === 'quotidien' || p.car === 'occasionnel',
        because: 'Vous utilisez une voiture',
    },
    {
        id: 'otherIncome', step: 3, tier: 'main', kind: 'multi',
        label: 'Avez-vous d’autres revenus ?',
        help: 'Plusieurs réponses possibles. Laissez vide si non.',
        options: [
            { value: 'capital', label: 'Dividendes, intérêts, plus-values' },
            { value: 'activite2', label: 'Activité secondaire' },
            { value: 'pension-alim', label: 'Pension alimentaire' },
        ],
    },
    {
        id: 'aids', step: 3, tier: 'followup', kind: 'multi',
        label: 'Quelles aides recevez-vous ?',
        help: 'Plusieurs réponses possibles. Laissez vide si aucune.',
        options: [
            { value: 'bourse', label: 'Bourse sur critères sociaux' },
            { value: 'apl', label: 'Aide au logement (APL)' },
            { value: 'pa', label: 'Prime d’activité' },
            { value: 'rsa', label: 'RSA' },
            { value: 'are', label: 'Allocation chômage' },
            { value: 'aah', label: 'AAH' },
            { value: 'af', label: 'Allocations familiales' },
            { value: 'css', label: 'Complémentaire santé solidaire' },
            { value: 'cheque-energie', label: 'Chèque énergie' },
        ],
        when: p => p.income !== null && p.status !== null && (p.income <= 3 || !working(p) || (p.children ?? 0) > 0 || p.disability.length > 0 || p.housing === 'loc-prive' || p.housing === 'loc-social'),
        because: 'Selon vos revenus et votre foyer',
    },
];

export const CRITERIA_BY_ID = Object.fromEntries(CRITERIA.map(c => [c.id, c])) as Record<Criterion['id'], Criterion>;

export const STEP_TITLES: Record<1 | 2 | 3, string> = {
    1: 'Revenus et patrimoine',
    2: 'Votre situation',
    3: 'Votre foyer',
};
