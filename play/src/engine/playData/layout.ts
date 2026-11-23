import {
    ASPECT_16_9,
    JUDGE_Y,
    LANE_UNIT,
    LANE_X_MAX,
    LANE_X_MIN,
    PLANE_HALF_H,
    PLANE_HALF_W16,
    SPAWN_Y,
    canvasPxToPlane,
    clampedCenter,
    clampedWidth,
    judgeXCenter,
    planeScale,
    viewProgress,
    visibleHalfH,
} from '../../../../shared/src/engine/data/geometry.js'
import { LIVE_SEQ_CARD_MS } from '../../../../shared/src/engine/data/level.js'

export const layout = levelData({

    scale: Number,

    halfH: Number,

    halfW: Number,

    canvasPx: Number,

    judgeOffset: Number,

    approachS: Number,

    musicStart: Number,

    introStart: Number,

    liveStart: Number,

    lodThreshold: Number,

    slideAlpha: Number,
    guideAlpha: Number,

    maskY: Number,

    chartShift: Number,
})

export const musicTime = (now: number) => now - layout.musicStart

const TL_END = 71 / 12
const TL_ZOOM = 89 / 60

const TL_CARD_FULL = 1.5 + 1.3333

const START_SLACK_MAX = 3

const startSeq = levelMemory({ a: Number, set: Boolean })

const START_STALL = 0.5
const START_STALL_WINDOW = 2

export const markFirstFrame = (skipping: boolean) => {
    if (!startSeq.set) {
        startSeq.set = true
        startSeq.a = time.now
        return
    }
    if (!skipping && time.delta > START_STALL && time.now - startSeq.a < START_STALL_WINDOW) startSeq.a = time.now
}

export const startSeqStart = () =>
    startSeq.set ? Math.max(Math.min(startSeq.a, layout.introStart), layout.introStart - START_SLACK_MAX) : layout.introStart

export const liveTime = (now: number) => {
    const e = startSeqStart()
    return Math.max(Math.min(now - e - (TL_END - TL_ZOOM), TL_CARD_FULL - TL_END), now - layout.musicStart)
}

export const introZoomTau = (now: number) => {
    const e = startSeqStart()
    const end = layout.musicStart - (TL_END - (TL_ZOOM + 10 / 3))
    return TL_ZOOM + ((now - e) * (10 / 3)) / Math.max(end - e, 10 / 3)
}

export const setupStartSequence = (musicStartMs: number, introStartMs: number) => {
    layout.musicStart = musicStartMs / 1000
    layout.introStart = introStartMs < -99999 || (introStartMs === 0 && musicStartMs === 0) ? layout.musicStart - LIVE_SEQ_CARD_MS / 1000 : introStartMs / 1000

    layout.liveStart = layout.musicStart
}

export const chartTime = (ms: number) => ms / 1000 + layout.chartShift

export const maskBottomY = (option308: number, aspect: number) => {

    const extra = aspect < ASPECT_16_9 ? 1920 / aspect - 1080 : 0
    return option308 <= 0 ? 1e9 : (540 + extra - (option308 / 100) * (1080 + extra - 224)) * layout.canvasPx
}

export const setupLayout = (aspect: number) => {
    layout.scale = planeScale(aspect)
    layout.halfH = visibleHalfH(aspect)
    layout.halfW = layout.halfH * aspect
    layout.canvasPx = canvasPxToPlane(aspect)
}

export const lodThresholdOf = (noteSpeed: number) => 0.6 - Math.clamp((noteSpeed - 4) * 0.125, 0, 1) * 0.6

export const screenPlaneRect = () => new Rect({ l: -layout.halfW, r: layout.halfW, b: -layout.halfH, t: layout.halfH })

export const judgeX = (c: number) => (1 + layout.judgeOffset) * judgeXCenter(c)

export const judgeY = () => SPAWN_Y + (JUDGE_Y - SPAWN_Y) * (1 + layout.judgeOffset)

export const noteX = (c: number, v: number) => v * judgeX(c)
export const noteY = (v: number) => SPAWN_Y + (judgeY() - SPAWN_Y) * v

export const viewCenter = (pos: number, size: number) => clampedCenter(pos + size / 2 - 0.5, size)
export const viewWidth = (pos: number, size: number) => clampedWidth(pos + size / 2 - 0.5, size)

export const laneEdgeMinX = (v: number) => v * (1 + layout.judgeOffset) * LANE_X_MIN
export const laneEdgeMaxX = (v: number) => v * (1 + layout.judgeOffset) * LANE_X_MAX

export const edgeOfScreenX = (x: number) => x / layout.scale / ((1 + layout.judgeOffset) * LANE_UNIT) + 12

export const screenXOfEdge = (edge: number) => (edge - 12) * LANE_UNIT * (1 + layout.judgeOffset) * layout.scale

export const inHitArea = (edge: number, pos: number, size: number, offsetLanes: number) =>
    edge >= pos - offsetLanes && edge <= pos + size + offsetLanes

export const centeredQuad = (cx: number, cy: number, w: number, h: number, flipX: boolean) => {
    const l = flipX ? cx + w / 2 : cx - w / 2
    const r = flipX ? cx - w / 2 : cx + w / 2
    return new Quad({ x1: l, y1: cy - h / 2, x2: l, y2: cy + h / 2, x3: r, y3: cy + h / 2, x4: r, y4: cy - h / 2 })
}

export const funnelQuad = (edgeL: number, edgeR: number, vNear: number, vFar: number) =>
    new Quad({
        x1: noteX(edgeL - 0.5, vNear),
        y1: noteY(vNear),
        x2: noteX(edgeL - 0.5, vFar),
        y2: noteY(vFar),
        x3: noteX(edgeR - 0.5, vFar),
        y3: noteY(vFar),
        x4: noteX(edgeR - 0.5, vNear),
        y4: noteY(vNear),
    })

export const v = viewProgress

export const constants = { LANE_UNIT, PLANE_HALF_H, PLANE_HALF_W16, ASPECT_16_9 }
