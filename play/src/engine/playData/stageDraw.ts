import { legacyDepth } from '../../../../shared/src/engine/data/depth.js'
import {
    CAM_COS,
    CAM_HEIGHT,
    CAM_SIN,
    JUDGE_GROUND_Z,
    LANE3D_FAR_Z,
    LANE3D_HALF,
    LANE3D_JUDGE_Z,
    LANE3D_STEP,
    LANE_UNIT,
    PLANE_DIST,
    PLANE_HALF_H,
    groundToPlaneX,
    groundToPlaneY,
    groundZAtPlaneY,
    viewProgress,
} from '../../../../shared/src/engine/data/geometry.js'
import { isJudgementOp } from '../../../../shared/src/engine/data/notes.js'
import { options } from '../configuration/options.js'
import { chartTime, layout, noteX, noteY } from './layout.js'
import { particle } from './particle.js'
import { BAND_INTRO_FIRST, layer, skin } from './skin.js'

export const LANE_INTRO_OFFSET = 5.9167 - 3.0833

export const LANE_INTRO_LENGTH = 2.8333

export const LANE_ACTIVE_TIME = 2.15 - LANE_INTRO_OFFSET

export const LANE_OUT_DURATION = 0.5
export const laneOutAlpha = (now: number, finish: number) => (now < finish ? 1 : flat(now, finish, 1, finish + LANE_OUT_DURATION, 0))

export const noteFinishTime = (firstNote: number, lastNote: number, connector: number, getNote: (index: number) => { ms: number; op: number }) => {
    let last = -1e9
    for (const info of entityInfos) {
        const a = info.archetype
        if (a < firstNote || a > lastNote || a === connector) continue
        const imp = getNote(info.index)

        last = Math.max(last, isJudgementOp(imp.op) ? chartTime(imp.ms) : -1e9)
    }
    return last < -1e8 ? 1e9 : last
}

export const NOTE_TAIL_WINDOW = 0.45
export const noteTailIndex = (
    firstNote: number,
    lastNote: number,
    connector: number,
    getNote: (index: number) => { ms: number; op: number },
    lastS: number,
    wantLast: boolean,
) => {
    let first = 1e9
    let last = -1
    for (const info of entityInfos) {
        const a = info.archetype
        if (a < firstNote || a > lastNote || a === connector) continue
        const imp = getNote(info.index)
        const inTail = isJudgementOp(imp.op) && chartTime(imp.ms) >= lastS - NOTE_TAIL_WINDOW

        first = Math.min(first, inTail ? info.index : 1e9)
        last = Math.max(last, inTail ? info.index : -1)
    }
    return wantLast ? last : first
}

const flat = (t: number, t0: number, v0: number, t1: number, v1: number) => {
    const s = Math.clamp((t - t0) / (t1 - t0), 0, 1)
    return v0 + (v1 - v0) * s * s * (3 - 2 * s)
}

const worldToPlaneX = (x: number, y: number, z: number) => (x * PLANE_DIST) / ((CAM_HEIGHT - y) * CAM_SIN + z * CAM_COS)
const worldToPlaneY = (y: number, z: number) =>
    (((y - CAM_HEIGHT) * CAM_COS + z * CAM_SIN) * PLANE_DIST) / ((CAM_HEIGHT - y) * CAM_SIN + z * CAM_COS)

const Z_SHADOW = layer.laneBase - 10

export const drawStageShadow = (brightness: number) => {
    const a = Math.clamp(1 - brightness, 0, 1)
    if (a <= 0) return
    if (skin.sprites.stageShadow.exists) {
        skin.sprites.stageShadow.draw(fullPlaneQuad(), Z_SHADOW, a)
    } else if (skin.sprites.hudBlack.exists) {
        skin.sprites.hudBlack.draw(fullPlaneQuad(), Z_SHADOW, a)
    }
}

const fullPlaneQuad = () =>
    new Quad({
        x1: -2 * layout.halfW,
        y1: -2 * layout.halfH,
        x2: -2 * layout.halfW,
        y2: 2 * layout.halfH,
        x3: 2 * layout.halfW,
        y3: 2 * layout.halfH,
        x4: 2 * layout.halfW,
        y4: -2 * layout.halfH,
    })

const BG_ZOOM_FROM = 1.12
const BG_ZOOM_TO = 1.2
const BG_ZOOM_START = 1.4833333
const BG_ZOOM_END = 1.4833333 + 3.3333333

const LANE_INTRO_START = 3.0833
const BG_COMPOSITE_ASPECT = 1536 / 1212

const BG_ASPECT_TOL = 0.003

