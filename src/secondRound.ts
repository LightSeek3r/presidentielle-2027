import type { Blackout, FinalistsConfig } from './data/types.ts';

// Pure geometry and timing rules of the second-round block.

export type Vertex = [number, number];

export interface Barycentre {
    x: number;
    y: number;
    // Every score was 0: the point is the centroid, not a measured position
    allZero: boolean;
}

// Point of the polygon pulled toward each vertex in proportion to its score.
// null when a score is missing (the position would not mean anything).
export const barycentre = (scores: (number | null)[], vertices: Vertex[]): Barycentre | null => {
    if (scores.length === 0 || scores.length !== vertices.length) return null;
    if (scores.some(s => s === null)) return null;
    const values = scores as number[];
    const total = values.reduce((sum, s) => sum + s, 0);
    const allZero = !(total > 0);
    const weights = values.map(s => (allZero ? 1 / values.length : s / total));
    return {
        x: weights.reduce((sum, w, i) => sum + w * vertices[i][0], 0),
        y: weights.reduce((sum, w, i) => sum + w * vertices[i][1], 0),
        allZero,
    };
};

// Finalists in alphabetical order of their label (never the poll order, which would put the
// first of the polls at the top of the triangle and of the list). Everything the block shows,
// vertices included, follows this order.
export const orderFinalists = <T extends { label: string }>(items: T[]): T[] =>
    [...items].sort((a, b) => a.label.localeCompare(b.label, 'fr'));

// Two finalists: position t on the segment, 0 = first party, 1 = second party.
export const segmentPosition = (scores: [number | null, number | null]): { t: number; allZero: boolean } | null => {
    const point = barycentre(scores, [[0, 0], [1, 0]]);
    return point && { t: point.x, allZero: point.allZero };
};

// True when no finalist reaches the threshold (scores on the same scale as the threshold).
// Missing scores are ignored; with no score at all there is nothing to say, so false.
export const bestBelowThreshold = (scores: (number | null)[], threshold: number): boolean => {
    const present = scores.filter((s): s is number => s !== null);
    return present.length > 0 && Math.max(...present) < threshold;
};

// Electoral silence: from start (inclusive) until end (exclusive).
export const isBlackout = (now: Date, blackouts: Blackout[]): boolean => {
    const t = now.getTime();
    return blackouts.some(b => t >= Date.parse(b.start) && t < Date.parse(b.end));
};

// The block is hidden during silence, and, when it is built on polls, from the first silence
// onwards: once the first round is held the finalists are no longer a poll matter.
export const isSecondRoundHidden = (
    now: Date,
    finalists: Pick<FinalistsConfig, 'mode'>,
    blackouts: Blackout[],
): boolean => {
    if (isBlackout(now, blackouts)) return true;
    if (finalists.mode !== 'sondages' || blackouts.length === 0) return false;
    const firstStart = Math.min(...blackouts.map(b => Date.parse(b.start)));
    return now.getTime() >= firstStart;
};
