export const NOTE_SPEED_MIN = 1
export const NOTE_SPEED_MAX = 12
export const NOTE_VIEW_MIN_S = 4
export const NOTE_VIEW_MAX_S = 0.35
export const NOTE_SPEED_EXPONENT = 1.31

export const NOTE_ALIVE_PROGRESS = 1.1
const NOTE_ALIVE_PROGRESS_EXTRA = NOTE_ALIVE_PROGRESS - 1

const CEIL_F32_GUARD = 1e-6

export const approachMs = (speed: number) => {
    const t = Math.clamp(Math.max(speed - NOTE_SPEED_MIN, 0) / (NOTE_SPEED_MAX - NOTE_SPEED_MIN), 0, 1)
    const e = Math.clamp(1 - (1 - t) ** NOTE_SPEED_EXPONENT, 0, 1)
    return Math.ceil((NOTE_VIEW_MIN_S + (NOTE_VIEW_MAX_S - NOTE_VIEW_MIN_S) * e) * 1000 - CEIL_F32_GUARD)
}

export const noteProgress = (nowS: number, noteS: number, approachS: number) =>
    Math.max((nowS - noteS + approachS) / approachS, 0)

export const autoMissTime = (noteS: number, approachS: number, missAfterMs: number) =>
    noteS + Math.max(missAfterMs / 1000, NOTE_ALIVE_PROGRESS_EXTRA * approachS)
