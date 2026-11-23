import { SkinSpriteName } from '@sonolus/core'
import { OurNotesSkinSprite } from '../../../../lib/resources/manifest/skin_sprites.js'
import { FXL_CORE_COLOURS, FXL_HALO_COLOURS, FXL_SKIN_SPRITES, FXL_WALL_COLOURS } from './fxLayer.generated.js'
import { NoteBodySprite } from './noteSprites.generated.js'

const NOTE_SECTION = Object.keys(OurNotesSkinSprite).indexOf('pairLine')
const flashName = (n: string) => n.replace(/^Our Notes /, 'Our Notes Note Flash ')
const NOTE_FLASH_A: Record<string, string> = Object.fromEntries(
    Object.entries(OurNotesSkinSprite)
        .slice(0, NOTE_SECTION)
        .map(([k, n]) => [`flashA_${k}`, flashName(n)]),
)
const MAIN_PIECES = {
    tapNoteMainL: 'Our Notes Tap Note Main Left',
    tapNoteMainC: 'Our Notes Tap Note Main Center',
    tapNoteMainR: 'Our Notes Tap Note Main Right',
    slideNoteMainL: 'Our Notes Slide Note Main Left',
    slideNoteMainC: 'Our Notes Slide Note Main Center',
    slideNoteMainR: 'Our Notes Slide Note Main Right',
    slideEndNoteMainL: 'Our Notes Slide End Note Main Left',
    slideEndNoteMainC: 'Our Notes Slide End Note Main Center',
    slideEndNoteMainR: 'Our Notes Slide End Note Main Right',
    slideConnectNoteMainL: 'Our Notes Slide Connect Note Main Left',
    slideConnectNoteMainC: 'Our Notes Slide Connect Note Main Center',
    slideConnectNoteMainR: 'Our Notes Slide Connect Note Main Right',
    traceNoteMainL: 'Our Notes Trace Note Main Left',
    traceNoteMainC: 'Our Notes Trace Note Main Center',
    traceNoteMainR: 'Our Notes Trace Note Main Right',
    flickNoteMainL: 'Our Notes Flick Note Main Left',
    flickNoteMainC: 'Our Notes Flick Note Main Center',
    flickNoteMainR: 'Our Notes Flick Note Main Right',
    flickLeftNoteMainL: 'Our Notes Flick Left Note Main Left',
    flickLeftNoteMainC: 'Our Notes Flick Left Note Main Center',
    flickLeftNoteMainR: 'Our Notes Flick Left Note Main Right',
    flickRightNoteMainL: 'Our Notes Flick Right Note Main Left',
    flickRightNoteMainC: 'Our Notes Flick Right Note Main Center',
    flickRightNoteMainR: 'Our Notes Flick Right Note Main Right',
} as const
const NOTE_FLASH_B: Record<string, string> = Object.fromEntries(Object.entries(MAIN_PIECES).map(([k, n]) => [`flashB_${k}`, flashName(n)]))

const upArrowEntries = Array.from({ length: 8 }, (_, i) => [`flickUpArrow${i + 1}`, `Our Notes Flick Up Arrow ${i + 1}`])
const rhythmBodyEntries = Object.entries(OurNotesSkinSprite).slice(0, NOTE_SECTION)
const rhythmPieceEntries = Object.entries(MAIN_PIECES)
const rhythmRoster = (subdivision: number): Record<string, string> => {
    const body = [...rhythmBodyEntries, ...rhythmPieceEntries]
    const entries = [...body, ...upArrowEntries, ...body.map(([key, name]) => [`white_${key}`, flashName(name!)])]
    return Object.fromEntries(entries.map(([key, name]) => [`rhythm${subdivision}_${key}`, name!.replace(/^Our Notes /, `Our Notes Rhythm ${subdivision} `)]))
}

