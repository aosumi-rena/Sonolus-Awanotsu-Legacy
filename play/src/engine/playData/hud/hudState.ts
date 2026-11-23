import { SimJudgement, scorePercentOf } from '../../../../../shared/src/engine/data/notes.js'
import { comboBonusFactor } from '../../../../../shared/src/engine/data/scoring.js'
import { life as lifeSettings } from '../../../../../shared/src/engine/data/windows.js'
import { options } from '../../configuration/options.js'
import { hudChart } from './hudQueue.js'
import { hudMeta } from './meta.js'

export const WINDOW = 8

export const HudState = {

    folded: Number,

    tierLast: Number,

    fcc: Number,

    unit: Number,
    judged: Number,

    baseCombo: Number,
    baseFc: Boolean,
    baseAp: Boolean,
    wn: Number,
    wT: Tuple(WINDOW, Number),
    wJ: Tuple(WINDOW, Number),
    combo: Number,
    fc: Boolean,
    ap: Boolean,

    comboShown: Number,
    comboLast: Number,
    tierShown: Number,
    comboAddTime: Number,
    comboInitTime: Number,

    score: Number,
    scorePrev: Number,
    scoreTweenStart: Number,
    addVal: Tuple(3, Number),
    addStart: Tuple(3, Number),
    addIdx: Number,

    life: Number,
    lifePrev: Number,
    lifeTweenStart: Number,

    rank: Number,
    rankPrev: Number,
    rankTime: Number,

    popSim: Number,
    popStart: Number,

    subStart: Tuple(3, Number),

    subAbsMs: Number,

    candPri: Number,
    candSim: Number,
    candHit: Number,
    resetSim: Number,
    resetHit: Number,

    finishType: Number,
    finishStart: Number,
}

export const NONE_TIME = -1e9

export const SUB_CHANNELS = 3
export const subChannelAt = (i: number) => Math.mod(i + 1, 3)

const subWeight = (ch: number) => (ch === 0 ? 1 : ch === 1 ? 256 : 65536)
export const subAbsOf = (packed: number, ch: number) => Math.mod(Math.floor(packed / subWeight(ch)), 256)
export const subAbsWith = (packed: number, ch: number, diffMs: number) =>
    packed + (Math.clamp(Math.floor(Math.abs(diffMs)), 0, 255) - subAbsOf(packed, ch)) * subWeight(ch)

export const hudTally = levelMemory({
    n: Tuple(7, Number),
})

export const hudMiss = levelMemory({
    start: Number,
})
export const MISS_SPLASH_LEN = 0.3333

export const resetHudTally = () => {
    for (let i = 0; i < 7; i++) hudTally.n.set(i, 0)
    hudMiss.start = NONE_TIME

    resetPopupPool()
}

export const FinishType = { None: 0, PerfectCombo: 1, FullCombo: 2, AssistFullCombo: 3, LiveClear: 4, LiveFailure: 5 } as const

export const Rank = { D: 0, C: 1, B: 2, A: 3, S: 4, SS: 5 } as const

export const resetHudState = (s: ContainerType<typeof HudState>, now: number) => {
    s.folded = 0
    s.tierLast = 0
    s.judged = 0
    s.baseCombo = 0
    s.baseFc = true
    s.baseAp = true
    s.wn = 0
    s.combo = 0
    s.fc = true
    s.ap = true

    s.comboShown = 0
    s.comboLast = 0
    s.tierShown = 0
    s.comboAddTime = NONE_TIME
    s.comboInitTime = NONE_TIME
    s.score = 0
    s.scorePrev = 0
    s.scoreTweenStart = NONE_TIME
    for (let i = 0; i < 3; i++) {
        s.addVal.set(i, 0)
        s.addStart.set(i, NONE_TIME)
    }
    s.addIdx = 0
    s.life = lifeSettings.base
    s.lifePrev = lifeSettings.base
    s.lifeTweenStart = NONE_TIME
    s.rank = Rank.D
    s.rankPrev = Rank.D
    s.rankTime = NONE_TIME
    s.popSim = 0
    s.popStart = NONE_TIME
    for (let i = 0; i < SUB_CHANNELS; i++) s.subStart.set(i, NONE_TIME)
    s.subAbsMs = 0
    s.candPri = 0
    s.candSim = 0
    s.candHit = NONE_TIME
    s.resetSim = 0
    s.resetHit = NONE_TIME
    s.finishType = FinishType.None
    s.finishStart = NONE_TIME
}

