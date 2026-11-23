import { SimJudgement, isJudgementOp, judgementTypeOf } from '../../../../shared/src/engine/data/notes.js'
import { missAfterMs } from '../../../../shared/src/engine/data/windows.js'
import {
    INTRO_DURATION,
    drawCombo,
    drawFinish,
    drawHeader,
    drawIntro,
    drawLanePopups,
    drawMissSplash,
    drawPopup,
    drawRankEffects,
    drawScore,
    drawScorePops,
    drawStatus,
    drawTally,
    updateHudOverFrame,
} from '../../../../play/src/engine/playData/hud/hudDraw.js'
import { CHUNK, hudFoldQueue, hudPushJudgement, hudQueue, hudQueuePending, hudTallyQueue } from '../../../../play/src/engine/playData/hud/hudQueue.js'
import { HudState, resetHudState, resetHudTally, setupScoreUnit } from '../../../../play/src/engine/playData/hud/hudState.js'
import { showFinishFx } from '../../../../play/src/engine/playData/hud/finishFx.js'
import { showPopupFx } from '../../../../play/src/engine/playData/hud/popupFx.js'
import { pauseIconAlpha } from '../../../../play/src/engine/playData/hud/uiSetup.js'
import { chartTime, layout, liveTime, viewCenter } from '../../../../play/src/engine/playData/layout.js'
import { note } from '../../../../play/src/engine/playData/note.js'
import { archetypes } from './archetypes/index.js'

export const watchHud = levelMemory(HudState)
export const watchHudCursor = levelMemory({
    ready: Boolean,
    cursor: Number,
    prevNow: Number,
})

const isNoteArchetype = (a: number) =>
    a >= archetypes.TapNote.index && a <= archetypes.GuideHiddenEndNote.index && a !== archetypes.SlideConnector.index

const rebuild = () => {
    resetHudState(watchHud, time.now)
    resetHudTally()
    setupScoreUnit(watchHud)
    watchHud.folded = hudQueue.seq
    watchHudCursor.cursor = 0
    watchHudCursor.prevNow = -1e9
    watchHudCursor.ready = true
}

const pushDue = () => {
    const now = time.now
    const prev = watchHudCursor.prevNow

    const early = replay.isReplay ? 0.1 : 0
    const late = replay.isReplay ? Math.max(0.25, 0.1 * layout.approachS) + 0.02 : 0
    let i = watchHudCursor.cursor
    let advancing = true
    let full = false
    let lastHit = prev
    while (!full) {
        const info = entityInfos.get(i)
        if (info.index !== i) break
        if (isNoteArchetype(info.archetype)) {
            const imp = archetypes.TapNote.import.get(i)
            const target = chartTime(imp.ms)
            if (target > now + early) break
            if (isJudgementOp(imp.op)) {
                let hit = target
                let sim: number = SimJudgement.Perfect
                let timing = 0

                let diffMs = 0
                if (replay.isReplay) {
                    if (imp.judgment === Judgment.Miss) {

                        const missAfter = missAfterMs(judgementTypeOf(imp.op, imp.crit > 0))
                        hit = Math.abs(imp.accuracy * 1000 - missAfter) < 1e-3 ? note.missTime(target, missAfter) : target + imp.accuracy
                        sim = imp.sim === SimJudgement.Bad ? SimJudgement.Bad : SimJudgement.Miss
                    } else {
                        hit = target + imp.accuracy
                        sim = imp.sim
                        diffMs = Math.floor(imp.accuracy * 1000 + 1e-6)
                    }
                    timing = imp.timing
                }
                if (hit > prev && hit <= now) {
                    if (hudQueuePending(watchHud) >= CHUNK && hit !== lastHit) {
                        full = true
                    } else {
                        hudPushJudgement(sim, imp.op, timing, diffMs, target, hit, viewCenter(imp.pos, imp.size), imp.size)
                        lastHit = hit
                    }
                }
                if (advancing && target + late > now) advancing = false
            }
        }
        if (full) break
        if (advancing) watchHudCursor.cursor = i + 1
        i++
    }

    watchHudCursor.prevNow = full ? lastHit : now
}

export const watchHudUpdate = () => {
    if (!watchHudCursor.ready || time.skip) rebuild()
    pushDue()
    hudTallyQueue(watchHud)
    hudFoldQueue(watchHud, true)
}

export const watchHudStageSequential = () => {
    watchHudUpdate()
    const now = time.now

    updateHudOverFrame(watchHud, now)

    if (liveTime(now) < 0) return

    showPopupFx(watchHud, now)

    showFinishFx(watchHud, now)
    drawPopup(watchHud, now)
    drawCombo(watchHud, now)
    drawTally()
}

export const watchHudStageParallel = () => {
    if (!watchHudCursor.ready) return
    const now = time.now
    if (liveTime(now) < 0) return
    drawStatus(watchHud, now, pauseIconAlpha())

    drawLanePopups(now)
}

export const watchHudInitSequential = () => {
    if (!watchHudCursor.ready) return
    const now = time.now
    if (liveTime(now) < 0) return
    drawHeader(watchHud, now)
    drawScore(watchHud, now)

    drawRankEffects(watchHud, now)
}

export const watchHudInitParallel = () => {
    if (!watchHudCursor.ready) return
    const now = time.now
    const tm = liveTime(now)
    if (tm < 0) {
        drawIntro(tm + INTRO_DURATION)
        return
    }
    drawScorePops(watchHud, now)
    drawFinish(watchHud, now)
    drawMissSplash(now)
}

export const setupWatchProgressUI = () => {
    const gap = 0.05
    const uiRect = screen.rect.shrink(gap, gap)
    ui.progress.set({
        anchor: uiRect.lb,
        pivot: { x: 0, y: 0 },
        size: { x: uiRect.w, y: 0.15 * ui.configuration.progress.scale },
        rotation: 0,
        alpha: ui.configuration.progress.alpha,
        horizontalAlign: HorizontalAlign.Center,
        background: true,
    })
}
