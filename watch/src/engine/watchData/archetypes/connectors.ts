import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { isJudgementOp } from '../../../../../shared/src/engine/data/notes.js'
import { LineState } from '../../../../../shared/src/engine/data/slideLine.js'
import { missAfterMs } from '../../../../../shared/src/engine/data/windows.js'
import { judgementTypeOf } from '../../../../../shared/src/engine/data/notes.js'
import { options } from '../../../../../play/src/engine/configuration/options.js'
import { effect } from '../../../../../play/src/engine/playData/effect.js'
import { SeFamily, SeSlot, noteSeClip, noteSfxOn } from '../../../../../play/src/engine/playData/seGroups.js'
import { markHoldFx, moveHoldFx, startHoldFx, stopHoldFx } from '../../../../../play/src/engine/playData/hookEffects.js'
import { chartTime, judgeX, layout, noteY } from '../../../../../play/src/engine/playData/layout.js'
import { note } from '../../../../../play/src/engine/playData/note.js'
import { camZ } from '../../../../../play/src/engine/playData/noteRender.js'
import { layer, skin } from '../../../../../play/src/engine/playData/skin.js'
import {
    LineRow,
    UnitBounds,
    drawUnitBody,
    heldHeadCenter,
    heldHeadWidth,
    lineMeshBoundsCentre,
    publishUnitBounds,
} from '../../../../../play/src/engine/playData/slideBody.js'
import { archetypes } from './index.js'

const holdVoice = levelMemory({ active: Boolean, end: Number })
const addHoldVoiceSpan = (s: number, e: number) => {
    if (e <= s) return

    const clipId = noteSeClip(SeSlot.SlideLoop, SeFamily.Slide, effect.clips.fbHold)
    if (clipId < 0) return
    const clip = clipId as EffectClipId
    if (holdVoice.active && s <= holdVoice.end) {
        if (e <= holdVoice.end) return
        const id = effect.clips.scheduleLoop(clip, holdVoice.end)
        effect.clips.scheduleStopLoop(id, e)
        holdVoice.end = e
        return
    }
    const id = effect.clips.scheduleLoop(clip, s)
    effect.clips.scheduleStopLoop(id, e)
    holdVoice.active = true
    holdVoice.end = e
}

export abstract class LineConnector extends Archetype {
    import = this.defineImport({
        headRef: { name: DataName.Head, type: Number },
        tailRef: { name: DataName.Tail, type: Number },
        startRef: { name: DataName.Start, type: Number },
        endRef: { name: DataName.End, type: Number },
        easeL: { name: DataName.EaseL, type: Number },
        easeR: { name: DataName.EaseR, type: Number },
        unit: { name: DataName.Unit, type: Number },
        unitCount: { name: DataName.UnitCount, type: Number },
    })

    abstract isGuide: boolean

    u = this.entityMemory({
        headTime: Number,
        tailTime: Number,
        lineBegin: Number,
        lineEnd: Number,
        hL: Number,
        hR: Number,
        tL: Number,
        tR: Number,
        easeL: Number,
        easeR: Number,
    })
    rowA = this.entityMemory(LineRow)
    rowB = this.entityMemory(LineRow)

    ub = this.entityMemory(UnitBounds)
    m = this.entityMemory({

        beginHit: Number,
        beginMissed: Boolean,

        endHit: Number,

    })

    preprocessOrder = 1
    preprocess() {
        const h = archetypes.TapNote.import.get(this.import.headRef)
        const t = archetypes.TapNote.import.get(this.import.tailRef)
        const s = archetypes.TapNote.import.get(this.import.startRef)
        const e = archetypes.TapNote.import.get(this.import.endRef)
        this.u.headTime = chartTime(h.ms)
        this.u.tailTime = chartTime(t.ms)
        this.u.lineBegin = chartTime(s.ms)
        this.u.lineEnd = chartTime(e.ms)
        this.u.hL = h.pos
        this.u.hR = h.pos + h.size
        this.u.tL = t.pos
        this.u.tR = t.pos + t.size
        this.u.easeL = options.mirror ? this.import.easeR : this.import.easeL
        this.u.easeR = options.mirror ? this.import.easeL : this.import.easeR

        const beginJudged = isJudgementOp(s.op)
        const beginMiss = replay.isReplay > 0 && beginJudged && s.judgment === Judgment.Miss
        this.m.beginMissed = beginMiss

        const beginMissAfter = missAfterMs(judgementTypeOf(s.op, s.crit > 0))
        const beginAuto = beginMiss && Math.abs(s.accuracy * 1000 - beginMissAfter) < 1e-3
        this.m.beginHit = !replay.isReplay || !beginJudged ? this.u.lineBegin : beginAuto ? note.missTime(this.u.lineBegin, beginMissAfter) : this.u.lineBegin + s.accuracy
        const endJudged = isJudgementOp(e.op)
        this.m.endHit = !replay.isReplay || !endJudged || e.judgment === Judgment.Miss ? this.u.lineEnd : this.u.lineEnd + e.accuracy

        if (!this.isGuide && this.import.unit === 0 && noteSfxOn()) {
            const start = this.u.lineBegin
            const end = this.u.lineEnd
            if (!beginMiss) addHoldVoiceSpan(Math.max(start, this.m.beginHit), end)
        }
    }

