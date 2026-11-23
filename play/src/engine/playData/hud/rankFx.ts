import { skin } from '../skin.js'
import { RANK_FX_ELEMENTS, RANK_FX_POOL, fillRankFxTables } from './hudText.generated.js'

export const rankFx = levelData({
    first: Tuple(6, Number),
    count: Tuple(6, Number),
    sprite: Tuple(RANK_FX_ELEMENTS, Number),
    mul: Tuple(RANK_FX_ELEMENTS, Number),
    ox: Tuple(RANK_FX_ELEMENTS, Number),
    oy: Tuple(RANK_FX_ELEMENTS, Number),
    hw: Tuple(RANK_FX_ELEMENTS, Number),
    hh: Tuple(RANK_FX_ELEMENTS, Number),
    rot: Tuple(RANK_FX_ELEMENTS, Number),
    on: Tuple(RANK_FX_ELEMENTS, Number),
    off: Tuple(RANK_FX_ELEMENTS, Number),
    sx: Tuple(RANK_FX_ELEMENTS, Number),
    sxN: Tuple(RANK_FX_ELEMENTS, Number),
    sy: Tuple(RANK_FX_ELEMENTS, Number),
    syN: Tuple(RANK_FX_ELEMENTS, Number),
    al: Tuple(RANK_FX_ELEMENTS, Number),
    alN: Tuple(RANK_FX_ELEMENTS, Number),
    pool: Tuple(RANK_FX_POOL, Number),
})

export const rankFxState = levelData({ ready: Boolean })

export const resetRankFx = () => {
    rankFxState.ready = false
}

export const setupRankFx = () => {
    rankFxState.ready = fillRankFxTables(rankFx, skin.sprites)
}
