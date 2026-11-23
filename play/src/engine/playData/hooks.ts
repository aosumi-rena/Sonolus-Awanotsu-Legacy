import { options } from '../configuration/options.js'
import { EffectIds, playEmptyTapEffects, playEmptyTapEffectsParallel, playJudgeEffects } from './hookEffects.js'
import { inputNoteSfxOn } from './seGroups.js'

export const onNoteJudged = (
    ids: ContainerType<typeof EffectIds>,
    sim: number,
    c: number,
    w: number,
    edgeL: number,
    edgeR: number,
) => {

    playJudgeEffects(ids, sim, c, w, edgeL, edgeR, inputNoteSfxOn(), options.noteEffectEnabled, false)
}

export const onEmptyTap = (edge: number) => {
    playEmptyTapEffects(edge, inputNoteSfxOn(), options.laneEffectEnabled)
}

export const onEmptyTapParallel = (edge: number) => {
    playEmptyTapEffectsParallel(edge, inputNoteSfxOn(), options.laneEffectEnabled)
}
