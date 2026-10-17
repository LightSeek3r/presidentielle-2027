import { FICTIONAL_ORDER, FICTIONAL_PARTIES, parti } from './fictional.ts';
import type {
    Dataset, GroupVotes, OptionId, PartyId, Position, Question, ScrutinVotes, Source, VoteMapping, VotesData,
} from '../../src/data/types.ts';

// FICTIONAL TEST DATA, NOT REAL POSITIONS.
//
// A complete demonstration dataset for the tests: the town, the questions, the twelve parties
// ("Parti A" to "Parti L", see fictional.ts), their positions, the votes and the poll are all
// invented. Nothing here says anything about what a real party thinks or voted.

const SOURCE: Source = {
    url: 'https://example.org/demo',
    label: 'Source fictive (démonstration)',
    date: '2026-01-15',
    kind: 'autre',
};

// Party order of the compact tables below
const ORDER: PartyId[] = FICTIONAL_ORDER;

// 'a' = backs option a, 'a+b' = split between a and b, '~' = ambiguous, '?' = not covered, '-' = absent
type Stances = [string, string, string, string, string, string, string, string, string, string, string, string];

type Vote = 'pour' | 'contre' | 'abstention' | 'mixte';

const position = (code: string): Position => {
    if (code === '~') return { backs: null, reason: 'ambigu' };
    if (code === '?') return { backs: null, reason: 'non-couvert' };
    if (code === '-') return { backs: null, reason: 'absent' };
    const backs = code.split('+');
    return { backs, kind: backs.length > 1 ? 'split' : 'clear', sources: [SOURCE] };
};

const MAPPING: VoteMapping = { pour: 'a', contre: 'd', abstention: 'b' };

// The group of a party votes like the party's stance unless a drift says otherwise
const voteOf = (stance: string, drift: Vote | undefined): Vote => {
    if (drift) return drift;
    const backs = stance.split('+');
    if (backs.includes(MAPPING.pour as OptionId)) return 'pour';
    if (backs.includes(MAPPING.contre as OptionId)) return 'contre';
    if (backs.includes(MAPPING.abstention as OptionId)) return 'abstention';
    return 'mixte';
};

const COUNTS: Record<Vote, GroupVotes> = {
    pour: { pour: 38, contre: 1, abstentions: 1, nonVotants: 3 },
    contre: { pour: 1, contre: 38, abstentions: 1, nonVotants: 3 },
    abstention: { pour: 2, contre: 2, abstentions: 36, nonVotants: 3 },
    mixte: { pour: 20, contre: 20, abstentions: 0, nonVotants: 3 },
};

interface Draft {
    theme: string;
    situation: string;
    context?: string;
    options: [string, string, string, string];
    stances: Stances;
    // Questions with a scrutin get a number; drift moves the vote of a few groups away from their stance
    scrutin?: number;
    // Demo-only European Parliament note for Parti L (a party without deputies)
    european?: string;
    drift?: Partial<Record<PartyId, Vote>>;
}

