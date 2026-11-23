export const SLIDE_INSET_LANES = 0.6
export const GUIDE_INSET_LANES = 0
export const SLIDE_GLOW_RANGE_SCALE = 2.5
export const SLIDE_NORMAL_MAX_ALPHA = 0.7843
export const GUIDE_COLOR_ALPHA = 0.4706
export const LINE_FADE_IN_PROGRESS_RANGE = 0.01
export const GUIDE_END_FADE_MS = 100

export const LineState = { Disabled: 0, Normal: 1, Pressed: 2 } as const

export const slideVertexAlpha = (option106: number) =>
    option106 <= 60
        ? (option106 / 60) * SLIDE_NORMAL_MAX_ALPHA
        : SLIDE_NORMAL_MAX_ALPHA + (1 - SLIDE_NORMAL_MAX_ALPHA) * ((option106 - 60) / 40)

export const guideVertexAlpha = (option107: number) =>
    option107 <= 60 ? (option107 / 60) * GUIDE_COLOR_ALPHA : GUIDE_COLOR_ALPHA + (1 - GUIDE_COLOR_ALPHA) * ((option107 - 60) / 40)

export const lineRowFade = (p: number) => (p > 1 ? 1 - Math.min(Math.max((p - 1) / LINE_FADE_IN_PROGRESS_RANGE, 0), 1) : 1)

export const guideEndFade = (remainingMs: number) => {
    if (remainingMs >= GUIDE_END_FADE_MS) return 1
    const x = 1 - Math.max(remainingMs, 0) / GUIDE_END_FADE_MS
    const x2 = x * x
    const x3 = x2 * x
    const h00 = 2 * x3 - 3 * x2 + 1
    const h10 = x3 - 2 * x2 + x
    const h11 = x3 - x2
    return h00 * 1 + h10 * -0.950166 + h11 * -0.883117
}