    get lineCode() {
        if (this.m.beginMissed) return -1
        return time.now >= this.m.beginHit && time.now < this.m.endHit ? 1 : 0
    }

    spawnTime() {
        return note.spawnTime(this.u.headTime)
    }

    despawnTime() {
        return this.u.tailTime
    }

    get lineShared() {
        return archetypes.TapNote.line.get(this.import.startRef)
    }

    get crossing() {
        return time.now >= this.u.headTime && time.now < this.u.tailTime
    }

    get pressed() {
        return this.lineCode === 1 && time.now > this.u.lineBegin
    }

    updateSequential() {
        const ls = this.lineShared

        if (time.skip) this.ub.valid = false
        publishUnitBounds(this.ub, ls)
        if (!this.isGuide && time.skip) {

            ls.holdActive = false
            ls.holdFx = 0 as ParticleEffectInstanceId
        }
        if (this.isGuide || !this.crossing) return

        const c = heldHeadCenter(this.u, time.now)
        const w = heldHeadWidth(this.u, time.now)

        const code = this.lineCode
        if (code === 1 && time.now > this.u.lineBegin && !ls.holdActive) {
            ls.holdActive = true
            ls.holdFx = startHoldFx(options.noteEffectEnabled, c, w)
        } else if (ls.holdActive && code === 1) moveHoldFx(ls.holdFx, c, w)

        if (ls.holdActive) markHoldFx(ls.holdFx)
    }

    terminate() {
        if (this.isGuide || this.import.unit !== this.import.unitCount - 1) return
        const ls = this.lineShared
        if (ls.holdActive) stopHoldFx(ls.holdFx)
    }

    updateParallel() {

        if (time.now >= this.m.endHit) {
            this.ub.valid = false
            return
        }

        const pB = note.unitProgress(this.u.headTime)
        const pE = note.unitProgress(this.u.tailTime)

        const state = this.isGuide ? LineState.Normal : this.pressed ? LineState.Pressed : this.lineCode === -1 ? LineState.Disabled : LineState.Normal
        const ls = this.lineShared
        const lc = lineMeshBoundsCentre(ls.bMinX, ls.bMaxX, ls.bMinY, ls.bMaxY)
        const lineOk = ls.bT === time.now && (ls.bMaxX > ls.bMinX || ls.bMaxY > ls.bMinY)
        drawUnitBody(this.u, pB, pE, this.isGuide, state, this.isGuide ? layout.guideAlpha : layout.slideAlpha, this.rowA, this.rowB, this.ub, lineOk, lc.x, lc.y)
    }
}

export class SlideConnector extends LineConnector {
    isGuide = false
}

export class GuideConnector extends LineConnector {
    isGuide = true
}

export class SimLine extends Archetype {
    import = this.defineImport({
        aRef: { name: DataName.A, type: Number },
        bRef: { name: DataName.B, type: Number },
    })

    m = this.entityMemory({ targetTime: Number, xA: Number, xB: Number, end: Number })

    preprocessOrder = 1
    preprocess() {
        const a = archetypes.TapNote.import.get(this.import.aRef)
        const b = archetypes.TapNote.import.get(this.import.bRef)
        this.m.targetTime = chartTime(a.ms)
        const ca = a.lane + (a.width - 1) / 2
        const cb = b.lane + (b.width - 1) / 2
        this.m.xA = judgeX(Math.min(ca, cb))
        this.m.xB = judgeX(Math.max(ca, cb))

        const t = this.m.targetTime
        const endA = replay.isReplay && a.judgment !== Judgment.Miss ? t + a.accuracy : t
        const endB = replay.isReplay && b.judgment !== Judgment.Miss ? t + b.accuracy : t
        this.m.end = Math.min(t, Math.min(endA, endB))
    }

    spawnTime() {
        return note.spawnTime(this.m.targetTime)
    }

    despawnTime() {
        return this.m.end
    }

    updateParallel() {
        if (!options.simLineEnabled) return
        const v = Math.clamp(note.view(this.m.targetTime), 0, 1)
        const y = noteY(v)
        const l = this.m.xA * v
        const r = this.m.xB * v
        const h = 0.025

        const id = skin.sprites.pairLineRinged.exists
            ? skin.sprites.pairLineRinged.id
            : skin.sprites.pairLine.exists
              ? skin.sprites.pairLine.id
              : skin.sprites.fbPairLine.id
        skin.sprites.draw(id, new Quad({ x1: l, y1: y - h / 2, x2: l, y2: y + h / 2, x3: r, y3: y + h / 2, x4: r, y4: y - h / 2 }), camZ(layer.pairLine, (l + r) / 2, y), 1)
    }
}