export const backgroundZoomAt = (T: number) => flat(T, BG_ZOOM_START, BG_ZOOM_FROM, BG_ZOOM_END, BG_ZOOM_TO)

const bgZoom = levelMemory({ cx: Number, cy: Number, hw: Number, hh: Number, ship: Number, cur: Number })

const introTimeline = levelMemory({ law: Number, law3: Number })

export const setupBackgroundZoom = (shipZoom: number) => {

    const l = Math.min(Math.min(background.x1, background.x2), Math.min(background.x3, background.x4))
    const r = Math.max(Math.max(background.x1, background.x2), Math.max(background.x3, background.x4))
    const b = Math.min(Math.min(background.y1, background.y2), Math.min(background.y3, background.y4))
    const t = Math.max(Math.max(background.y1, background.y2), Math.max(background.y3, background.y4))
    const hw = (r - l) / 2
    const hh = (t - b) / 2
    const fits = hw > 0 && hh > 0 && Math.abs(hw / hh - BG_COMPOSITE_ASPECT) < BG_ASPECT_TOL
    bgZoom.cx = (l + r) / 2
    bgZoom.cy = (b + t) / 2
    bgZoom.hw = hw
    bgZoom.hh = hh
    bgZoom.ship = shipZoom > 0 && fits ? shipZoom : 0
    setBackgroundScale(BG_ZOOM_TO)
}

export const updateIntroTimeline = (clipT: number, zoomT: number) => {

    setBackgroundScale(backgroundZoomAt(zoomT))
    introTimeline.law = introHaloLaneLaw(clipT)
    introTimeline.law3 = introHaloRampLaw(clipT)
}

const setBackgroundScale = (zoom: number) => {
    if (bgZoom.ship <= 0) return
    const s = zoom / bgZoom.ship

    bgZoom.cur = s
    const l = bgZoom.cx - bgZoom.hw * s
    const r = bgZoom.cx + bgZoom.hw * s
    const b = bgZoom.cy - bgZoom.hh * s
    const t = bgZoom.cy + bgZoom.hh * s
    background.set({ x1: l, y1: b, x2: l, y2: t, x3: r, y3: t, x4: r, y4: b })
}

const Z_MONITOR = layer.laneBase - 20

const MON_X0 = 316
const MON_X1 = 1220
const MON_Y0 = 368
const MON_Y1 = 752
const ROOT_CX = 768
const ROOT_CY = 606
const SHIP_HALF_W = 688
const SHIP_HALF_H = 543

export const drawStageMonitor = (band: number) => {
    if (bgZoom.ship <= 0) return
    if (band < 0 || band > 5) return
    const id = (skin.sprites.stageMonitorB0.id + Math.floor(band)) as SkinSpriteId
    if (!skin.sprites.monitorJacket.exists || !skin.sprites.exists(id)) return

    const inv = 1 / layout.scale
    const kx = ((bgZoom.hw * bgZoom.cur) / SHIP_HALF_W) * inv
    const ky = ((bgZoom.hh * bgZoom.cur) / SHIP_HALF_H) * inv
    const l = bgZoom.cx * inv + (MON_X0 - ROOT_CX) * kx
    const r = bgZoom.cx * inv + (MON_X1 - ROOT_CX) * kx
    const t = bgZoom.cy * inv - (MON_Y0 - ROOT_CY) * ky
    const b = bgZoom.cy * inv - (MON_Y1 - ROOT_CY) * ky
    const q = new Quad({ x1: l, y1: b, x2: l, y2: t, x3: r, y3: t, x4: r, y4: b })
    skin.sprites.monitorJacket.draw(q, Z_MONITOR, 1)
    skin.sprites.draw(id, q, Z_MONITOR + 1, 1)
}

const LANE_BASE_HALF_W = 1024
const LANE_BASE_CY = -247
const LANE_BASE_HALF_H = 822
const LANE_BASE_TOP = LANE_BASE_CY + LANE_BASE_HALF_H

const STRIP_COUNT = 42
const STRIP_CANVAS_H = 40

const canvasQuad = (l: number, b: number, r: number, t: number) =>
    new Quad({ x1: l, y1: b, x2: l, y2: t, x3: r, y3: t, x4: r, y4: b })

