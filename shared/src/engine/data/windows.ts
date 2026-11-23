import { JudgementType, SimJudgement } from './notes.js'

type Unit = readonly [sim: number, before: number, after: number]

const NORMAL: readonly Unit[] = [
    [SimJudgement.Just, 2, 2],
    [SimJudgement.Perfect, 50, 50],
    [SimJudgement.Great, 83, 83],
    [SimJudgement.Good, 100, 100],
    [SimJudgement.Bad, 125, 125],
    [SimJudgement.Miss, 130, 130],
]
const EASY_NORMAL: readonly Unit[] = [
    [SimJudgement.Just, 2, 2],
    [SimJudgement.Perfect, 67, 67],
    [SimJudgement.Miss, 58, 130],
]
const FLICK: readonly Unit[] = [
    [SimJudgement.Just, 2, 2],
    [SimJudgement.Perfect, 83, 67],
    [SimJudgement.Great, 0, 83],
    [SimJudgement.Good, 0, 117],
    [SimJudgement.Bad, 0, 125],
    [SimJudgement.Miss, 0, 130],
]
const SLIDE_END: readonly Unit[] = [
    [SimJudgement.Perfect, 84, 66],
    [SimJudgement.Great, 0, 166],
    [SimJudgement.Good, 0, 191],
    [SimJudgement.Bad, 0, 208],
    [SimJudgement.Miss, 0, 150],
]
const TRACE: readonly Unit[] = [
    [SimJudgement.Perfect, 67, 67],
    [SimJudgement.Miss, 0, 130],
]

export const unitsOf = (jt: number): readonly Unit[] => {
    if (jt === JudgementType.EasyNormal || jt === JudgementType.SlideBeginEasy) return EASY_NORMAL
    if (jt === JudgementType.Flick || jt === JudgementType.SlideEndFlick) return FLICK
    if (jt === JudgementType.SlideEnd) return SLIDE_END
    if (jt === JudgementType.Trace || jt === JudgementType.SlideEndTrace) return TRACE
    return NORMAL
}

const maxBefore = (u: readonly Unit[]) => u.reduce((m, x) => Math.max(m, x[1]), 0)
const maxAfter = (u: readonly Unit[]) => u.reduce((m, x) => Math.max(m, x[2]), 0)
const missAfter = (u: readonly Unit[]) => u[u.length - 1]![2]

const T = {
    normal: { before: maxBefore(NORMAL), after: maxAfter(NORMAL), missAfter: missAfter(NORMAL) },
    easy: { before: maxBefore(EASY_NORMAL), after: maxAfter(EASY_NORMAL), missAfter: missAfter(EASY_NORMAL) },
    flick: { before: maxBefore(FLICK), after: maxAfter(FLICK), missAfter: missAfter(FLICK) },
    slideEnd: { before: maxBefore(SLIDE_END), after: maxAfter(SLIDE_END), missAfter: missAfter(SLIDE_END) },
    trace: { before: maxBefore(TRACE), after: maxAfter(TRACE), missAfter: missAfter(TRACE) },
}

const isEasy = (jt: number) => jt === JudgementType.EasyNormal || jt === JudgementType.SlideBeginEasy
const isFlick = (jt: number) => jt === JudgementType.Flick || jt === JudgementType.SlideEndFlick
const isSlideEnd = (jt: number) => jt === JudgementType.SlideEnd
const isTrace = (jt: number) => jt === JudgementType.Trace || jt === JudgementType.SlideEndTrace

export const beforeMaxMs = (jt: number) => {
    if (isEasy(jt)) return T.easy.before
    if (isFlick(jt)) return T.flick.before
    if (isSlideEnd(jt)) return T.slideEnd.before
    if (isTrace(jt)) return T.trace.before
    return T.normal.before
}

export const afterMaxMs = (jt: number) => {
    if (isEasy(jt)) return T.easy.after
    if (isFlick(jt)) return T.flick.after
    if (isSlideEnd(jt)) return T.slideEnd.after
    if (isTrace(jt)) return T.trace.after
    return T.normal.after
}

export const missAfterMs = (jt: number) => {
    if (isEasy(jt)) return T.easy.missAfter
    if (isFlick(jt)) return T.flick.missAfter
    if (isSlideEnd(jt)) return T.slideEnd.missAfter
    if (isTrace(jt)) return T.trace.missAfter
    return T.normal.missAfter
}

export const missBeforeMs = (jt: number) => {
    if (isEasy(jt)) return 58
    if (isFlick(jt) || isSlideEnd(jt) || isTrace(jt)) return 0
    return 130
}

export const routingBeforeMs = (jt: number, adjAbsMs: number) => Math.max(beforeMaxMs(jt), missBeforeMs(jt) + adjAbsMs)
export const routingAfterMs = (jt: number, adjAbsMs: number) => Math.max(afterMaxMs(jt), missAfterMs(jt) + adjAbsMs)

