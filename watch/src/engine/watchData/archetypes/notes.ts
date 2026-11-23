import { EngineArchetypeDataName } from '@sonolus/core'
import { LANE_COUNT, viewProgress } from '../../../../../shared/src/engine/data/geometry.js'
import { DataName, ExportName } from '../../../../../shared/src/engine/data/level.js'
import {
    NoteDirection,
    SimJudgement,
    areaOffsetTypeOf,
    freezesAfterJudge,
    isFlickOp,
    judgementTypeOf,
    skinUnitOfView,
    viewTypeOf,
} from '../../../../../shared/src/engine/data/notes.js'
import { missAfterMs } from '../../../../../shared/src/engine/data/windows.js'
import { options } from '../../../../../play/src/engine/configuration/options.js'
import { bucketIndexOf } from '../../../../../play/src/engine/playData/bucketMap.js'
import { EffectIds, LANE_QUEUE_LEAD, enqueueLaneFlood, noteFlashAlpha, playJudgeEffects, resolveNoteEffectIds, scheduleJudgeSfx } from '../../../../../play/src/engine/playData/hookEffects.js'
import { chartTime, layout, noteX, noteY, viewCenter, viewWidth } from '../../../../../play/src/engine/playData/layout.js'
import { note } from '../../../../../play/src/engine/playData/note.js'
import { gradientPeriod, gradientSlots, hasHoneycombGradient } from '../../../../../play/src/engine/playData/honeycombGradient.js'
import { noteSfxOn } from '../../../../../play/src/engine/playData/seGroups.js'
import { foldWatchFinish } from '../liveSeWatch.js'
import {
    NoteParts,
    computeNoteParts, noteRootOrder,
    applyRhythmSupport,
    drawFlickArrow,
    drawNoteMark,
    drawNoteParts,
    unitHasMark,
} from '../../../../../play/src/engine/playData/noteRender.js'

export abstract class Note extends Archetype {
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        ms: { name: DataName.Ms, type: Number },
        pos: { name: DataName.Pos, type: Number },
        size: { name: DataName.Size, type: Number },
        lane: { name: DataName.Lane, type: Number },
        width: { name: DataName.Width, type: Number },
        crit: { name: DataName.Crit, type: Number },
        dir: { name: DataName.Dir, type: Number },
        op: { name: DataName.Op, type: Number },
        fever: { name: DataName.Fever, type: Number },
        judgment: { name: EngineArchetypeDataName.Judgment, type: DataType<Judgment>, def: Judgment.Perfect },
        accuracy: { name: EngineArchetypeDataName.Accuracy, type: Number, def: 0 },
        sim: { name: ExportName.Sim, type: Number, def: SimJudgement.Perfect },
        timing: { name: ExportName.Timing, type: Number, def: 0 },
        rhythmSupportClass: { name: DataName.RhythmSupportClass, type: Number },
    })

    line = this.defineSharedMemory({
        holdActive: Boolean,
        holdSfx: LoopedEffectClipInstanceId,
        holdFx: ParticleEffectInstanceId,

        arrowT0: Number,
        arrowBase: Boolean,

        bT: Number,
        bMinX: Number,
        bMaxX: Number,
        bMinY: Number,
        bMaxY: Number,
    })

    targetTime = this.entityMemory(Number)

    preprocess() {
        this.targetTime = chartTime(this.import.ms)
        if (options.mirror) {
            this.import.pos = LANE_COUNT - this.import.pos - this.import.size
            this.import.lane = LANE_COUNT - this.import.lane - this.import.width
            if (this.import.dir === NoteDirection.Left) this.import.dir = NoteDirection.Right
            else if (this.import.dir === NoteDirection.Right) this.import.dir = NoteDirection.Left
        }
    }

    get hitTime() {
        if (!replay.isReplay) return this.targetTime
        const missAfter = missAfterMs(judgementTypeOf(this.import.op, this.import.crit > 0))
        if (this.import.judgment === Judgment.Miss && Math.abs(this.import.accuracy * 1000 - missAfter) < 1e-3)
            return note.missTime(this.targetTime, missAfter)
        return this.targetTime + this.import.accuracy
    }

    get sim() {
        if (!replay.isReplay) return SimJudgement.Perfect
        if (this.import.judgment === Judgment.Miss) return this.import.sim === SimJudgement.Bad ? SimJudgement.Bad : SimJudgement.Miss
        if (this.import.sim > 0) return this.import.sim
        if (this.import.judgment === Judgment.Good) return SimJudgement.Good
        if (this.import.judgment === Judgment.Great) return SimJudgement.Great
        return SimJudgement.Perfect
    }

    get edgeL() {
        return this.import.pos
    }
    get edgeR() {
        return this.import.pos + this.import.size
    }
}

const watchArrowSync = levelMemory({ started: Boolean, origin: Number, end: Number })
const createGradientPool = () => levelMemory({count:Tuple(3,Number),until:Tuple(3*gradientSlots,Number),phase:Tuple(3*gradientSlots,Number)})
let gradientPool: ReturnType<typeof createGradientPool>
export const allocateWatchGradientPool = () => { gradientPool = createGradientPool() }

const watchGradientOrigin = (dir: number, spawn: number, hit: number) => {
    const base = dir*gradientSlots
    const count = gradientPool.count.get(dir)
    let slot = -1
    let last = -1e10
    for (let i=0; i<count; i++) {
        const end = gradientPool.until.get(base+i)
        if (end <= spawn && end >= last) {
            last = end
            slot = i
        }
    }
    if (slot < 0) {
        if (count >= gradientSlots) return spawn
        slot = count
        gradientPool.count.set(dir,count+1)
    }
    const origin = spawn-gradientPool.phase.get(base+slot)
    gradientPool.until.set(base+slot,hit)
    gradientPool.phase.set(base+slot,Math.mod(hit-origin,gradientPeriod))
    return origin
}