export const drawLaneBase = (alpha: number, maskY: number) => {
    if (alpha <= 0) return
    const k = layout.canvasPx
    const hw = LANE_BASE_HALF_W * k
    const z = layer.laneBase
    if (maskY < 1e8 && skin.sprites.laneBaseStrip00.exists) {
        const id0 = skin.sprites.laneBaseStrip00.id
        for (let i = 0; i < STRIP_COUNT; i++) {
            const top = LANE_BASE_TOP - i * STRIP_CANVAS_H
            const bottom = (top - Math.min(STRIP_CANVAS_H, 1644 - i * STRIP_CANVAS_H)) * k
            const visibleTop = Math.min(top * k, maskY)
            if (visibleTop > bottom) skin.sprites.draw((id0 + i) as SkinSpriteId, canvasQuad(-hw, bottom, hw, visibleTop), z, alpha)
        }
        return
    }
    const cy = LANE_BASE_CY * k
    const hh = LANE_BASE_HALF_H * k
    const id = skin.sprites.laneBase.exists ? skin.sprites.laneBase.id : skin.sprites.fbLane.id
    skin.sprites.draw(id, canvasQuad(-hw, cy - hh, hw, cy + hh), z, alpha)
}

const mainCountOf = (option302: number) => (option302 <= 0 ? 0 : option302 === 1 ? 4 : option302 === 2 ? 6 : option302 === 3 ? 8 : 12)
const subCountOf = (option302: number) => (option302 <= 2 ? 12 : 0)

const HORIZON_Y = (PLANE_DIST * CAM_SIN) / CAM_COS

const nearZ = () => groundZAtPlaneY(-layout.halfH)

const farZ = () => {
    const z = groundZAtPlaneY(layout.halfH)
    return z > 0 && z < LANE3D_FAR_Z ? z : LANE3D_FAR_Z
}

const ribbonQuad = (x: number, z0: number, z1: number, w0: number, w1: number) => {
    const n = (100 + x * x) ** 0.5
    const rx = -10 / n
    const ry = -x / n
    return new Quad({
        x1: worldToPlaneX(x + (rx * w0) / 2, (ry * w0) / 2, z0),
        y1: worldToPlaneY((ry * w0) / 2, z0),
        x2: worldToPlaneX(x + (rx * w1) / 2, (ry * w1) / 2, z1),
        y2: worldToPlaneY((ry * w1) / 2, z1),
        x3: worldToPlaneX(x - (rx * w1) / 2, -(ry * w1) / 2, z1),
        y3: worldToPlaneY(-(ry * w1) / 2, z1),
        x4: worldToPlaneX(x - (rx * w0) / 2, -(ry * w0) / 2, z0),
        y4: worldToPlaneY(-(ry * w0) / 2, z0),
    })
}

const groundLineQuad = (x: number, zNear: number, zFar: number, wNear: number, wFar: number) =>
    new Quad({
        x1: groundToPlaneX(x - wNear / 2, zNear),
        y1: groundToPlaneY(zNear),
        x2: groundToPlaneX(x - wFar / 2, zFar),
        y2: groundToPlaneY(zFar),
        x3: groundToPlaneX(x + wFar / 2, zFar),
        y3: groundToPlaneY(zFar),
        x4: groundToPlaneX(x + wNear / 2, zNear),
        y4: groundToPlaneY(zNear),
    })

const NORMAL_LINE_GREY = 0.6132
const SPACE_TICK_HALF = 0.65
const OUTSIDE_LINE_X = 9.64
const OUTSIDE_LINE_W = 0.16

export const drawLaneLines = (option302: number, guidelineAlpha: number, animAlpha: number, maskY: number) => {
    const main = mainCountOf(option302)
    const sub = subCountOf(option302)

    const zEnd = maskY < HORIZON_Y ? Math.min(LANE3D_FAR_Z, groundZAtPlaneY(maskY)) : LANE3D_FAR_Z
    const normalEndW = 0.15 + (0.15 * zEnd) / LANE3D_FAR_Z
    const spaceZ0 = LANE3D_JUDGE_Z - SPACE_TICK_HALF
    const spaceZ1 = Math.min(LANE3D_JUDGE_Z + SPACE_TICK_HALF, zEnd)
    const aaExists = skin.sprites.laneLineAaGrey.exists
    const greyExists = skin.sprites.laneLineGrey.exists
    const lineId = aaExists
        ? skin.sprites.laneLineAaGrey.id
        : greyExists
          ? skin.sprites.laneLineGrey.id
          : skin.sprites.laneLine.exists
            ? skin.sprites.laneLine.id
            : skin.sprites.fbWhite.id
    const tint = aaExists || greyExists ? 1 : NORMAL_LINE_GREY
    const z = layer.laneLine

    for (let i = 1; i < 24; i++) {
        const x = -LANE3D_HALF + i * LANE3D_STEP
        const isNormal = main > 0 && i % (24 / main) === 0
        const isSpace = !isNormal && main > 0 && sub > 0 && i % (24 / sub) === 0
        if (isNormal) {
            skin.sprites.draw(lineId, ribbonQuad(x, 0, zEnd, 0.15, normalEndW), z, guidelineAlpha * tint * animAlpha)
        } else if (isSpace && spaceZ1 > spaceZ0) {
            skin.sprites.draw(lineId, ribbonQuad(x, spaceZ0, spaceZ1, 0.15, 0.15), z, guidelineAlpha * tint * animAlpha)
        }
    }

    const outId = skin.sprites.laneOutsideLineAa.exists
        ? skin.sprites.laneOutsideLineAa.id
        : skin.sprites.laneOutsideLine.exists
          ? skin.sprites.laneOutsideLine.id
          : skin.sprites.fbWhite.id
    skin.sprites.draw(outId, ribbonQuad(-OUTSIDE_LINE_X, 0, zEnd, OUTSIDE_LINE_W, OUTSIDE_LINE_W), z, animAlpha)
    skin.sprites.draw(outId, ribbonQuad(OUTSIDE_LINE_X, 0, zEnd, OUTSIDE_LINE_W, OUTSIDE_LINE_W), z, animAlpha)
}

