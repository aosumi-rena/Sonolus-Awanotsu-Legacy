import { viewProgress } from '../../../../../../shared/src/engine/data/geometry.js'
import { ExportName } from '../../../../../../shared/src/engine/data/level.js'
import {
    NoteDirection,
    NoteOp,
    SimJudgement,
    areaOffsetTypeOf,
    freezesAfterJudge,
    judgementTypeOf,
    skinUnitOfView,
    viewTypeOf,
} from '../../../../../../shared/src/engine/data/notes.js'
import {
    DIFF_INT_MAX,
    DIFF_INT_MIN,
    TimingCode,
    areaOffsetLanes,
    autoMissAfterMs,
    judgeDiffMs,
    missAfterMs,
    routingAfterMs,
    routingBeforeMs,
    timingCode,
    toSonolusJudgment,
} from '../../../../../../shared/src/engine/data/windows.js'
import { options } from '../../../configuration/options.js'
import { autoSfxOn, scheduleAutoNoteSfx } from '../../autoSfx.js'
import { EffectIds, noteFlashAlpha, requestJudgeLaneFlood, resolveNoteEffectIds } from '../../hookEffects.js'
import { hudPushJudgement } from '../../hud/hudQueue.js'
import { onNoteJudged } from '../../hooks.js'
import { inHitArea, layout, noteX, noteY, viewCenter, viewWidth } from '../../layout.js'
import { note } from '../../note.js'
import { NoteParts, applyRhythmSupport, computeNoteParts, noteRootOrder, drawNoteMark, drawNoteParts, unitHasMark } from '../../noteRender.js'
import { arrowDisable, arrowEnable, rentGradient, returnGradient } from '../../arrowSync.js'
import { hasHoneycombGradient } from '../../honeycombGradient.js'
import { bucketIndexOf } from '../../bucketMap.js'
import {
    STOP_IN_VAIN_S,
    inVainGuardFrom,
    inVainGuardTo,
    lanePairOf,
    pairCentreEdge,
} from '../../../../../../shared/src/engine/data/inputLane.js'
import { onEmptyTapParallel } from '../../hooks.js'
import {
    claimPress,
    claimTouch,
    flickBeginEdge,
    flickDirX,
    flickedNow,
    guardInVainLanes,
    isClaimedBy,
    isPairInVainGuarded,
    markTouchUsed,
} from '../InputManager.js'
import { NO_LANE, edgeOfTouchX, laneOfScreenX } from '../inputLane.js'
import { archetypes } from '../index.js'
import { Note } from './Note.js'

const judgeShift = () => input.offset + options.noteTiming / 1000

const touchJudgeTime = (t: number) => t - options.noteTiming / 1000

const GAME_FRAME_S = 1 / 60

const EARLY_GATE_SLACK_S = 0.25

export const InputMode = {

    Tap: 0,

    Flick: 1,

    SlideEnd: 2,

    Trace: 3,
} as const

export abstract class VisibleNote extends Note {
    hasInput = true
    hasRhythmSupport = false

    abstract inputMode: number

    abstract hasArrow: boolean

    abstract drawn: boolean

    abstract lineBegin: boolean

    guardsInVain = false

    export = this.defineExport({
        sim: { name: ExportName.Sim, type: Number },
        timing: { name: ExportName.Timing, type: Number },
        dirMismatch: { name: ExportName.DirMismatch, type: Number },
    })

    n = this.entityMemory({

        jt: Number,

        area: Number,

        c: Number,
        w: Number,

        unit: Number,

        missTime: Number,
        inputMin: Number,

        missAdj: Number,

        inputMax: Number,

        unitLo: Number,
        unitHi: Number,

        claimed: Boolean,
        claimTouch: TouchId,
        claimIndex: Number,

        claimTime: Number,

        pairIndex: Number,
        pairFlicked: Boolean,

        flickReserved: Boolean,
        flickTime: Number,
        flickBeginEdge: Number,

        done: Boolean,
        doneMissed: Boolean,
        dirMismatch: Boolean,

        pSim: Number,
        pTiming: Number,
        pDiffMs: Number,
        pHit: Number,

        arrowT0: Number,
        arrowReady: Boolean,

        vainEdge: Number,
    })
    parts = this.entityMemory(NoteParts)
    fx = this.entityMemory(EffectIds)

    preprocess() {
        super.preprocess()

        this.life.miss = -100

        if (autoSfxOn()) scheduleAutoNoteSfx(this.import.op, this.import.dir, this.fx, this.targetTime)
    }

