#!/usr/bin/env node
// Leave-one-out fragility report of the "dit" ranking.
//
//   node scripts/robustness.mjs [--profiles 2000] [--seed 42] [--fixture]
//
// N random answer profiles are drawn over the core questions (uniform random option, 10 % skips,
// 15 % marked important). For each profile the top "dit" group (first group of rankWithTies) is
// computed on all core questions, then again with each core question removed in turn. A question
// is fragile when removing it often changes the top group: a verdict that rests on one question.
//
// The real scoring code (scoring.ts, data/*) is imported as is: Node 24 runs TypeScript sources
// directly, so nothing is bundled or installed. When the real DATASET has no core question yet, the
// test fixture (__tests__/fixtures.ts) is used instead and the report says so.

import { parseArgs } from 'node:util';

const SKIP_RATE = 0.1;
const IMPORTANT_RATE = 0.15;
const FLAG_THRESHOLD = 25;

const fail = message => {
    console.error(`\nERREUR robustness: ${message}\n`);
    process.exit(1);
};

const { values: args } = parseArgs({
    options: {
        profiles: { type: 'string', default: '2000' },
        seed: { type: 'string', default: '42' },
        fixture: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
    },
});
if (args.help) {
    console.log('Usage: node scripts/robustness.mjs [--profiles 2000] [--seed 42] [--fixture]');
    process.exit(0);
}
const profileCount = Number(args.profiles);
const seed = Number(args.seed);
if (!Number.isInteger(profileCount) || profileCount <= 0) fail(`--profiles invalide: "${args.profiles}"`);
if (!Number.isInteger(seed)) fail(`--seed invalide: "${args.seed}"`);

// Load the TypeScript sources directly (Node 24 strips the types)
let scoreAll, rankWithTies, FIXTURE;
try {
    ({ scoreAll, rankWithTies } = await import('../src/scoring.ts'));
    ({ FIXTURE } = await import('../src/__tests__/fixtures.ts'));
} catch (error) {
    fail(`chargement du code de scoring impossible:
${error.message}`);
}
let datasetError = null;
let DATASET = { questions: [] };
try {
    ({ DATASET } = await import('../src/data/index.ts'));
} catch (error) {
    // The data files may be mid-edit: fall back on the fixture so the script itself can still be checked
    datasetError = error.message;
}

