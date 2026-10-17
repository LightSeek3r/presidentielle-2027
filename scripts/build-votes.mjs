#!/usr/bin/env node
// Builds src/data/votes.generated.json from the Assemblée nationale
// open-data dump (Scrutins.json.zip, one JSON file per scrutin).
//
//   node scripts/build-votes.mjs --dir <extracted folder> [--legislature 17]
//        [--out src/data/votes.generated.json] [--list-groups] [--no-write] [--scrutins <file>]
//        [--rename <organeRef>=<key> ...]
//
// Only the scrutins listed in data/scrutins.json (or in --scrutins <file>, a JSON array) are read. The output keeps the counts of every
// group, keyed by organeRef (data/votes.ts looks groups up by organeRef first, then by abbreviation).
// --list-groups prints the organeRefs found and a guess of their abbreviation. The guess is only
// printed, never written: fill `organeRef` in data/parties.ts by hand after checking it.

import { readFileSync, readdirSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'src', 'data');

// Groups of the 17th legislature, from the largest to the smallest at the start of the
// legislature. Used only to guess abbreviations from the group sizes.
const KNOWN_GROUPS = [
    ['RN', 123],
    ['EPR', 95],
    ['LFI-NFP', 71],
    ['SOC', 66],
    ['DR', 49],
    ['EcoS', 38],
    ['Dem', 36],
    ['HOR', 34],
    ['LIOT', 22],
    ['GDR', 17],
    ['UDR', 16],
    ['NI', 12],
];

const fail = message => {
    console.error(`\nERREUR build-votes: ${message}\n`);
    process.exit(1);
};

const { values: args } = parseArgs({
    options: {
        dir: { type: 'string' },
        legislature: { type: 'string', default: '17' },
        out: { type: 'string', default: join(DATA_DIR, 'votes.generated.json') },
        'list-groups': { type: 'boolean', default: false },
        'no-write': { type: 'boolean', default: false },
        scrutins: { type: 'string', default: join(DATA_DIR, 'scrutins.json') },
        rename: { type: 'string', multiple: true, default: [] },
        help: { type: 'boolean', default: false },
    },
});

if (args.help || !args.dir) {
    console.log(
        'Usage: node scripts/build-votes.mjs --dir <extracted Scrutins.json.zip folder>\n' +
            '       [--legislature 17] [--out <file>] [--list-groups] [--no-write] [--scrutins <file>]\n' +
            '       [--rename <organeRef>=<key> ...]   (explicit: key the group <key>, e.g. when a group changed organeRef)',
    );
    process.exit(args.help ? 0 : 1);
}

const legislature = Number(args.legislature);
if (!Number.isInteger(legislature) || legislature <= 0) fail(`--legislature invalide: "${args.legislature}"`);

const dir = resolve(args.dir);
try {
    if (!statSync(dir).isDirectory()) throw new Error('not a directory');
} catch {
    fail(`le dossier --dir est introuvable ou n'est pas un dossier: ${dir}`);
}

// Scrutin numbers wanted
let wanted;
try {
    wanted = JSON.parse(readFileSync(resolve(args.scrutins), 'utf8'));
} catch (error) {
    fail(`fichier des scrutins illisible: ${error.message}`);
}
if (!Array.isArray(wanted) || !wanted.every(n => Number.isInteger(n) && n > 0)) {
    fail('La liste des scrutins doit etre un tableau de numeros de scrutin (entiers positifs).');
}
wanted = [...new Set(wanted)].sort((a, b) => a - b);
if (wanted.length === 0) console.warn('Attention: scrutins.json est vide, rien a extraire.');

// Discover the layout: file names are VTANR5L<leg>V<n>.json, possibly nested in sub-folders.
const files = new Map();
const walk = folder => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
        const full = join(folder, entry.name);
        if (entry.isDirectory()) walk(full);
        else {
            const match = entry.name.match(new RegExp(`^VTANR\\d+L${legislature}V(\\d+)\\.json$`, 'i'));
            if (match) files.set(Number(match[1]), full);
        }
    }
};
walk(dir);
if (files.size === 0) {
    fail(
        `aucun fichier VTANR5L${legislature}V<n>.json trouve sous ${dir}. ` +
            "Verifiez que le zip est extrait et que --dir pointe dessus (ou sur son sous-dossier json/).",
    );
}
const missing = wanted.filter(n => !files.has(n));
if (missing.length > 0) {
    fail(
        `${missing.length} scrutin(s) de scrutins.json absent(s) du dossier (${files.size} fichiers trouves): ` +
            `${missing.join(', ')}. Mauvais numero, ou dump trop ancien ?`,
    );
}