    initialize() {
        const op = this.import.op
        const crit = this.import.crit > 0
        this.n.jt = judgementTypeOf(op, crit)

        this.n.area = areaOffsetLanes(areaOffsetTypeOf(op, crit), this.import.size)
        this.n.c = viewCenter(this.import.pos, this.import.size)
        this.n.w = viewWidth(this.import.pos, this.import.size)
        this.n.unit = skinUnitOfView(viewTypeOf(op, this.import.dir))
        if (this.drawn && this.n.unit >= 0) computeNoteParts(this.n.unit, this.n.c, this.n.w, this.parts)
        if (this.hasRhythmSupport && options.rhythmSupport) applyRhythmSupport(this.n.unit, this.import.rhythmSupportClass, this.parts)
        resolveNoteEffectIds(op, this.import.dir, this.fx)

        const shift = judgeShift()
        const adj = Math.abs(shift) * 1000

        this.n.missAdj = note.missTime(this.targetTime, autoMissAfterMs(this.n.jt, adj))
        this.n.missTime = this.n.missAdj + shift

        this.n.inputMin = this.targetTime - routingBeforeMs(this.n.jt, adj) / 1000 + shift

        this.n.inputMax = this.targetTime + routingAfterMs(this.n.jt, adj) / 1000 + shift
        this.n.unitLo = this.targetTime - routingBeforeMs(this.n.jt, adj) / 1000
        this.n.unitHi = this.targetTime + routingAfterMs(this.n.jt, adj) / 1000
        this.n.claimed = false
        this.n.arrowReady = false
        this.n.flickReserved = false
        this.n.flickBeginEdge = -1000
        this.n.vainEdge = -1

        this.result.accuracy = missAfterMs(this.n.jt) / 1000
    }

    get nowAdj() {
        return time.now - judgeShift()
    }

    touchOrder = 1
    touch() {
        if (this.n.done) return

        if (this.guardsInVain && time.now < this.n.missTime) this.guardInVain()
        if (time.now < this.n.inputMin - EARLY_GATE_SLACK_S) return
        this.touchInput()
    }

    gameFrameOf(t: number) {
        return Math.min(Math.max(this.nowAdj, t), t + GAME_FRAME_S)
    }

    heldFrame() {
        return Math.min(this.nowAdj, Math.max(this.nowAdj - time.delta, this.targetTime) + GAME_FRAME_S)
    }

    liveAt(f: number) {
        return f < this.n.missAdj && (!this.lineBegin || this.line.endT <= 0 || f + judgeShift() < this.line.endT + 0.001)
    }

    abstract touchInput(): void

    guardInVain() {
        if (Math.abs(time.now - this.targetTime) > STOP_IN_VAIN_S) return
        guardInVainLanes(inVainGuardFrom(this.import.lane, this.n.area), inVainGuardTo(this.import.lane, this.import.width, this.n.area))
    }

    inArea(x: number) {
        return inHitArea(edgeOfTouchX(x), this.import.pos, this.import.size, this.n.area)
    }

    inWindow(t: number) {
        return t >= this.n.unitLo && t < this.n.unitHi + 0.001
    }

    unitTime(touch: Touch) {
        return touch.ended ? touchJudgeTime(touch.time) : touch.started ? touchJudgeTime(touch.startTime) : this.heldFrame()
    }

    unitFrame(touch: Touch) {
        return touch.ended || touch.started ? this.gameFrameOf(this.unitTime(touch)) : this.heldFrame()
    }

    priorityDiffAt(f: number) {
        return Math.abs(f - this.targetTime)
    }

    touchTap() {
        for (const touch of touches) {
            if (!touch.started) continue
            if (!this.inArea(touch.position.x)) continue

            const pressTime = touchJudgeTime(touch.startTime)
            if (!this.inWindow(pressTime)) continue
            if (!this.liveAt(this.gameFrameOf(pressTime))) continue
            if (this.n.claimed &&
                !inHitArea(edgeOfTouchX(touch.position.x), this.import.pos, this.import.size, 0) &&
                inHitArea(edgeOfTouchX(touches.get(this.n.claimIndex).position.x), this.import.pos, this.import.size, 0)) continue
            this.n.claimed = true
            this.n.claimTouch = touch.id
            this.n.claimIndex = touch.index
            this.n.claimTime = pressTime
        }
        if (!this.n.claimed) return
        claimPress(touches.get(this.n.claimIndex), this.info.index, this.import.ms, this.import.pos, this.import.size, this.n.claimTime, false)
    }