export const autoMissAfterMs = (jt: number, adjAbsMs: number) => missAfterMs(jt) + adjAbsMs

const inUnit = (diff: number, before: number, after: number) => diff >= -before && diff <= after

export const JUST_ENABLED = false

export const judgeDiffMs = (jt: number, diffMs: number, justEnabled: boolean = JUST_ENABLED): number => {
    if (isEasy(jt)) {
        if (justEnabled && inUnit(diffMs, 2, 2)) return SimJudgement.Just
        if (inUnit(diffMs, 67, 67)) return SimJudgement.Perfect
        return SimJudgement.Miss
    }
    if (isFlick(jt)) {
        if (justEnabled && inUnit(diffMs, 2, 2)) return SimJudgement.Just
        if (inUnit(diffMs, 83, 67)) return SimJudgement.Perfect
        if (inUnit(diffMs, 0, 83)) return SimJudgement.Great
        if (inUnit(diffMs, 0, 117)) return SimJudgement.Good
        if (inUnit(diffMs, 0, 125)) return SimJudgement.Bad
        return SimJudgement.Miss
    }
    if (isSlideEnd(jt)) {
        if (inUnit(diffMs, 84, 66)) return SimJudgement.Perfect
        if (inUnit(diffMs, 0, 166)) return SimJudgement.Great
        if (inUnit(diffMs, 0, 191)) return SimJudgement.Good
        if (inUnit(diffMs, 0, 208)) return SimJudgement.Bad
        return SimJudgement.Miss
    }
    if (isTrace(jt)) {
        if (inUnit(diffMs, 67, 67)) return SimJudgement.Perfect
        return SimJudgement.Miss
    }
    if (justEnabled && inUnit(diffMs, 2, 2)) return SimJudgement.Just
    if (inUnit(diffMs, 50, 50)) return SimJudgement.Perfect
    if (inUnit(diffMs, 83, 83)) return SimJudgement.Great
    if (inUnit(diffMs, 100, 100)) return SimJudgement.Good
    if (inUnit(diffMs, 125, 125)) return SimJudgement.Bad
    return SimJudgement.Miss
}

export const timingCode = (diffMs: number) => (Math.abs(diffMs) <= 1 ? 0 : diffMs < 0 ? 1 : 2)

export const TimingCode = { Exact: 0, Fast: 1, Slow: 2, NoUnit: 4, Last: 5, Forced: 6 } as const

export const DIFF_INT_MAX = 2147483647
export const DIFF_INT_MIN = -2147483648

export const toSonolusJudgment = (sim: number) => {
    if (sim === SimJudgement.Perfect || sim === SimJudgement.Just) return 1
    if (sim === SimJudgement.Great || sim === SimJudgement.Good) return 2
    return 0
}

export const damageOf = (sim: number) => (sim === SimJudgement.Bad ? 50 : sim === SimJudgement.Miss ? 100 : 0)

export const AreaOffsetType = {
    Default: 0,
    Slide: 1,
    SlideBegin: 2,
    SlideEnd: 3,
    Flick: 4,
    Trace: 5,
    SlideMin: 6,
    SlideMax: 7,
    EasyDefault: 8,
    EasySlideBegin: 9,
} as const

export const areaOffsetLanes = (type: number, width: number) => {
    if (type === AreaOffsetType.Slide) return Math.lerp(2, 1, Math.clamp((width - 4) / 1, 0, 1))
    if (type === AreaOffsetType.SlideBegin) return 2
    if (type === AreaOffsetType.SlideEnd) return 3
    if (type === AreaOffsetType.Flick) return 3
    if (type === AreaOffsetType.Trace) return 2.8
    if (type === AreaOffsetType.EasyDefault || type === AreaOffsetType.EasySlideBegin) return 2.8
    return 1
}

export const bucketWindows = {

    normal: { perfect: { min: -50, max: 50 }, great: { min: -83, max: 83 }, good: { min: -100, max: 100 } },

    easy: { perfect: { min: -67, max: 67 }, great: { min: -67, max: 67 }, good: { min: -67, max: 67 } },

    flick: { perfect: { min: -83, max: 67 }, great: { min: 0, max: 83 }, good: { min: 0, max: 117 } },

    slideEnd: { perfect: { min: -84, max: 66 }, great: { min: 0, max: 166 }, good: { min: 0, max: 191 } },

    trace: { perfect: { min: -67, max: 67 }, great: { min: -67, max: 67 }, good: { min: -67, max: 67 } },
} as const

const lifeDefaults = { base: 1000, danger: 300 } as const
export { lifeDefaults as life }