const TAP_AREA_HALF_X = 10.05
const TAP_AREA_HALF_Z = 1.05
const TAP_AREA_BORDER = 0.7

const TAP_CENTRE_TEXELS = 128
const TAP_SIDE_WIDTH = 0.8

const groundQuad = (x0: number, x1: number, z0: number, z1: number) =>
    new Quad({
        x1: groundToPlaneX(x0, z0),
        y1: groundToPlaneY(z0),
        x2: groundToPlaneX(x0, z1),
        y2: groundToPlaneY(z1),
        x3: groundToPlaneX(x1, z1),
        y3: groundToPlaneY(z1),
        x4: groundToPlaneX(x1, z0),
        y4: groundToPlaneY(z0),
    })

export const drawTapArea = (alpha: number) => {
    if (alpha <= 0) return
    const z = layer.tapArea
    const x0 = -TAP_AREA_HALF_X
    const x3 = TAP_AREA_HALF_X
    const z0 = LANE3D_JUDGE_Z - TAP_AREA_HALF_Z
    const z3 = LANE3D_JUDGE_Z + TAP_AREA_HALF_Z
    const x1 = x0 + TAP_AREA_BORDER
    const x2 = x3 - TAP_AREA_BORDER
    if (skin.sprites.laneTapAreaColC.exists) {
        const t = (x2 - x1) / (TAP_CENTRE_TEXELS - 2)
        const zSide = layer.tapArea + 0.5
        skin.sprites.laneTapAreaColC.draw(groundQuad(x1 - t, x2 + t, z0, z3), z, alpha)
        skin.sprites.laneTapAreaColL.draw(groundQuad(x0, x0 + TAP_SIDE_WIDTH, z0, z3), zSide, alpha)
        skin.sprites.laneTapAreaColR.draw(groundQuad(x3 - TAP_SIDE_WIDTH, x3, z0, z3), zSide, alpha)
    } else if (skin.sprites.laneTapAreaC.exists) {
        const z1 = z0 + TAP_AREA_BORDER
        const z2 = z3 - TAP_AREA_BORDER
        skin.sprites.laneTapAreaBL.draw(groundQuad(x0, x1, z0, z1), z, alpha)
        skin.sprites.laneTapAreaB.draw(groundQuad(x1, x2, z0, z1), z, alpha)
        skin.sprites.laneTapAreaBR.draw(groundQuad(x2, x3, z0, z1), z, alpha)
        skin.sprites.laneTapAreaL.draw(groundQuad(x0, x1, z1, z2), z, alpha)
        skin.sprites.laneTapAreaC.draw(groundQuad(x1, x2, z1, z2), z, alpha)
        skin.sprites.laneTapAreaR.draw(groundQuad(x2, x3, z1, z2), z, alpha)
        skin.sprites.laneTapAreaTL.draw(groundQuad(x0, x1, z2, z3), z, alpha)
        skin.sprites.laneTapAreaT.draw(groundQuad(x1, x2, z2, z3), z, alpha)
        skin.sprites.laneTapAreaTR.draw(groundQuad(x2, x3, z2, z3), z, alpha)
    } else {
        const id = skin.sprites.laneTapArea.exists ? skin.sprites.laneTapArea.id : skin.sprites.fbJudgmentLine.id
        skin.sprites.draw(id, groundQuad(x0, x3, z0, z3), z, alpha)
    }
}

