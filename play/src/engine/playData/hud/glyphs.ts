import { skin } from '../skin.js'
import { hudLayout } from './canvas.js'
import { hudRect } from './hudOver.js'
import {
    FONT_ASCENDER,
    FONT_DESCENDER,
    FONT_POINT,
    MS_TEXT_BASELINE_DY,
    MS_TEXT_PT,
    MS_TEXT_REGULAR_STYLE_SPACING,
    REGULAR_STYLE_SPACING,
    fillHudGlyphTables,
    fillHudMsTables,
} from './hudText.generated.js'

export const DigitSet = {
    Score44: 0,
    Dim44: 1,
    Life30: 2,
    Danger30: 3,
    Count26: 4,
    Pop24: 5,
    Level30: 6,
} as const
const SETS = 7

const SLOTS = 11
export const GLYPH_PLUS = 10

export const glyphs = levelData({
    baseId: Tuple(SETS, Number),
    exists: Tuple(SETS, Boolean),
    pt: Tuple(SETS, Number),
    L: Tuple(SETS * SLOTS, Number),
    B: Tuple(SETS * SLOTS, Number),
    R: Tuple(SETS * SLOTS, Number),
    T: Tuple(SETS * SLOTS, Number),
    adv: Tuple(SETS * SLOTS, Number),

    ctr: Tuple(SETS * SLOTS, Number),

    kern: Tuple(SLOTS * SLOTS, Number),

    pow10: Tuple(9, Number),
})

const setBase = (set: number, base: SkinSprite) => {
    glyphs.baseId.set(set, base.id)
    glyphs.exists.set(set, base.exists)
}

export const setupGlyphs = () => {
    const c = skin.sprites
    setBase(DigitSet.Score44, c.hudDigit440)
    setBase(DigitSet.Dim44, c.hudDigit44Dim0)
    setBase(DigitSet.Life30, c.hudDigit30Glow0)
    setBase(DigitSet.Danger30, c.hudDigit30Danger0)
    setBase(DigitSet.Count26, c.hudDigit260)
    setBase(DigitSet.Pop24, c.hudDigit240)
    setBase(DigitSet.Level30, c.hudDigit300)
    fillHudGlyphTables(glyphs)
    let p = 1
    for (let i = 0; i < 9; i++) {
        glyphs.pow10.set(i, p)
        p *= 10
    }
    setupMsGlyphs()
}

export const MsSet = { Fast: 0, Late: 1, None: 2 } as const
const MS_SETS = 3

const MS_SLOTS = 12
const MS_GLYPH_M = 10
const MS_GLYPH_S = 11
export const msGlyphs = levelMemory({
    baseId: Tuple(MS_SETS, Number),
    exists: Tuple(MS_SETS, Boolean),
    L: Tuple(MS_SLOTS, Number),
    B: Tuple(MS_SLOTS, Number),
    R: Tuple(MS_SLOTS, Number),
    T: Tuple(MS_SLOTS, Number),
    adv: Tuple(MS_SLOTS, Number),
})

const setupMsGlyphs = () => {
    const c = skin.sprites

    msGlyphs.baseId.set(MsSet.Fast, c.hudJudgeMsFast0.id)
    msGlyphs.exists.set(MsSet.Fast, c.hudJudgeMsFast0.exists && c.hudJudgeMsFastS.exists)
    msGlyphs.baseId.set(MsSet.Late, c.hudJudgeMsLate0.id)
    msGlyphs.exists.set(MsSet.Late, c.hudJudgeMsLate0.exists && c.hudJudgeMsLateS.exists)
    msGlyphs.baseId.set(MsSet.None, c.hudJudgeMsNone0.id)
    msGlyphs.exists.set(MsSet.None, c.hudJudgeMsNone0.exists && c.hudJudgeMsNoneS.exists)
    fillHudMsTables(msGlyphs)
}

export const msGlyphsExist = (set: number) => msGlyphs.exists.get(set)

const msAdvance = (g: number) => msGlyphs.adv.get(g) + MS_TEXT_REGULAR_STYLE_SPACING * MS_TEXT_PT * 0.01

const drawMsGlyph = (set: number, g: number, px: number, cx: number, cy: number, s: number, z: number, ov: boolean) => {
    const k = hudLayout.u * s
    const l = cx + (px + msGlyphs.L.get(g)) * k
    const r = cx + (px + msGlyphs.R.get(g)) * k

    const b = cy + (msGlyphs.B.get(g) - MS_TEXT_BASELINE_DY) * k
    const t = cy + (msGlyphs.T.get(g) - MS_TEXT_BASELINE_DY) * k
    hudRect(msGlyphs.baseId.get(set) + g, l, b, r, t, z, 1, ov)
}

const MS_MAX_DIGITS = 3