export const setupScoreUnit = (s: ContainerType<typeof HudState>) => {
    s.fcc = hudChart.fcc
    s.unit = hudChart.apWeight > 0 ? (hudMeta.apScore * hudChart.fcc) / hudChart.apWeight : 0
}

export const apWeightOf = (op: number, comboBefore: number) => (scorePercentOf(op) / 100) * comboBonusFactor(comboBefore)

const breaks = (j: number) => j === SimJudgement.Miss || j === SimJudgement.Bad
const keepsAp = (j: number) => j === SimJudgement.Perfect || j === SimJudgement.Just

const comboBefore = (s: ContainerType<typeof HudState>, noteTime: number) => {
    let combo = s.baseCombo
    for (let i = 0; i < s.wn; i++) {
        if (s.wT.get(i) >= noteTime) break
        combo = breaks(s.wJ.get(i)) ? 0 : combo + 1
    }
    return combo
}

const comboInsert = (s: ContainerType<typeof HudState>, noteTime: number, j: number) => {
    if (s.wn >= WINDOW) {

        const j0 = s.wJ.get(0)
        s.baseCombo = breaks(j0) ? 0 : s.baseCombo + 1
        if (breaks(j0)) s.baseFc = false
        if (!keepsAp(j0)) s.baseAp = false
        for (let i = 1; i < WINDOW; i++) {
            s.wT.set(i - 1, s.wT.get(i))
            s.wJ.set(i - 1, s.wJ.get(i))
        }
        s.wn = WINDOW - 1
    }

    let k = s.wn
    while (k > 0 && s.wT.get(k - 1) > noteTime) k--
    for (let i = s.wn; i > k; i--) {
        s.wT.set(i, s.wT.get(i - 1))
        s.wJ.set(i, s.wJ.get(i - 1))
    }
    s.wT.set(k, noteTime)
    s.wJ.set(k, j)
    s.wn += 1

    let combo = s.baseCombo
    let fc = s.baseFc
    let ap = s.baseAp
    for (let i = 0; i < s.wn; i++) {
        const jj = s.wJ.get(i)
        const b = breaks(jj)
        combo = b ? 0 : combo + 1
        if (b) fc = false
        if (!keepsAp(jj)) ap = false
    }
    s.combo = combo
    s.fc = fc
    s.ap = ap
}

const judgePercent = (sim: number) => {
    if (sim === SimJudgement.Perfect || sim === SimJudgement.Just) return 100
    if (sim === SimJudgement.Great) return 80
    if (sim === SimJudgement.Good) return 50
    return 0
}

const damageOf = (sim: number) => (sim === SimJudgement.Bad ? 50 : sim === SimJudgement.Miss ? 100 : 0)

export const rankOfScore = (score: number) => {
    if (hudMeta.rankC >= score) return Rank.D
    if (hudMeta.rankB > score) return Rank.C
    if (hudMeta.rankA > score) return Rank.B
    if (hudMeta.rankS > score) return Rank.A
    if (hudMeta.rankSS > score) return Rank.S
    return Rank.SS
}

const XC = 90
const XB = 179
const XA = 266
const XS = 354
const XSS = 441
const XMAX = 507

