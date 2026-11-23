import { LANE_COUNT } from '../../../../../shared/src/engine/data/geometry.js'
import { NO_LANE, roundHalfEven } from '../../../../../shared/src/engine/data/inputLane.js'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import {
    inLineStartWindow,
    laneInLineExtent,
    longLaneFrom,
    longLaneTo,
    nextLineEnabled,
    nextLineMissed,
} from '../../../../../shared/src/engine/data/lineState.js'
import { SimJudgement, judgementTypeOf } from '../../../../../shared/src/engine/data/notes.js'
import { LineState } from '../../../../../shared/src/engine/data/slideLine.js'
import { judgeDiffMs } from '../../../../../shared/src/engine/data/windows.js'
import { options } from '../../configuration/options.js'
import { addAutoHoldVoiceSpan, autoSfxOn } from '../autoSfx.js'
import { markHoldFx, moveHoldFx, startHoldFx, stopHoldFx, wantHoldSfx } from '../hookEffects.js'
import { chartTime, judgeX, layout, noteY } from '../layout.js'
import { note } from '../note.js'
import { camZ } from '../noteRender.js'
import { layer, skin } from '../skin.js'
import { LineRow, UnitBounds, drawUnitBody, heldHeadCenter, heldHeadWidth, lineMeshBoundsCentre, publishUnitBounds } from '../slideBody.js'
import { NO_CLAIM_HIT, claimHitOf, guardInVainLanes, isTouchClaimed, markTouchUsed } from './InputManager.js'
import { laneOfScreenX } from './inputLane.js'
import { archetypes } from './index.js'

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

        lineLaneStart: { name: DataName.LineLaneStart, type: Number },
        lineLaneEndX: { name: DataName.LineLaneEndX, type: Number },
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

        jtBegin: Number,
    })
    rowA = this.entityMemory(LineRow)
    rowB = this.entityMemory(LineRow)

    ub = this.entityMemory(UnitBounds)

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
        this.u.jtBegin = judgementTypeOf(s.op, s.crit > 0)
        if (!this.isGuide) this.setupLineExtent(h.lane, h.width, t.lane, t.width)

        if (!this.isGuide) this.lineShared.endT = this.u.lineEnd

        if (!this.isGuide && this.import.unit === 0 && autoSfxOn()) addAutoHoldVoiceSpan(this.u.lineBegin, this.u.lineEnd)
    }

    setupLineExtent(hLane: number, hWidth: number, tLane: number, tWidth: number) {
        const ls = this.lineShared
        if (this.import.lineLaneEndX > 0) {
            ls.extL = options.mirror ? LANE_COUNT - this.import.lineLaneEndX : this.import.lineLaneStart
            ls.extR = options.mirror ? LANE_COUNT - this.import.lineLaneStart : this.import.lineLaneEndX
            return
        }
        const l = Math.min(hLane, tLane)
        const r = Math.max(hLane + hWidth, tLane + tWidth)
        const unset = ls.extR <= 0
        const nl = unset ? l : Math.min(ls.extL, l)
        const nr = unset ? r : Math.max(ls.extR, r)
        ls.extL = nl
        ls.extR = nr
    }

    spawnOrder() {
        return 1000 + note.spawnTime(this.u.headTime)
    }

    shouldSpawn() {
        return time.now >= note.spawnTime(this.u.headTime)
    }

    get lineShared() {
        return archetypes.TapNote.line.get(this.import.startRef)
    }

    get endDone() {
        return archetypes.TapNote.line.get(this.import.endRef).done
    }

    get crossing() {
        return time.now >= this.u.headTime && time.now < this.u.tailTime
    }

    get isLastUnit() {
        return this.import.unit === this.import.unitCount - 1
    }

    get responsible() {
        return this.crossing || (this.import.unit === 0 && time.now < this.u.headTime)
    }

    get isPressed() {
        return this.lineShared.enabled && time.now > this.u.lineBegin
    }

    updateLineState(finger: boolean, claimGood: boolean) {
        const ls = this.lineShared
        const missEvent = ls.missCount > ls.missSeen
        ls.missSeen = ls.missCount

        const startGood = inLineStartWindow(time.now, this.u.lineBegin) && ((ls.judged && ls.beginGood) || claimGood)
        const en = startGood || nextLineEnabled(ls.enabled, missEvent, finger)
        const mi = !startGood && nextLineMissed(ls.lmissed, missEvent, finger)

        ls.enabled = en
        ls.lmissed = mi
        ls.pressed = en && time.now > this.u.lineBegin
    }

    touchOrder = 2
    touch() {
        if (this.isGuide) return
        if (!this.responsible) return
        const ls = this.lineShared
        const lastLane = ls.extR - 1
        let finger = false
        for (const touch of touches) {
            if (touch.ended) continue
            if (laneInLineExtent(laneOfScreenX(touch.position.x), ls.extL, lastLane)) finger = true
        }

        const hitB = ls.judged ? NO_CLAIM_HIT : claimHitOf(this.import.startRef)
        const claimGood = hitB > NO_CLAIM_HIT && judgeDiffMs(this.u.jtBegin, Math.floor((hitB - this.u.lineBegin) * 1000 + 1e-6)) >= SimJudgement.Good

        this.updateLineState(finger, claimGood)

        if (this.crossing) this.updateHold(heldHeadCenter(this.u, time.now), heldHeadWidth(this.u, time.now))
        if (!this.isPressed) return
        const from = longLaneFrom(ls.extL)
        const to = longLaneTo(lastLane, LANE_COUNT)
        guardInVainLanes(from, to)
        for (const touch of touches) {
            if (touch.ended) continue
            const lane = laneOfScreenX(touch.position.x)
            if (lane === NO_LANE) continue
            const r = roundHalfEven(lane)
            if (r >= from && r < to) markTouchUsed(touch)
        }
    }

    updateSequential() {
        if (time.now >= this.u.tailTime) {

            if (!this.isGuide && this.isLastUnit) this.endLine()
            this.despawn = true
            return
        }

        publishUnitBounds(this.ub, this.lineShared)

        if (this.isGuide || touches.count > 0) return
        if (this.responsible) this.updateLineState(false, false)
        if (!this.crossing) return

        this.updateHold(heldHeadCenter(this.u, time.now), heldHeadWidth(this.u, time.now))
    }

    updateHold(c: number, w: number) {
        const ls = this.lineShared
        if (ls.enabled && time.now > this.u.lineBegin && !ls.holdActive) {
            ls.holdActive = true
            ls.holdFx = startHoldFx(options.noteEffectEnabled, c, w)
        } else if (ls.holdActive && ls.enabled) moveHoldFx(ls.holdFx, c, w)

        if (ls.holdActive) markHoldFx(ls.holdFx)
        const wantSfx = ls.enabled && time.now >= this.u.lineBegin
        if (wantSfx) wantHoldSfx()
        if (wantSfx && !ls.sfxOn) {
            ls.sfxOn = true
        } else if (!wantSfx && ls.sfxOn) this.dropHoldSfx()
    }

    dropHoldSfx() {
        const ls = this.lineShared
        ls.sfxOn = false
    }

    endLine() {
        const ls = this.lineShared
        if (!ls.judged) ls.forceMiss = true
        this.endHold()
    }

    endHold() {
        const ls = this.lineShared
        if (ls.sfxOn) this.dropHoldSfx()
        if (!ls.holdActive) return
        ls.holdActive = false
        stopHoldFx(ls.holdFx)
        ls.holdFx = 0 as ParticleEffectInstanceId
    }

    updateParallel() {

        if (time.now >= this.u.tailTime || this.endDone) {
            this.ub.valid = false
            return
        }

        const pB = note.unitProgress(this.u.headTime)
        const pE = note.unitProgress(this.u.tailTime)
        const ls = this.lineShared

        const state = this.isGuide
            ? LineState.Normal
            : this.isPressed
              ? LineState.Pressed
              : ls.lmissed
                ? LineState.Disabled
                : LineState.Normal
        const lc = lineMeshBoundsCentre(ls.bMinX, ls.bMaxX, ls.bMinY, ls.bMaxY)
        const lineOk = ls.bT === time.now && (ls.bMaxX > ls.bMinX || ls.bMaxY > ls.bMinY)
        drawUnitBody(this.u, pB, pE, this.isGuide, state, this.isGuide ? layout.guideAlpha : layout.slideAlpha, this.rowA, this.rowB, this.ub, lineOk, lc.x, lc.y)
    }
}

