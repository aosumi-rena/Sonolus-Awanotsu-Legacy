import { SimJudgement } from '../../../../shared/src/engine/data/notes.js'
import { options } from '../configuration/options.js'
import { effect } from './effect.js'
import { EffectIds, resolveNoteEffectIds, scheduleJudgeSfx } from './hookEffects.js'
import { SeFamily, SeSlot, noteSeClip, noteSfxOn } from './seGroups.js'

export const autoSfxOn = () => noteSfxOn() && options.autoSFX

export const scheduleAutoNoteSfx = (op: number, dir: number, ids: ContainerType<typeof EffectIds>, targetTime: number) => {
    resolveNoteEffectIds(op, dir, ids)
    scheduleJudgeSfx(ids, SimJudgement.Perfect, targetTime)
}

const autoHoldVoice = levelMemory({ active: Boolean, end: Number })

export const resetAutoSfx = () => {
    autoHoldVoice.active = false
    autoHoldVoice.end = 0
}

export const addAutoHoldVoiceSpan = (s: number, e: number) => {
    if (e <= s) return

    const clipId = noteSeClip(SeSlot.SlideLoop, SeFamily.Slide, effect.clips.fbHold)
    if (clipId < 0) return
    const clip = clipId as EffectClipId
    if (autoHoldVoice.active && s <= autoHoldVoice.end) {
        if (e <= autoHoldVoice.end) return
        const id = effect.clips.scheduleLoop(clip, autoHoldVoice.end)
        effect.clips.scheduleStopLoop(id, e)
        autoHoldVoice.end = e
        return
    }
    const id = effect.clips.scheduleLoop(clip, s)
    effect.clips.scheduleStopLoop(id, e)
    autoHoldVoice.active = true
    autoHoldVoice.end = e
}
