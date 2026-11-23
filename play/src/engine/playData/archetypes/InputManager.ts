import {
    FLICK_DISTANCE,
    FLICK_REFERENCE_FRAME_S,
    FLICK_THRESHOLD_PLANE_PER_FRAME,
    SCREEN_HEIGHT_CM_ESTIMATE,
    isFlickDelta,
} from '../../../../../shared/src/engine/data/flick.js'
import { LANE_COUNT } from '../../../../../shared/src/engine/data/geometry.js'
import { LANE_PAIRS } from '../../../../../shared/src/engine/data/inputLane.js'
import { layout } from '../layout.js'
import { edgeOfTouchX } from './inputLane.js'
import { archetypes } from './index.js'

export const MAX_TOUCHES = 16

export { FLICK_DISTANCE, FLICK_REFERENCE_FRAME_S, FLICK_THRESHOLD_PLANE_PER_FRAME, SCREEN_HEIGHT_CM_ESTIMATE, isFlickDelta }

const claims = levelMemory({
    id: Tuple(MAX_TOUCHES, TouchId),
    entity: Tuple(MAX_TOUCHES, Number),
    diff: Tuple(MAX_TOUCHES, Number),
    hit: Tuple(MAX_TOUCHES, Number),
    t: Tuple(MAX_TOUCHES, Number),
})

export const NO_CLAIM_HIT = -1e9

const flicks = levelMemory({

    flicked: Tuple(MAX_TOUCHES, Boolean),

    beginEdge: Tuple(MAX_TOUCHES, Number),

    dirX: Tuple(MAX_TOUCHES, Number),
})

export const IGNORE_SLOTS = 32
const inVain = levelMemory({
    used: Tuple(MAX_TOUCHES, TouchId),
    ignored: Tuple(IGNORE_SLOTS, TouchId),
    ignoredNext: Number,
    pairPrev: Tuple(LANE_PAIRS, Number),
    pairNow: Tuple(LANE_PAIRS, Number),

    guard: Tuple(LANE_COUNT, Boolean),
})

export const guardInVainLanes = (from: number, to: number) => {
    for (let l = 0; l < LANE_COUNT; l++) if (l >= from && l < to) inVain.guard.set(l, true)
}
export const isPairInVainGuarded = (pair: number) => inVain.guard.get(2 * pair) && inVain.guard.get(2 * pair + 1)

export const markTouchUsed = (touch: Touch) => {
    inVain.used.set(touch.index, touch.id)
}
export const isTouchUsed = (touch: Touch) => inVain.used.get(touch.index) === touch.id

export const isFingerIgnored = (id: TouchId) => {
    for (let k = 0; k < IGNORE_SLOTS; k++) if (inVain.ignored.get(k) === id) return true
    return false
}

export const ignoreFinger = (id: TouchId) => {
    if (isFingerIgnored(id)) return
    inVain.ignored.set(Math.mod(inVain.ignoredNext, IGNORE_SLOTS), id)
    inVain.ignoredNext += 1
}

export const pairPrevState = (pair: number) => inVain.pairPrev.get(pair)
export const pairNowState = (pair: number) => inVain.pairNow.get(pair)
export const setPairNowState = (pair: number, state: number) => inVain.pairNow.set(pair, state)

export const commitPairState = (pair: number) => inVain.pairPrev.set(pair, inVain.pairNow.get(pair))

export const claimTouch = (touch: Touch, entity: number, absDiff: number, hit: number) => {
    const i = touch.index
    if (claims.id.get(i) === touch.id && claims.diff.get(i) <= absDiff) return
    claims.id.set(i, touch.id)
    claims.entity.set(i, entity)
    claims.diff.set(i, absDiff)
    claims.hit.set(i, hit)
    claims.t.set(i, time.now)
}

const bodyDistance = (edge: number, left: number, width: number) => Math.max(0, left - edge, edge - (left + width))

export const claimPress = (touch: Touch, entity: number, ms: number, left: number, width: number, hit: number, claimOnly: boolean) => {
    const i = touch.index
    if (claims.id.get(i) === touch.id) {
        const previousMs = claims.diff.get(i)
        if (previousMs < ms) return
        if (previousMs === ms) {
            const previous = claims.entity.get(i)
            const note = archetypes.TapNote.import.get(previous < 0 ? -1 - previous : previous)
            const edge = edgeOfTouchX(touch.position.x)
            const distance = bodyDistance(edge, left, width)
            const previousDistance = bodyDistance(edge, note.pos, note.size)
            if (previousDistance < distance || (previousDistance === distance && (previous < 0 || !claimOnly))) return
        }
    }
    claims.id.set(i, touch.id)
    claims.entity.set(i, claimOnly ? -1 - entity : entity)
    claims.diff.set(i, ms)
    claims.hit.set(i, hit)
    claims.t.set(i, claimOnly ? NO_CLAIM_HIT : time.now)
}

export const isClaimedBy = (touchIndex: number, touchId: TouchId, entity: number) =>
    claims.id.get(touchIndex) === touchId && claims.entity.get(touchIndex) === entity

export const isTouchClaimed = (touch: Touch) => claims.id.get(touch.index) === touch.id

export const claimLiveAt = (i: number) => claims.t.get(i) === time.now && claims.id.get(i) !== (0 as TouchId)
export const claimEntityAt = (i: number) => claims.entity.get(i)
export const claimHitAt = (i: number) => claims.hit.get(i)

export const claimHitOf = (entity: number) => {
    let hit = NO_CLAIM_HIT
    for (let i = 0; i < MAX_TOUCHES; i++) if (claimLiveAt(i) && claims.entity.get(i) === entity) hit = claims.hit.get(i)
    return hit
}

export const flickedNow = (touch: Touch) => flicks.flicked.get(touch.index)
export const flickBeginEdge = (touch: Touch) => flicks.beginEdge.get(touch.index)
export const flickDirX = (touch: Touch) => flicks.dirX.get(touch.index)

export class InputManager extends SpawnableArchetype({}) {
    touchOrder = 0
    touch() {
        for (let l = 0; l < LANE_COUNT; l++) inVain.guard.set(l, false)

        for (let i = 0; i < MAX_TOUCHES; i++) claims.id.set(i, 0 as TouchId)
        for (const touch of touches) {
            const i = touch.index
            inVain.used.set(i, 0 as TouchId)

            if (touch.started) {
                flicks.flicked.set(i, false)
                flicks.beginEdge.set(i, -1000)
                flicks.dirX.set(i, 0)
                continue
            }
            const flicked = isFlickDelta(touch.delta.x / layout.scale, touch.delta.y / layout.scale, time.delta)
            flicks.flicked.set(i, flicked)
            flicks.beginEdge.set(i, flicked ? edgeOfTouchX(touch.position.x - touch.delta.x) : -1000)
            flicks.dirX.set(i, flicked ? (touch.delta.x < 0 ? -1 : 1) : 0)
        }
    }
}