    touchFlick() {
        const waitingForGesture = !this.n.flickReserved
        this.updateFlickInput()
        if (!waitingForGesture || this.n.flickReserved || this.n.claimed) return
        if (this.import.op !== NoteOp.Flick && this.import.op !== NoteOp.SlideBeginFlick && this.import.op !== NoteOp.GuideBeginFlick) return

        for (const touch of touches) {
            if (!touch.started || touch.ended || !this.inArea(touch.position.x)) continue
            const pressTime = touchJudgeTime(touch.startTime)
            if (!this.inWindow(pressTime) || !this.liveAt(this.gameFrameOf(pressTime))) continue
            claimPress(touch, this.info.index, this.import.ms, this.import.pos, this.import.size, pressTime, true)
        }
    }

    updateFlickInput() {
        this.n.pairIndex = -1
        this.n.pairFlicked = false
        for (const touch of touches) {
            const flicked = flickedNow(touch)
            const inBegin = flicked && inHitArea(flickBeginEdge(touch), this.import.pos, this.import.size, this.n.area)
            if (!inBegin && !this.inArea(touch.position.x)) continue

            if (this.n.pairIndex < 0 || (flicked && !this.n.pairFlicked)) {
                this.n.pairIndex = touch.index
                this.n.pairFlicked = flicked
            }
        }
        if (this.n.pairIndex < 0) return
        const unit = touches.get(this.n.pairIndex)

        if (!this.inWindow(this.unitTime(unit))) return
        const f = this.unitFrame(unit)
        if (!this.liveAt(f)) return
        if (this.n.pairFlicked) {
            const dx = flickDirX(unit)
            const mismatch =
                (this.import.dir === NoteDirection.Left && dx > 0) || (this.import.dir === NoteDirection.Right && dx < 0)
            if (!mismatch || !options.flickDirectionCheck) {
                this.n.flickReserved = true
                this.n.flickTime = touchJudgeTime(unit.time)
                this.n.flickBeginEdge = flickBeginEdge(unit)
                this.n.dirMismatch = mismatch
            }
        }
        if (!this.n.flickReserved) return
        if (!inHitArea(this.n.flickBeginEdge, this.import.pos, this.import.size, this.n.area)) return

        if (unit.ended || (!unit.started && f >= this.targetTime)) {
            claimTouch(unit, this.info.index, this.priorityDiffAt(f), this.n.flickTime)
            this.n.claimed = true
            this.n.claimTouch = unit.id
            this.n.claimIndex = unit.index
            this.n.claimTime = this.n.flickTime
        }
    }

    touchHold() {
        this.n.pairIndex = -1
        for (const touch of touches) {
            if (!this.inArea(touch.position.x)) continue
            if (this.n.pairIndex < 0 || (!touch.started && !touch.ended)) this.n.pairIndex = touch.index
        }
        if (this.n.pairIndex < 0) return
        const unit = touches.get(this.n.pairIndex)

        if (!this.inWindow(this.unitTime(unit))) return

        const f = this.unitFrame(unit)
        if (!this.liveAt(f)) return
        if (this.inputMode === InputMode.SlideEnd && f >= this.n.unitHi + 0.001) return
        const exit = unit.ended
        const reached = f >= this.targetTime

        if (this.inputMode === InputMode.SlideEnd && unit.started && !exit) return

        if (!exit && !reached) return
        this.complete(exit ? touchJudgeTime(unit.time) : this.targetTime)
        this.markAreaFingersUsed()
    }

    markAreaFingersUsed() {
        if (this.n.pSim < SimJudgement.Good) return
        for (const touch of touches) {
            if (touch.ended) continue
            if (this.inArea(touch.position.x)) markTouchUsed(touch)
        }
    }

    inVainAt(x: number) {
        const lane = laneOfScreenX(x)
        if (lane === NO_LANE) return
        if (isPairInVainGuarded(lanePairOf(lane))) return
        onEmptyTapParallel(pairCentreEdge(lanePairOf(lane)))

        this.n.vainEdge = pairCentreEdge(lanePairOf(lane))
    }

    updateSequential() {

        if (this.hasArrow && !this.n.arrowReady) {
            this.n.arrowT0 = hasHoneycombGradient() ? rentGradient(this.import.dir) : arrowEnable(this.info.index)
            this.n.arrowReady = true
        }
        if (!this.n.done) return
        if (this.hasArrow) {
            if (hasHoneycombGradient()) returnGradient(this.import.dir,this.n.arrowT0)
            else arrowDisable(this.info.index)
        }
        this.flushLineState()
        this.pushHud()

        requestJudgeLaneFlood(this.fx, this.n.pSim, this.edgeL, this.edgeR, this.n.vainEdge, this.n.pHit, options.laneEffectEnabled, this.n.c, this.n.w, options.noteEffectEnabled)
        this.despawn = true
    }

