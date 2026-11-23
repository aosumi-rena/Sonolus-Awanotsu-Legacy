import { judgeOffsetOf } from '../../../../../shared/src/engine/data/geometry.js'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { guideVertexAlpha, slideVertexAlpha } from '../../../../../shared/src/engine/data/slideLine.js'
import { approachMs } from '../../../../../shared/src/engine/data/timing.js'
import { options } from '../../configuration/options.js'
import { setupBuckets } from '../bucketMap.js'
import { judgeY, layout, lodThresholdOf, maskBottomY, setupLayout, setupStartSequence } from '../layout.js'
import { scheduleStartCheer } from '../liveSe.js'
import { resetAutoSfx } from '../autoSfx.js'
import { particle } from '../particle.js'
import { skin } from '../skin.js'
import { setupHud, setupHudChart } from '../hud/index.js'
import { spawnLiveHud } from '../hud/LiveHud.js'
import { archetypes } from './index.js'

export class Initialization extends Archetype {

    import = this.defineImport({
        musicStartMs: { name: DataName.MusicStartMs, type: Number, def: 0 },

        introStartMs: { name: DataName.IntroStartMs, type: Number, def: -999999 },
    })

    preprocess() {
        setupLayout(screen.aspectRatio)

        setupStartSequence(this.import.musicStartMs, this.import.introStartMs)

        resetAutoSfx()
        if (options.sfxEnabled) scheduleStartCheer()
        layout.judgeOffset = judgeOffsetOf(options.judgePosition)
        layout.approachS = approachMs(options.noteSpeed) / 1000
        layout.lodThreshold = lodThresholdOf(options.noteSpeed)
        layout.slideAlpha = slideVertexAlpha(options.slideOpacity)
        layout.guideAlpha = guideVertexAlpha(options.guideOpacity)
        layout.maskY = maskBottomY(options.noteStartPosition, screen.aspectRatio)

        layout.chartShift = options.chartPosition / 1000

        const transform = Mat.identity.scale(layout.scale, layout.scale)
        skin.transform.set(transform)
        particle.transform.set(transform)

        setupBuckets()

        score.base.set({ perfect: 1, great: 0.8, good: 0.5 })
        score.consecutive.good.set({ multiplier: 0.01, step: 10, cap: 100 })

        setupHud(screen.aspectRatio)

        setupHudChart(
            archetypes.TapNote.index,
            archetypes.GuideHiddenEndNote.index,
            archetypes.SlideConnector.index,
            (i) => archetypes.TapNote.import.get(i),
            input.offset + options.noteTiming / 1000,
        )
    }

    spawnOrder() {
        return 0
    }

    updateSequential() {
        archetypes.InputManager.spawn({})
        spawnLiveHud()
        this.despawn = true
    }
}

export const initJudgeY = judgeY
