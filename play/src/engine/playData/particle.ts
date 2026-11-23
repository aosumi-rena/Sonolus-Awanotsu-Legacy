import { ParticleEffectName } from '@sonolus/core'
import { SKIN_SPRITE_NAMES, skin } from './skin.js'

export const EFFECT_FAMILIES = ['Normal', 'Slide', 'Slide Connect', 'Flick', 'Flick Left', 'Flick Right'] as const
export const EFFECT_JUDGEMENTS = ['Perfect', 'Great', 'Good', 'Bad'] as const
export const EFFECT_COMPONENTS = [
    'Ring Halo',
    'Ring Halo Mid',
    'Ring Cap',
    'Ring Mid',
    'Pillar Back',
    'Pillar Front',
    'Wall Front',
    'Wall Side L',
    'Wall Side R',
    'Sum L',
    'Sum Mid',
    'Sum R',
    'Ring Glow Mid',
    'Ring Glow Cap',
    'Sum Front L',
    'Sum Front Mid',
    'Sum Front R',
] as const
export const COMPONENT_COUNT = EFFECT_COMPONENTS.length
export const Comp = {
    RingHalo: 0,
    RingHaloMid: 1,
    RingCap: 2,
    RingMid: 3,
    PillarBack: 4,
    PillarFront: 5,
    WallFront: 6,
    WallSideL: 7,
    WallSideR: 8,
    SumL: 9,
    SumMid: 10,
    SumR: 11,
    RingGlowMid: 12,
    RingGlowCap: 13,
    SumFrontL: 14,
    SumFrontMid: 15,
    SumFrontR: 16,
} as const
export const LANE_EFFECTS = ['Normal', 'Slide', 'Flick', 'Flick Left', 'Flick Right', 'In Vain', 'Gekisou'] as const

export const WIDTH_VARIANTS = [4, 6, 8, 10, 12, 24] as const

const generated: Record<string, string> = {}
let nextId = 0
const add = (key: string, name: string) => {
    generated[key] = name
    nextId++
}

export const NOTE_BASE = nextId
for (const f of EFFECT_FAMILIES)
    for (const j of EFFECT_JUDGEMENTS)
        for (const c of EFFECT_COMPONENTS) add(`n_${f}_${j}_${c}`, `Our Notes Note Effect ${f} ${j} ${c}`)

export const SPARKS_BASE = nextId
for (const f of EFFECT_FAMILIES)
    for (const j of EFFECT_JUDGEMENTS)
        for (const n of WIDTH_VARIANTS) add(`s_${f}_${j}_${n}`, `Our Notes Note Effect ${f} ${j} Sparks W${n}`)

export const LOOP_BASE = nextId
for (const c of EFFECT_COMPONENTS) add(`loop_${c}`, `Our Notes Note Effect Slide Loop ${c}`)
export const LOOP_SPARKS_BASE = nextId
for (const n of WIDTH_VARIANTS) add(`loop_s_${n}`, `Our Notes Note Effect Slide Loop Sparks W${n}`)

export const LOOP_SPARKS_START_BASE = nextId
for (const n of WIDTH_VARIANTS) add(`loop_ss_${n}`, `Our Notes Note Effect Slide Loop Sparks Start W${n}`)

export const LANE_BASE = nextId
for (const l of LANE_EFFECTS) add(`lane_${l}`, `Our Notes Lane Effect ${l}`)

export const POPUP_JUDGEMENTS = ['Miss', 'Bad', 'Good', 'Great', 'Perfect', 'Just'] as const
export const POPUP_BASE = nextId
for (const j of POPUP_JUDGEMENTS) add(`popup_${j}`, `Our Notes Popup ${j}`)

export const GROOVE_ID = nextId

const HOF_KEYS = {
    r1Lo: 'judgementPerfect',
    r1Hi: 'hudLifeTrackCapsule',
    r2Lo: 'hudBlack',
    r2Hi: 'hudLifeFillDanger',
    fLo: 'hudDigit260',
    fHi: 'hudDigit24Plus',
} as const
const skinIdOf = (key: string) => (skin.sprites as unknown as Record<string, { id: number }>)[key]!.id

export const HOF_R1_LO = skinIdOf(HOF_KEYS.r1Lo)
export const HOF_R1_HI = skinIdOf(HOF_KEYS.r1Hi)
export const HOF_R2_LO = skinIdOf(HOF_KEYS.r2Lo)
export const HOF_R2_HI = skinIdOf(HOF_KEYS.r2Hi)
export const HOF_F_LO = skinIdOf(HOF_KEYS.fLo)
export const HOF_F_HI = skinIdOf(HOF_KEYS.fHi)

export const HOF_FADE_STEPS = 31
const hofName = (skinId: number) => 'Our Notes HUD Over ' + SKIN_SPRITE_NAMES[skinId]!.replace(/^Our Notes /, '')
const hofGenerated: Record<string, string> = {}
const hofAdd = (key: string, name: string) => {
    hofGenerated[key] = name
}
for (let i = HOF_R1_LO; i <= HOF_R1_HI; i++) hofAdd(`hof_${i}`, hofName(i))
for (let i = HOF_R2_LO; i <= HOF_R2_HI; i++) hofAdd(`hof_${i}`, hofName(i))
for (let i = HOF_F_LO; i <= HOF_F_HI; i++) for (let k = 1; k <= HOF_FADE_STEPS; k++) hofAdd(`hofa_${i}_${k}`, `${hofName(i)} A${k}`)

