import { layout } from '../layout.js'

export const hudLayout = levelData({

    u: Number,

    invScale: Number,

    halfW: Number,

    insetL: Number,
    insetR: Number,
    insetT: Number,
    insetB: Number,

    cardL: Number,
    cardR: Number,
    cardT: Number,
    cardB: Number,
})

export const CANVAS_W = 1920
export const CANVAS_H = 1080

export const CONTENT_BOTTOM_MARGIN = 40

export const LIVE_MARGIN = { l: 0, r: 0, t: 0, b: CONTENT_BOTTOM_MARGIN } as const

export const CARD_MARGIN = { l: 20, r: 20, t: 20, b: 40 } as const

export const setupHudLayout = (aspect: number) => {
    const u = Math.min(aspect / (CANVAS_W / 2), 1 / (CANVAS_H / 2))
    hudLayout.u = u
    hudLayout.invScale = 1 / layout.scale
    hudLayout.halfW = aspect

    hudLayout.insetL = LIVE_MARGIN.l
    hudLayout.insetR = LIVE_MARGIN.r
    hudLayout.insetT = LIVE_MARGIN.t
    hudLayout.insetB = LIVE_MARGIN.b
    hudLayout.cardL = CARD_MARGIN.l
    hudLayout.cardR = CARD_MARGIN.r
    hudLayout.cardT = CARD_MARGIN.t
    hudLayout.cardB = CARD_MARGIN.b
}

export const px = (v: number) => v * hudLayout.u

export const leftX = (x: number) => -hudLayout.halfW + (hudLayout.insetL + x) * hudLayout.u

export const rightX = (x: number) => hudLayout.halfW - (hudLayout.insetR + CANVAS_W - x) * hudLayout.u

export const contentCenterX = (x: number) => ((hudLayout.insetL - hudLayout.insetR) / 2 + (x - CANVAS_W / 2)) * hudLayout.u

export const topY = (y: number) => 1 - (hudLayout.insetT + y) * hudLayout.u

export const centerX = (x: number) => (x - CANVAS_W / 2) * hudLayout.u

export const centerY = (y: number) => (CANVAS_H / 2 - y) * hudLayout.u

export const cardCenterX = (x: number) => ((hudLayout.cardL - hudLayout.cardR) / 2 + (x - CANVAS_W / 2)) * hudLayout.u

export const cardCenterY = (y: number) =>
    (CANVAS_H / 2 - y + (hudLayout.cardB - hudLayout.cardT - (CARD_MARGIN.b - CARD_MARGIN.t)) / 2) * hudLayout.u

export const cardBottomY = (y: number) => -1 + (CANVAS_H - y + hudLayout.cardB - CARD_MARGIN.b) * hudLayout.u

export const screenRectQuad = (l: number, b: number, r: number, t: number) => {
    const k = hudLayout.invScale
    return new Quad({ x1: l * k, y1: b * k, x2: l * k, y2: t * k, x3: r * k, y3: t * k, x4: r * k, y4: b * k })
}

export const centeredScreenQuad = (cx: number, cy: number, w: number, h: number) =>
    screenRectQuad(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)

export const pxRectAt = (cx: number, cy: number, wPx: number, hPx: number, scale: number) =>
    centeredScreenQuad(cx, cy, wPx * hudLayout.u * scale, hPx * hudLayout.u * scale)

export const fullScreenQuad = () => screenRectQuad(-hudLayout.halfW, -1, hudLayout.halfW, 1)
