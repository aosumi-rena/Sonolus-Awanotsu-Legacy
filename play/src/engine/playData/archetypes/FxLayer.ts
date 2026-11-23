import { drawFxLayer, fillFlashTables, fillFxLayerTables, updateFlashTable } from '../hookEffects.js'
import { drawClaimFxParts } from '../fxSameFrame.js'

export class FxLayer extends Archetype {
    preprocess() {
        fillFxLayerTables()
        fillFlashTables()
    }

    spawnOrder() {
        return 1
    }

    shouldSpawn() {
        return entityInfos.get(0).state === EntityState.Despawned
    }

    updateSequential() {
        updateFlashTable()
    }

    updateParallel() {
        drawFxLayer()

        drawClaimFxParts()
    }
}
