import { viewProgress } from '../../../../shared/src/engine/data/geometry.js'
import { autoMissTime, noteProgress } from '../../../../shared/src/engine/data/timing.js'
import { layout } from './layout.js'

export const note = {
    get approachS() {
        return layout.approachS
    },

    spawnTime(targetTime: number) {
        return Math.max(targetTime - layout.approachS, layout.musicStart)
    },

    missTime(targetTime: number, missAfterMs: number) {
        return autoMissTime(targetTime, layout.approachS, missAfterMs)
    },
    progress(targetTime: number) {
        return noteProgress(time.now, targetTime, layout.approachS)
    },
    progressAt(targetTime: number, now: number) {
        return noteProgress(now, targetTime, layout.approachS)
    },

    unitProgress(targetTime: number) {
        return (time.now - targetTime + layout.approachS) / layout.approachS
    },
    view(targetTime: number) {
        return viewProgress(noteProgress(time.now, targetTime, layout.approachS))
    },
    viewAt(targetTime: number, now: number) {
        return viewProgress(noteProgress(now, targetTime, layout.approachS))
    },
}
