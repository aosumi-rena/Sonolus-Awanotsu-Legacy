import { CENTER_LANE, LANE_COUNT, LANE_UNIT } from './geometry.js'

export const INPUT_LANE_MARGIN_PLANE = 3.0

export const NO_LANE = -1

export const laneOfPlaneX = (xPlane: number) => {
    const c0 = -CENTER_LANE * LANE_UNIT
    const cLast = CENTER_LANE * LANE_UNIT
    if (c0 - xPlane > INPUT_LANE_MARGIN_PLANE) return NO_LANE
    if (xPlane - cLast > INPUT_LANE_MARGIN_PLANE) return NO_LANE
    return Math.clamp((xPlane - c0) / LANE_UNIT, 0, LANE_COUNT - 1)
}

export const edgeOfLane = (lane: number) => (lane < 0 ? -1000 : lane + 0.5)

export const InputState = { None: 0, PressEnter: 1, Press: 2, PressExit: 3 } as const

export const LANE_PAIRS = LANE_COUNT / 2

export const roundHalfEven = (x: number) => {
    const f = Math.floor(x)
    const d = x - f
    return d > 0.5 ? f + 1 : d < 0.5 ? f : f % 2 === 0 ? f : f + 1
}

export const lanePairOf = (lane: number) => Math.floor(roundHalfEven(lane) / 2)

export const pairCentreEdge = (pair: number) => 2 * pair + 1

export const STOP_IN_VAIN_S = 0.2

export const inVainGuardFrom = (lane: number, area: number) => Math.max(Math.floor(lane - area), 0)

export const inVainGuardTo = (lane: number, width: number, area: number) => Math.min(Math.ceil(area + (lane + width - 1)), LANE_COUNT)

export const pairInVainGuarded = (pair: number, from: number, to: number) => 2 * pair >= from && 2 * pair + 1 < to
