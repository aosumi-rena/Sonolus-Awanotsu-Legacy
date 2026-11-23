export const PASS_NOTE_MISS_AFTER_MS = 130

const JP_LAST = Math.fround(1.1)

export const DEFAULT_APPROACH_MS = 2370

export const isPassOp = (op: number) => op === 0 || op === 80 || op === 82 || op === 100 || op === 103 || op === 121 || op === 122 || op === 123

export const passNoteDoneOffsetMs = (approachMs: number, adjAbsMs = 0) => {
    let off = Math.max(PASS_NOTE_MISS_AFTER_MS + adjAbsMs + 1, Math.floor(0.1 * approachMs) - 1)
    while (Math.fround(Math.fround(off + approachMs) / Math.fround(approachMs)) < JP_LAST) off++
    return off
}

export const liveFinishMs = (lastJudgedMs: number, lastPassMs: number, approachMs = DEFAULT_APPROACH_MS, adjMs = 0) =>
    lastPassMs < 0 ? lastJudgedMs : Math.max(lastJudgedMs, lastPassMs + adjMs + passNoteDoneOffsetMs(approachMs, Math.abs(adjMs)))
