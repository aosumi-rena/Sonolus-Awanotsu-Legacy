import { lineEase } from '../../../../shared/src/engine/data/ease.js'
import { LANE_TOP_Y, LANE_UNIT, viewProgress } from '../../../../shared/src/engine/data/geometry.js'
import {
    GUIDE_INSET_LANES,
    LINE_FADE_IN_PROGRESS_RANGE,
    SLIDE_GLOW_RANGE_SCALE,
    SLIDE_INSET_LANES,
    guideEndFade,
    lineRowFade,
} from '../../../../shared/src/engine/data/slideLine.js'
import { laneEdgeMaxX, laneEdgeMinX, layout, noteX, noteY } from './layout.js'
import { camZ } from './noteRender.js'
import { SLIDE_BAND_LOD_W0, SLIDE_BAND_LOD_W1, SLIDE_R_SAMPLES } from './noteSprites.generated.js'
import { layer, noteStyle, skin } from './skin.js'

const MAX_SPLIT = 70
const FADE_SUB = 4

const FADE_ZERO = 0.001

export const UnitBounds = {
    valid: Boolean,
    minX: Number,
    maxX: Number,
    minY: Number,
    maxY: Number,
}

export const lineMeshBoundsCentre = (minX: number, maxX: number, minY: number, maxY: number) =>
    new Vec((Math.min(minX, 0) + Math.max(maxX, 0)) / 2, (Math.min(minY, 0) + Math.max(maxY, 0)) / 2)

export const publishUnitBounds = (
    ub: ContainerType<typeof UnitBounds>,
    ls: { bT: number; bMinX: number; bMaxX: number; bMinY: number; bMaxY: number },
) => {
    if (ls.bT !== time.now) {

        ls.bT = time.now
        ls.bMinX = 0
        ls.bMaxX = 0
        ls.bMinY = 0
        ls.bMaxY = 0
    }
    if (!ub.valid) return
    ls.bMinX = Math.min(ls.bMinX, ub.minX)
    ls.bMaxX = Math.max(ls.bMaxX, ub.maxX)
    ls.bMinY = Math.min(ls.bMinY, ub.minY)
    ls.bMaxY = Math.max(ls.bMaxY, ub.maxY)
}

export const LineRow = {
    y: Number,

    l: Number,
    r: Number,
    v: Number,
    p: Number,

    a: Number,
    t: Number,
}

const copyRow = (from: ContainerType<typeof LineRow>, to: ContainerType<typeof LineRow>) => {
    to.y = from.y
    to.l = from.l
    to.r = from.r
    to.v = from.v
    to.p = from.p
    to.a = from.a
    to.t = from.t
}

export type UnitGeometry = {

    headTime: number
    tailTime: number
    lineBegin: number
    lineEnd: number

    hL: number
    hR: number
    tL: number
    tR: number
    easeL: number
    easeR: number
}

export const unitEdgeL = (u: UnitGeometry, s: number) => Math.lerp(u.hL, u.tL, lineEase(s, u.easeL))
export const unitEdgeR = (u: UnitGeometry, s: number) => Math.lerp(u.hR, u.tR, lineEase(s, u.easeR))

export const heldHeadCenter = (u: UnitGeometry, now: number) => {
    const te = lineEase(Math.clamp(Math.unlerp(u.headTime, u.tailTime, now), 0, 1), u.easeL)
    return Math.lerp((u.hL + u.hR) / 2 - 0.5, (u.tL + u.tR) / 2 - 0.5, te)
}
export const heldHeadWidth = (u: UnitGeometry, now: number) => {
    const te = lineEase(Math.clamp(Math.unlerp(u.headTime, u.tailTime, now), 0, 1), u.easeL)
    return Math.lerp(u.hR - u.hL, u.tR - u.tL, te)
}

export const unitSplitCount = (pB: number, pE: number, diff: number) => {
    const k = layout.lodThreshold > 1e-6 ? Math.clamp(viewProgress(Math.max(pB, pE)) / layout.lodThreshold, 0, 1) : 1
    const base = Math.min(Math.round(k * 68 + 2), MAX_SPLIT)
    return diff >= 1 ? base : Math.max(2, Math.ceil(base * diff))
}