const DRAFTS: { tier: Question['tier']; draft: Draft }[] = [
    { tier: 'core', draft: {
        theme: 'Démo · Rue principale',
        situation: "La mairie de Villeneuve-sur-Exemple, ville fictive, dispose d'un budget pour la rue principale. Que faire en priorité ?",
        context: "La rue principale fait 800 mètres et traverse le centre de la ville fictive.",
        options: ['Créer une piste cyclable protégée', 'Élargir les trottoirs et planter des arbres', 'Ajouter des places de stationnement', 'Ne rien changer et garder le budget'],
        stances: ['a', 'a', 'b', 'a', 'b', 'b', 'a+b', 'c', 'c', 'c', 'c', 'd'],
        scrutin: 9001,
        european: "Démonstration fictive : sa seule eurodéputée aurait voté pour un texte imaginaire sur la rue principale.",
        drift: { [parti('f')]: 'abstention' },
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Piscine',
        situation: "La piscine de Villeneuve-sur-Exemple ferme tôt le soir. Comment l'ouvrir plus longtemps ?",
        options: ['Embaucher du personnel avec l\'argent public', 'Faire payer un peu plus les entrées', 'Confier la gestion à une entreprise', 'Laisser les horaires actuels'],
        stances: ['a', 'a', 'a', 'a', 'a', 'c', 'b', 'c', 'c', 'c', 'b', 'd'],
        scrutin: 9002,
        drift: { [parti('k')]: 'contre' },
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Marché',
        situation: "Le marché du samedi attire moins de monde à Villeneuve-sur-Exemple. Que proposer ?",
        options: ['Baisser le prix des emplacements pour les commerçants', 'Ajouter des animations et des concerts', 'Ouvrir aussi le dimanche', 'Le laisser évoluer seul'],
        stances: ['?', 'a', 'a', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'b+c', 'd'],
        scrutin: 9003,
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Bibliothèque',
        situation: "La bibliothèque de Villeneuve-sur-Exemple est fermée le soir. Que décider ?",
        options: ['Ouvrir le soir et le dimanche', 'Ouvrir le soir seulement', 'Créer un service de livres à domicile', 'Garder les horaires actuels'],
        stances: ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'd', 'd', 'd', 'd'],
        scrutin: 9004,
        drift: { [parti('i')]: 'abstention', [parti('h')]: 'pour' },
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Cantine',
        situation: "La cantine des écoles de Villeneuve-sur-Exemple veut changer ses repas. Quelle est la priorité ?",
        options: ['Plus de produits locaux, même plus chers', 'Un repas de qualité au prix actuel', 'Un tarif réduit pour toutes les familles', 'Des plats à la carte, payants'],
        stances: ['c', 'c', 'c', 'a', 'c', 'b', 'b', 'b', 'a+b', 'a', 'a', 'd'],
        scrutin: 9005,
        drift: { [parti('c')]: 'abstention' },
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Éclairage',
        situation: "Les lampadaires de Villeneuve-sur-Exemple restent allumés toute la nuit. Que faire ?",
        options: ['Les éteindre au milieu de la nuit', 'Baisser leur intensité', 'Les laisser allumés par sécurité', 'Installer des détecteurs de présence'],
        stances: ['a', 'a', '~', 'a', 'b', 'b', 'd', 'b', 'c', 'c', 'c', 'c'],
        scrutin: 9006,
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Terrain libre',
        situation: "Un terrain vide est libre près de la gare de Villeneuve-sur-Exemple. Que construire ?",
        options: ['Un parc public', 'Des logements', 'Un parking', 'Des commerces et des activités'],
        stances: ['b', 'a', 'b', 'a', 'b', 'b', 'd', 'd', 'd', 'c', 'd', 'c'],
        scrutin: 9007,
        drift: { [parti('d')]: 'contre', [parti('j')]: 'pour' },
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Fête annuelle',
        situation: "La fête annuelle de Villeneuve-sur-Exemple coûte cher. Comment la financer ?",
        options: ['Uniquement par la mairie', 'Par la mairie et des dons des habitants', 'Avec des partenaires privés', 'Réduire la fête'],
        stances: ['a', 'a', 'a', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'd', 'd'],
        scrutin: 9008,
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Petit bus',
        situation: "Un petit bus pourrait relier les quartiers de Villeneuve-sur-Exemple. Qui doit payer ?",
        options: ['La mairie, gratuit pour tous', 'La mairie, avec un tarif réduit selon les revenus', 'Les usagers, au prix réel', 'Il ne faut pas de bus'],
        stances: ['-', 'a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'd', 'd', 'd'],
        scrutin: 9009,
        drift: { [parti('h')]: 'abstention' },
    } },
    { tier: 'core', draft: {
        theme: 'Démo · Poubelles',
        situation: "À Villeneuve-sur-Exemple, les poubelles sont ramassées deux fois par semaine. Que décider ?",
        options: ['Garder deux passages par semaine', 'Passer à un seul passage et trier davantage', 'Payer selon le poids jeté', 'Laisser chaque quartier choisir'],
        stances: ['b', 'b', 'a', 'b', 'a', 'c', 'c', 'c', 'd', 'd', 'a', 'd'],
    } },
    { tier: 'affiner', draft: {
        theme: 'Démo · Gymnase',
        situation: "Le gymnase de Villeneuve-sur-Exemple est vieux. Faut-il le rénover ou en construire un nouveau ?",
        options: ['Le rénover en gardant sa taille', 'Construire un grand gymnase neuf', 'Partager un gymnase avec la ville voisine', 'Ne rien faire pour le moment'],
        stances: ['a', 'a', 'a', 'a', 'a', 'b', 'c', 'b', 'b', 'b', 'b', 'd'],
        scrutin: 9011,
    } },
    { tier: 'affiner', draft: {
        theme: 'Démo · Démarches',
        situation: "La mairie de Villeneuve-sur-Exemple propose des démarches en ligne. Que faire du guichet ?",
        options: ['Le garder ouvert comme aujourd\'hui', 'Le garder avec moins d\'heures', 'Le remplacer par des rendez-vous', 'Le fermer'],
        stances: ['a', 'a', 'a', 'a', 'a', 'c', 'c', 'c', 'b', 'b', 'a', 'd'],
        scrutin: 9012,
    } },
    { tier: 'affiner', draft: {
        theme: 'Démo · Fleurs',
        situation: "Les massifs de fleurs de Villeneuve-sur-Exemple demandent beaucoup d'eau. Que décider ?",
        options: ['Planter des espèces qui boivent peu', 'Garder les massifs actuels', 'Remplacer les fleurs par du gazon', 'Supprimer les massifs'],
        stances: ['?', 'a', 'a', 'a', 'a', 'a', 'a+b', 'b', 'b', 'b', 'b', 'b'],
    } },
];