export const tapAreaFadeAlpha = (elapsedS: number) => Math.ease('In', 'Sine', Math.clamp(elapsedS / 0.6, 0, 1))

export const drawJudgementLine = (animAlpha: number) => {
    const id = skin.sprites.laneLineAaWhite.exists
        ? skin.sprites.laneLineAaWhite.id
        : skin.sprites.judgementLine.exists
          ? skin.sprites.judgementLine.id
          : skin.sprites.fbJudgmentLine.id
    const zj = groundZAtPlaneY(noteY(1))
    const m = (zj * zj + 100) ** 0.5
    const hy = (0.03 * zj) / m
    const hz = (0.03 * 10) / m

    const q = new Quad({
        x1: worldToPlaneX(-9.6, -hy, zj - hz),
        y1: worldToPlaneY(-hy, zj - hz),
        x2: worldToPlaneX(9.6, -hy, zj - hz),
        y2: worldToPlaneY(-hy, zj - hz),
        x3: worldToPlaneX(9.6, hy, zj + hz),
        y3: worldToPlaneY(hy, zj + hz),
        x4: worldToPlaneX(-9.6, hy, zj + hz),
        y4: worldToPlaneY(hy, zj + hz),
    })
    skin.sprites.draw(id, q, layer.judgementLine, 0.4 * animAlpha)
}

export const judgeGroundZ = JUDGE_GROUND_Z

const BEAM_Z_FROM = 400
const BEAM_Z_TO = 146.1224518
const BEAM_HALF_LEN = 144
const BEAM_TEX_W = 0.24

const STAR_OFFSET = 0.0803 * 1800

const STAR_PAD = 1.5
const STAR_ACROSS = 0.64 * 2.22 * STAR_PAD
const STAR_HALF_ALONG = (0.64 * 1800 * 0.0012 * STAR_PAD) / 2

const STAR_WIDTH = 0.64 * 2.22
const STAR_GLOW_K = 3

const STAR_GLOW_W0 = 0.12
const STAR_GLOW_WS = 0.45

const INTRO_ACTIVE_FROM = 0.0167

const HALO_HALF_W = 2.3
const HALO_Y0 = -6

const SHORT_HALO_HALF_W = 0.5
const SHORT_HALO_EXT = 0.6

const BEAM_COUNT = 7
const beamX = (k: number) => {
    const a = k < 3 ? 3 - k : k - 3
    const v = a === 3 ? 9.55 : a === 2 ? 6.37 : a * 3.19
    return k < 3 ? -v : v
}
const beamT0 = (k: number) => (k < 5 ? k * 0.0667 : k === 5 ? 0.1667 : 0.4)
const beamDur = (k: number) => (k === 5 ? 1.1667 : 1)
const beamT = (k: number) => (k < 4 ? 1.9167 + k * 0.08333 : 2.25)
const beamScale = (k: number) => (k === 0 || k === 6 ? 1.5 : 0.7)

const SHORT_COUNT = 6
const shortX = (k: number) => (k === 0 ? -7.99 : k === 1 ? -4.81 : k === 2 ? -1.63 : k === 3 ? 1.56 : k === 4 ? 4.75 : 7.93)
const SHORT_Z = 9.6
const SHORT_HALF_LEN = 0.624
const SHORT_W = 0.7 * 0.16
const BEAM_FADE = 0.5833

const Z_INTRO_BASE = layer.laneBase - 1

const Z_INTRO_BLUE = layer.tapArea + 9.5
const Z_INTRO_HALO = layer.tapArea + 10

const Z_INTRO_HALO_UNDER = layer.laneBase - 2

const Z_BEAM_STEP = 0.001
const Z_BEAM_STEP2 = 0.002
const Z_E3_OFFSET = 0.001
const Z_SHORT_HALO = Z_INTRO_HALO + 7 * Z_BEAM_STEP2

const INTRO_HALO_LAW_T = [1.25, 1.367, 1.5, 1.633, 1.833, 2.033, 2.3, 2.567, 2.8333] as const
const INTRO_HALO_LAW_G = [0, 0.4549, 0.9005, 1.0993, 1.0038, 0.9594, 1.0952, 1.3805, 1.4504] as const
const lawSeg = (t: number, i: number) =>
    INTRO_HALO_LAW_G[i] + ((INTRO_HALO_LAW_G[i + 1] - INTRO_HALO_LAW_G[i]) * (t - INTRO_HALO_LAW_T[i])) / (INTRO_HALO_LAW_T[i + 1] - INTRO_HALO_LAW_T[i])

const INTRO_RAMP_LAW_T = [1.25, 1.3333, 1.4167, 1.5, 1.5833, 1.6667, 1.75, 1.8333, 1.9167, 2.0, 2.0833] as const

