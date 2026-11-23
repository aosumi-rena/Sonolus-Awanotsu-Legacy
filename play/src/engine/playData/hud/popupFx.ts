import { SimJudgement } from '../../../../../shared/src/engine/data/notes.js'
import { POPUP_BASE, particle } from '../particle.js'
import { pxRectAt } from './canvas.js'
import { hudSprites, judgementY } from './hudDraw.js'
import { HudState, JudgeResultPosition, NONE_TIME } from './hudState.js'
import { options } from '../../configuration/options.js'
import { hofAvailable } from './hudOver.js'

export const POPUP_FX_LIFE = 0.3

const popupFx = levelMemory({
    start: Number,
    instance: ParticleEffectInstanceId,
})

const popupId = (sim: number) => POPUP_BASE + sim - SimJudgement.Miss

export const popupFxAvailable = () => particle.effects.exists(POPUP_BASE as ParticleEffectId)

export const showPopupFx = (s: ContainerType<typeof HudState>, now: number) => {

    if (hofAvailable()) return

    if (options.judgeResultPosition !== JudgeResultPosition.Center) return
    if (s.popStart === popupFx.start) return
    if (popupFx.instance) particle.effects.destroy(popupFx.instance)
    popupFx.instance = 0 as ParticleEffectInstanceId
    popupFx.start = s.popStart
    if (s.popStart === NONE_TIME) return
    const t = now - s.popStart
    const sim = s.popSim
    if (t < 0 || t >= POPUP_FX_LIFE || sim < SimJudgement.Miss || sim > SimJudgement.Just) return
    if (!particle.effects.exists(popupId(sim) as ParticleEffectId)) return
    popupFx.instance = particle.effects.spawn(
        popupId(sim) as ParticleEffectId,
        pxRectAt(0, judgementY(676), hudSprites.judgeW.get(sim), hudSprites.judgeH.get(sim), 1),
        POPUP_FX_LIFE,
        false,
    )
}
