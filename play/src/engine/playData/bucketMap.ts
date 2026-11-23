import { JudgementType, NoteDirection } from '../../../../shared/src/engine/data/notes.js'
import { bucketWindows } from '../../../../shared/src/engine/data/windows.js'
import { buckets } from './buckets.js'

export const bucketIndexOf = (jt: number, op: number, dir: number) => {
    if (jt === JudgementType.EasyNormal) return buckets.criticalTapNote.index
    if (jt === JudgementType.Flick || jt === JudgementType.SlideEndFlick)
        return dir === NoteDirection.Normal ? buckets.flickNote.index : buckets.directionalFlickNote.index
    if (jt === JudgementType.SlideBegin) return buckets.slideStartNote.index
    if (jt === JudgementType.SlideBeginEasy) return buckets.criticalSlideStartNote.index
    if (jt === JudgementType.SlideEnd) return buckets.slideEndNote.index
    if (jt === JudgementType.SlideEndTrace) return buckets.slideEndTraceNote.index
    if (jt === JudgementType.Trace) return op === 21 || op === 120 ? buckets.slideTickNote.index : buckets.traceNote.index
    return buckets.tapNote.index
}

export const setupBuckets = () => {
    buckets.tapNote.set(bucketWindows.normal)
    buckets.criticalTapNote.set(bucketWindows.easy)
    buckets.flickNote.set(bucketWindows.flick)
    buckets.directionalFlickNote.set(bucketWindows.flick)
    buckets.traceNote.set(bucketWindows.trace)
    buckets.slideTickNote.set(bucketWindows.trace)
    buckets.slideStartNote.set(bucketWindows.normal)
    buckets.criticalSlideStartNote.set(bucketWindows.easy)
    buckets.slideEndNote.set(bucketWindows.slideEnd)
    buckets.slideEndTraceNote.set(bucketWindows.trace)
}