const INTRO_RAMP_LAW_G = [0, 1.3175, 1.8372, 1.6355, 1.2723, 0.8555, 0.3717, 0.1335, 0, 0, 0] as const
const rampSeg = (t: number, i: number) =>
    INTRO_RAMP_LAW_G[i] + ((INTRO_RAMP_LAW_G[i + 1] - INTRO_RAMP_LAW_G[i]) * (t - INTRO_RAMP_LAW_T[i])) / (INTRO_RAMP_LAW_T[i + 1] - INTRO_RAMP_LAW_T[i])

export const introHaloRampLaw = (t: number) =>
    t <= INTRO_RAMP_LAW_T[0] || t >= INTRO_RAMP_LAW_T[10]
        ? 0
        : t < INTRO_RAMP_LAW_T[1]
          ? rampSeg(t, 0)
          : t < INTRO_RAMP_LAW_T[2]
            ? rampSeg(t, 1)
            : t < INTRO_RAMP_LAW_T[3]
              ? rampSeg(t, 2)
              : t < INTRO_RAMP_LAW_T[4]
                ? rampSeg(t, 3)
                : t < INTRO_RAMP_LAW_T[5]
                  ? rampSeg(t, 4)
                  : t < INTRO_RAMP_LAW_T[6]
                    ? rampSeg(t, 5)
                    : t < INTRO_RAMP_LAW_T[7]
                      ? rampSeg(t, 6)
                      : t < INTRO_RAMP_LAW_T[8]
                        ? rampSeg(t, 7)
                        : t < INTRO_RAMP_LAW_T[9]
                          ? rampSeg(t, 8)
                          : rampSeg(t, 9)

export const introHaloLaneLaw = (t: number) =>
    t <= INTRO_HALO_LAW_T[0]
        ? 0
        : t < INTRO_HALO_LAW_T[1]
          ? lawSeg(t, 0)
          : t < INTRO_HALO_LAW_T[2]
            ? lawSeg(t, 1)
            : t < INTRO_HALO_LAW_T[3]
              ? lawSeg(t, 2)
              : t < INTRO_HALO_LAW_T[4]
                ? lawSeg(t, 3)
                : t < INTRO_HALO_LAW_T[5]
                  ? lawSeg(t, 4)
                  : t < INTRO_HALO_LAW_T[6]
                    ? lawSeg(t, 5)
                    : t < INTRO_HALO_LAW_T[7]
                      ? lawSeg(t, 6)
                      : t < INTRO_HALO_LAW_T[8]
                        ? lawSeg(t, 7)
                        : INTRO_HALO_LAW_G[8]
const Z_INTRO_LINE = layer.tapArea + 11
const Z_INTRO_STAR = layer.tapArea + 12

const beamAlpha = (t: number, T: number) => (t < 0.1667 ? 0 : t < T ? flat(t, 0.1667, 0, T, 1) : flat(t, T, 1, T + BEAM_FADE, 0))
const shortAlpha = (t: number, t1: number) =>
    t < t1 ? 0 : t < t1 + 0.3333 ? flat(t, t1, 0, t1 + 0.3333, 1) : t < t1 + 0.8333 ? 1 : flat(t, t1 + 0.8333, 1, t1 + 1.1667, 0)

const coreWhite = (a: number) => (a > 0 ? 1 - 2.718281828 ** -((a / 0.2) ** 1.5) : 0)
const coreBlue = (a: number) => Math.min(1, 12 * a)
const haloAlpha = (a: number) => Math.max(0, (a - 0.08) / 0.92) ** 0.6

const bandQuad = (x0: number, y0: number, x1: number, y1: number, h: number) => {
    const dx = x1 - x0
    const dy = y1 - y0
    const l = (dx * dx + dy * dy) ** 0.5
    const nx = (-dy / l) * h
    const ny = (dx / l) * h
    return new Quad({ x1: x0 - nx, y1: y0 - ny, x2: x1 - nx, y2: y1 - ny, x3: x1 + nx, y3: y1 + ny, x4: x0 + nx, y4: y0 + ny })
}

