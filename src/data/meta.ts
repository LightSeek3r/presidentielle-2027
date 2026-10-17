import type { PartyId } from './types.ts';

export const DATA_VERSION = '2026-10-v1.1';

// Gates the content-completeness tests: stays false while the question bank is being written.
export const CONTENT_READY = true;

// Planned publication date (ISO). Cited sources must not be dated after it.
export const PUBLISHED_AT = '2026-10-15';

export const LEGISLATURE = 17;

// Party order of the share code, per layout number. APPEND-ONLY: a layout that was ever shared
// must keep decoding forever, so never edit or remove an entry; add a new layout instead.
export const SHARE_LAYOUTS: Record<number, PartyId[]> = {
    1: ['lo', 'lfi', 'pcf', 'eco', 'ps', 'ren', 'modem', 'hor', 'lr', 'udr', 'rn', 'rec'],
};

export const CURRENT_SHARE_LAYOUT = 1;

// Identity of the "Impact pour moi" dataset, separate from DATA_VERSION so that changing a measure
// never purges quiz answers (and the other way round). Bump on any change of measures or criteria.
export const IMPACT_VERSION = '2026-10-i0';
