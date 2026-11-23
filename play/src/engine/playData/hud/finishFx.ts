import { FINISH_FX_BASE, particle } from '../particle.js'
import { centeredScreenQuad, hudLayout } from './canvas.js'
import { FinishType, HudState, NONE_TIME } from './hudState.js'

export const FINISH_FX_HALF = 1400
export const FINISH_FX_DURATION = 6
const FINISH_FX_LATE = 0.1

const finishFx = levelMemory({
    start: Number,
    instance: ParticleEffectInstanceId,
})

export const showFinishFx = (s: ContainerType<typeof HudState>, now: number) => {
    if (s.finishStart === finishFx.start) return

    if (s.finishStart !== NONE_TIME && now < s.finishStart) {
        if (finishFx.instance) particle.effects.destroy(finishFx.instance)
        finishFx.instance = 0 as ParticleEffectInstanceId
        return
    }
    if (finishFx.instance) particle.effects.destroy(finishFx.instance)
    finishFx.instance = 0 as ParticleEffectInstanceId
    finishFx.start = s.finishStart
    if (s.finishStart === NONE_TIME) return
    const type = s.finishType
    const t = now - s.finishStart
    if (type < FinishType.PerfectCombo || type > FinishType.LiveClear || t < 0 || t > FINISH_FX_LATE) return
    const id = (FINISH_FX_BASE + type - FinishType.PerfectCombo) as ParticleEffectId
    if (!particle.effects.exists(id)) return
    const d = 2 * FINISH_FX_HALF * hudLayout.u
    finishFx.instance = particle.effects.spawn(id, centeredScreenQuad(0, 0, d, d), FINISH_FX_DURATION, false)
}
