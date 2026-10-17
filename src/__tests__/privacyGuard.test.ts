import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// The quiz handles political opinions: its engine and data must not be able to talk to the network
// or keep anything in the browser. Every source file may import only other files of this package
// (relative paths), and none may use a network or storage primitive.

const here = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(here, '..');

const FORBIDDEN_TOKENS = ['fetch(', 'sendBeacon', 'XMLHttpRequest', 'axios', 'localStorage', 'sessionStorage', 'WebSocket', 'document.cookie'];

const SOURCE_FILE = /\.tsx?$/;
const IMPORT_SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g;

const walkDir = (dir: string, skip: (path: string) => boolean): string[] =>
    readdirSync(dir).flatMap(name => {
        const path = join(dir, name);
        if (skip(path)) return [];
        return statSync(path).isDirectory() ? walkDir(path, skip) : [path];
    });

const sourceFiles = (): string[] =>
    walkDir(SRC_DIR, path => relative(SRC_DIR, path).split(sep)[0] === '__tests__').filter(f => SOURCE_FILE.test(f));

const rel = (file: string): string => relative(SRC_DIR, file).split(sep).join('/');

describe('privacy guard', () => {
    it('has the sources to inspect', () => {
        const files = sourceFiles().map(rel);
        expect(files).toContain('scoring.ts');
        expect(files).toContain('data/index.ts');
        expect(files.some(f => f.includes('__tests__'))).toBe(false);
    });

    it('no source file imports anything outside this package', () => {
        const offenders: string[] = [];
        for (const file of sourceFiles()) {
            const source = readFileSync(file, 'utf8');
            for (const match of source.matchAll(IMPORT_SPECIFIER)) {
                if (!match[1].startsWith('.')) offenders.push(`${rel(file)}: ${match[1]}`);
            }
        }
        expect(offenders).toEqual([]);
    });

    it('no source file uses a network or storage primitive', () => {
        const offenders: string[] = [];
        for (const file of sourceFiles()) {
            const source = readFileSync(file, 'utf8');
            for (const token of FORBIDDEN_TOKENS) {
                if (source.includes(token)) offenders.push(`${rel(file)}: ${token}`);
            }
        }
        expect(offenders).toEqual([]);
    });
});
