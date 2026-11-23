import { EffectClipName } from '@sonolus/core'
import { OurNotesEffectClip } from '../../../../lib/resources/manifest/effect_clips.js'

export const effect = defineEffect({
    clips: {
        perfect: OurNotesEffectClip.seDefaultPerfect,
        great: OurNotesEffectClip.seDefaultGreat,
        good: OurNotesEffectClip.seDefaultGood,
        inVain: OurNotesEffectClip.seDefaultInVain,

        just: OurNotesEffectClip.seDefaultJust,
        flick: OurNotesEffectClip.seDefaultFlick,
        flickDirection: OurNotesEffectClip.seDefaultFlickDirection,

        slideLoop: OurNotesEffectClip.seDefaultSlide,
        trace: OurNotesEffectClip.seDefaultTrace,
        slideConnect: OurNotesEffectClip.seDefaultSlideConnect,

        fbPerfect: EffectClipName.Perfect,
        fbGreat: EffectClipName.Great,
        fbGood: EffectClipName.Good,
        fbPerfectAlternative: EffectClipName.PerfectAlternative,
        fbHold: EffectClipName.Hold,
        fbStage: EffectClipName.Stage,

        liveStartCheer: OurNotesEffectClip.liveMixStartCheers,

        liveStartCheerRaw: OurNotesEffectClip.liveStartCheers,

        liveFinishCheer: OurNotesEffectClip.liveMixFinishCheers,

        liveFinishCheerLoop: OurNotesEffectClip.liveMixFinishCheersLoop,
        liveClear: OurNotesEffectClip.liveMixLiveClearDirection,
        liveFullCombo: OurNotesEffectClip.liveMixFullComboDirection,
        liveAssistFullCombo: OurNotesEffectClip.liveMixAssistFullComboDirection,
        liveAllPerfect: OurNotesEffectClip.liveMixAllPerfectDirection,

        solidPerfect: OurNotesEffectClip.seSolidPerfect,
        solidGreat: OurNotesEffectClip.seSolidGreat,
        solidGood: OurNotesEffectClip.seSolidGood,
        solidInVain: OurNotesEffectClip.seSolidInVain,
        solidJust: OurNotesEffectClip.seSolidJust,
        solidFlick: OurNotesEffectClip.seSolidFlick,
        solidFlickDirection: OurNotesEffectClip.seSolidFlickDirection,
        solidSlideLoop: OurNotesEffectClip.seSolidSlide,
        solidTrace: OurNotesEffectClip.seSolidTrace,
        solidSlideConnect: OurNotesEffectClip.seSolidSlideConnect,
        woodPerfect: OurNotesEffectClip.seWoodPerfect,
        woodGreat: OurNotesEffectClip.seWoodGreat,
        woodGood: OurNotesEffectClip.seWoodGood,
        woodInVain: OurNotesEffectClip.seWoodInVain,
        woodJust: OurNotesEffectClip.seWoodJust,
        woodFlick: OurNotesEffectClip.seWoodFlick,
        woodFlickDirection: OurNotesEffectClip.seWoodFlickDirection,
        woodSlideLoop: OurNotesEffectClip.seWoodSlide,
        woodTrace: OurNotesEffectClip.seWoodTrace,
        woodSlideConnect: OurNotesEffectClip.seWoodSlideConnect,
        typingPerfect: OurNotesEffectClip.seTypingPerfect,
        typingGreat: OurNotesEffectClip.seTypingGreat,
        typingGood: OurNotesEffectClip.seTypingGood,
        typingInVain: OurNotesEffectClip.seTypingInVain,
        typingJust: OurNotesEffectClip.seTypingJust,
        typingFlick: OurNotesEffectClip.seTypingFlick,
        typingFlickDirection: OurNotesEffectClip.seTypingFlickDirection,
        typingSlideLoop: OurNotesEffectClip.seTypingSlide,
        typingTrace: OurNotesEffectClip.seTypingTrace,
        typingSlideConnect: OurNotesEffectClip.seTypingSlideConnect,
    },
})

export const sfxDistance = 0.001

export const sfxDistanceScheduled = 1 / 120