const rowAt = (
    u: UnitGeometry,
    s: number,
    p: number,
    k: number,
    n: number,
    isGuide: boolean,
    baseAlpha: number,
    out: ContainerType<typeof LineRow>,
) => {
    const l = unitEdgeL(u, s)
    const r = unitEdgeR(u, s)
    const vk = viewProgress(p)
    const px = noteX((l + r) / 2 - 0.5, vk)
    const half = (vk * Math.max(r - l - (isGuide ? GUIDE_INSET_LANES : SLIDE_INSET_LANES), 0) * LANE_UNIT) / 2
    const beginMs = Math.round(u.headTime * 1000)
    const fromMs = Math.floor(beginMs + ((Math.round(u.tailTime * 1000) - beginMs) / n) * k)
    out.y = Math.min(noteY(vk), LANE_TOP_Y)
    out.l = px - half
    out.r = px + half
    out.v = vk
    out.p = p
    out.t = fromMs
    out.a = baseAlpha * lineRowFade(p) * (isGuide ? guideEndFade(Math.round(u.lineEnd * 1000) - fromMs) : 1)
}

const edgeCrossValue = (x: number, v: number, j: number) => x - (j % 2 === 1 ? laneEdgeMaxX(v) : laneEdgeMinX(v))

const findLaneEdgeCrossing = (
    u: UnitGeometry,
    tLow: number,
    tHigh: number,
    fLow: number,
    j: number,
    visA: number,
    visB: number,
    cb: number,
    ce: number,
    inset: number,
) => {
    let lo = tLow
    let hi = tHigh
    let f0 = fLow
    for (let i = 0; i < 16; i++) {
        const mid = (hi + lo) * 0.5
        const s = visA + mid * (visB - visA)
        const l = unitEdgeL(u, s)
        const r = unitEdgeR(u, s)
        const vk = viewProgress(cb + mid * (ce - cb))
        const half = (vk * Math.max(r - l - inset, 0) * LANE_UNIT) / 2
        const px = noteX((l + r) / 2 - 0.5, vk)
        const f = edgeCrossValue(j >= 2 ? px + half : px - half, vk, j)
        if (f0 * f <= 0) {
            hi = mid
        } else {
            f0 = f
            lo = mid
        }
    }
    return (hi + lo) * 0.5
}

const quad = (id: SkinSpriteId, xb0: number, xt0: number, xt1: number, xb1: number, y0: number, y1: number, z: number, a: number) => {
    skin.sprites.draw(id, new Quad({ x1: xb0, y1: y0, x2: xt0, y2: y1, x3: xt1, y3: y1, x4: xb1, y4: y0 }), z, a)
}

const drawRowPair = (
    s: ContainerType<typeof LineRow>,
    e: ContainerType<typeof LineRow>,
    isGuide: boolean,
    band0: SkinSpriteId,
    lodStride: number,
    mid: SkinSpriteId,
    fadeBand: number,
    fadeMid: number,
    z: number,
) => {
    const glow = isGuide ? 0 : noteStyle() === 2 ? 2 : SLIDE_GLOW_RANGE_SCALE
    const ge = Math.min(e.v * 0.5 * glow, (e.r - e.l) / 2)
    const gs = Math.min(s.v * 0.5 * glow, (s.r - s.l) / 2)
    const band = (band0 + lodStride * lodOf((gs + ge) / 2)) as SkinSpriteId
    const eMin = laneEdgeMinX(e.v)
    const eMax = laneEdgeMaxX(e.v)
    const sMin = laneEdgeMinX(s.v)
    const sMax = laneEdgeMaxX(s.v)
    const tlo = Math.clamp(e.l, eMin, eMax)
    const tli = Math.clamp(e.l + ge, eMin, eMax)
    const tro = Math.clamp(e.r, eMin, eMax)
    const tri = Math.clamp(e.r - ge, eMin, eMax)
    const blo = Math.clamp(s.l, sMin, sMax)
    const bli = Math.clamp(s.l + gs, sMin, sMax)
    const bro = Math.clamp(s.r, sMin, sMax)
    const bri = Math.clamp(s.r - gs, sMin, sMax)
    if (fadeMid > 0 && s.a < FADE_ZERO && e.a > 0) {

        if (!isGuide) quad(fadeBand as SkinSpriteId, blo, tlo, tli, bli, s.y, e.y, z, e.a)
        quad(fadeMid as SkinSpriteId, bli, tli, tri, bri, s.y, e.y, z, e.a)
        if (!isGuide) quad(fadeBand as SkinSpriteId, bro, tro, tri, bri, s.y, e.y, z, e.a)
        return
    }
    const sub = s.p > 1 || e.p > 1 ? FADE_SUB : 1
    for (let j = 0; j < sub; j++) {
        const f0 = j / sub
        const f1 = (j + 1) / sub
        const a = Math.lerp(s.a, e.a, (f0 + f1) / 2)
        const y0 = Math.lerp(s.y, e.y, f0)
        const y1 = Math.lerp(s.y, e.y, f1)
        const lo0 = Math.lerp(blo, tlo, f0)
        const lo1 = Math.lerp(blo, tlo, f1)
        const li0 = Math.lerp(bli, tli, f0)
        const li1 = Math.lerp(bli, tli, f1)
        const ro0 = Math.lerp(bro, tro, f0)
        const ro1 = Math.lerp(bro, tro, f1)
        const ri0 = Math.lerp(bri, tri, f0)
        const ri1 = Math.lerp(bri, tri, f1)
        if (a > 0) {
            if (!isGuide) quad(band, lo0, lo1, li1, li0, y0, y1, z, a)
            quad(mid, li0, li1, ri1, ri0, y0, y1, z, a)
            if (!isGuide) quad(band, ro0, ro1, ri1, ri0, y0, y1, z, a)
        }
    }
}