const SKIN_SPRITES = {
        ...OurNotesSkinSprite,

        slideBodyNormalMid0: 'Our Notes Slide Body Normal Mid R0',
        slideBodyNormalMid1: 'Our Notes Slide Body Normal Mid R1',
        slideBodyNormalMid2: 'Our Notes Slide Body Normal Mid R2',
        slideBodyNormalBand0: 'Our Notes Slide Body Normal Band R0',
        slideBodyNormalBand1: 'Our Notes Slide Body Normal Band R1',
        slideBodyNormalBand2: 'Our Notes Slide Body Normal Band R2',
        slideBodyPressedMid0: 'Our Notes Slide Body Pressed Mid R0',
        slideBodyPressedMid1: 'Our Notes Slide Body Pressed Mid R1',
        slideBodyPressedMid2: 'Our Notes Slide Body Pressed Mid R2',
        slideBodyPressedBand0: 'Our Notes Slide Body Pressed Band R0',
        slideBodyPressedBand1: 'Our Notes Slide Body Pressed Band R1',
        slideBodyPressedBand2: 'Our Notes Slide Body Pressed Band R2',
        slideBodyDisabledMid0: 'Our Notes Slide Body Disabled Mid R0',
        slideBodyDisabledMid1: 'Our Notes Slide Body Disabled Mid R1',
        slideBodyDisabledMid2: 'Our Notes Slide Body Disabled Mid R2',
        slideBodyDisabledBand0: 'Our Notes Slide Body Disabled Band R0',
        slideBodyDisabledBand1: 'Our Notes Slide Body Disabled Band R1',
        slideBodyDisabledBand2: 'Our Notes Slide Body Disabled Band R2',
        guideBodyMid: 'Our Notes Guide Body Mid',

        laneLineGrey: 'Our Notes Lane Line Grey',
        skillLineTinted: 'Our Notes Skill Line Tinted',
        laneTapAreaTL: 'Our Notes Lane Tap Area TL',
        laneTapAreaT: 'Our Notes Lane Tap Area T',
        laneTapAreaTR: 'Our Notes Lane Tap Area TR',
        laneTapAreaL: 'Our Notes Lane Tap Area L',
        laneTapAreaC: 'Our Notes Lane Tap Area C',
        laneTapAreaR: 'Our Notes Lane Tap Area R',
        laneTapAreaBL: 'Our Notes Lane Tap Area BL',
        laneTapAreaB: 'Our Notes Lane Tap Area B',
        laneTapAreaBR: 'Our Notes Lane Tap Area BR',

        ...MAIN_PIECES,

        hudBlack: 'Our Notes HUD Black',
        hudHeaderBase: 'Our Notes HUD Header Base',
        hudStatusBase: 'Our Notes HUD Status Base',
        hudRankGaugeWell: 'Our Notes HUD Rank Gauge Well',
        hudRankGaugeFill: 'Our Notes HUD Rank Gauge Fill',
        hudTextRank: 'Our Notes HUD Text Rank',
        hudTextLiveScore: 'Our Notes HUD Text Live Score',
        hudRankLetterC: 'Our Notes HUD Rank Letter C',
        hudRankLetterB: 'Our Notes HUD Rank Letter B',
        hudRankLetterA: 'Our Notes HUD Rank Letter A',
        hudRankLetterS: 'Our Notes HUD Rank Letter S',
        hudRankLetterSS: 'Our Notes HUD Rank Letter SS',
        hudLifeTrack: 'Our Notes HUD Life Track',
        hudLifeFillNormal: 'Our Notes HUD Life Fill Normal',
        hudLifeFillDanger: 'Our Notes HUD Life Fill Danger',

        laneLineAaGrey: 'Our Notes Lane Line AA Grey',
        laneLineAaWhite: 'Our Notes Lane Line AA White',
        laneOutsideLineAa: 'Our Notes Lane Outside Line AA',
        laneIntroBeam: 'Our Notes Lane Intro Beam',
        laneIntroBeamBlue: 'Our Notes Lane Intro Beam Blue',
        laneIntroHalo: 'Our Notes Lane Intro Halo',
        laneIntroHaloInner: 'Our Notes Lane Intro Halo Inner',
        laneIntroBase: 'Our Notes Lane Intro Base',
        laneIntroShort: 'Our Notes Lane Intro Short',
        laneIntroShortHalo: 'Our Notes Lane Intro Short Halo',
        laneIntroStar: 'Our Notes Lane Intro Star',
        stageShadow: 'Our Notes Stage Shadow',
        laneBaseStrip00: 'Our Notes Lane Base Strip 00',
        laneBaseStrip01: 'Our Notes Lane Base Strip 01',
        laneBaseStrip02: 'Our Notes Lane Base Strip 02',
        laneBaseStrip03: 'Our Notes Lane Base Strip 03',
        laneBaseStrip04: 'Our Notes Lane Base Strip 04',
        laneBaseStrip05: 'Our Notes Lane Base Strip 05',
        laneBaseStrip06: 'Our Notes Lane Base Strip 06',
        laneBaseStrip07: 'Our Notes Lane Base Strip 07',
        laneBaseStrip08: 'Our Notes Lane Base Strip 08',
        laneBaseStrip09: 'Our Notes Lane Base Strip 09',
        laneBaseStrip10: 'Our Notes Lane Base Strip 10',
        laneBaseStrip11: 'Our Notes Lane Base Strip 11',
        laneBaseStrip12: 'Our Notes Lane Base Strip 12',
        laneBaseStrip13: 'Our Notes Lane Base Strip 13',
        laneBaseStrip14: 'Our Notes Lane Base Strip 14',
        laneBaseStrip15: 'Our Notes Lane Base Strip 15',
        laneBaseStrip16: 'Our Notes Lane Base Strip 16',
        laneBaseStrip17: 'Our Notes Lane Base Strip 17',
        laneBaseStrip18: 'Our Notes Lane Base Strip 18',
        laneBaseStrip19: 'Our Notes Lane Base Strip 19',
        laneBaseStrip20: 'Our Notes Lane Base Strip 20',
        laneBaseStrip21: 'Our Notes Lane Base Strip 21',
        laneBaseStrip22: 'Our Notes Lane Base Strip 22',
        laneBaseStrip23: 'Our Notes Lane Base Strip 23',
        laneBaseStrip24: 'Our Notes Lane Base Strip 24',
        laneBaseStrip25: 'Our Notes Lane Base Strip 25',
        laneBaseStrip26: 'Our Notes Lane Base Strip 26',
        laneBaseStrip27: 'Our Notes Lane Base Strip 27',
        laneBaseStrip28: 'Our Notes Lane Base Strip 28',
        laneBaseStrip29: 'Our Notes Lane Base Strip 29',
        laneBaseStrip30: 'Our Notes Lane Base Strip 30',
        laneBaseStrip31: 'Our Notes Lane Base Strip 31',
        laneBaseStrip32: 'Our Notes Lane Base Strip 32',
        laneBaseStrip33: 'Our Notes Lane Base Strip 33',
        laneBaseStrip34: 'Our Notes Lane Base Strip 34',
        laneBaseStrip35: 'Our Notes Lane Base Strip 35',
        laneBaseStrip36: 'Our Notes Lane Base Strip 36',
        laneBaseStrip37: 'Our Notes Lane Base Strip 37',
        laneBaseStrip38: 'Our Notes Lane Base Strip 38',
        laneBaseStrip39: 'Our Notes Lane Base Strip 39',
        laneBaseStrip40: 'Our Notes Lane Base Strip 40',
        laneBaseStrip41: 'Our Notes Lane Base Strip 41',

        laneTapAreaColL: 'Our Notes Lane Tap Area Col L',
        laneTapAreaColC: 'Our Notes Lane Tap Area Col C',
        laneTapAreaColR: 'Our Notes Lane Tap Area Col R',

        laneFloodNormal: 'Our Notes Lane Flood Normal',
        laneFloodSlide: 'Our Notes Lane Flood Slide',
        laneFloodFlick: 'Our Notes Lane Flood Flick',
        laneFloodFlickLeft: 'Our Notes Lane Flood Flick Left',
        laneFloodFlickRight: 'Our Notes Lane Flood Flick Right',
        laneFloodInVain: 'Our Notes Lane Flood In Vain',

        ...FXL_SKIN_SPRITES,

        ...NoteBodySprite,

        fbLane: SkinSpriteName.Lane,
        fbLaneAlternative: SkinSpriteName.LaneAlternative,
        fbStageLeftBorder: SkinSpriteName.StageLeftBorder,
        fbStageRightBorder: SkinSpriteName.StageRightBorder,
        fbJudgmentLine: SkinSpriteName.JudgmentLine,
        fbTapNote: SkinSpriteName.NoteHeadCyan,
        fbSlideNote: SkinSpriteName.NoteHeadGreen,
        fbSlideEndNote: SkinSpriteName.NoteTailGreen,
        fbSlideTick: SkinSpriteName.NoteTickGreen,
        fbTraceNote: SkinSpriteName.NoteTickBlue,
        fbFlickNote: SkinSpriteName.NoteHeadRed,
        fbFlickArrow: SkinSpriteName.DirectionalMarkerRed,
        fbFlickLeftNote: SkinSpriteName.NoteHeadPurple,
        fbFlickLeftArrow: SkinSpriteName.DirectionalMarkerPurple,
        fbFlickRightNote: SkinSpriteName.NoteHeadYellow,
        fbFlickRightArrow: SkinSpriteName.DirectionalMarkerYellow,
        fbSlideLine: SkinSpriteName.NoteConnectionGreenSeamless,
        fbGuideLine: SkinSpriteName.NoteConnectionNeutralSeamless,
        fbPairLine: SkinSpriteName.SimultaneousConnectionNeutralSeamless,
        fbWhite: SkinSpriteName.StageCover,

        ...NOTE_FLASH_A,
        ...NOTE_FLASH_B,

        laneIntroHaloS0: 'Our Notes Lane Intro Halo S0',
        laneIntroHaloS1: 'Our Notes Lane Intro Halo S1',
        laneIntroHaloS2: 'Our Notes Lane Intro Halo S2',
        laneIntroHaloS3: 'Our Notes Lane Intro Halo S3',
        laneIntroHaloS4: 'Our Notes Lane Intro Halo S4',
        laneIntroHaloS5: 'Our Notes Lane Intro Halo S5',
        laneIntroHaloS6: 'Our Notes Lane Intro Halo S6',
        laneIntroHaloL0: 'Our Notes Lane Intro Halo L0',
        laneIntroHaloL1: 'Our Notes Lane Intro Halo L1',
        laneIntroHaloL2: 'Our Notes Lane Intro Halo L2',
        laneIntroHaloL3: 'Our Notes Lane Intro Halo L3',
        laneIntroHaloL4: 'Our Notes Lane Intro Halo L4',
        laneIntroHaloL5: 'Our Notes Lane Intro Halo L5',
        laneIntroHaloL6: 'Our Notes Lane Intro Halo L6',

        laneIntroStarGlow: 'Our Notes Lane Intro Star Glow',

        laneIntroHaloM0: 'Our Notes Lane Intro Halo M0',
        laneIntroHaloM1: 'Our Notes Lane Intro Halo M1',
        laneIntroHaloM2: 'Our Notes Lane Intro Halo M2',
        laneIntroHaloM3: 'Our Notes Lane Intro Halo M3',
        laneIntroHaloM4: 'Our Notes Lane Intro Halo M4',
        laneIntroHaloM5: 'Our Notes Lane Intro Halo M5',
        laneIntroHaloM6: 'Our Notes Lane Intro Halo M6',

        jacket: 'Our Notes Jacket',

        monitorJacket: 'Our Notes Monitor Jacket',
        stageMonitorB0: 'Our Notes Stage Monitor B0',
        stageMonitorB1: 'Our Notes Stage Monitor B1',
        stageMonitorB2: 'Our Notes Stage Monitor B2',
        stageMonitorB3: 'Our Notes Stage Monitor B3',
        stageMonitorB4: 'Our Notes Stage Monitor B4',
        stageMonitorB5: 'Our Notes Stage Monitor B5',
        noteStyle2: 'Our Notes Note Style 2',
        noteStyle3: 'Our Notes Note Style 3',
        flickUpArrow1: 'Our Notes Flick Up Arrow 1',
        flickUpArrow2: 'Our Notes Flick Up Arrow 2',
        flickUpArrow3: 'Our Notes Flick Up Arrow 3',
        flickUpArrow4: 'Our Notes Flick Up Arrow 4',
        flickUpArrow5: 'Our Notes Flick Up Arrow 5',
        flickUpArrow6: 'Our Notes Flick Up Arrow 6',
        flickUpArrow7: 'Our Notes Flick Up Arrow 7',
        flickUpArrow8: 'Our Notes Flick Up Arrow 8',
        ...rhythmRoster(2),
        ...rhythmRoster(3),
        ...Object.fromEntries(['Up','Left','Right'].flatMap((dir,d) => Array.from({length:8},(_,w) =>
            Array.from({length:35},(_,i) => [`honeycomb${d}_${w}_${i}`,`Our Notes Honeycomb ${dir} ${w+1} Slice ${i}`])).flat())),
        ...Object.fromEntries(['Up','Left','Right'].flatMap((dir,d) => Array.from({length:8},(_,w) =>
            Array.from({length:35},(_,i) => [`honeycombSupport${d}_${w}_${i}`,`Our Notes Honeycomb Rhythm 3 ${dir} ${w+1} Slice ${i}`])).flat())),
        stockRhythmGeometry: 'Our Notes Stock Rhythm Geometry',
        ...Object.fromEntries(Array.from({length:5},(_,band) => Array.from({length:171},(_,frame) =>
            [`laneIntroBand${band+1}Frame${frame}`, `Our Notes Lane Intro Band ${band+1} Frame ${frame}`])).flat()),
}

