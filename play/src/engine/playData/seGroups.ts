import { SE_GROUP_COUNT } from '../../../../shared/src/engine/configuration/options.js'
import { options } from '../configuration/options.js'
import { effect } from './effect.js'

export const SeFamily = { EmptyTap: 0, Tap: 1, Flick: 2, SideFlick: 3, Slide: 4, Trace: 5 } as const

export const SeSlot = {
    Perfect: effect.clips.perfect.id,
    Great: effect.clips.great.id,
    Good: effect.clips.good.id,
    InVain: effect.clips.inVain.id,
    Just: effect.clips.just.id,
    Flick: effect.clips.flick.id,
    FlickDirection: effect.clips.flickDirection.id,
    SlideLoop: effect.clips.slideLoop.id,
    Trace: effect.clips.trace.id,
    SlideConnect: effect.clips.slideConnect.id,
} as const
export const SE_SLOTS = 10

export const SE_PATTERN_BASE = effect.clips.solidPerfect.id

{
    const c = effect.clips
    const block = (first: number, ids: number[]) => ids.every((id, i) => id === first + i)
    const g1 = [c.perfect.id, c.great.id, c.good.id, c.inVain.id, c.just.id, c.flick.id, c.flickDirection.id, c.slideLoop.id, c.trace.id, c.slideConnect.id]
    const g2 = [c.solidPerfect.id, c.solidGreat.id, c.solidGood.id, c.solidInVain.id, c.solidJust.id, c.solidFlick.id, c.solidFlickDirection.id, c.solidSlideLoop.id, c.solidTrace.id, c.solidSlideConnect.id]
    const g3 = [c.woodPerfect.id, c.woodGreat.id, c.woodGood.id, c.woodInVain.id, c.woodJust.id, c.woodFlick.id, c.woodFlickDirection.id, c.woodSlideLoop.id, c.woodTrace.id, c.woodSlideConnect.id]
    const g4 = [c.typingPerfect.id, c.typingGreat.id, c.typingGood.id, c.typingInVain.id, c.typingJust.id, c.typingFlick.id, c.typingFlickDirection.id, c.typingSlideLoop.id, c.typingTrace.id, c.typingSlideConnect.id]
    if (!block(0, g1) || !block(SE_PATTERN_BASE, g2) || !block(SE_PATTERN_BASE + SE_SLOTS, g3) || !block(SE_PATTERN_BASE + 2 * SE_SLOTS, g4) || SE_GROUP_COUNT !== 4)
        throw new Error('effect roster order changed: the note SE group blocks are not contiguous (seGroups.ts)')
}

export const seGroupOf = (family: number) =>
    !options.useIndividualNoteSe
        ? options.noteSePattern
        : family === SeFamily.EmptyTap
          ? options.emptyTapSe
          : family === SeFamily.Tap
            ? options.tapSe
            : family === SeFamily.Flick
              ? options.flickSe
              : family === SeFamily.SideFlick
                ? options.sideFlickSe
                : family === SeFamily.Slide
                  ? options.slideSe
                  : options.traceSe

export const noteSfxOn = () => options.sfxEnabled && !options.liveNoteSeMute

export const inputNoteSfxOn = () => noteSfxOn() && !options.autoSFX

export const noteSeMuted = (family: number) =>
    family === SeFamily.EmptyTap
        ? options.emptyTapSeMute
        : family === SeFamily.Tap
          ? options.tapSeMute
          : family === SeFamily.Flick
            ? options.flickSeMute
            : family === SeFamily.SideFlick
              ? options.sideFlickSeMute
              : family === SeFamily.Slide
                ? options.slideSeMute
                : options.traceSeMute

export const SE_MUTED = -1

export const noteSeClip = (slot: number, family: number, fallback: EffectClip) => {
    if (noteSeMuted(family)) return SE_MUTED
    const group = seGroupOf(family)
    const id = group <= 0 ? slot : SE_PATTERN_BASE + (group - 1) * SE_SLOTS + slot
    return effect.clips.exists(id as EffectClipId) ? id : effect.clips.exists(slot as EffectClipId) ? slot : fallback.id
}