export const drawLaneIntro = (t: number, band: number) => {
    if (t <= 0 || t >= LANE_INTRO_LENGTH) return
    const zn = nearZ()
    const zf = farZ()
    const coreId = skin.sprites.laneIntroBeam.exists ? skin.sprites.laneIntroBeam.id : skin.sprites.fbWhite.id
    const blueExists = skin.sprites.laneIntroBeamBlue.exists
    const haloExists = skin.sprites.laneIntroHalo.exists && skin.sprites.laneIntroHaloInner.exists

    const splitExists = skin.sprites.laneIntroHaloS0.exists && skin.sprites.laneIntroHaloL0.exists
    const law = introTimeline.law
    const law3 = skin.sprites.laneIntroHaloM0.exists ? introTimeline.law3 : 0

    const aBase = t < 1.25 ? 0 : t < 2.0 ? flat(t, 1.25, 0, 2.0, 1) : flat(t, 2.0, 1, 2.6667, 0)
    if (aBase > 0 && skin.sprites.laneIntroBase.exists) {
        skin.sprites.laneIntroBase.draw(groundQuad(-LANE3D_HALF, LANE3D_HALF, 0, LANE3D_FAR_Z), Z_INTRO_BASE, aBase)
    }
    if (band >= 1 && band <= 5) {
        const first = BAND_INTRO_FIRST + (Math.floor(band) - 1) * 171
        const frame = first + Math.clamp(Math.round(t * 60), 0, 170)
        if (skin.sprites.exists(frame as SkinSpriteId)) {

            const hh = PLANE_HALF_H * 1.35
            const hw = hh * 16 / 9
            skin.sprites.draw(frame as SkinSpriteId, canvasQuad(-hw,-hh,hw,hh), Z_INTRO_LINE, 1)
            return
        }
    }

    const starExists = skin.sprites.laneIntroStar.exists
    const glowExists = skin.sprites.laneIntroStarGlow.exists
    for (let k = 0; k < BEAM_COUNT; k++) {
        const bx = beamX(k)
        const t0 = beamT0(k)
        const zc = flat(t, t0, BEAM_Z_FROM, t0 + beamDur(k), BEAM_Z_TO)
        const a = beamAlpha(t, beamT(k))

        const z0 = zc - BEAM_HALF_LEN
        const z1 = zc + BEAM_HALF_LEN
        const sc = beamScale(k)
        if (a > 0) {
            const h = haloAlpha(a)
            if ((haloExists || splitExists) && h > 0) {

                const nx = groundToPlaneX(bx, z0)
                const ny = groundToPlaneY(z0)
                const fx = groundToPlaneX(bx, z1)
                const fy = groundToPlaneY(z1)
                const by = Math.max(ny, HALO_Y0)
                const bxp = nx + ((by - ny) / (fy - ny)) * (fx - nx)
                const band = bandQuad(bxp, by, fx, fy, HALO_HALF_W)
                if (splitExists) {
                    skin.sprites.draw((skin.sprites.laneIntroHaloS0.id + k) as SkinSpriteId, band, Z_INTRO_HALO_UNDER + k * Z_BEAM_STEP, h)
                    if (law > 0)
                        skin.sprites.draw((skin.sprites.laneIntroHaloL0.id + k) as SkinSpriteId, band, Z_INTRO_HALO + k * Z_BEAM_STEP2, Math.min(1, h * law))

                    if (law3 > 0)
                        skin.sprites.draw((skin.sprites.laneIntroHaloM0.id + k) as SkinSpriteId, band, Z_INTRO_HALO + k * Z_BEAM_STEP2 + Z_E3_OFFSET, Math.min(1, h * law3))
                } else {
                    const haloId = k === 0 || k === 6 ? skin.sprites.laneIntroHalo.id : skin.sprites.laneIntroHaloInner.id
                    skin.sprites.draw(haloId, band, Z_INTRO_HALO, h)
                }
            }
            const w = sc * BEAM_TEX_W
            const q = groundLineQuad(bx, z0, z1, w, w)
            if (blueExists) skin.sprites.laneIntroBeamBlue.draw(q, Z_INTRO_BLUE, coreBlue(a))
            skin.sprites.draw(coreId, q, Z_INTRO_LINE + 0.5, blueExists ? coreWhite(a) : a)
        }
        const zs = zc - STAR_OFFSET
        if (starExists && t >= INTRO_ACTIVE_FROM && zs + STAR_HALF_ALONG > zn && zs - STAR_HALF_ALONG < zf) {
            const hw = (sc * STAR_ACROSS) / 2
            if (glowExists) {

                const gcx = groundToPlaneX(bx, zs)
                const gcy = groundToPlaneY(zs)
                const gw = Math.abs(groundToPlaneX(bx + (sc * STAR_WIDTH) / 2, zs) - gcx) * 2
                const gh = STAR_GLOW_K * gw

                const ga = Math.clamp((gw - STAR_GLOW_W0) / STAR_GLOW_WS, 0, 1)
                if (ga > 0)
                    skin.sprites.laneIntroStarGlow.draw(
                        new Quad({ x1: gcx - gh, y1: gcy - gh, x2: gcx - gh, y2: gcy + gh, x3: gcx + gh, y3: gcy + gh, x4: gcx + gh, y4: gcy - gh }),
                        Z_INTRO_STAR - 0.5,
                        ga,
                    )
            }
            skin.sprites.laneIntroStar.draw(groundQuad(bx - hw, bx + hw, zs - STAR_HALF_ALONG, zs + STAR_HALF_ALONG), Z_INTRO_STAR, 1)
        }
    }

    const shortId = skin.sprites.laneIntroShort.exists ? skin.sprites.laneIntroShort.id : coreId
    const shortHaloExists = skin.sprites.laneIntroShortHalo.exists
    for (let k = 0; k < SHORT_COUNT; k++) {
        const a = shortAlpha(t, 1.1667 + 0.0833 * k)
        if (a > 0) {
            const sx = shortX(k)
            const zA = SHORT_Z - SHORT_HALF_LEN
            const zB = SHORT_Z + SHORT_HALF_LEN
            if (shortHaloExists) {
                const ax = groundToPlaneX(sx, zA)
                const ay = groundToPlaneY(zA)
                const fx = groundToPlaneX(sx, zB)
                const fy = groundToPlaneY(zB)
                const dx = fx - ax
                const dy = fy - ay
                const l = (dx * dx + dy * dy) ** 0.5
                const ex = (dx / l) * SHORT_HALO_EXT
                const ey = (dy / l) * SHORT_HALO_EXT
                skin.sprites.laneIntroShortHalo.draw(bandQuad(ax - ex, ay - ey, fx + ex, fy + ey, SHORT_HALO_HALF_W), Z_SHORT_HALO, haloAlpha(a))
            }
            const q = groundLineQuad(sx, zA, zB, SHORT_W, SHORT_W)
            if (blueExists) skin.sprites.laneIntroBeamBlue.draw(q, Z_INTRO_BLUE, coreBlue(a))
            skin.sprites.draw(shortId, q, Z_INTRO_LINE + 0.5, blueExists ? coreWhite(a) : a)
        }
    }
}

