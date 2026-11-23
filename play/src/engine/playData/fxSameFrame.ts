import { LANE3D_STEP } from '../../../../shared/src/engine/data/geometry.js'
import { lanePairOf } from '../../../../shared/src/engine/data/inputLane.js'
import { SimJudgement, judgementTypeOf } from '../../../../shared/src/engine/data/notes.js'
import { judgeDiffMs } from '../../../../shared/src/engine/data/windows.js'
import { options } from '../configuration/options.js'
import { MAX_TOUCHES, claimEntityAt, claimHitAt, claimLiveAt, isPairInVainGuarded } from './archetypes/InputManager.js'
import { archetypes } from './archetypes/index.js'
import { laneOfScreenX } from './archetypes/inputLane.js'
import {
    LaneType,
    drawFloodRunAt,
    drawFxPartsAt,
    familyOf,
    fxLayerActive,
    fxLayerMapHi,
    fxLayerMapLo,
    judgeIndex,
    laneFloodHitPlaying,
    laneFloodZMask,
    laneTypeOf,
} from './hookEffects.js'
import { chartTime, viewCenter, viewWidth } from './layout.js'

const sameFrameJudgement = (i: number) => {
    const e = claimEntityAt(i)
    const imp = archetypes.TapNote.import.get(e)

    const diffMs = Math.floor((claimHitAt(i) - chartTime(imp.ms)) * 1000 + 1e-6)
    return judgeDiffMs(judgementTypeOf(imp.op, imp.crit > 0), diffMs)
}

export const drawClaimFxParts = () => {
    if (!options.noteEffectEnabled || !fxLayerActive()) return
    for (let i = 0; i < MAX_TOUCHES; i++) {
        if (!claimLiveAt(i)) continue
        const imp = archetypes.TapNote.import.get(claimEntityAt(i))
        const fam = familyOf(imp.op, imp.dir)
        const j = judgeIndex(sameFrameJudgement(i))
        if (fam < 0 || j < 0) continue
        const key = fam * 4 + j
        const c = viewCenter(imp.pos, imp.size)
        drawFxPartsAt(false, fam, fxLayerMapLo(key), fxLayerMapHi(key), 0, LANE3D_STEP * (c + 0.5 - 12), viewWidth(imp.pos, imp.size) * LANE3D_STEP, time.now, 64 + i)
    }
}

export const computeClaimFloodLanes = (out: Tuple<number>) => {
    for (let lane = 0; lane < 24; lane++) out.set(lane, -1)
    if (!options.laneEffectEnabled) return
    for (let i = 0; i < MAX_TOUCHES; i++) {
        if (!claimLiveAt(i)) continue
        const imp = archetypes.TapNote.import.get(claimEntityAt(i))
        const sim = sameFrameJudgement(i)
        const lt = laneTypeOf(imp.op, imp.dir)
        if (sim >= SimJudgement.Good && lt >= 0) {

            const l0 = Math.max(0, Math.floor(imp.pos + 1e-6))
            const l1 = Math.min(23, Math.ceil(imp.pos + imp.size - 1e-6) - 1)
            for (let lane = l0; lane <= l1; lane++) if (out.get(lane) < 0 || lt < out.get(lane)) out.set(lane, lt)
        } else if ((sim === SimJudgement.Bad || sim === SimJudgement.Miss) && (imp.op === 1 || imp.op === 20 || imp.op === 101)) {

            const lane = laneOfScreenX(touches.get(i).position.x)
            if (lane < 0) continue
            const p = lanePairOf(lane)
            if (isPairInVainGuarded(p)) continue
            for (let k = 2 * p; k < 2 * p + 2; k++) if (out.get(k) < 0 && !laneFloodHitPlaying(k)) out.set(k, LaneType.InVain)
        }
    }
}

export const drawClaimFloods = (out: Tuple<number>) => {
    const zMask = laneFloodZMask()
    let run = -1
    for (let lane = 0; lane <= 24; lane++) {
        const t = lane < 24 ? out.get(lane) : -1
        const same = run >= 0 && t >= 0 && t === out.get(run)
        if (run >= 0 && !same) drawFloodRunAt(run, lane, out.get(run), 0, zMask)
        run = same ? run : t >= 0 ? lane : -1
    }
}