export const HOF_R1_N = HOF_R1_HI - HOF_R1_LO + 1

export const particle = defineParticle({
    effects: {
        ...generated,

        grooveLoop: 'Our Notes Note Effect Groove Loop',

        fbNoteTap: ParticleEffectName.NoteCircularTapCyan,
        fbNoteSlide: ParticleEffectName.NoteCircularTapGreen,
        fbNoteFlick: ParticleEffectName.NoteCircularAlternativeRed,
        fbNoteFlickLeft: ParticleEffectName.NoteLinearAlternativePurple,
        fbNoteFlickRight: ParticleEffectName.NoteLinearAlternativeYellow,
        fbNoteTrace: ParticleEffectName.NoteCircularAlternativeBlue,
        fbSlideLoop: ParticleEffectName.NoteCircularHoldGreen,
        fbLane: ParticleEffectName.LaneLinear,

        introSparkles: 'Our Notes Intro Sparkles',

        finishAllPerfect: 'Our Notes Finish AllPerfect',
        finishFullCombo: 'Our Notes Finish FullCombo',
        finishAssistFullCombo: 'Our Notes Finish AssistFullCombo',
        finishLiveClear: 'Our Notes Finish LiveClear',

        ...hofGenerated,

        introSparklesNoCard: 'Our Notes Intro Sparkles No Card',

        loopPillarBackP01: 'Our Notes Note Effect Slide Loop Pillar Back P01',
        loopPillarFrontP01: 'Our Notes Note Effect Slide Loop Pillar Front P01',

        loopSumLP01: 'Our Notes Note Effect Slide Loop Sum L P01',
        loopSumMidP01: 'Our Notes Note Effect Slide Loop Sum Mid P01',
        loopSumRP01: 'Our Notes Note Effect Slide Loop Sum R P01',
        loopSumFrontLP01: 'Our Notes Note Effect Slide Loop Sum Front L P01',
        loopSumFrontMidP01: 'Our Notes Note Effect Slide Loop Sum Front Mid P01',
        loopSumFrontRP01: 'Our Notes Note Effect Slide Loop Sum Front R P01',
    },
})

export const HOF_BASE = particle.effects.finishLiveClear.id + 1
export const HOF_FADE_BASE = HOF_BASE + HOF_R1_N + (HOF_R2_HI - HOF_R2_LO + 1)
{
    const fx = particle.effects as unknown as Record<string, { id: number }>
    if (
        HOF_R1_LO < 0 ||
        HOF_R1_HI <= HOF_R1_LO ||
        HOF_R2_HI <= HOF_R2_LO ||
        HOF_F_LO < HOF_R1_LO ||
        HOF_F_HI > HOF_R1_HI ||
        fx[`hof_${HOF_R1_LO}`]!.id !== HOF_BASE ||
        fx[`hof_${HOF_R2_LO}`]!.id !== HOF_BASE + HOF_R1_N ||
        fx[`hofa_${HOF_F_LO}_1`]!.id !== HOF_FADE_BASE ||
        fx[`hofa_${HOF_F_HI}_${HOF_FADE_STEPS}`]!.id !== HOF_FADE_BASE + (HOF_F_HI - HOF_F_LO + 1) * HOF_FADE_STEPS - 1
    )
        throw new Error('particle roster order changed: HUD overlay blocks do not mirror the skin ranges')
}

export const FINISH_FX_BASE = particle.effects.finishAllPerfect.id
if (particle.effects.finishLiveClear.id !== FINISH_FX_BASE + 3) throw new Error('particle roster order changed: finish block mismatch')

if (particle.effects.grooveLoop.id !== GROOVE_ID) throw new Error('particle roster order changed: GROOVE_ID mismatch')
if (particle.effects.fbNoteTap.id !== GROOVE_ID + 1) throw new Error('particle roster order changed: fallback block mismatch')

if (
    particle.effects.loopSumMidP01.id !== particle.effects.loopSumLP01.id + 1 ||
    particle.effects.loopSumRP01.id !== particle.effects.loopSumLP01.id + 2 ||
    particle.effects.loopSumFrontLP01.id !== particle.effects.loopSumLP01.id + 3 ||
    particle.effects.loopSumFrontMidP01.id !== particle.effects.loopSumLP01.id + 4 ||
    particle.effects.loopSumFrontRP01.id !== particle.effects.loopSumLP01.id + 5 ||
    Comp.SumMid !== Comp.SumL + 1 ||
    Comp.SumR !== Comp.SumL + 2 ||
    Comp.SumFrontMid !== Comp.SumFrontL + 1 ||
    Comp.SumFrontR !== Comp.SumFrontL + 2
)
    throw new Error('particle roster order changed: loop SUM P01 block mismatch')
