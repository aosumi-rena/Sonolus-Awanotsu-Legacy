import { EngineConfigurationOption, Text } from '@sonolus/core'

const SE_PATTERN_NAMES = ['Our Notes', 'Solid', 'Wood', 'Typing'] as const

export const optionsDefinition = {

    speed: {
        name: Text.Speed,
        standard: true,
        advanced: true,
        type: 'slider',
        def: 1,
        min: 0.5,
        max: 2,
        step: 0.05,
        unit: Text.PercentageUnit,
    },
    hidden: {
        name: Text.Hidden,
        standard: true,
        advanced: true,
        type: 'slider',
        def: 0,
        min: 0,
        max: 1,
        step: 0.05,
        unit: Text.PercentageUnit,
    },
    sfxEnabled: {
        name: Text.Effect,
        description: 'Play note sounds and live sound effects.',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },
    autoSFX: {
        name: Text.EffectAuto,
        description: 'Play note sounds on the beat, regardless of when you tap.',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },
    noteEffectEnabled: {
        name: Text.NoteEffect,
        description: 'Show a visual effect when a note is judged.',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },
    laneEffectEnabled: {
        name: Text.LaneEffect,
        description: 'Light up the lane when you hit a note or tap an empty lane.',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },
    lockStageAspectRatio: {
        name: Text.StageAspectratioLock,
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },
    previewVerticalScale: {
        name: Text.PreviewScaleVertical,
        scope: 'Our Notes',
        type: 'slider',
        def: 1,
        min: 0.5,
        max: 2,
        step: 0.05,
        unit: Text.PercentageUnit,
    },

    flickDirectionCheck: {
        name: 'Strict Flick Direction',
        description: 'Require flicks to follow the arrow direction.',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    noteSpeed: {
        name: 'Notes Speed',
        description: 'Higher values make notes approach the judgment line faster.',
        scope: 'Our Notes',
        type: 'slider',
        def: 5,
        min: 1,
        max: 12,
        step: 0.01,
    },

    noteTiming: {
        name: 'Notes Timing',
        description: 'If you see more SLOW judgments, increase the value. If you see more FAST judgments, decrease it.',
        scope: 'Our Notes',
        type: 'slider',
        def: 0,
        min: -300,
        max: 300,
        step: 1,
        unit: Text.MillisecondUnit,
    },

    chartPosition: {
        name: 'Chart Position',
        description: 'Positive values delay the chart relative to the music. Negative values move it earlier.',
        scope: 'Our Notes',
        type: 'slider',
        def: 0,
        min: -300,
        max: 300,
        step: 1,
        unit: Text.MillisecondUnit,
    },

    mirror: {
        name: 'Mirror Chart',
        type: 'toggle',
        def: 0,
    },

    fastSlowDisplay: {
        name: 'FAST/SLOW Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    perfectFastSlowDisplay: {
        name: 'PERFECT FAST/SLOW Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    judgeOffsetMsDisplay: {
        name: 'FAST/SLOW Numerical Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    judgeResultPosition: {
        name: 'Judgment Text Display Position',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: ['Center', 'Each Lane', 'No Display'],
    },

    judgePosition: {
        name: 'HIT Position',
        scope: 'Our Notes',
        type: 'slider',
        def: 0,
        min: -5,
        max: 5,
        step: 1,
    },

    judgementLine: {
        name: 'HIT Position Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    slideOpacity: {
        name: 'Slide Opacity',
        scope: 'Our Notes',
        type: 'slider',
        def: 60,
        min: 10,
        max: 100,
        step: 5,
    },

    guideOpacity: {
        name: 'Guide Opacity',
        scope: 'Our Notes',
        type: 'slider',
        def: 60,
        min: 10,
        max: 100,
        step: 5,
    },

    simLineEnabled: {
        name: 'Simultaneous Press Line Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },

    measureLine: {
        name: 'Bar Line Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    damageEffect: {
        name: 'Damage Effect',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },

    backgroundBrightness: {
        name: 'Background Brightness',
        description: 'Lower the brightness to darken the stage behind the notes.',
        scope: 'Our Notes',
        type: 'slider',
        def: 70,
        min: 30,
        max: 100,
        step: 1,
    },

    comboCountDisplay: {
        name: 'Combo Number Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },

    judgeDetailDisplay: {
        name: 'HIT Breakdown',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },

    continuationEffectDisplay: {
        name: 'Continuous Effect Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 1,
    },

    laneOpacity: {
        name: 'Lane Opacity',
        description: 'Lower the opacity to see more of the stage through the lanes.',
        scope: 'Our Notes',
        type: 'slider',
        def: 80,
        min: 0,
        max: 100,
        step: 1,
    },

    guidelineOpacity: {
        name: 'Guideline Opacity',
        scope: 'Our Notes',
        type: 'slider',
        def: 25,
        min: 0,
        max: 100,
        step: 1,
    },

    guidelineCount: {
        name: 'Number of Guidelines',
        scope: 'Our Notes',
        type: 'select',
        def: 2,
        values: ['No Display', '4 Lanes', '6 Lanes', '8 Lanes', '12 Lanes'],
    },

    skillLine: {
        name: 'LIVE Skill Activation Display',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    noteStartPosition: {
        name: 'Notes Start Position',
        scope: 'Our Notes',
        type: 'slider',
        def: 0,
        min: 0,
        max: 100,
        step: 10,
    },

    liveSeMute: {
        name: 'SE Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    liveNoteSeMute: {
        name: 'Notes SE Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    noteSePattern: {
        name: 'Notes SE Change',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    useIndividualNoteSe: {
        name: 'Notes Type SE & Volume Setting',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    tapSe: {
        name: 'Tap',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    tapSeMute: {
        name: 'Tap Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    emptyTapSe: {
        name: 'Empty Tap',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    emptyTapSeMute: {
        name: 'Empty Tap Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    flickSe: {
        name: 'Flick',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    flickSeMute: {
        name: 'Flick Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    sideFlickSe: {
        name: 'Side Flick',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    sideFlickSeMute: {
        name: 'Side Flick Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    slideSe: {
        name: 'Slide',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    slideSeMute: {
        name: 'Slide Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    traceSe: {
        name: 'Trace',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: [...SE_PATTERN_NAMES],
    },

    traceSeMute: {
        name: 'Trace Mute',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

    judgeDisplayPositionPattern: {
        name: '判定表示位置',
        scope: 'Our Notes',
        type: 'select',
        def: 0,
        values: ['パターン1', 'パターン2'],
    },
    rhythmSupport: {
        name: 'Rhythm Support',
        description: 'Change the look of taps, flicks and slide starts to show their timing within the measure.',
        scope: 'Our Notes',
        type: 'toggle',
        def: 0,
    },

} satisfies Record<string, EngineConfigurationOption>

export const SE_GROUP_COUNT = SE_PATTERN_NAMES.length