const rIndex = (r: number) => Math.round(Math.clamp(r, 0, 1) * (SLIDE_R_SAMPLES - 1))

const lodOf = (bandW: number) => (bandW < SLIDE_BAND_LOD_W0 ? 0 : bandW < SLIDE_BAND_LOD_W1 ? 1 : 2)

const BAND_LOD_STRIDE = 3 * SLIDE_R_SAMPLES
const bandSprite0 = (state: number, k: number) => (skin.sprites.slideBand32Disabled00.id + state * SLIDE_R_SAMPLES + k) as SkinSpriteId
const midSprite = (state: number, k: number) => (skin.sprites.slideMidDisabled00.id + state * SLIDE_R_SAMPLES + k) as SkinSpriteId
const fadeBandSprite = (state: number, k: number) => skin.sprites.slideBandFadeDisabled00.id + state * SLIDE_R_SAMPLES + k
const fadeMidSprite = (state: number, k: number) => skin.sprites.slideMidFadeDisabled00.id + state * SLIDE_R_SAMPLES + k

export const drawUnitBody = (
    u: UnitGeometry,
    pB: number,
    pE: number,
    isGuide: boolean,
    state: number,
    baseAlpha: number,
    rowA: ContainerType<typeof LineRow>,
    rowB: ContainerType<typeof LineRow>,
    ub: ContainerType<typeof UnitBounds>,
    lineOk: boolean,
    lineCx: number,
    lineCy: number,
) => {
    ub.valid = false
    if (pB < pE) return
    const cb = Math.max(pB < 1 ? pB : 1 + LINE_FADE_IN_PROGRESS_RANGE, 0)
    const ce = Math.clamp(pE, 0, 1)
    const diff = Math.min(pB, 1) - ce
    if (diff <= 0) return
    const rows = unitSplitCount(pB, pE, diff)
    const span = pE - pB
    const flat = Math.abs(span) < 1e-6
    const visA = flat ? 0 : Math.clamp((cb - pB) / span, 0, 1)
    const visB = flat ? 1 : Math.clamp((ce - pB) / span, 0, 1)
    const stepOne = cb <= 1 || ce >= 1 ? -1 : (1 - cb) / (ce - cb)
    const hasOne = stepOne >= 0
    const inset = isGuide ? GUIDE_INSET_LANES : SLIDE_INSET_LANES
    const lineSpanMs = Math.round(u.lineEnd * 1000) - Math.round(u.lineBegin * 1000)
    const invSpan = lineSpanMs >= 1 ? 1 / lineSpanMs : 0
    const lineBeginMs = Math.round(u.lineBegin * 1000)

    const useNew = skin.sprites.slideBand32Disabled00.exists
    const useFade = skin.sprites.slideBandFadeDisabled00.exists
    const guideMid = skin.sprites.guideLineMid.exists
        ? skin.sprites.guideLineMid.id
        : skin.sprites.guideLine.exists
          ? skin.sprites.guideLine.id
          : skin.sprites.fbGuideLine.id
    const guideFade = skin.sprites.guideLineMidFade.exists ? skin.sprites.guideLineMidFade.id : 0
    const strip = skin.sprites.slideLine.exists ? skin.sprites.slideLine.id : skin.sprites.fbSlideLine.id

    let zx = lineCx
    let zy = lineCy
    if (!lineOk) {
        rowAt(u, visA, cb, 0, rows, isGuide, baseAlpha, rowA)
        rowAt(u, visB, ce, rows, rows, isGuide, baseAlpha, rowB)
        const c = lineMeshBoundsCentre(
            Math.min(Math.clamp(rowA.l, laneEdgeMinX(rowA.v), laneEdgeMaxX(rowA.v)), Math.clamp(rowB.l, laneEdgeMinX(rowB.v), laneEdgeMaxX(rowB.v))),
            Math.max(Math.clamp(rowA.r, laneEdgeMinX(rowA.v), laneEdgeMaxX(rowA.v)), Math.clamp(rowB.r, laneEdgeMinX(rowB.v), laneEdgeMaxX(rowB.v))),
            Math.min(rowA.y, rowB.y),
            Math.max(rowA.y, rowB.y),
        )
        zx = c.x
        zy = c.y
    }
    const z = camZ(isGuide ? layer.guideBody : layer.slideBody, zx, zy)
    ub.minX = 1e9
    ub.maxX = -1e9
    ub.minY = 1e9
    ub.maxY = -1e9

    let k = 0
    let has = false
    let oneDone = !hasOne
    let nEdge = 0
    let probed = false
    let tLow = 0
    let q0 = 0
    let q1 = 0
    let q2 = 0
    let q3 = 0
    let iOne = -1
    let i0 = -1
    let i1 = -1
    let i2 = -1
    let i3 = -1
    while (k <= rows) {
        const t = k / rows

        let tn = 2
        let which = -1
        if (iOne >= 0 && iOne < tn) {
            tn = iOne
            which = 4
        }
        if (i0 >= 0 && i0 < tn) {
            tn = i0
            which = 0
        }
        if (i1 >= 0 && i1 < tn) {
            tn = i1
            which = 1
        }
        if (i2 >= 0 && i2 < tn) {
            tn = i2
            which = 2
        }
        if (i3 >= 0 && i3 < tn) {
            tn = i3
            which = 3
        }
        if (which === 4) iOne = -1
        if (which === 0) i0 = -1
        if (which === 1) i1 = -1
        if (which === 2) i2 = -1
        if (which === 3) i3 = -1
        const isIns = which >= 0
        const isOne = which === 4
        if (isIns && !isOne && nEdge > 3) continue
        rowAt(
            u,
            visA + (isIns ? tn : t) * (visB - visA),
            isOne ? 1 : cb + (isIns ? tn : t) * (ce - cb),
            isIns ? tn * rows : k,
            rows,
            isGuide,
            baseAlpha,
            rowB,
        )
        if (!isIns && !probed) {
            probed = true
            if (!oneDone && t > stepOne) {
                oneDone = true
                iOne = stepOne
            }
            const c0 = edgeCrossValue(rowB.l, rowB.v, 0)
            const c1 = edgeCrossValue(rowB.l, rowB.v, 1)
            const c2 = edgeCrossValue(rowB.r, rowB.v, 2)
            const c3 = edgeCrossValue(rowB.r, rowB.v, 3)
            if (k > 0 && nEdge <= 3) {
                for (let j = 0; j < 4; j++) {
                    const q = j === 0 ? q0 : j === 1 ? q1 : j === 2 ? q2 : q3
                    const c = j === 0 ? c0 : j === 1 ? c1 : j === 2 ? c2 : c3
                    if (q * c < 0) {
                        const tc = findLaneEdgeCrossing(u, tLow, t, q, j, visA, visB, cb, ce, inset)
                        if (j === 0) i0 = tc
                        if (j === 1) i1 = tc
                        if (j === 2) i2 = tc
                        if (j === 3) i3 = tc
                    }
                }
            }
            q0 = c0
            q1 = c1
            q2 = c2
            q3 = c3

            if (iOne >= 0 || i0 >= 0 || i1 >= 0 || i2 >= 0 || i3 >= 0) continue
        }
        if (has) {

            const ks = rIndex(invSpan * ((rowA.t + rowB.t) / 2 - lineBeginMs))
            const band0 = useNew ? bandSprite0(state, ks) : strip
            const mid = isGuide ? guideMid : useNew ? midSprite(state, ks) : strip
            const fadeMid = isGuide ? guideFade : useFade ? fadeMidSprite(state, ks) : 0
            const fadeBand = useFade && !isGuide ? fadeBandSprite(state, ks) : 0
            drawRowPair(rowA, rowB, isGuide, band0, useNew ? BAND_LOD_STRIDE : 0, mid, fadeBand, fadeMid, z)
        }
        copyRow(rowB, rowA)
        has = true

        ub.minX = Math.min(ub.minX, Math.clamp(rowB.l, laneEdgeMinX(rowB.v), laneEdgeMaxX(rowB.v)))
        ub.maxX = Math.max(ub.maxX, Math.clamp(rowB.r, laneEdgeMinX(rowB.v), laneEdgeMaxX(rowB.v)))
        ub.minY = Math.min(ub.minY, rowB.y)
        ub.maxY = Math.max(ub.maxY, rowB.y)
        ub.valid = true
        if (isIns) {
            if (!isOne) nEdge++
            continue
        }
        tLow = t
        probed = false
        k++
    }
}

export const lineLayer = layer
export const lineLayout = layout