export const gaugeOfScore = (score: number) => {
    const d = XMAX + 0.0001
    if (hudMeta.rankC >= score) return (XC * (score / (hudMeta.rankC + 0.0001))) / d
    if (hudMeta.rankB > score) return (XC + (XB - XC) * ((score - hudMeta.rankC) / (hudMeta.rankB - hudMeta.rankC))) / d
    if (hudMeta.rankA > score) return (XB + (XA - XB) * ((score - hudMeta.rankB) / (hudMeta.rankA - hudMeta.rankB))) / d
    if (hudMeta.rankS > score) return (XA + (XS - XA) * ((score - hudMeta.rankA) / (hudMeta.rankS - hudMeta.rankA))) / d
    if (hudMeta.rankSS > score) return (XS + (XSS - XS) * ((score - hudMeta.rankS) / (hudMeta.rankSS - hudMeta.rankS))) / d
    return Math.clamp((XSS + (XMAX - XSS) * ((score - hudMeta.rankSS) / (hudMeta.rankMax - hudMeta.rankSS))) / d, 0, 1)
}

const popupPriority = (sim: number) => {
    if (sim === SimJudgement.Miss) return 1
    if (sim === SimJudgement.Bad) return 2
    if (sim === SimJudgement.Good) return 3
    if (sim === SimJudgement.Great) return 5
    if (sim === SimJudgement.Perfect) return 10
    if (sim === SimJudgement.Just) return 20
    return 0
}

export const hudBeginBatch = (s: ContainerType<typeof HudState>) => {
    s.candPri = 0
    s.resetSim = 0
}

export const subTimingShown = (sim: number, timing: number) => {
    if (timing !== 1 && timing !== 2 && !(timing === 0 && options.judgeOffsetMsDisplay)) return false
    if (options.perfectFastSlowDisplay) return sim === SimJudgement.Good || sim === SimJudgement.Great || sim === SimJudgement.Perfect || sim === SimJudgement.Bad
    if (options.fastSlowDisplay) return sim === SimJudgement.Good || sim === SimJudgement.Great || sim === SimJudgement.Bad
    return false
}

export const hudFoldJudgement = (
    s: ContainerType<typeof HudState>,
    sim: number,
    op: number,
    timing: number,
    diffMs: number,
    noteTime: number,
    hit: number,
    withScore: boolean,
) => {
    if (withScore) {

        const cb = comboBefore(s, noteTime)
        const notePct = scorePercentOf(op)
        const jp = judgePercent(sim)
        let add = 0
        if (jp > 0 && s.fcc > 0) {
            const perNote = Math.floor(((jp / 100) * ((notePct / 100) * s.unit) * comboBonusFactor(cb)) / s.fcc)
            add = Math.floor((s.life <= 0 ? 0.3 : 1) * perNote)
        }

        s.score += add

        s.life = Math.max(0, s.life - damageOf(sim))
    }

    comboInsert(s, noteTime, sim)

    const tier = options.continuationEffectDisplay ? (s.ap ? 2 : s.fc ? 1 : 0) : 0
    if (s.combo !== s.comboShown || tier !== s.tierShown) {
        const prev = s.comboShown
        s.comboShown = s.combo
        s.tierShown = tier
        if (s.combo <= 0) {
            s.comboInitTime = hit
        } else {
            s.comboLast = s.combo
            s.tierLast = tier
            if (prev !== s.combo) s.comboAddTime = hit
        }
    }

    const pri = popupPriority(sim)
    if (pri > s.candPri) {
        s.candPri = pri
        s.candSim = sim
        s.candHit = hit
    }
    if (breaks(sim) && pri > popupPriority(s.resetSim)) {
        s.resetSim = sim
        s.resetHit = hit
    }

    if (subTimingShown(sim, timing)) {
        s.subStart.set(timing, hit)
        s.subAbsMs = subAbsWith(s.subAbsMs, timing, diffMs)
    }

    if (withScore) {
        s.judged += 1
        if (s.judged >= s.fcc && s.finishType === FinishType.None) {

            s.finishStart = Math.max(hit, hudChart.passDone)
            if (s.life < 1) s.finishType = FinishType.LiveFailure
            else if (s.ap) s.finishType = FinishType.PerfectCombo
            else if (s.fc) s.finishType = FinishType.FullCombo
            else s.finishType = FinishType.LiveClear
        }
    }
}