// Explicit renames: --rename PO847173=UDR --rename PO872880=UDR keys both refs of a group that
// changed organeRef during the legislature under the same name (e.g. its abbreviation).
const renames = new Map();
for (const item of args.rename) {
    const [ref, key, ...rest] = item.split('=');
    if (!ref || !key || rest.length > 0) fail(`--rename invalide: "${item}" (forme attendue: organeRef=cle).`);
    renames.set(ref, key);
}

// Numbers may be strings in the dump
const toCount = (value, where) => {
    const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
        fail(`schema inattendu: ${where} = ${JSON.stringify(value)} (entier positif attendu).`);
    }
    return n;
};
const toText = (value, where) => {
    if (typeof value !== 'string' || value.trim() === '') fail(`schema inattendu: ${where} absent ou vide.`);
    return value.trim();
};

const warnings = [];
const scrutins = {};
// organeRef -> { scrutins: n, numbers: number[], sizes: number[], majorities: Record<string, number> }
const groupStats = new Map();

for (const n of wanted) {
    const file = files.get(n);
    const where = `${file}`;
    let root;
    try {
        root = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
        fail(`JSON invalide dans ${where}: ${error.message}`);
    }
    const s = root?.scrutin;
    if (!s || typeof s !== 'object') fail(`schema inattendu dans ${where}: pas de racine "scrutin".`);
    if (toCount(s.numero, `${where} scrutin.numero`) !== n) {
        fail(`${where}: scrutin.numero (${s.numero}) different du numero attendu (${n}).`);
    }
    if (s.legislature !== undefined && Number(s.legislature) !== legislature) {
        fail(`${where}: legislature ${s.legislature} au lieu de ${legislature}.`);
    }
    const date = toText(s.dateScrutin, `${where} scrutin.dateScrutin`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`${where}: dateScrutin "${date}" n'est pas au format yyyy-mm-dd.`);
    const titre = toText(
        typeof s.titre === 'string' && s.titre.trim() !== '' ? s.titre : s.objet?.libelle,
        `${where} scrutin.titre / scrutin.objet.libelle`,
    );
    const sort = toText(s.sort?.code, `${where} scrutin.sort.code`);

    const groupesNode = s.ventilationVotes?.organe?.groupes?.groupe;
    if (groupesNode === undefined) fail(`${where}: ventilationVotes.organe.groupes.groupe absent.`);
    // XML-derived JSON may give a single object instead of an array
    const groupList = Array.isArray(groupesNode) ? groupesNode : [groupesNode];
    if (groupList.length === 0) fail(`${where}: aucun groupe dans ventilationVotes.`);

    const groupes = {};
    for (const g of groupList) {
        const rawRef = toText(g?.organeRef, `${where} groupe.organeRef`);
        const ref = renames.get(rawRef) ?? rawRef;
        if (groupes[ref]) fail(
                `${where}: le groupe ${ref} apparait deux fois (organeRef ${rawRef}). Soit le dump AN est defectueux pour ce scrutin ` +
                    "(des organeRef valent \"PO0\" dans quelques scrutins de 2024-2026: choisissez un autre scrutin), soit deux --rename " +
                    "visent la meme cle dans un meme scrutin.",
            );
        const members = toCount(g.nombreMembresGroupe, `${where} groupe ${ref} nombreMembresGroupe`);
        const vote = g.vote;
        if (!vote || typeof vote !== 'object') fail(`${where}: groupe ${ref} sans "vote".`);
        const d = vote.decompteVoix;
        if (!d || typeof d !== 'object') fail(`${where}: groupe ${ref} sans vote.decompteVoix.`);
        const counts = {
            pour: toCount(d.pour, `${where} groupe ${ref} decompteVoix.pour`),
            contre: toCount(d.contre, `${where} groupe ${ref} decompteVoix.contre`),
            abstentions: toCount(d.abstentions, `${where} groupe ${ref} decompteVoix.abstentions`),
            nonVotants: toCount(d.nonVotants, `${where} groupe ${ref} decompteVoix.nonVotants`),
        };
        const total = counts.pour + counts.contre + counts.abstentions + counts.nonVotants;
        if (total > members) {
            warnings.push(`scrutin ${n}, ${ref}: ${total} voix comptees pour ${members} membres.`);
        }
        const majority = typeof vote.positionMajoritaire === 'string' ? vote.positionMajoritaire : '?';
        groupes[ref] = counts;

        const stat = groupStats.get(ref) ?? { scrutins: 0, numbers: [], sizes: [], majorities: {} };
        stat.scrutins += 1;
        stat.numbers.push(n);
        stat.sizes.push(members);
        stat.majorities[majority] = (stat.majorities[majority] ?? 0) + 1;
        groupStats.set(ref, stat);
    }

    scrutins[String(n)] = {
        date,
        titre,
        sort,
        url: `https://www.assemblee-nationale.fr/dyn/${legislature}/scrutins/${n}`,
        groupes: Object.fromEntries(Object.entries(groupes).sort(([a], [b]) => a.localeCompare(b))),
    };
}