export const drawMsText = (set: number, ms: number, cx: number, cy: number, s: number, z: number, ov: boolean) => {
    if (!msGlyphs.exists.get(set)) return
    const v = Math.mod(Math.floor(Math.abs(ms)), 1000)
    const digits = v < 10 ? 1 : v < 100 ? 2 : 3

    const total = digits * msAdvance(0) + msAdvance(MS_GLYPH_M) + msGlyphs.adv.get(MS_GLYPH_S)
    let pen = -total / 2
    let div = digits === 3 ? 100 : digits === 2 ? 10 : 1
    for (let i = 0; i < MS_MAX_DIGITS; i++) {
        if (i < digits) {
            const d = Math.mod(Math.floor(v / div), 10)
            drawMsGlyph(set, d, pen, cx, cy, s, z, ov)
            pen += msAdvance(d)
            div = Math.floor(div / 10)
            if (div < 1) div = 1
        }
    }
    drawMsGlyph(set, MS_GLYPH_M, pen, cx, cy, s, z, ov)
    pen += msAdvance(MS_GLYPH_M)
    drawMsGlyph(set, MS_GLYPH_S, pen, cx, cy, s, z, ov)
}

export const digitCount = (v: number) =>
    v < 10 ? 1 : v < 100 ? 2 : v < 1000 ? 3 : v < 10000 ? 4 : v < 100000 ? 5 : v < 1000000 ? 6 : v < 10000000 ? 7 : v < 100000000 ? 8 : 9

export const baselineMiddle = (cy: number, pt: number) => cy + ((FONT_ASCENDER + FONT_DESCENDER) / 2) * (pt / FONT_POINT)

export const baselineBottom = (bottom: number, pt: number) => bottom + FONT_DESCENDER * (pt / FONT_POINT)

export const advanceOf = (set: number, g: number, next: number, spacing: number) => {
    const pt = glyphs.pt.get(set)

    const kern = next >= 0 ? glyphs.kern.get(g * SLOTS + Math.max(next, 0)) * (pt / FONT_POINT) : 0
    return glyphs.adv.get(set * SLOTS + g) + (spacing + REGULAR_STYLE_SPACING) * pt * 0.01 + kern
}

export const glyphAdvance = (set: number, g: number) => glyphs.adv.get(set * SLOTS + g)

export const numberWidth = (set: number, value: number, minDigits: number, spacing: number) => {
    const v = Math.floor(Math.max(value, 0))
    const total = Math.max(digitCount(v), minDigits)
    let w = 0
    let div = glyphs.pow10.get(total - 1)
    let prev = 0
    for (let i = 0; i < total; i++) {
        const d = Math.mod(Math.floor(v / div), 10)

        w += i > 0 ? advanceOf(set, prev, d, spacing) : 0
        prev = d
        div = Math.floor(div / 10)
        if (div < 1) div = 1
    }

    return w + glyphs.adv.get(set * SLOTS + prev)
}

export const drawGlyph = (set: number, g: number, sx: number, sBase: number, z: number, alpha: number, ov: boolean) => {
    if (!glyphs.exists.get(set)) return
    const u = hudLayout.u
    const i = set * SLOTS + g
    const l = sx + glyphs.L.get(i) * u
    const r = sx + glyphs.R.get(i) * u
    const b = sBase + glyphs.B.get(i) * u
    const t = sBase + glyphs.T.get(i) * u

    hudRect(glyphs.baseId.get(set) + g, l, b, r, t, z, alpha, ov)
}

export const drawNumberMono = (
    set: number,
    padSet: number,
    value: number,
    minDigits: number,
    sRight: number,
    sBase: number,
    mono: number,
    z: number,
    alpha: number,
    padAlpha: number,
    ov: boolean,
) => {
    const v = Math.floor(Math.max(value, 0))
    const digits = digitCount(v)
    const total = Math.max(digits, minDigits)
    const u = hudLayout.u
    const pitch = mono + REGULAR_STYLE_SPACING * glyphs.pt.get(set) * 0.01
    let div = glyphs.pow10.get(total - 1)
    for (let i = 0; i < total; i++) {
        const d = Math.mod(Math.floor(v / div), 10)
        const isPad = i < total - digits
        const gs = isPad ? padSet : set
        const cell = sRight - (mono + (total - 1 - i) * pitch) * u
        drawGlyph(gs, d, cell + (mono / 2 - glyphs.ctr.get(gs * SLOTS + d)) * u, sBase, z, isPad ? padAlpha : alpha, ov)
        div = Math.floor(div / 10)
        if (div < 1) div = 1
    }
}

export const drawNumber = (
    set: number,
    padSet: number,
    value: number,
    minDigits: number,
    sx: number,
    sBase: number,
    spacing: number,
    z: number,
    alpha: number,
    padAlpha: number,
    ov: boolean,
) => {
    const v = Math.floor(Math.max(value, 0))
    const digits = digitCount(v)
    const total = Math.max(digits, minDigits)
    let x = sx
    let div = glyphs.pow10.get(total - 1)
    for (let i = 0; i < total; i++) {
        const d = Math.mod(Math.floor(v / div), 10)
        const isPad = i < total - digits
        drawGlyph(isPad ? padSet : set, d, x, sBase, z, isPad ? padAlpha : alpha, ov)
        div = Math.floor(div / 10)
        if (div < 1) div = 1
        const next = i + 1 < total ? Math.mod(Math.floor(v / div), 10) : -1
        x += advanceOf(set, d, next, spacing) * hudLayout.u
    }
    return x
}
