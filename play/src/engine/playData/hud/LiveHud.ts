import { options } from '../../configuration/options.js'
import { archetypes } from '../archetypes/index.js'
import { liveTime } from '../layout.js'
import { playFinishSe } from '../liveSe.js'
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
} from './hudDraw.js'
import { hudFoldQueue, hudTallyQueue } from './hudQueue.js'
import { showFinishFx } from './finishFx.js'
import { showPopupFx } from './popupFx.js'
import { FinishType, HudState, resetHudState, resetHudTally, setupScoreUnit } from './hudState.js'
import { pauseIconAlpha } from './uiSetup.js'

export const hudLevel = levelMemory(HudState)

const hudCore = levelMemory({ ready: Boolean })

export const HudPart = {
    Core: 0,
    Header: 1,
    Score: 2,
    ScorePops: 3,
    Status: 4,
    Combo: 5,
    Popup: 6,
    Banner: 7,

    Tally: 8,

    Intro: 9,
} as const

export abstract class LiveHudPart extends SpawnableArchetype({}) {
    abstract part: number

    s = this.entityMemory(HudState)
}

export class LiveHudCore extends LiveHudPart {
    part = HudPart.Core

    updateSequential() {
        if (!hudCore.ready) {
            resetHudState(hudLevel, time.now)
            resetHudTally()
            setupScoreUnit(hudLevel)
            hudCore.ready = true
        }
        hudTallyQueue(hudLevel)
        const finished = hudLevel.finishType !== FinishType.None
        hudFoldQueue(hudLevel, true)

        if (!finished && hudLevel.finishType !== FinishType.None && options.sfxEnabled) playFinishSe(hudLevel.finishType, hudLevel.finishStart)

        showFinishFx(hudLevel, time.now)

        updateHudOverFrame(hudLevel, time.now)
    }
}

export class LiveHudHeader extends LiveHudPart {
    part = HudPart.Header

    updateSequential() {
        const now = time.now
        if (liveTime(now) < 0) return
        drawHeader(hudLevel, now)
    }
}
export class LiveHudScore extends LiveHudPart {
    part = HudPart.Score

    updateParallel() {
        const now = time.now
        if (liveTime(now) < 0) return
        drawScore(hudLevel, now)

        drawRankEffects(hudLevel, now)
    }
}
export class LiveHudScorePops extends LiveHudPart {
    part = HudPart.ScorePops

    updateParallel() {
        const now = time.now
        if (liveTime(now) < 0) return
        drawScorePops(hudLevel, now)
    }
}
export class LiveHudStatus extends LiveHudPart {
    part = HudPart.Status

    updateParallel() {
        const now = time.now
        if (liveTime(now) < 0) return
        drawStatus(hudLevel, now, pauseIconAlpha())
    }
}

export class LiveHudCombo extends LiveHudPart {
    part = HudPart.Combo

    initialize() {
        resetHudState(this.s, time.now)
    }

    updateParallel() {
        const now = time.now
        hudFoldQueue(this.s, false)
        if (liveTime(now) < 0) return
        drawCombo(this.s, now)

        drawTally()
    }
}

export class LiveHudPopup extends LiveHudPart {
    part = HudPart.Popup

    initialize() {
        resetHudState(this.s, time.now)
    }

    updateParallel() {
        const now = time.now
        hudFoldQueue(this.s, false)
        if (liveTime(now) >= 0) drawPopup(this.s, now)
    }

    updateSequential() {
        const now = time.now
        hudFoldQueue(this.s, false)
        if (liveTime(now) >= 0) showPopupFx(this.s, now)
    }
}

export class LiveHudBanner extends LiveHudPart {
    part = HudPart.Banner

    updateParallel() {
        const now = time.now
        if (liveTime(now) < 0) return
        drawFinish(hudLevel, now)
        drawMissSplash(now)
    }
}

export class LiveHudIntro extends LiveHudPart {
    part = HudPart.Intro

    updateParallel() {

        const tm = liveTime(time.now)
        if (tm >= 0) return
        drawIntro(tm + INTRO_DURATION)
    }
}

export class LiveHudTally extends LiveHudPart {
    part = HudPart.Tally

    updateParallel() {
        const now = time.now
        if (liveTime(now) < 0) return
        drawLanePopups(now)
    }
}

export const spawnLiveHud = () => {
    archetypes.LiveHudCore.spawn({})
    archetypes.LiveHudHeader.spawn({})
    archetypes.LiveHudScore.spawn({})
    archetypes.LiveHudScorePops.spawn({})
    archetypes.LiveHudStatus.spawn({})
    archetypes.LiveHudCombo.spawn({})
    archetypes.LiveHudPopup.spawn({})
    archetypes.LiveHudBanner.spawn({})
    archetypes.LiveHudTally.spawn({})
    archetypes.LiveHudIntro.spawn({})
}
