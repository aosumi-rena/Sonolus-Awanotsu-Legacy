import { ParticleEffectName } from '@sonolus/core'
import { PART_COMPONENTS, SPARKS_NAME, partEffectName } from './hitFx.js'

const hitComponents: Record<string, string> = Object.fromEntries(PART_COMPONENTS.map((c, i) => [`hitC${i}`, partEffectName(c)]))

export const particle = defineParticle({
    effects: {
        ...(hitComponents as Record<'hitC0', string>),
        hitSparks: SPARKS_NAME,
        hitPopup: 'Our Notes Popup Perfect',
        fbTap: ParticleEffectName.NoteCircularTapCyan,
    },
})

if (PART_COMPONENTS.length !== 17) throw new Error('tutorial particle: expected the 17 note-effect components of play particle.ts')
