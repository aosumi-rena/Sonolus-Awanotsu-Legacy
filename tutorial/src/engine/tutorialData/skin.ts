import { SkinSpriteName } from '@sonolus/core'
import { OurNotesSkinSprite } from '../../../../lib/resources/manifest/skin_sprites.js'
import { HIT_FX_SPRITES, HIT_FX_SPRITE_COUNT } from './hitFx.js'

export const skin = defineSkin({
    renderMode: 'lightweight',
    sprites: {
        laneBase: OurNotesSkinSprite.laneBase,
        laneLine: OurNotesSkinSprite.laneLine,
        laneOutsideLine: OurNotesSkinSprite.laneOutsideLine,
        laneTapArea: OurNotesSkinSprite.laneTapArea,

        laneLineAaGrey: 'Our Notes Lane Line AA Grey',
        laneOutsideLineAa: 'Our Notes Lane Outside Line AA',
        laneTapAreaColL: 'Our Notes Lane Tap Area Col L',
        laneTapAreaColC: 'Our Notes Lane Tap Area Col C',
        laneTapAreaColR: 'Our Notes Lane Tap Area Col R',
        stageShadow: 'Our Notes Stage Shadow',
        tapNote: OurNotesSkinSprite.tapNote,
        tapNoteLeft: OurNotesSkinSprite.tapNoteLeft,
        tapNoteRight: OurNotesSkinSprite.tapNoteRight,
        tapNoteRightTilt3: OurNotesSkinSprite.tapNoteRightTilt3,
        tapNoteMark: OurNotesSkinSprite.tapNoteMark,

        tapNoteMainL: 'Our Notes Tap Note Main Left',
        tapNoteMainC: 'Our Notes Tap Note Main Center',
        tapNoteMainR: 'Our Notes Tap Note Main Right',

        fbLane: SkinSpriteName.Lane,
        fbLine: SkinSpriteName.GridNeutral,
        fbJudgmentLine: SkinSpriteName.JudgmentLine,
        fbTap: SkinSpriteName.NoteHeadCyan,

        laneFloodNormal: 'Our Notes Lane Flood Normal',
        ...(HIT_FX_SPRITES as Record<'hitHalo0' | 'hitHaloMid0' | 'hitWallFront' | 'hitCoreMid0' | 'hitCoreCap0' | 'hitCoreCap9', string>),
    },
})

if (skin.sprites.hitCoreCap9.id !== skin.sprites.hitHalo0.id + HIT_FX_SPRITE_COUNT - 1 || skin.sprites.hitCoreMid0.id !== skin.sprites.hitHalo0.id + 15)
    throw new Error('tutorial skin: the hit FX-layer sprite block is not consecutive')
