import { drawFxLayer, fillFlashTables, fillFxLayerTables, resetFxLayer, snapFxLayerSlots, updateFlashTable } from '../../../../../play/src/engine/playData/hookEffects.js'
import { introZoomTau, liveTime, markFirstFrame } from '../../../../../play/src/engine/playData/layout.js'
import { LANE_INTRO_OFFSET, updateIntroTimeline } from '../../../../../play/src/engine/playData/stageDraw.js'

export class FxLayer extends Archetype {
    updateSequentialOrder = -1

    preprocess() {
        fillFxLayerTables()
        fillFlashTables()
    }

    spawnTime() {
        return -999999
    }

    despawnTime() {
        return 999999
    }

    updateSequential() {

        markFirstFrame(time.skip)
        if (time.skip) resetFxLayer()

        if (!time.skip) snapFxLayerSlots()

        updateFlashTable()

        updateIntroTimeline(liveTime(time.now) + LANE_INTRO_OFFSET, introZoomTau(time.now))
    }

    updateParallel() {
        drawFxLayer()
    }
}