const INTRO_SPARKLE_FROM = 0.5
const INTRO_SPARKLE_DURATION = LANE_INTRO_LENGTH - INTRO_SPARKLE_FROM
const INTRO_SPARKLE_HALF = 10
const INTRO_SPARKLE_LATE = 0.05
const introSparkle = levelMemory({ instance: ParticleEffectInstanceId, done: Boolean })

export const updateIntroSparkles = (t: number, skip: boolean) => {
    if (skip) {
        if (introSparkle.instance) particle.effects.destroy(introSparkle.instance)
        introSparkle.instance = 0 as ParticleEffectInstanceId
        introSparkle.done = t >= INTRO_SPARKLE_FROM
        return
    }
    if (introSparkle.done || t < INTRO_SPARKLE_FROM) return
    introSparkle.done = true

    if (t > INTRO_SPARKLE_FROM + INTRO_SPARKLE_LATE || !particle.effects.introSparkles.exists) return
    const id = particle.effects.introSparkles.id
    const h = INTRO_SPARKLE_HALF
    introSparkle.instance = particle.effects.spawn(
        id as ParticleEffectId,
        new Quad({ x1: -h, y1: -h, x2: -h, y2: h, x3: h, y3: h, x4: h, y4: -h }),
        INTRO_SPARKLE_DURATION,
        false,
    )
}

export const drawBarLine = (p: number, isSkill: boolean) => {
    const vv = viewProgress(p)
    const w = 24 * LANE_UNIT * vv
    const h = (isSkill ? 0.15 : 0.05) * vv
    const y = noteY(vv)
    const x = noteX(11.5, vv)
    const q = new Quad({ x1: x - w / 2, y1: y - h / 2, x2: x - w / 2, y2: y + h / 2, x3: x + w / 2, y3: y + h / 2, x4: x + w / 2, y4: y - h / 2 })
    if (isSkill) {
        const tinted = skin.sprites.skillLineTinted.exists
        const id = tinted ? skin.sprites.skillLineTinted.id : skin.sprites.skillLine.exists ? skin.sprites.skillLine.id : skin.sprites.fbWhite.id
        skin.sprites.draw(id, q, legacyDepth(layer.skillLine, -p), tinted ? 1 : 0.698)
    } else {
        const id = skin.sprites.barLine.exists ? skin.sprites.barLine.id : skin.sprites.fbWhite.id
        skin.sprites.draw(id, q, legacyDepth(layer.measureLine, -p), 1)
    }
}
