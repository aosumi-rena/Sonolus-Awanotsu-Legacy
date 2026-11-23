export const flatSeg = (t: number, t0: number, v0: number, t1: number, v1: number) => {
    if (t <= t0) return v0
    if (t >= t1) return v1
    const s = (t - t0) / (t1 - t0)
    return v0 + (v1 - v0) * (3 * s * s - 2 * s * s * s)
}

export const outQuad = (x: number) => {
    const c = Math.clamp(x, 0, 1)
    return 1 - (1 - c) * (1 - c)
}

export const outBack = (x: number) => {
    const c = Math.clamp(x, 0, 1) - 1
    const s = 1.70158
    return 1 + (s + 1) * c * c * c + s * c * c
}

export const punchScale = (t: number) => {
    if (t <= 0) return 1
    if (t < 0.05) return 1 + 0.2 * outBack(t / 0.05)
    if (t < 0.15) return 1.2 - 0.2 * outBack((t - 0.05) / 0.1)
    return 1
}

export const roundHalfEven = (x: number) => {
    const f = Math.floor(x)
    const d = x - f
    if (d < 0.5) return f
    if (d > 0.5) return f + 1
    return Math.mod(f, 2) === 0 ? f : f + 1
}
