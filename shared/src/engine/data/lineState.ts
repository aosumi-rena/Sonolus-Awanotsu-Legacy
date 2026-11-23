export const LINE_START_WINDOW_S = 0.1

export const laneInLineExtent = (lane: number, laneStart: number, laneEnd: number) => lane >= laneStart && lane <= laneEnd

export const nextLineEnabled = (enabled: boolean, missEvent: boolean, finger: boolean) => finger || (!missEvent && enabled)

export const nextLineMissed = (missed: boolean, missEvent: boolean, finger: boolean) => !finger && (missEvent || missed)

export const inLineStartWindow = (now: number, lineBegin: number) => now - LINE_START_WINDOW_S < lineBegin

export const LINE_LONG_LANE_OFFSET = 2

export const longLaneFrom = (laneStart: number) => Math.max(Math.floor(laneStart - LINE_LONG_LANE_OFFSET), 0)

export const longLaneTo = (laneEnd: number, laneCount: number) => Math.min(Math.ceil(LINE_LONG_LANE_OFFSET + laneEnd), laneCount)

export const addLineExtent = (ext: { start: number; end: number }, laneStartIndex: number, laneEndIndex: number) => {
    if (ext.start === 0 || ext.start > laneStartIndex) ext.start = laneStartIndex
    if (ext.end === 0 || ext.end < laneEndIndex) ext.end = laneEndIndex
}

export const lineMembershipCount = (op: number, lineIdCount: number) => {
    if (op === 21 || op === 63 || op === 120 || op === 121 || op === 122) return Math.min(lineIdCount, 1)
    if (op === 20 || op === 22 || op === 41 || op === 42 || op === 61 || op === 62 || op === 80 || op === 82 || (op >= 100 && op <= 105))
        return lineIdCount
    return 0
}