// Deterministic PRNG (mulberry32)
const prng = initial => {
    let state = initial >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
const random = prng(seed);

const realCore = DATASET.questions.filter(q => q.tier === 'core');
const useFixture = args.fixture || realCore.length === 0 || datasetError !== null;
const base = useFixture ? FIXTURE : DATASET;
const core = base.questions.filter(q => q.tier === 'core');
if (core.length < 2) fail('moins de 2 questions de tier "core": rien a mesurer.');

const randomAnswers = () => {
    const answers = {};
    for (const question of core) {
        if (random() < SKIP_RATE) {
            answers[question.id] = { picks: [], skipped: true, important: false };
            continue;
        }
        const option = question.options[Math.floor(random() * question.options.length)];
        answers[question.id] = { picks: [option.id], skipped: false, important: random() < IMPORTANT_RATE };
    }
    return answers;
};

// Top "dit" group: ids of its parties, best first (ties: alphabetical, as rankWithTies sorts them).
// Empty when nobody has a displayable score.
const topGroup = (questions, answers) => {
    const results = scoreAll({ parties: base.parties, questions, votes: base.votes }, answers);
    const first = rankWithTies(results, 'dit')[0];
    if (!first || first.insufficient) return [];
    return first.results.map(r => r.partyId);
};
const sameSet = (a, b) => a.length === b.length && a.every(id => b.includes(id));
const disjoint = (a, b) => !a.some(id => b.includes(id));

const zero = () => new Map(core.map(q => [q.id, 0]));
const leaderChanged = zero();
const groupChanged = zero();
const groupReplaced = zero();
let noTop = 0;
for (let i = 0; i < profileCount; i++) {
    const answers = randomAnswers();
    const reference = topGroup(core, answers);
    if (reference.length === 0) noTop += 1;
    for (const question of core) {
        const without = topGroup(
            core.filter(q => q.id !== question.id),
            answers,
        );
        const bump = (map, condition) => condition && map.set(question.id, map.get(question.id) + 1);
        bump(leaderChanged, reference[0] !== without[0]);
        bump(groupChanged, !sameSet(reference, without));
        bump(groupReplaced, reference.length > 0 && without.length > 0 && disjoint(reference, without));
    }
}

const pct = count => (count * 100) / profileCount;
const rows = core
    .map(q => ({
        id: q.id,
        theme: q.theme,
        leader: pct(leaderChanged.get(q.id)),
        group: pct(groupChanged.get(q.id)),
        replaced: pct(groupReplaced.get(q.id)),
    }))
    .sort((a, b) => b.leader - a.leader || a.id.localeCompare(b.id));
const mean = values => values.reduce((sum, v) => sum + v, 0) / values.length;

console.log('# Robustesse du classement "dit" (retrait d\'une question)\n');
if (useFixture && !datasetError) {
    console.log(
        args.fixture
            ? '> Jeu de test (`__tests__/fixtures.ts`) utilise sur demande (`--fixture`).\n'
            : '> Le jeu de donnees reel ne contient pas encore de question `core`: rapport calcule sur le jeu de test ' +
                  '(`__tests__/fixtures.ts`), a titre de demonstration uniquement.\n',
    );
}
if (datasetError) {
    console.log(`> ATTENTION : le jeu de donnees reel ne compile pas (${datasetError}), fixture utilisee.\n`);
}
console.log(
    `${profileCount} profils aleatoires (graine ${seed}), ${core.length} questions core, ${base.parties.length} partis. ` +
        `Reponses : option uniforme, ${SKIP_RATE * 100} % de passes, ${IMPORTANT_RATE * 100} % marquees importantes. ` +
        `Profils sans groupe de tete affichable : ${pct(noTop).toFixed(1)} %.\n`,
);
console.log("- **Parti de tete change** : le premier parti du groupe de tete (score arrondi le plus haut, a egalite l'ordre alphabetique) n'est plus le meme une fois la question retiree. Colonne qui sert au signalement.");
console.log("- **Groupe de tete change** : l'ensemble des partis a egalite en tete (marge d'egalite) differe. Tres sensible, car les scores sont arrondis par 5.");
console.log('- **Groupe de tete remplace** : aucun parti du groupe de tete initial ne figure dans le nouveau groupe de tete.\n');
console.log('| Question | Theme | Parti de tete change | Groupe de tete change | Groupe de tete remplace | Fragile |');
console.log('| --- | --- | ---: | ---: | ---: | :---: |');
for (const row of rows) {
    const flag = row.leader > FLAG_THRESHOLD ? `**oui (> ${FLAG_THRESHOLD} %)**` : 'non';
    console.log(
        `| ${row.id} | ${row.theme} | ${row.leader.toFixed(1)} % | ${row.group.toFixed(1)} % | ${row.replaced.toFixed(1)} % | ${flag} |`,
    );
}
console.log(
    `\nMoyenne : parti de tete ${mean(rows.map(r => r.leader)).toFixed(1)} %, ` +
        `groupe de tete change ${mean(rows.map(r => r.group)).toFixed(1)} %, ` +
        `groupe de tete remplace ${mean(rows.map(r => r.replaced)).toFixed(1)} %.`,
);
const fragile = rows.filter(r => r.leader > FLAG_THRESHOLD);
console.log(
    fragile.length === 0
        ? `Aucune question au-dessus de ${FLAG_THRESHOLD} % (parti de tete).`
        : `Questions fragiles (> ${FLAG_THRESHOLD} %, parti de tete) : ${fragile.map(r => r.id).join(', ')}.`,
);
