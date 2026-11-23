import { PLANE_HALF_H } from './geometry.js'

export const FLICK_DISTANCE = 0.2

export const FLICK_DPI_DIVISOR_ESTIMATE = 2.54

export const SCREEN_HEIGHT_CM_ESTIMATE = 6.8

export const FLICK_THRESHOLD_PLANE_PER_FRAME = (FLICK_DISTANCE / SCREEN_HEIGHT_CM_ESTIMATE) * 2 * PLANE_HALF_H

export const FLICK_REFERENCE_FRAME_S = 0.016667

export const flickFrames = (deltaTime: number) => {
    const frames = deltaTime / FLICK_REFERENCE_FRAME_S
    return frames <= 0 ? 1 : frames
}

export const isFlickDelta = (dxPlane: number, dyPlane: number, deltaTime: number) => {
    const n = flickFrames(deltaTime)
    const vx = dxPlane / n
    const vy = dyPlane / n
    return vx * vx + vy * vy > FLICK_THRESHOLD_PLANE_PER_FRAME * FLICK_THRESHOLD_PLANE_PER_FRAME
}