export const hudEndBatch = (s: ContainerType<typeof HudState>) => {
    if (s.candPri <= 0) return
    if (s.resetSim > 0) {
        s.popSim = s.resetSim
        s.popStart = s.resetHit
        return
    }
    s.popSim = s.candSim
    s.popStart = s.candHit
}

export const JudgeResultPosition = { Center: 0, Lane: 1, None: 2 } as const

export const POPUP_POOL = 8
export const POPUP_SHOW_S = 0.3

export const POPUP_LANE_BUFFER = 4
export const hudPopupPool = levelMemory({
    start: Tuple(POPUP_POOL, Number),
    sim: Tuple(POPUP_POOL, Number),
    lane: Tuple(POPUP_POOL, Number),
    c: Tuple(POPUP_POOL, Number),

    subStart: Tuple(POPUP_POOL * SUB_CHANNELS, Number),

    subAbsMs: Tuple(POPUP_POOL, Number),
})

export const resetPopupPool = () => {
    for (let i = 0; i < POPUP_POOL; i++) {
        hudPopupPool.start.set(i, NONE_TIME)
        hudPopupPool.sim.set(i, 0)
        hudPopupPool.lane.set(i, 0)
        hudPopupPool.c.set(i, 11.5)
        hudPopupPool.subAbsMs.set(i, 0)
    }
    for (let i = 0; i < POPUP_POOL * SUB_CHANNELS; i++) hudPopupPool.subStart.set(i, NONE_TIME)
}

const poolActive = (i: number, now: number) => hudPopupPool.start.get(i) !== NONE_TIME && now - hudPopupPool.start.get(i) < POPUP_SHOW_S

export const popupPoolShow = (sim: number, timing: number, diffMs: number, hit: number, c: number, comboReset: boolean, now: number) => {
    const centerFloat = c + 0.5
    if (!(centerFloat >= 0 && centerFloat < 24)) return
    const laneIdx = Math.floor(c + 1e-6)
    let best = -1
    let bestD = 1e9
    for (let i = 0; i < POPUP_POOL; i++) {
        if (!poolActive(i, now)) continue
        const d = Math.abs(hudPopupPool.lane.get(i) - laneIdx)
        if (d <= POPUP_LANE_BUFFER && d < bestD) {
            bestD = d
            best = i
        }
    }
    if (best < 0) {
        for (let i = 0; i < POPUP_POOL; i++) {
            if (poolActive(i, now)) continue
            best = i
            break
        }
    }
    if (best < 0) best = 0
    const hidden = comboReset && sim !== SimJudgement.Miss && sim !== SimJudgement.Bad
    if (!hidden) {
        hudPopupPool.start.set(best, hit)
        hudPopupPool.sim.set(best, sim)
        hudPopupPool.lane.set(best, laneIdx)
        hudPopupPool.c.set(best, c)
    } else if (!poolActive(best, now)) {

        hudPopupPool.lane.set(best, laneIdx)
        hudPopupPool.c.set(best, c)
    }

    if (subTimingShown(sim, timing)) {
        hudPopupPool.subStart.set(best * SUB_CHANNELS + timing, hit)
        hudPopupPool.subAbsMs.set(best, subAbsWith(hudPopupPool.subAbsMs.get(best), timing, diffMs))
    }
}

export const hudCommitFrameViews = (s: ContainerType<typeof HudState>, score0: number, life0: number, at: number) => {
    if (s.score > score0) {
        s.scorePrev = score0
        s.scoreTweenStart = at
        s.addVal.set(s.addIdx, s.score - score0)
        s.addStart.set(s.addIdx, at)
        s.addIdx = s.addIdx + 1 < 3 ? s.addIdx + 1 : 0

        const r = rankOfScore(s.score)
        if (r !== s.rank) {
            s.rankPrev = s.rank
            s.rank = r
            s.rankTime = at
        }
    }
    if (s.life !== life0) {
        s.lifePrev = life0
        s.lifeTweenStart = at
    }
}