export const skin = defineSkin({ renderMode: 'lightweight', sprites: SKIN_SPRITES })
export const noteStyle = () => {
    const second = skin.sprites.noteStyle2.exists
    const third = skin.sprites.noteStyle3.exists
    return second === third ? 1 : second ? 2 : 3
}

export const SKIN_SPRITE_NAMES: readonly string[] = Object.values(SKIN_SPRITES)

export const flashSprite = (key: string) => (skin.sprites as unknown as Record<string, typeof skin.sprites.tapNote>)[key]!

export const FLASH_K1 = flashSprite('flashA_tapNote').id - skin.sprites.tapNote.id
export const FLASH_K2 = flashSprite('flashB_tapNoteMainL').id - skin.sprites.tapNoteMainL.id

export const RHYTHM_BODY_2 = flashSprite('rhythm2_tapNote').id
export const HONEYCOMB_FIRST = flashSprite('honeycomb0_0_0').id
export const HONEYCOMB_SUPPORT_FIRST = flashSprite('honeycombSupport0_0_0').id
export const BAND_INTRO_FIRST = flashSprite('laneIntroBand1Frame0').id
export const RHYTHM_BODY_3 = flashSprite('rhythm3_tapNote').id
export const RHYTHM_PIECE_OFFSET = flashSprite('rhythm2_tapNoteMainL').id - skin.sprites.tapNoteMainL.id
export const RHYTHM_BODY_OFFSET = RHYTHM_BODY_2 - skin.sprites.tapNote.id
export const RHYTHM_UP_ARROW_OFFSET = flashSprite('rhythm2_flickUpArrow1').id - skin.sprites.flickUpArrow1.id
export const RHYTHM_FLASH_OFFSET = flashSprite('rhythm2_white_tapNote').id - RHYTHM_BODY_2
if (
    NOTE_SECTION < 112 ||
    flashSprite('flashA_flickRightNoteRight').id !== skin.sprites.flickRightNoteRight.id + FLASH_K1 ||
    flashSprite('flashA_traceNoteLeftTilt5').id !== skin.sprites.traceNoteLeftTilt5.id + FLASH_K1 ||
    flashSprite('flashB_flickRightNoteMainR').id !== skin.sprites.flickRightNoteMainR.id + FLASH_K2 ||
    flashSprite('flashB_traceNoteMainC').id !== skin.sprites.traceNoteMainC.id + FLASH_K2
)
    throw new Error('skin roster order changed: note flash blocks do not mirror the note pieces')

