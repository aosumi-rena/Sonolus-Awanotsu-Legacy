import { InputState, LANE_PAIRS, lanePairOf, pairCentreEdge } from '../../../../../shared/src/engine/data/inputLane.js'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { isJudgementOp } from '../../../../../shared/src/engine/data/notes.js'
import { options } from '../../configuration/options.js'
import { fillFxTables } from '../fxTables.js'
import { hudChart } from '../hud/hudQueue.js'
import { decideHoldSfx, decideHoldSfxLate, drawLaneFloods } from '../hookEffects.js'
import { inputNoteSfxOn } from '../seGroups.js'
import { computeClaimFloodLanes, drawClaimFloods } from '../fxSameFrame.js'
import { onEmptyTap } from '../hooks.js'
import { introZoomTau, layout, liveTime, markFirstFrame } from '../layout.js'
import { fillSkinTables } from '../skinTables.generated.js'
import { NO_LANE, laneOfScreenX } from './inputLane.js'
import {
    LANE_ACTIVE_TIME,
    LANE_INTRO_OFFSET,
    laneOutAlpha,
    noteFinishTime,
    noteTailIndex,
    drawJudgementLine,
    drawLaneBase,
    drawLaneIntro,
    drawLaneLines,
    drawStageShadow,
    drawStageMonitor,
    drawTapArea,
    setupBackgroundZoom,
    tapAreaFadeAlpha,
    updateIntroTimeline,
    updateIntroSparkles,
} from '../stageDraw.js'
import { archetypes } from './index.js'
import {
    commitPairState,
    ignoreFinger,
    isFingerIgnored,
    isTouchClaimed,
    isPairInVainGuarded,
    isTouchUsed,
    pairNowState,
    pairPrevState,
    setPairNowState,
} from './InputManager.js'

export class Stage extends Archetype {

    s = this.entityMemory({ finish: Number, chartFinish: Number, tailFirst: Number, tailLast: Number, found: Boolean })

    claimLane = this.entityMemory(Tuple(24, Number))
    claimT = this.entityMemory(Number)

    import = this.defineImport({
        bgZoom: { name: DataName.BgZoom, type: Number, def: 0 },

        bgBand: { name: DataName.BgBand, type: Number, def: -1 },
    })

    preprocess() {
        const first = archetypes.TapNote.index
        const last = archetypes.GuideHiddenEndNote.index
        const connector = archetypes.SlideConnector.index
        this.s.chartFinish = noteFinishTime(first, last, connector, (i) => archetypes.TapNote.import.get(i))
        this.s.tailFirst = noteTailIndex(first, last, connector, (i) => archetypes.TapNote.import.get(i), this.s.chartFinish, false)
        this.s.tailLast = noteTailIndex(first, last, connector, (i) => archetypes.TapNote.import.get(i), this.s.chartFinish, true)
        this.s.finish = 1e9
        this.s.found = false
        fillSkinTables()
        fillFxTables()

        setupBackgroundZoom(this.import.bgZoom)
    }

    updateSequential() {

        markFirstFrame(false)

        decideHoldSfxLate(inputNoteSfxOn())

        updateIntroSparkles(liveTime(time.now) + LANE_INTRO_OFFSET, false)

        updateIntroTimeline(liveTime(time.now) + LANE_INTRO_OFFSET, introZoomTau(time.now))
        if (this.s.found || time.now < this.s.chartFinish - 0.3) return
        let pending = 0
        for (let i = this.s.tailFirst; i <= this.s.tailLast; i++) {
            const info = entityInfos.get(i)
            const a = info.archetype
            const note = a >= archetypes.TapNote.index && a <= archetypes.GuideHiddenEndNote.index && a !== archetypes.SlideConnector.index
            pending += note && info.state !== EntityState.Despawned && isJudgementOp(archetypes.TapNote.import.get(i).op) ? 1 : 0
        }
        if (pending === 0 || time.now >= this.s.chartFinish + 1) {
            this.s.found = true

            this.s.finish = Math.max(time.now - time.delta, hudChart.passDone)
        }
    }

    spawnOrder() {
        return 1
    }

    shouldSpawn() {
        return entityInfos.get(0).state === EntityState.Despawned
    }

    touchOrder = 3
    touch() {

        decideHoldSfx(time.now, inputNoteSfxOn())

        if (liveTime(time.now) < 0) return

        computeClaimFloodLanes(this.claimLane)
        this.claimT = time.now
        for (let p = 0; p < LANE_PAIRS; p++) setPairNowState(p, InputState.None)
        for (const touch of touches) {
            if (isTouchClaimed(touch) || isTouchUsed(touch)) {
                ignoreFinger(touch.id)
                continue
            }
            if (isFingerIgnored(touch.id)) continue
            const lane = laneOfScreenX(touch.position.x)
            if (lane === NO_LANE) continue
            const p = lanePairOf(lane)

            if (pairNowState(p) !== InputState.None) continue
            setPairNowState(p, touch.started ? InputState.PressEnter : touch.ended ? InputState.PressExit : InputState.Press)
        }
        for (let p = 0; p < LANE_PAIRS; p++) {
            const st = pairNowState(p)

            if ((st === InputState.PressEnter || st === InputState.Press) && pairPrevState(p) === InputState.None && !isPairInVainGuarded(p))
                onEmptyTap(pairCentreEdge(p))
            commitPairState(p)
        }
    }

    updateParallel() {
        const now = time.now

        const tm = liveTime(now)

        drawStageMonitor(this.import.bgBand)
        drawStageShadow(options.backgroundBrightness / 100)
        if (tm < 0) drawLaneIntro(tm + LANE_INTRO_OFFSET, this.import.bgBand)

        if (tm < LANE_ACTIVE_TIME) return

        const out = laneOutAlpha(now, this.s.finish)
        if (out <= 0) return
        drawLaneBase((options.laneOpacity / 100) * out, layout.maskY)

        const claims = this.claimT === time.now
        const claimLane = this.claimLane
        drawLaneFloods((lane) => claims && claimLane.get(lane) >= 0)
        if (claims) drawClaimFloods(claimLane)
        drawLaneLines(options.guidelineCount, options.guidelineOpacity / 100, out, layout.maskY)
        drawTapArea(tapAreaFadeAlpha(tm - LANE_ACTIVE_TIME) * out)
        if (options.judgementLine) drawJudgementLine(out)
    }
}
