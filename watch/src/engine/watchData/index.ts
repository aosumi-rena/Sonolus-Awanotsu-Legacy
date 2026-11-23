import { buckets } from '../../../../play/src/engine/playData/buckets.js'
import { effect } from '../../../../play/src/engine/playData/effect.js'
import { particle } from '../../../../play/src/engine/playData/particle.js'
import { skin } from '../../../../play/src/engine/playData/skin.js'
import { archetypes } from './archetypes/index.js'
import { updateSpawn } from './updateSpawn.js'
import { allocateWatchGradientPool } from './archetypes/notes.js'

allocateWatchGradientPool()

export const watchData = {
    skin,
    effect,
    particle,
    buckets,
    archetypes,
    updateSpawn,

    globalResolver: (name: string) => eval(name) as unknown,
}
