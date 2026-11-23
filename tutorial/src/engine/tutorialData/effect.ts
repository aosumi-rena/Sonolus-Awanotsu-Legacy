import { EffectClipName } from '@sonolus/core'
import { OurNotesEffectClip } from '../../../../lib/resources/manifest/effect_clips.js'

export const effect = defineEffect({
    clips: {
        perfect: OurNotesEffectClip.seDefaultPerfect,
        fbPerfect: EffectClipName.Perfect,
    },
})
