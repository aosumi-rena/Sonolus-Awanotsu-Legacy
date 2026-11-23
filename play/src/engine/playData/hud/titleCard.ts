import { liveTime } from '../layout.js'
import { skin } from '../skin.js'
import { cardBottomY, cardCenterX, screenRectQuad } from './canvas.js'
import { INTRO_CARD_END, INTRO_DURATION, Z, introCenterAlpha, introContentAlpha, introRootAlpha } from './hudDraw.js'

export const LIVE_TITLE_GLYPH_ARCHETYPE = 'LiveTitleGlyph'

export const TitleGlyphDataName = {
    Set: 'set',
    Glyph: 'g',
    X0: 'x0',
    Y0: 'y0',
    X1: 'x1',
    Y1: 'y1',
    Group: 'grp',
} as const

export const titleGlyphImport = {
    set: { name: TitleGlyphDataName.Set, type: Number, def: 0 },
    g: { name: TitleGlyphDataName.Glyph, type: Number, def: 0 },
    x0: { name: TitleGlyphDataName.X0, type: Number, def: 0 },
    y0: { name: TitleGlyphDataName.Y0, type: Number, def: 0 },
    x1: { name: TitleGlyphDataName.X1, type: Number, def: 0 },
    y1: { name: TitleGlyphDataName.Y1, type: Number, def: 0 },
    grp: { name: TitleGlyphDataName.Group, type: Number, def: 0 },
} as const

export const TITLE_CARD_END_TIME = INTRO_CARD_END - INTRO_DURATION

export const titleGlyphAlpha = (now: number, grp: number) => {
    const tau = liveTime(now) + INTRO_DURATION
    const root = introRootAlpha(tau)
    if (root <= 0) return 0
    return introContentAlpha(tau) * (grp === 0 ? introCenterAlpha(tau) : 1)
}

export const drawTitleGlyph = (set: number, g: number, x0: number, y0: number, x1: number, y1: number, alpha: number) => {

    const exists = set === 1 ? skin.sprites.cardGlyph0.exists : skin.sprites.titleGlyph0.exists
    if (!exists) return
    const baseId = set === 1 ? skin.sprites.cardGlyph0.id : skin.sprites.titleGlyph0.id

    skin.sprites.draw((baseId + g) as SkinSpriteId, screenRectQuad(cardCenterX(960 + x0), cardBottomY(1080 - y0), cardCenterX(960 + x1), cardBottomY(1080 - y1)), Z.intro + 3, alpha)
}
