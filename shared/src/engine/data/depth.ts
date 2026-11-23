// Older clients sort sprites on a single coordinate. Keep the primary layer and use its fraction for ties.
export const legacyDepth = (layer: number, distance: number) =>
    layer + 0.12 * distance / (1 + Math.abs(distance))

export const legacyPartDepth = (layer: number, distance: number, part: number) =>
    legacyDepth(layer, distance) + Math.clamp(part, 0, 127) * 0.000001