if (skin.sprites.laneIntroHaloS6.id !== skin.sprites.laneIntroHaloS0.id + 6 || skin.sprites.laneIntroHaloL0.id !== skin.sprites.laneIntroHaloS0.id + 7 || skin.sprites.laneIntroHaloL6.id !== skin.sprites.laneIntroHaloS0.id + 13)
    throw new Error('skin roster order changed: intro halo block is not consecutive')

if (skin.sprites.laneIntroHaloM6.id !== skin.sprites.laneIntroHaloM0.id + 6) throw new Error('skin roster order changed: intro halo E3 block is not consecutive')

if (skin.sprites.stageMonitorB5.id !== skin.sprites.stageMonitorB0.id + 5) throw new Error('skin roster order changed: stage monitor block is not consecutive')

export const layer = {
    laneBase: 4000,

    laneFlood: 4099,

    fxUnder: 4099.5,
    laneLine: 4100,

    fxCore: 4100.5,
    judgementLine: 4100,
    tapArea: 4101,
    measureLine: 4300,
    skillLine: 4400,
    guideBody: 4998,
    slideBody: 4999,
    pairLine: 4999,
    noteBody: 5000,
    traceMark: 5001,

    arrowBase: 5001,
    mark: 5500,
    comboNote: 5500,
    groove: 6002,
} as const

