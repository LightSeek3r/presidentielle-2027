// Checks the real data against the editorial rules the engine relies on, and prints a short report.
//
//   npm run validate        (node scripts/validate.ts, Node 24 runs the TypeScript directly)
//
// Errors (exit code 1): the rules of src/data/validate.ts and src/data/validateImpact.ts on the real
// question bank and on every impact measure file, the publication rule on the published measures,
// every measure file listed as published, and every scrutin of scrutins.json present in
// votes.generated.json.
// Warnings: questions on which every party has the same position (they cannot tell parties apart).
// The rest is information: counts that a reviewer of a change wants to see move (or not).

import { readdirSync } from 'node:fs';

import { DATASET } from '../src/data/index.ts';
import { CONTENT_READY, DATA_VERSION, IMPACT_VERSION, PUBLISHED_AT } from '../src/data/meta.ts';
import { IMPACT_MEASURES } from '../src/data/impact.ts';
import type { Measure } from '../src/data/impactTypes.ts';
import type { Position } from '../src/data/types.ts';
import {
    MIN_CORE_WITH_VOTES, contentCompletenessErrors, contentCompletenessWarnings, explanationErrors, validateDataset,
} from '../src/data/validate.ts';
import { criteriaErrors, publicationErrors, publicationStatus, validateImpact } from '../src/data/validateImpact.ts';

const errors: string[] = [];
const warnings: string[] = [];
const section = (title: string) => console.log(`\n## ${title}\n`);

// ── Question bank ────────────────────────────────────────────────────────────────────────
errors.push(...validateDataset(DATASET));
errors.push(...explanationErrors(DATASET));
if (CONTENT_READY) errors.push(...contentCompletenessErrors(DATASET));
warnings.push(...contentCompletenessWarnings(DATASET));
for (const n of DATASET.scrutins) {
    if (!DATASET.votes.scrutins[String(n)]) errors.push(`scrutin ${n} is listed in scrutins.json but missing from votes.generated.json`);
}

// ── Impact measures: every file, each one published ──────────────────────────────────────
const impactDir = new URL('../src/data/impact/', import.meta.url);
const measureFiles = readdirSync(impactDir).filter(name => name.endsWith('.ts')).sort();
const allMeasures: Measure[] = [];
for (const name of measureFiles) {
    const module = (await import(new URL(name, impactDir).href)) as { measure?: Measure };
    if (!module.measure) {
        errors.push(`data/impact/${name}: exports no measure`);
        continue;
    }
    if (module.measure.id !== name.replace(/\.ts$/, '')) errors.push(`data/impact/${name}: measure id "${module.measure.id}" differs from the file name`);
    allMeasures.push(module.measure);
}
errors.push(...criteriaErrors());
errors.push(...validateImpact(allMeasures));
errors.push(...publicationErrors(IMPACT_MEASURES));
const published = new Set(IMPACT_MEASURES.map(m => m.id));
for (const measure of allMeasures) {
    if (!published.has(measure.id)) errors.push(`data/impact/${measure.id}.ts: not listed in IMPACT_MEASURES (only published measures belong in this repository)`);
}

// ── Report ───────────────────────────────────────────────────────────────────────────────
const isWeak = (p: Position | undefined): boolean => !!p && p.backs !== null && /^faible/i.test(p.note ?? '');
const documented = (p: Position | undefined): boolean => !!p && p.backs !== null && p.backs.length > 0;

console.log(`# presidentielle-2027 data check`);
console.log(`\nData version ${DATA_VERSION}, impact version ${IMPACT_VERSION}, sources dated up to ${PUBLISHED_AT}.`);

section('Question bank');
const core = DATASET.questions.filter(q => q.tier === 'core');
const affiner = DATASET.questions.filter(q => q.tier === 'affiner');
const coreWithVotes = core.filter(q => q.votes && q.votes.scrutins.length > 0).length;
const allWithVotes = DATASET.questions.filter(q => q.votes && q.votes.scrutins.length > 0).length;
console.log(`- ${DATASET.questions.length} questions: ${core.length} core, ${affiner.length} "affiner"`);
console.log(`- ${coreWithVotes} core questions with an Assemblée nationale vote (minimum ${MIN_CORE_WITH_VOTES}), ${allWithVotes} in all, over ${DATASET.scrutins.length} scrutins`);
console.log(`- ${DATASET.parties.length} parties, ${DATASET.parties.filter(p => p.group).length} with a group of deputies`);
const urls = new Set<string>();
for (const q of DATASET.questions) {
    q.context?.sources.forEach(s => urls.add(s.url));
    q.options.forEach(o => o.cases?.sources.forEach(s => urls.add(s.url)));
    for (const p of Object.values(q.programme)) if (p.backs !== null) p.sources.forEach(s => urls.add(s.url));
}
console.log(`- ${urls.size} distinct source URLs, all https and dated (checked above)`);

section('Documented positions per party ("dit")');
console.log('| Party | Core questions with a position | All questions with a position | of which "faible" |');
console.log('| --- | ---: | ---: | ---: |');
for (const party of DATASET.parties) {
    const coreCount = core.filter(q => documented(q.programme[party.id])).length;
    const allCount = DATASET.questions.filter(q => documented(q.programme[party.id])).length;
    const weak = DATASET.questions.filter(q => isWeak(q.programme[party.id])).length;
    console.log(`| ${party.label} | ${coreCount} / ${core.length} | ${allCount} / ${DATASET.questions.length} | ${weak} |`);
}

section('Impact measures');
console.log(`- ${measureFiles.length} measure files, ${IMPACT_MEASURES.length} published`);
for (const measure of IMPACT_MEASURES) {
    const status = publicationStatus(measure);
    console.log(`  - ${measure.id}: ${status.backedOptions} options backed by a solid position, blocs ${status.blocs.join(', ')}`);
}

section('Result');
for (const warning of warnings) console.log(`- warning: ${warning}`);
for (const error of errors) console.log(`- ERROR: ${error}`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s).`);
process.exitCode = errors.length > 0 ? 1 : 0;
