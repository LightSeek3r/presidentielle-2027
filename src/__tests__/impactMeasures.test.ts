import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';

import type { Measure } from '../data/impactTypes.ts';
import { validateImpact } from '../data/validateImpact.ts';

// One file per measure under data/impact/, each exporting `measure`. Every file is validated on its
// own so a contributor sees only the errors of the file they edit: `npx vitest run impactMeasures`.
const dir = new URL('../data/impact/', import.meta.url);
const files: Record<string, { measure: Measure }> = Object.fromEntries(await Promise.all(
    readdirSync(dir).filter(name => name.endsWith('.ts')).sort()
        .map(async name => [`../data/impact/${name}`, await import(new URL(name, dir).href)] as const),
));

describe('measure files', () => {
    const entries = Object.entries(files);

    it.skipIf(entries.length === 0)('exports a measure whose id is its file name', () => {
        for (const [path, module] of entries) {
            const name = path.split('/').pop()!.replace(/\.ts$/, '');
            expect(module.measure?.id, path).toBe(name);
        }
    });

    for (const [path, module] of entries) {
        const name = path.split('/').pop()!.replace(/\.ts$/, '');
        it(`${name} is valid`, () => {
            expect(validateImpact([module.measure])).toEqual([]);
        });
    }
});