    updateParallel() {
        if (this.n.done) return

        const byClaim = this.n.claimed && isClaimedBy(this.n.claimIndex, this.n.claimTouch, this.info.index)
        if (this.n.claimed && !byClaim) this.n.claimed = false
        const forced = this.lineBegin && this.line.forceMiss
        const byFlick = !byClaim && !forced && this.tryReservedFlick()
        if (byClaim || byFlick) {
            this.judge(byFlick ? this.n.flickTime : this.n.claimTime)
            if (byClaim) this.afterClaimJudge()
            this.publish()
            this.n.done = true
            return
        }

        if (forced) {
            this.forceMissResult()
            this.publishMiss()
            this.n.done = true
            return
        }
        if (time.now >= this.n.missTime) {
            this.missResult()
            this.publishMiss()
            this.n.done = true
            return
        }
        this.render()
    }

    abstract tryReservedFlick(): boolean

    abstract afterClaimJudge(): void

    judge(hitTime: number) {
        const diff = hitTime - this.targetTime

        const diffMs = Math.floor(diff * 1000 + 1e-6)
        const sim = judgeDiffMs(this.n.jt, diffMs)
        this.result.judgment = toSonolusJudgment(sim)
        this.result.accuracy = diff
        this.result.bucket.index = bucketIndexOf(this.n.jt, this.import.op, this.import.dir)
        this.result.bucket.value = diff * 1000

        this.n.pSim = sim
        this.n.pTiming = timingCode(diffMs)
        this.n.pDiffMs = diffMs

        this.n.pHit = time.now
    }

    missResult() {
        this.result.judgment = Judgment.Miss
        this.n.pSim = SimJudgement.Miss
        this.n.pTiming = TimingCode.Last
        this.n.pDiffMs = DIFF_INT_MAX
        this.n.pHit = time.now
    }

    forceMissResult() {
        this.result.judgment = Judgment.Miss
        this.result.accuracy = this.nowAdj - this.targetTime
        this.n.pSim = SimJudgement.Miss
        this.n.pTiming = TimingCode.Forced
        this.n.pDiffMs = DIFF_INT_MIN
        this.n.pHit = time.now
    }

    publish() {
        const sim = this.n.pSim
        this.exportPending(sim)
        onNoteJudged(this.fx, sim, this.n.c, this.n.w, this.edgeL, this.edgeR)
    }

    publishMiss() {
        this.exportPending(SimJudgement.Miss)
    }

    exportPending(sim: number) {
        this.export('sim', sim)
        this.export('timing', this.n.pTiming)
        this.export('dirMismatch', this.n.dirMismatch ? 1 : 0)
        this.n.doneMissed = sim === SimJudgement.Miss || sim === SimJudgement.Bad
    }

    complete(hitTime: number) {
        this.judge(hitTime)
        this.publish()
        this.flushLineState()
        this.pushHud()
        requestJudgeLaneFlood(this.fx, this.n.pSim, this.edgeL, this.edgeR, -1, this.n.pHit, options.laneEffectEnabled, this.n.c, this.n.w, options.noteEffectEnabled)
        this.n.done = true
        this.despawn = true
    }

    pushHud() {
        hudPushJudgement(this.n.pSim, this.import.op, this.n.pTiming, this.n.pDiffMs, this.targetTime, this.n.pHit, this.n.c, this.n.w)
    }

    flushLineState() {
        this.line.done = true
        if (this.n.doneMissed) this.flagLineMiss()
        if (!this.lineBegin) return
        this.line.judged = true
        this.line.missed = this.n.doneMissed
        this.line.beginGood = !this.n.doneMissed
    }

    flagLineMiss() {
        if (this.import.line0 > 0) archetypes.TapNote.line.get(this.import.line0).missCount += 1
        else if (this.lineBegin) this.line.missCount += 1
        if (this.import.line1 > 0) archetypes.TapNote.line.get(this.import.line1).missCount += 1
    }

    render() {
        if (this.n.unit < 0) return
        let p = note.progress(this.targetTime)
        if (options.hidden > 0 && p > 1 - options.hidden) return

        if (p > 1 && freezesAfterJudge(this.import.op)) p = 1
        const v = viewProgress(p)
        const px = noteX(this.n.c, v)
        const py = noteY(v)
        if (py > layout.maskY) return

        const root = noteRootOrder(px, py)
        drawNoteParts(this.n.unit, this.parts, px, py, v, 1, noteFlashAlpha(this.n.c, this.n.w, p), this.hasRhythmSupport, root, this.info.index)
        if (unitHasMark(this.n.unit)) drawNoteMark(this.n.unit, px, py, v, 1, this.hasRhythmSupport ? this.parts.mainId : 0, root, this.info.index)
        this.drawArrow(px, py, v, root)
    }

    abstract drawArrow(px: number, py: number, v: number, root: number): void
}