const output = {
    extractedAt: new Date().toISOString(),
    source: `data.assemblee-nationale.fr, Scrutins.json.zip (${legislature}${legislature === 1 ? 're' : 'e'} législature)`,
    legislature,
    scrutins,
};

// Same key order for every scrutin: date, titre, sort, url, groupes (and pour, contre, ...)
if (!args['no-write']) {
    const out = resolve(args.out);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
    console.log(`${wanted.length} scrutin(s) ecrit(s) dans ${out}`);
} else {
    console.log(`${wanted.length} scrutin(s) lus (--no-write: rien d'ecrit).`);
}
for (const warning of warnings.slice(0, 20)) console.warn(`Attention: ${warning}`);
if (warnings.length > 20) console.warn(`Attention: ... et ${warnings.length - 20} autres avertissements.`);

if (args['list-groups']) {
    const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    let rows = [...groupStats.entries()].map(([ref, stat]) => ({
        refs: [ref],
        numbers: new Set(stat.numbers),
        sizes: [...stat.sizes],
        majorities: { ...stat.majorities },
        scrutins: stat.scrutins,
    }));

    // A group can be registered again under a new organeRef during the legislature. Refs that never
    // appear in the same scrutin and have similar sizes are shown as one candidate group.
    const sizeOf = row => median(row.sizes);
    for (let merged = true; merged; ) {
        merged = false;
        outer: for (let a = 0; a < rows.length; a++) {
            for (let b = a + 1; b < rows.length; b++) {
                const disjoint = ![...rows[a].numbers].some(x => rows[b].numbers.has(x));
                if (disjoint && Math.abs(sizeOf(rows[a]) - sizeOf(rows[b])) <= 3) {
                    const [x, y] = [rows[a], rows[b]];
                    for (const k of Object.keys(y.majorities)) x.majorities[k] = (x.majorities[k] ?? 0) + y.majorities[k];
                    x.refs.push(...y.refs);
                    y.numbers.forEach(v => x.numbers.add(v));
                    x.sizes.push(...y.sizes);
                    x.scrutins += y.scrutins;
                    rows.splice(b, 1);
                    merged = true;
                    break outer;
                }
            }
        }
    }
    rows = rows.map(row => ({ ...row, size: sizeOf(row) })).sort((a, b) => b.size - a.size || a.refs[0].localeCompare(b.refs[0]));

    // Guess: rank of the group size against the known sizes. Printed only.
    const guess = [];
    if (rows.length === KNOWN_GROUPS.length) rows.forEach((row, index) => guess.push(KNOWN_GROUPS[index][0]));
    const close = index =>
        (index > 0 && rows[index - 1].size - rows[index].size <= 3) ||
        (index < rows.length - 1 && rows[index].size - rows[index + 1].size <= 3);

    console.log(`
Groupes trouves dans ${wanted.length} scrutin(s): ${rows.length}`);
    console.log('organeRef(s) | membres (mediane) | presence | positions majoritaires | abreviation supposee');
    rows.forEach((row, index) => {
        const majorities = Object.entries(row.majorities)
            .map(([k, v]) => `${k}:${v}`)
            .join(' ');
        const abbrev = guess.length
            ? `${guess[index]}${close(index) ? " (effectif proche d'un autre groupe: incertain)" : ''}`
            : '?';
        const presence = `${row.numbers.size}/${wanted.length}`;
        const refs = row.refs.join(' + ') + (row.refs.length > 1 ? ' (meme groupe ? a confirmer, voir --rename)' : '');
        console.log(`${refs} | ${row.size} | ${presence} | ${majorities} | ${abbrev}`);
    });
    if (!guess.length) {
        console.log(
            `
Pas de supposition: ${rows.length} groupes trouves, ${KNOWN_GROUPS.length} attendus ` +
                `(${KNOWN_GROUPS.map(([a]) => a).join(', ')}).`,
        );
    } else {
        console.log(
            "\nSupposition d'apres les effectifs seulement (jamais ecrite dans le fichier). Les fichiers de " +
                "scrutin ne contiennent pas le libelle des groupes: verifiez chaque organeRef sur la page d'un " +
                "scrutin (assemblee-nationale.fr/dyn/17/scrutins/<n>) ou dans le fichier des organes (AMO) avant " +
                "de renseigner `organeRef` dans data/parties.ts. Un groupe qui change d'organeRef en cours de " +
                "legislature se traite avec --rename <organeRef>=<abreviation> (une fois par organeRef), puis " +
                "`group.abbrev` de parties.ts fait le lien.",
        );
    }
}
