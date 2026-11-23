import { LANE_COUNT } from '../../../../shared/src/engine/data/geometry.js'
import { options } from '../configuration/options.js'

export const PANEL_SECONDS = 8
export const SEC_UNITS = 4
export const PANEL_W = PANEL_SECONDS * SEC_UNITS
export const PANEL_GAP = 2
export const PANEL_H = LANE_COUNT

export const chart = previewData({

    duration: Number,

    musicStartMs: Number,

    count: Number,

    scale: Number,
})

export const panelIndex = (t: number) => Math.floor(t / PANEL_SECONDS)

export const timeX = (t: number) => {
    const i = panelIndex(t)
    return i * (PANEL_W + PANEL_GAP) + (t - i * PANEL_SECONDS) * SEC_UNITS
}

export const timeXIn = (t: number, panel: number) =>
    panel * (PANEL_W + PANEL_GAP) + Math.clamp(t - panel * PANEL_SECONDS, 0, PANEL_SECONDS) * SEC_UNITS

export const panelL = (i: number) => i * (PANEL_W + PANEL_GAP)
export const panelR = (i: number) => i * (PANEL_W + PANEL_GAP) + PANEL_W

export const verticalScale = () => options.previewVerticalScale

export const chartQuad = (x0: number, x1: number, b: number, t: number) => new Quad({ x1: x0, y1: b, x2: x1, y2: b, x3: x1, y3: t, x4: x0, y4: t })

export const chartQuad180 = (x0: number, x1: number, b: number, t: number) => new Quad({ x1: x1, y1: t, x2: x0, y2: t, x3: x0, y3: b, x4: x1, y4: b })