if (skin.sprites.laneFloodSlide.id !== skin.sprites.laneFloodNormal.id + 1 || skin.sprites.laneFloodInVain.id !== skin.sprites.laneFloodNormal.id + 5)
    throw new Error('skin roster order changed: lane flood block is not consecutive')

if (
    skin.sprites.fxlHalo01.id !== skin.sprites.fxlHalo00.id + 1 ||
    skin.sprites.fxlHaloMid00.id !== skin.sprites.fxlHalo00.id + FXL_HALO_COLOURS * 6 ||
    skin.sprites.fxlWall0Front.id !== skin.sprites.fxlHaloMid00.id + FXL_HALO_COLOURS * 6 ||
    skin.sprites.fxlWall1Front.id !== skin.sprites.fxlWall0Front.id + 3 ||
    skin.sprites.fxlWall0SideR.id !== skin.sprites.fxlWall0Front.id + 2 ||
    FXL_WALL_COLOURS < 1 ||
    skin.sprites.fxlCoreGlowMid00.id !== skin.sprites.fxlWall0Front.id + FXL_WALL_COLOURS * 3 ||
    skin.sprites.fxlCoreGlowCap00.id !== skin.sprites.fxlCoreGlowMid00.id + FXL_CORE_COLOURS * 10 ||
    skin.sprites.fxlCoreLoopMid00.id !== skin.sprites.fxlCoreGlowMid00.id + 2 * FXL_CORE_COLOURS * 10 ||
    skin.sprites.fxlCoreLoopCap00.id !== skin.sprites.fxlCoreGlowMid00.id + 3 * FXL_CORE_COLOURS * 10
)
    throw new Error('skin roster order changed: note-effect layer block is not consecutive')