export class SlideConnector extends LineConnector {
    isGuide = false
    hasInput = false
}

export class GuideConnector extends LineConnector {
    isGuide = true
    hasInput = false
}

export class SimLine extends Archetype {
    import = this.defineImport({
        aRef: { name: DataName.A, type: Number },
        bRef: { name: DataName.B, type: Number },
    })

    m = this.entityMemory({ targetTime: Number, xA: Number, xB: Number })

    preprocessOrder = 1
    preprocess() {
        const a = archetypes.TapNote.import.get(this.import.aRef)
        const b = archetypes.TapNote.import.get(this.import.bRef)
        this.m.targetTime = chartTime(a.ms)
        const ca = a.lane + (a.width - 1) / 2
        const cb = b.lane + (b.width - 1) / 2
        this.m.xA = judgeX(Math.min(ca, cb))
        this.m.xB = judgeX(Math.max(ca, cb))
    }

    spawnOrder() {
        return 1000 + note.spawnTime(this.m.targetTime)
    }

    shouldSpawn() {
        return time.now >= note.spawnTime(this.m.targetTime)
    }

    updateParallel() {
        if (
            time.now >= this.m.targetTime ||
            entityInfos.get(this.import.aRef).state === EntityState.Despawned ||
            entityInfos.get(this.import.bRef).state === EntityState.Despawned
        ) {
            this.despawn = true
            return
        }
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

export const stageTouchClaimed = isTouchClaimed
