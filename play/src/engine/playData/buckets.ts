import { EngineDataBucket, Text } from '@sonolus/core'
import { skin } from './skin.js'

const bar = (id: number, x: number) => ({ id, x, y: 0, w: 2, h: 2, rotation: -90 })

const single = (id: number): EngineDataBucket => ({
    sprites: [bar(id, 0)],
    unit: Text.MillisecondUnit,
})

const withArrow = (id: number, arrowId: number): EngineDataBucket => ({
    sprites: [bar(id, 0), { id: arrowId, x: 0, y: 1, w: 1.5, h: 1.5, rotation: 0 }],
    unit: Text.MillisecondUnit,
})

const withLine = (lineId: number, id: number, headOffset: number): EngineDataBucket => ({
    sprites: [{ id: lineId, x: 0.5 * -headOffset, y: 0, w: 2, h: 5, rotation: -90 }, bar(id, -2 * headOffset)],
    unit: Text.MillisecondUnit,
})

export const buckets = defineBuckets({

    tapNote: single(skin.sprites.tapNote.id),

    criticalTapNote: single(skin.sprites.tapNote.id),

    flickNote: withArrow(skin.sprites.flickNote.id, skin.sprites.flickArrowS.id),
    directionalFlickNote: withArrow(skin.sprites.flickRightNote.id, skin.sprites.flickRightArrow1.id),

    traceNote: single(skin.sprites.traceNote.id),
    slideTickNote: single(skin.sprites.slideConnectNote.id),

    slideStartNote: withLine(skin.sprites.slideLine.id, skin.sprites.slideNote.id, 1),
    criticalSlideStartNote: withLine(skin.sprites.slideLine.id, skin.sprites.slideNote.id, 1),

    slideEndNote: withLine(skin.sprites.slideLine.id, skin.sprites.slideEndNote.id, -1),

    slideEndTraceNote: withLine(skin.sprites.slideLine.id, skin.sprites.traceNote.id, -1),
})