const QUESTIONS_DEMO: Question[] = DRAFTS.map(({ tier, draft }, i) => ({
    id: `demo-${i + 1}`,
    tier,
    theme: draft.theme,
    situation: draft.situation,
    context: draft.context ? { text: draft.context, sources: [SOURCE] } : undefined,
    options: draft.options.map((label, k) => ({ id: 'abcd'[k], label })),
    programme: Object.fromEntries(ORDER.map((id, k) => [id, position(draft.stances[k])])) as Record<PartyId, Position>,
    votes: draft.scrutin ? { scrutins: [draft.scrutin], mapping: MAPPING } : undefined,
    europeanVotes: draft.european ? [{
        party: parti('l'),
        summary: draft.european,
        votes: [{ title: 'Vote fictif (démonstration)', date: '2026-02-01', url: 'https://example.org/vote-europeen' }],
    }] : undefined,
}));

const scrutinsData = (): Record<string, ScrutinVotes> => {
    const result: Record<string, ScrutinVotes> = {};
    for (const { draft } of DRAFTS) {
        if (!draft.scrutin) continue;
        const groupes: Record<string, GroupVotes> = {};
        FICTIONAL_PARTIES.forEach(party => {
            if (!party.group) return;
            const stance = draft.stances[ORDER.indexOf(party.id)];
            groupes[party.group.abbrev] = COUNTS[voteOf(stance, draft.drift?.[party.id])];
        });
        result[String(draft.scrutin)] = {
            date: '2026-02-01',
            titre: `Scrutin fictif n° ${draft.scrutin} (démonstration)`,
            url: 'https://example.org/scrutin',
            groupes,
        };
    }
    return result;
};

const VOTES_DEMO: VotesData = { extractedAt: '2026-02-01', legislature: 17, scrutins: scrutinsData() };

export const DEMO_DATASET: Dataset = {
    parties: FICTIONAL_PARTIES,
    questions: QUESTIONS_DEMO,
    scrutins: DRAFTS.flatMap(({ draft }) => (draft.scrutin ? [draft.scrutin] : [])),
    votes: VOTES_DEMO,
    finalists: {
        mode: 'sondages',
        parties: [parti('b'), parti('f'), parti('k')],
        asOf: '2026-10-11',
        polls: [{
            institut: 'Institut Exemple (démonstration)',
            commanditaire: 'Commanditaire fictif',
            dates: '1er au 3 octobre 2026',
            echantillon: 1000,
            marge: '± 3 points',
            noticeUrl: 'https://example.org/notice',
            url: 'https://example.org/sondage',
        }],
    },
};