export class PassNote extends Note {
    spawnTime() {
        return this.targetTime
    }
    despawnTime() {
        return this.targetTime
    }
}

export abstract class VisibleNote extends Note {
    hasInput = true
    hasRhythmSupport = false

    abstract hasArrow: boolean

    n = this.entityMemory({ c: Number, w: Number, unit: Number, hit: Number, queued: Boolean })
    parts = this.entityMemory(NoteParts)
    fx = this.entityMemory(EffectIds)

    preprocess() {
        super.preprocess()
        this.life.miss = -100

        const hit = this.hitTime
        this.result.time = this.targetTime
        if (!replay.isReplay || this.import.judgment !== Judgment.Miss) {
            this.result.bucket.index = bucketIndexOf(judgementTypeOf(this.import.op, this.import.crit > 0), this.import.op, this.import.dir)
            this.result.bucket.value = replay.isReplay ? this.import.accuracy * 1000 : 0
        }

        if (noteSfxOn()) {
            resolveNoteEffectIds(this.import.op, this.import.dir, this.fx)
            scheduleJudgeSfx(this.fx, this.sim, hit)
        }

        if (options.sfxEnabled) foldWatchFinish(this.sim, hit)

        if (isFlickOp(this.import.op)) {
            const spawn = note.spawnTime(this.targetTime)
            if (hasHoneycombGradient()) {
                this.line.arrowT0 = watchGradientOrigin(this.import.dir,spawn,hit)
                return
            }
            const alive = watchArrowSync.started && spawn < watchArrowSync.end
            this.line.arrowT0 = alive ? watchArrowSync.origin : spawn
            this.line.arrowBase = !alive
            watchArrowSync.origin = alive ? watchArrowSync.origin : spawn
            watchArrowSync.end = alive ? watchArrowSync.end : hit
            watchArrowSync.started = true
        }
    }

    spawnTime() {
        return note.spawnTime(this.targetTime)
    }

    despawnTime() {
        return this.hitTime
    }

    initialize() {
        this.n.c = viewCenter(this.import.pos, this.import.size)
        this.n.w = viewWidth(this.import.pos, this.import.size)
        this.n.unit = skinUnitOfView(viewTypeOf(this.import.op, this.import.dir))
        if (this.n.unit >= 0) computeNoteParts(this.n.unit, this.n.c, this.n.w, this.parts)
        if (this.hasRhythmSupport && options.rhythmSupport) applyRhythmSupport(this.n.unit, this.import.rhythmSupportClass, this.parts)
        resolveNoteEffectIds(this.import.op, this.import.dir, this.fx)
        this.n.hit = this.hitTime
    }

    updateSequential() {
        if (time.skip) this.n.queued = false
        if (this.n.queued || !(options.laneEffectEnabled || options.noteEffectEnabled)) return
        if (this.n.hit - time.now > LANE_QUEUE_LEAD) return

        enqueueLaneFlood(this.fx, this.sim, this.edgeL, this.edgeR, this.n.hit, this.n.c, this.n.w, options.laneEffectEnabled, options.noteEffectEnabled)
        this.n.queued = true
    }

    updateParallel() {
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

    terminate() {
        if (time.skip) return

        playJudgeEffects(this.fx, this.sim, this.n.c, this.n.w, this.edgeL, this.edgeR, false, options.noteEffectEnabled, false)
    }
}

export const watchAreaOffsetTypeOf = areaOffsetTypeOf

export abstract class PlainNote extends VisibleNote {
    hasArrow = false
    drawArrow(_px: number, _py: number, _v: number) {}
}

export abstract class ArrowNote extends VisibleNote {
    hasArrow = true
    drawArrow(px: number, py: number, v: number, root: number) {
        drawFlickArrow(this.import.dir, this.n.w, px, py, v, 1, this.line.arrowT0, this.hasRhythmSupport && options.rhythmSupport ? this.import.rhythmSupportClass : 0, root, this.info.index)
    }
}

export class TapNote extends PlainNote { hasRhythmSupport = true }
export class FlickNote extends ArrowNote { hasRhythmSupport = true }
export class TraceNote extends PlainNote {}
export class SlideStartNote extends PlainNote { hasRhythmSupport = true }
export class SlideStartFlickNote extends ArrowNote { hasRhythmSupport = true }
export class SlideStartTraceNote extends PlainNote {}
export class SlideHiddenStartNote extends PassNote {}
export class SlideTickNote extends PlainNote {}
export class SlideTraceTickNote extends PlainNote {}
export class SlideAnchorNote extends PassNote {}
export class SlideComboNote extends PlainNote {}
export class SlideComboSkipNote extends PassNote {}
export class SlideEndNote extends PlainNote {}
export class SlideEndFlickNote extends ArrowNote {}
export class SlideEndTraceNote extends PlainNote {}
export class SlideHiddenEndNote extends PassNote {}
export class GuideStartNote extends PlainNote {}
export class GuideStartFlickNote extends ArrowNote {}
export class GuideStartTraceNote extends PlainNote {}
export class GuideHiddenStartNote extends PassNote {}
export class GuideAnchorNote extends PassNote {}
export class GuideEndTraceNote extends PlainNote {}
export class GuideHiddenEndNote extends PassNote {}
