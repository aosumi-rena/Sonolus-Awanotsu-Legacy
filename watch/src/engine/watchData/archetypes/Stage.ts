import { options } from '../../../../../play/src/engine/configuration/options.js'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { fillFxTables } from '../../../../../play/src/engine/playData/fxTables.js'
import { hudChart } from '../../../../../play/src/engine/playData/hud/hudQueue.js'
import { drawLaneFloods, flushLaneFloodQueue } from '../../../../../play/src/engine/playData/hookEffects.js'
import { layout, liveTime } from '../../../../../play/src/engine/playData/layout.js'
import { fillSkinTables } from '../../../../../play/src/engine/playData/skinTables.generated.js'
import {
    LANE_ACTIVE_TIME,
    LANE_INTRO_OFFSET,
    laneOutAlpha,
    noteFinishTime,
    drawJudgementLine,
    drawLaneBase,
    drawLaneIntro,
    drawLaneLines,
    drawStageShadow,
    drawStageMonitor,
    drawTapArea,
    setupBackgroundZoom,
    tapAreaFadeAlpha,
    updateIntroSparkles,
} from '../../../../../play/src/engine/playData/stageDraw.js'
import { watchHudStageParallel, watchHudStageSequential } from '../hud.js'
import { archetypes } from './index.js'

export class Stage extends Archetype {
    s = this.entityMemory({ finish: Number })

    import = this.defineImport({
        bgZoom: { name: DataName.BgZoom, type: Number, def: 0 },

        bgBand: { name: DataName.BgBand, type: Number, def: -1 },
    })

    preprocess() {

        this.s.finish = Math.max(
            noteFinishTime(archetypes.TapNote.index, archetypes.GuideHiddenEndNote.index, archetypes.SlideConnector.index, (i) =>
                archetypes.TapNote.import.get(i),
            ),
            hudChart.passDone,
        )
        fillSkinTables()
        fillFxTables()

        setupBackgroundZoom(this.import.bgZoom)
    }

    spawnTime() {
        return -999999
    }

    despawnTime() {
        return 999999
    }

    updateSequential() {
        watchHudStageSequential()

        updateIntroSparkles(liveTime(time.now) + LANE_INTRO_OFFSET, time.skip)

        flushLaneFloodQueue(time.skip)
    }

    updateParallel() {
        watchHudStageParallel()
        const now = time.now

        const tm = liveTime(now)

        drawStageMonitor(this.import.bgBand)
        drawStageShadow(options.backgroundBrightness / 100)
        if (tm < 0) drawLaneIntro(tm + LANE_INTRO_OFFSET, this.import.bgBand)
        const out = laneOutAlpha(now, this.s.finish)
        if (tm >= LANE_ACTIVE_TIME && out > 0) {
            drawLaneBase((options.laneOpacity / 100) * out, layout.maskY)

            drawLaneFloods(() => false)
            drawLaneLines(options.guidelineCount, options.guidelineOpacity / 100, out, layout.maskY)
            drawTapArea(tapAreaFadeAlpha(tm - LANE_ACTIVE_TIME) * out)
            if (options.judgementLine) drawJudgementLine(out)
        }
    }
}
