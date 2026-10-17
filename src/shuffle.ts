// Deterministic shuffle of the answer options, so the order does not favour the first option but
// stays the same for a whole session (reload, back and forward) once the seed is stored.

// Small seeded PRNG (mulberry32): returns numbers in [0, 1).
export const mulberry32 = (seed: number): (() => number) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// FNV-1a, so each question gets its own stream from the same session seed.
const hashString = (text: string): number => {
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
};

export const shuffleWithSeed = <T,>(items: readonly T[], seed: number, salt: string): T[] => {
    const random = mulberry32((seed ^ hashString(salt)) >>> 0);
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

export const newSeed = (): number => Math.floor(Math.random() * 4294967296) >>> 0;
