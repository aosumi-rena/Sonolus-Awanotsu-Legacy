import { SimJudgement } from '../../../../../shared/src/engine/data/notes.js'
import { life as lifeSettings } from '../../../../../shared/src/engine/data/windows.js'
import { judgeX } from '../layout.js'
import { POPUP_BASE, particle } from '../particle.js'
import { skin } from '../skin.js'
import {
    cardBottomY,
    cardCenterX,
    cardCenterY,
    centerY,
    centeredScreenQuad,
    contentCenterX,
    fullScreenQuad,
    hudLayout,
    leftX,
    pxRectAt,
    rightX,
    screenRectQuad,
    topY,
} from './canvas.js'
import { flatSeg, outQuad, punchScale, roundHalfEven } from './curves.js'
import { DigitSet, GLYPH_PLUS, MsSet, advanceOf, baselineMiddle, digitCount, drawGlyph, drawMsText, drawNumber, drawNumberMono, glyphAdvance, glyphs, msGlyphsExist, numberWidth } from './glyphs.js'
import { options } from '../../configuration/options.js'
import { layout } from '../layout.js'
import {
    FinishType,
    HudState,
    JudgeResultPosition,
    MISS_SPLASH_LEN,
    NONE_TIME,
    POPUP_POOL,
    POPUP_SHOW_S,
    Rank,
    gaugeOfScore,
    hudMiss,
    hudPopupPool,
    hudTally,
    SUB_CHANNELS,
    subAbsOf,
    subChannelAt,
} from './hudState.js'
import {
    FINISH_MASK_SOFTNESS,
    FINISH_PIECES,
    GAUGE_EXT,
    GAUGE_FILL_W,
    GAUGE_LEVEL_BASE,
    GAUGE_PIECE_W,
    HUD_CAPTIONS,
    RANK_FX_LEN,
    RANK_FX_MAX_SEGS,
    fillFinishClipTables,
    finishBackgroundAlpha,
    finishGroupScale,
} from './hudText.generated.js'
import { rankFx, rankFxState, resetRankFx } from './rankFx.js'
import { hofAvailable, hofComboOn, hofOn, hofPopupOn, hudRect, hudRectAt, updateHudOver } from './hudOver.js'
import { hudMeta } from './meta.js'

export const Z = {

    shadow: 0,
    base: 10000,
    gauge: 10010,
    icon: 10020,
    text: 10030,
    pause: 10050,

    comboGlow: 10100,
    comboTitle: 10105,
    comboDigit: 10110,

    tally: 10130,
    popup: 10200,

    missSplash: 10250,
    finish: 10300,
    intro: 10400,
} as const

export const hudSprites = levelData({

    comboBase: Tuple(30, Number),
    comboFill: Tuple(30, Number),
    comboTitle: Tuple(3, Number),
    comboGlow: Tuple(3, Number),
    hasCombo: Boolean,

    rankIcon: Tuple(6, Number),
    hasRank: Boolean,

    judge: Tuple(7, Number),
    judgeW: Tuple(7, Number),
    judgeH: Tuple(7, Number),
    hasJudge: Boolean,

    finish: Tuple(5, Number),
    finishW: Tuple(5, Number),
    finishH: Tuple(5, Number),

    finishPieceBase: Tuple(5, Number),
    finishPieceCount: Tuple(5, Number),
    finishPieceSrcW: Tuple(5, Number),
    finishPieceExtSrc: Tuple(5, Number),
    hasFinishPieces: Boolean,

    difficulty: Tuple(5, Number),

    black: Number,
    hasBlack: Boolean,

    tickX: Tuple(5, Number),
    letterId: Tuple(5, Number),
    letterRect: Tuple(20, Number),
    hasLetters: Boolean,

    gaugeBase: Tuple(6, Number),
    hasGaugePieces: Boolean,

    bannerInsetL: Tuple(6, Number),
    bannerInsetR: Tuple(6, Number),

    tallyIcon: Tuple(7, Number),
    tallyIconW: Tuple(7, Number),
    tallyIconH: Tuple(7, Number),
    tallyRowY: Tuple(7, Number),
    tallyTextDy: Tuple(7, Number),
    hasTally: Boolean,

    headBandX0: Tuple(3, Number),
    headBandX1: Tuple(3, Number),
    headBandA: Tuple(3, Number),
    statBandX0: Tuple(3, Number),
    statBandX1: Tuple(3, Number),
    statBandA: Tuple(3, Number),
})

export const finishClip = levelData({

    scale: Tuple(100, Number),
    scaleEndT: Tuple(5, Number),
    scaleEndX: Tuple(5, Number),
    scaleEndY: Tuple(5, Number),

    textA: Tuple(100, Number),
    textPre: Tuple(5, Number),

    addA: Tuple(100, Number),
    addPre: Tuple(5, Number),

    pad: Tuple(50, Number),
    padPre: Tuple(5, Number),
    maskEnd: Tuple(5, Number),
    len: Tuple(5, Number),
})

export const setupHudSprites = () => {
    const c = skin.sprites
    const setCombo = (tier: number, d: number, base: SkinSprite, fill: SkinSprite) => {
        hudSprites.comboBase.set(tier * 10 + d, base.id)
        hudSprites.comboFill.set(tier * 10 + d, fill.id)
    }
    setCombo(0, 0, c.comboNormalDigit0Base, c.comboNormalDigit0Fill)
    setCombo(0, 1, c.comboNormalDigit1Base, c.comboNormalDigit1Fill)
    setCombo(0, 2, c.comboNormalDigit2Base, c.comboNormalDigit2Fill)
    setCombo(0, 3, c.comboNormalDigit3Base, c.comboNormalDigit3Fill)
    setCombo(0, 4, c.comboNormalDigit4Base, c.comboNormalDigit4Fill)
    setCombo(0, 5, c.comboNormalDigit5Base, c.comboNormalDigit5Fill)
    setCombo(0, 6, c.comboNormalDigit6Base, c.comboNormalDigit6Fill)
    setCombo(0, 7, c.comboNormalDigit7Base, c.comboNormalDigit7Fill)
    setCombo(0, 8, c.comboNormalDigit8Base, c.comboNormalDigit8Fill)
    setCombo(0, 9, c.comboNormalDigit9Base, c.comboNormalDigit9Fill)
    setCombo(1, 0, c.comboFCDigit0Base, c.comboFCDigit0Fill)
    setCombo(1, 1, c.comboFCDigit1Base, c.comboFCDigit1Fill)
    setCombo(1, 2, c.comboFCDigit2Base, c.comboFCDigit2Fill)
    setCombo(1, 3, c.comboFCDigit3Base, c.comboFCDigit3Fill)
    setCombo(1, 4, c.comboFCDigit4Base, c.comboFCDigit4Fill)
    setCombo(1, 5, c.comboFCDigit5Base, c.comboFCDigit5Fill)
    setCombo(1, 6, c.comboFCDigit6Base, c.comboFCDigit6Fill)
    setCombo(1, 7, c.comboFCDigit7Base, c.comboFCDigit7Fill)
    setCombo(1, 8, c.comboFCDigit8Base, c.comboFCDigit8Fill)
    setCombo(1, 9, c.comboFCDigit9Base, c.comboFCDigit9Fill)
    setCombo(2, 0, c.comboAPDigit0Base, c.comboAPDigit0Fill)
    setCombo(2, 1, c.comboAPDigit1Base, c.comboAPDigit1Fill)
    setCombo(2, 2, c.comboAPDigit2Base, c.comboAPDigit2Fill)
    setCombo(2, 3, c.comboAPDigit3Base, c.comboAPDigit3Fill)
    setCombo(2, 4, c.comboAPDigit4Base, c.comboAPDigit4Fill)
    setCombo(2, 5, c.comboAPDigit5Base, c.comboAPDigit5Fill)
    setCombo(2, 6, c.comboAPDigit6Base, c.comboAPDigit6Fill)
    setCombo(2, 7, c.comboAPDigit7Base, c.comboAPDigit7Fill)
    setCombo(2, 8, c.comboAPDigit8Base, c.comboAPDigit8Fill)
    setCombo(2, 9, c.comboAPDigit9Base, c.comboAPDigit9Fill)
    hudSprites.comboTitle.set(0, c.comboNormalTitle.id)
    hudSprites.comboTitle.set(1, c.comboFCTitle.id)
    hudSprites.comboTitle.set(2, c.comboAPTitle.id)

    hudSprites.comboGlow.set(0, c.comboFCGlow.id)
    hudSprites.comboGlow.set(1, c.comboFCGlow.id)
    hudSprites.comboGlow.set(2, c.comboAPGlow.id)
    hudSprites.hasCombo = c.comboNormalDigit0Base.exists && c.comboAPDigit0Fill.exists

    hudSprites.rankIcon.set(Rank.D, c.scoreRankD.id)
    hudSprites.rankIcon.set(Rank.C, c.scoreRankC.id)
    hudSprites.rankIcon.set(Rank.B, c.scoreRankB.id)
    hudSprites.rankIcon.set(Rank.A, c.scoreRankA.id)
    hudSprites.rankIcon.set(Rank.S, c.scoreRankS.id)
    hudSprites.rankIcon.set(Rank.SS, c.scoreRankSS.id)
    hudSprites.hasRank = c.scoreRankD.exists

    const setJudge = (sim: number, sp: SkinSprite, w: number, h: number) => {
        hudSprites.judge.set(sim, sp.id)
        hudSprites.judgeW.set(sim, w)
        hudSprites.judgeH.set(sim, h)
    }
    setJudge(SimJudgement.Miss, c.judgementMiss, 177, 76)
    setJudge(SimJudgement.Bad, c.judgementBad, 156, 80)
    setJudge(SimJudgement.Good, c.judgementGood, 186, 76)
    setJudge(SimJudgement.Great, c.judgementGreat, 233, 76)
    setJudge(SimJudgement.Perfect, c.judgementPerfect, 323, 89)
    setJudge(SimJudgement.Just, c.judgementJust, 346, 122)
    hudSprites.hasJudge = c.judgementPerfect.exists

    const setFinish = (t: number, sp: SkinSprite, w: number, h: number) => {
        hudSprites.finish.set(t, sp.id)
        hudSprites.finishW.set(t, w)
        hudSprites.finishH.set(t, h)
    }
    setFinish(FinishType.PerfectCombo, c.allPerfectText, 1267, 208)
    setFinish(FinishType.FullCombo, c.fullComboText, 1146, 200)
    setFinish(FinishType.AssistFullCombo, c.assistFullComboText, 1705, 192)
    setFinish(FinishType.LiveClear, c.liveClearText, 1042, 200)

    const setPieces = (t: number, p0: SkinSprite, info: { w: number; scaledW: number; pieceW: number; ext: number; count: number }) => {
        hudSprites.finishPieceBase.set(t, p0.id)
        hudSprites.finishPieceCount.set(t, info.count)
        hudSprites.finishPieceSrcW.set(t, (info.pieceW * info.w) / info.scaledW)
        hudSprites.finishPieceExtSrc.set(t, (info.ext * info.w) / info.scaledW)
    }
    setPieces(FinishType.PerfectCombo, c.finishPieceAPP0, FINISH_PIECES.ap)
    setPieces(FinishType.FullCombo, c.finishPieceFCP0, FINISH_PIECES.fc)
    setPieces(FinishType.AssistFullCombo, c.finishPieceAFCP0, FINISH_PIECES.afc)
    setPieces(FinishType.LiveClear, c.finishPieceLCP0, FINISH_PIECES.lc)
    hudSprites.hasFinishPieces = c.finishPieceAPP0.exists && c.finishPieceFCP0.exists && c.finishPieceAFCP0.exists && c.finishPieceLCP0.exists
    fillFinishClipTables(finishClip)

    hudSprites.difficulty.set(1, c.difficultyEasy.id)
    hudSprites.difficulty.set(2, c.difficultyNormal.id)
    hudSprites.difficulty.set(3, c.difficultyHard.id)
    hudSprites.difficulty.set(4, c.difficultyExpert.id)

    hudSprites.black = c.hudBlack.exists ? c.hudBlack.id : c.fbWhite.id
    hudSprites.hasBlack = c.hudBlack.exists || c.fbWhite.exists

    const tick = (i: number, x: number, letter: SkinSprite, rect: readonly number[]) => {
        hudSprites.tickX.set(i, x)
        hudSprites.letterId.set(i, letter.id)

        hudSprites.letterRect.set(i * 4, rect[0]!)
        hudSprites.letterRect.set(i * 4 + 1, rect[1]!)
        hudSprites.letterRect.set(i * 4 + 2, rect[2]!)
        hudSprites.letterRect.set(i * 4 + 3, rect[3]!)
    }
    tick(0, 248, c.hudRankLetterC, HUD_CAPTIONS.hudRankLetterC)
    tick(1, 335, c.hudRankLetterB, HUD_CAPTIONS.hudRankLetterB)
    tick(2, 424, c.hudRankLetterA, HUD_CAPTIONS.hudRankLetterA)
    tick(3, 512, c.hudRankLetterS, HUD_CAPTIONS.hudRankLetterS)
    tick(4, 600, c.hudRankLetterSS, HUD_CAPTIONS.hudRankLetterSS)
    hudSprites.hasLetters = c.hudRankLetterC.exists

    const g0 = c.hudRankGaugeFillL0P0.id
    hudSprites.gaugeBase.set(0, g0 + GAUGE_LEVEL_BASE[0])
    hudSprites.gaugeBase.set(1, g0 + GAUGE_LEVEL_BASE[1])
    hudSprites.gaugeBase.set(2, g0 + GAUGE_LEVEL_BASE[2])
    hudSprites.gaugeBase.set(3, g0 + GAUGE_LEVEL_BASE[3])
    hudSprites.gaugeBase.set(4, g0 + GAUGE_LEVEL_BASE[4])
    hudSprites.gaugeBase.set(5, g0 + GAUGE_LEVEL_BASE[5])
    hudSprites.hasGaugePieces = c.hudRankGaugeFillL0P0.exists && c.hudRankGaugeFillL5P1.exists

    resetRankFx()

    const bannerRow = (i: number, l: number, r: number) => {
        hudSprites.bannerInsetL.set(i, l)
        hudSprites.bannerInsetR.set(i, r)
    }
    bannerRow(0, 65, 0)
    bannerRow(1, 128, 65)
    bannerRow(2, 96, 162)
    bannerRow(3, 162, 97)
    bannerRow(4, 64, 130)
    bannerRow(5, 0, 64)

    const k0 = TALLY_SHOW_JUST ? 1 : 0
    const row = (sim: number, sp: SkinSprite, w: number, h: number, scale: number, k: number, textDy: number) => {
        hudSprites.tallyIcon.set(sim, sp.id)
        hudSprites.tallyIconW.set(sim, w * scale)
        hudSprites.tallyIconH.set(sim, h * scale)
        hudSprites.tallyRowY.set(sim, TALLY_TOP_Y + TALLY_PITCH * k)
        hudSprites.tallyTextDy.set(sim, textDy)
    }
    row(SimJudgement.Just, c.resultJudgementJust, 196, 81, 0.35, 0, 2)
    row(SimJudgement.Perfect, c.resultJudgementPerfect, 180, 50, 0.61, k0, 2)
    row(SimJudgement.Great, c.resultJudgementGreat, 130, 50, 0.61, k0 + 1, 2)
    row(SimJudgement.Good, c.resultJudgementGood, 108, 50, 0.61, k0 + 2, 2.2)
    row(SimJudgement.Bad, c.resultJudgementBad, 88, 50, 0.61, k0 + 3, 2)
    row(SimJudgement.Miss, c.resultJudgementMiss, 100, 50, 0.61, k0 + 4, 2)
    hudSprites.hasTally = c.resultJudgementPerfect.exists && c.hudDigit260.exists

    const band = (i: number, hx0: number, hx1: number, ha: number, sx0: number, sx1: number, sa: number) => {
        hudSprites.headBandX0.set(i, hx0)
        hudSprites.headBandX1.set(i, hx1)
        hudSprites.headBandA.set(i, ha)
        hudSprites.statBandX0.set(i, sx0)
        hudSprites.statBandX1.set(i, sx1)
        hudSprites.statBandA.set(i, sa)
    }
    band(0, 20, 416, 0.62, 1500, 1540, 0.15)
    band(1, 416, 614, 0.42, 1540, 1660, 0.42)
    band(2, 614, 680, 0.16, 1660, 1900, 0.62)
}

const drawTL = (id: number, x0: number, y0: number, x1: number, y1: number, z: number, a: number, ov: boolean) =>
    hudRect(id, leftX(x0), topY(y1), leftX(x1), topY(y0), z, a, ov)
const drawTR = (id: number, x0: number, y0: number, x1: number, y1: number, z: number, a: number, ov: boolean) =>
    hudRect(id, rightX(x0), topY(y1), rightX(x1), topY(y0), z, a, ov)

const skinTL = (id: number, x0: number, y0: number, x1: number, y1: number, z: number, a: number) =>
    skin.sprites.draw(id as SkinSpriteId, screenRectQuad(leftX(x0), topY(y1), leftX(x1), topY(y0)), z, a)
const skinTR = (id: number, x0: number, y0: number, x1: number, y1: number, z: number, a: number) =>
    skin.sprites.draw(id as SkinSpriteId, screenRectQuad(rightX(x0), topY(y1), rightX(x1), topY(y0)), z, a)

const drawTC = (id: number, x0: number, y0: number, x1: number, y1: number, z: number, a: number, ov: boolean) =>
    hudRect(id, contentCenterX(x0), topY(y1), contentCenterX(x1), topY(y0), z, a, ov)

const whiteId = () => (skin.sprites.white.exists ? skin.sprites.white.id : skin.sprites.fbWhite.id)

export const shownScore = (s: ContainerType<typeof HudState>, now: number) => {
    if (s.scoreTweenStart === NONE_TIME) return s.score
    const v = outQuad((now - s.scoreTweenStart) / 0.24)
    return roundHalfEven(s.scorePrev + v * (s.score - s.scorePrev))
}

const rankInAlpha = (rank: number, t: number) => {
    if (rank === Rank.B) return t < 0.15 ? 0 : flatSeg(t, 0.15, 0, 0.25, 1)
    if (rank === Rank.A) return flatSeg(t, 0.1667, 0, 0.5, 1)
    if (rank === Rank.S) return flatSeg(t, 0.1167, 0, 0.3333, 1)
    if (rank === Rank.SS) return flatSeg(t, 0.1333, 0, 0.4167, 1)
    return flatSeg(t, 0, 0, 0.25, 1)
}
const rankOutAlpha = (t: number) => flatSeg(t, 0, 1, 0.25, 0)

const drawGaugeFill = (g: number, ov: boolean) => {
    const fillW = GAUGE_FILL_W * g
    if (fillW <= 0) return
    if (!hudSprites.hasGaugePieces) {
        const bar = skin.sprites.hudRankGaugeFill.exists ? skin.sprites.hudRankGaugeFill.id : skin.sprites.roundedBar14.exists ? skin.sprites.roundedBar14.id : whiteId()
        skinTL(bar, 160, 68, 160 + fillW, 92, Z.gauge, 1)
        return
    }
    const cols = Math.floor(fillW / GAUGE_PIECE_W)
    let pos = 0
    let n = 32
    for (let k = 5; k >= 0; k--) {
        const w = n * GAUGE_PIECE_W
        const bit = Math.mod(Math.floor(cols / n), 2)
        if (bit > 0) {
            const id = hudSprites.gaugeBase.get(k) + Math.floor(pos / w)
            drawTL(id, 160 + pos - GAUGE_EXT, 68, 160 + Math.min(pos + w + GAUGE_EXT, fillW), 92, Z.gauge, 1, ov)
        }
        pos += bit * w
        n = n / 2
    }
    if (fillW > pos) drawTL(hudSprites.gaugeBase.get(0) + cols, 160 + pos - GAUGE_EXT, 68, 160 + fillW, 92, Z.gauge, 1, ov)
}

export const drawHeader = (s: ContainerType<typeof HudState>, now: number) => {
    const sp = skin.sprites

    const ov = hofOn() && (s.rankTime === NONE_TIME || now - s.rankTime >= RANK_FX_LEN)

    if (sp.hudHeaderBase.exists) {
        drawTL(sp.hudHeaderBase.id, 20, 0, 680, 146, Z.base, 1, ov)
    } else if (hudSprites.hasBlack) {
        for (let i = 0; i < 3; i++) skinTL(hudSprites.black, hudSprites.headBandX0.get(i), 0, hudSprites.headBandX1.get(i), 146, Z.base, hudSprites.headBandA.get(i))
    }

    if (sp.hudRankGaugeFrame.exists) {
        drawTL(sp.hudRankGaugeFrame.id, 158, 66, 664, 94, Z.gauge - 2, 1, ov)
    } else if (sp.roundedBar14.exists) {

        skinTL(sp.roundedBar14.id, 158, 66, 186, 94, Z.gauge - 2, 1)
        skinTL(sp.roundedBar14.id, 636, 66, 664, 94, Z.gauge - 2, 1)
        skinTL(whiteId(), 172, 66, 650, 94, Z.gauge - 2, 1)
    } else {
        skinTL(whiteId(), 158, 66, 664, 94, Z.gauge - 2, 1)
    }
    if (sp.hudRankGaugeWell.exists) drawTL(sp.hudRankGaugeWell.id, 160, 68, 662, 92, Z.gauge - 1, 1, ov)
    else if (hudSprites.hasBlack) skinTL(hudSprites.black, 160, 68, 662, 92, Z.gauge - 1, 0.698)
    drawGaugeFill(gaugeOfScore(s.score), ov)

    const w = whiteId()
    for (let i = 0; i < 5; i++) {
        const x = hudSprites.tickX.get(i)
        drawTL(w, x - 1.5, 66, x + 1.5, 94, Z.gauge + 1, 1, ov)
    }

    if (sp.hudRankBase.exists) drawTL(sp.hudRankBase.id, 6, 0, 155, 160, Z.base + 1, 1, ov)
    else if (sp.headerRankBase.exists) skinTL(sp.headerRankBase.id, 6, 0, 155, 160, Z.base + 1, 1)

    if (sp.hudTextRank.exists) drawTL(sp.hudTextRank.id, HUD_CAPTIONS.hudTextRank[0], HUD_CAPTIONS.hudTextRank[1], HUD_CAPTIONS.hudTextRank[2], HUD_CAPTIONS.hudTextRank[3], Z.icon - 1, 1, ov)

    if (hudSprites.hasRank) {
        const cx = leftX(80.5)
        const cy = topY(89)
        const iw = 115 * hudLayout.u
        const ih = 95 * hudLayout.u
        if (s.rankTime === NONE_TIME) {
            hudRectAt(hudSprites.rankIcon.get(s.rank), cx, cy, iw, ih, Z.icon, 1, ov)
        } else {
            const t = now - s.rankTime
            const ao = rankOutAlpha(t)
            if (ao > 0) skin.sprites.draw(hudSprites.rankIcon.get(s.rankPrev) as SkinSpriteId, pxRectAt(cx, cy, 230, 190, 0.5), Z.icon, ao)

            const ai = rankInAlpha(s.rank, t)
            if (ai > 0) hudRectAt(hudSprites.rankIcon.get(s.rank), cx, cy, iw, ih, Z.icon + 1, ai, ov)
        }
    }

    if (hudSprites.hasLetters) {
        for (let i = 0; i < 5; i++) {
            drawTL(hudSprites.letterId.get(i), hudSprites.letterRect.get(i * 4), hudSprites.letterRect.get(i * 4 + 1), hudSprites.letterRect.get(i * 4 + 2), hudSprites.letterRect.get(i * 4 + 3), Z.text, 1, ov)
        }
    }
}

export const drawRankEffects = (s: ContainerType<typeof HudState>, now: number) => {
    if (!rankFxState.ready || s.rankTime === NONE_TIME) return
    const t = now - s.rankTime
    if (t >= 0 && t < RANK_FX_LEN) drawRankFx(s.rank, t)
}

const rankFxCurve = (start: number, n: number, t: number) => {
    let idx = start
    for (let k = 1; k < RANK_FX_MAX_SEGS; k++) {
        idx = k < n && t >= rankFx.pool.get(start + k * 5) ? start + k * 5 : idx
    }
    return segAt(rankFx.pool, idx, t)
}

const drawRankFx = (rank: number, t: number) => {
    const n = rankFx.count.get(rank)
    const e0 = rankFx.first.get(rank)
    const u = hudLayout.u
    const k = hudLayout.invScale
    for (let i = 0; i < n; i++) {
        const e = e0 + i
        const m = rankFxCurve(rankFx.al.get(e), rankFx.alN.get(e), t)
        const a = rankFx.mul.get(e) * Math.min(1, Math.max(0, 2 * m))
        if (t >= rankFx.on.get(e) && t < rankFx.off.get(e) && a > 0.001) {
            const hx = rankFx.hw.get(e) * rankFxCurve(rankFx.sx.get(e), rankFx.sxN.get(e), t) * u
            const hy = rankFx.hh.get(e) * rankFxCurve(rankFx.sy.get(e), rankFx.syN.get(e), t) * u
            const X = leftX(80.5 + rankFx.ox.get(e))
            const Y = topY(89 + rankFx.oy.get(e))

            const r = rankFx.rot.get(e)
            const c = 1 - r
            skin.sprites.draw(
                rankFx.sprite.get(e) as SkinSpriteId,
                new Quad({
                    x1: (X - hx * c - hy * r) * k,
                    y1: (Y - hy * c + hx * r) * k,
                    x2: (X - hx * c + hy * r) * k,
                    y2: (Y + hy * c + hx * r) * k,
                    x3: (X + hx * c + hy * r) * k,
                    y3: (Y + hy * c - hx * r) * k,
                    x4: (X + hx * c - hy * r) * k,
                    y4: (Y - hy * c - hx * r) * k,
                }),
                Z.icon + 2 + i * 0.5,
                a,
            )
        }
    }
}

export const drawScore = (s: ContainerType<typeof HudState>, now: number) => {
    const sp = skin.sprites
    const w = whiteId()

    const ov = hofOn()

    drawNumber(DigitSet.Score44, DigitSet.Dim44, shownScore(s, now), 8, leftX(42), topY(baselineMiddle(190, 44)), 1, Z.text, 1, 1, ov)

    if (sp.hudTextLiveScore.exists) {
        drawTL(sp.hudTextLiveScore.id, HUD_CAPTIONS.hudTextLiveScore[0], HUD_CAPTIONS.hudTextLiveScore[1], HUD_CAPTIONS.hudTextLiveScore[2], HUD_CAPTIONS.hudTextLiveScore[3], Z.text, 1, ov)
    }

    if (sp.levelStar.exists) drawTL(sp.levelStar.id, 20, 202.8, 36.65, 219, Z.icon, 1, ov)
    if (sp.hudScoreUnderline.exists) {
        drawTL(sp.hudScoreUnderline.id, 28.3, 209.9, 28.3 + 260, 211.9, Z.icon, 1, ov)
    } else {
        skinTL(w, 28.3, 209.9, 28.3 + 182, 211.9, Z.icon, 1)
        skinTL(w, 28.3 + 182, 209.9, 28.3 + 260, 211.9, Z.icon, 0.5)
    }
}

const POP_LEFT_X = 350 - 78.71155

export const drawScorePops = (s: ContainerType<typeof HudState>, now: number) => {

    const ov = hofOn()
    for (let i = 0; i < 3; i++) {
        const st = s.addStart.get(i)
        if (st === NONE_TIME) continue
        const t = now - st
        if (t < 0 || t >= 0.4333) continue
        const cy = t < 0.0167 ? 196.9 : flatSeg(t, 0.0167, 196.9, 0.4333, 144.9)
        const a = flatSeg(t, 0, 1, 0.4333, 0)

        const baseline = topY(baselineMiddle(cy, 24))
        let pen = leftX(POP_LEFT_X)
        drawGlyph(DigitSet.Pop24, GLYPH_PLUS, pen, baseline, Z.text, a, ov)

        const v = Math.max(s.addVal.get(i), 0)
        pen += advanceOf(DigitSet.Pop24, GLYPH_PLUS, Math.mod(Math.floor(v / glyphs.pow10.get(digitCount(v) - 1)), 10), 1) * hudLayout.u
        drawNumber(DigitSet.Pop24, DigitSet.Pop24, v, 1, pen, baseline, 1, Z.text, a, a, ov)
    }
}

export const shownLife = (s: ContainerType<typeof HudState>, now: number) => {
    if (s.lifeTweenStart === NONE_TIME) return s.life
    const v = outQuad((now - s.lifeTweenStart) / 0.24)
    return Math.trunc(s.lifePrev + v * (s.life - s.lifePrev))
}

const drawLifeFill = (right: number, danger: boolean, ov: boolean) => {
    const sp = skin.sprites
    if (!sp.hudLifeFillNormalL.exists || !sp.hudLifeFillDangerL.exists) {
        let fill = sp.roundedBar14.exists ? sp.roundedBar14.id : whiteId()
        if (danger && sp.hudLifeFillDanger.exists) fill = sp.hudLifeFillDanger.id
        if (!danger && sp.hudLifeFillNormal.exists) fill = sp.hudLifeFillNormal.id
        skinTR(fill, 1520, 64, right, 76, Z.gauge + 1, 1)
        return
    }
    const l = danger ? sp.hudLifeFillDangerL.id : sp.hudLifeFillNormalL.id
    const m = danger ? sp.hudLifeFillDangerM.id : sp.hudLifeFillNormalM.id
    const r = danger ? sp.hudLifeFillDangerR.id : sp.hudLifeFillNormalR.id
    drawTR(l, 1520, 64, Math.min(1526, right), 76, Z.gauge + 1, 1, ov)
    if (right > 1526) drawTR(m, 1526, 64, Math.min(1794, right), 76, Z.gauge + 1, 1, ov)
    if (right > 1794) drawTR(r, 1794, 64, right, 76, Z.gauge + 1, 1, ov)
}

export const drawStatus = (s: ContainerType<typeof HudState>, now: number, pauseIconAlpha: number) => {
    const sp = skin.sprites

    const ov = hofOn() && (pauseIconAlpha <= 0 || pauseIconAlpha >= 0.999)

    if (sp.hudStatusBase.exists) {
        drawTR(sp.hudStatusBase.id, 1500, 19, 1900, 99, Z.base, 1, ov)
    } else if (hudSprites.hasBlack) {
        for (let i = 0; i < 3; i++) skinTR(hudSprites.black, hudSprites.statBandX0.get(i), 19, hudSprites.statBandX1.get(i), 99, Z.base, hudSprites.statBandA.get(i))
    }

    const life = shownLife(s, now)

    const hasTrack = sp.hudLifeTrackCapsule.exists || sp.hudLifeTrack.exists
    const track = sp.hudLifeTrackCapsule.exists ? sp.hudLifeTrackCapsule.id : sp.hudLifeTrack.exists ? sp.hudLifeTrack.id : hudSprites.hasBlack ? hudSprites.black : whiteId()
    drawTR(track, 1520, 62, 1804, 78, Z.gauge, hasTrack ? 1 : 0.9, ov && sp.hudLifeTrackCapsule.exists)
    const g = Math.clamp(life / lifeSettings.base, 0, 1)
    const danger = life <= lifeSettings.danger
    if (g > 0) {
        const right = Math.min(1800, 1520 + 284 * g)
        if (right > 1520) drawLifeFill(right, danger, ov)
    }

    const set = danger ? DigitSet.Danger30 : DigitSet.Life30
    const wNum = numberWidth(set, life, 1, 0)
    drawNumber(set, set, life, 1, rightX(1802.5 - wNum), topY(baselineMiddle(48, 30)), 0, Z.text, 1, 1, ov)

    const heartId = danger ? sp.lifeIconDanger.id : sp.lifeIcon.id
    if (sp.lifeIcon.exists) drawTR(heartId, 1700, 34.5, 1730, 61.5, Z.icon, 1, ov)

    const cx = rightX(1860)
    const cy = topY(59)
    const u = hudLayout.u
    if (sp.pauseButtonShadow.exists) drawTR(sp.pauseButtonShadow.id, 1820, 22.36, 1900, 112.9, Z.pause, 1, ov)
    if (sp.pauseButtonFrame.exists) hudRectAt(sp.pauseButtonFrame.id, cx, cy, 80 * u, 80 * u, Z.pause + 1, 1, ov)
    if (pauseIconAlpha > 0 && sp.pauseIcon.exists) hudRectAt(sp.pauseIcon.id, cx, cy, 64 * u, 64 * u, Z.pause + 2, pauseIconAlpha, ov)
}

export const TALLY_SHOW_JUST = false

const TALLY_TOP_Y = 214

const TALLY_PITCH = 34.4

const TALLY_LAST = TALLY_SHOW_JUST ? SimJudgement.Just : SimJudgement.Perfect

const TALLY_MONO = 0.57 * 26
const TALLY_ZERO_ALPHA = 0x29 / 255
export const drawTally = () => {

    if (!hudSprites.hasTally || !options.judgeDetailDisplay) return

    const ov = hofOn()
    for (let sim = SimJudgement.Miss; sim <= TALLY_LAST; sim++) {
        const cy = hudSprites.tallyRowY.get(sim)
        const w = hudSprites.tallyIconW.get(sim)
        const h = hudSprites.tallyIconH.get(sim)
        drawTC(hudSprites.tallyIcon.get(sim), 1584, cy - h / 2, 1584 + w, cy + h / 2, Z.tally, 1, ov)
        const n = hudTally.n.get(sim)
        drawNumberMono(DigitSet.Count26, DigitSet.Count26, n, 4, contentCenterX(1776), topY(baselineMiddle(cy + hudSprites.tallyTextDy.get(sim), 26)), TALLY_MONO, Z.tally, 1, TALLY_ZERO_ALPHA, ov)
    }
}

export const drawCombo = (s: ContainerType<typeof HudState>, now: number) => {

    if (!hudSprites.hasCombo || !options.comboCountDisplay) return
    const combo = s.comboShown
    if (combo <= 0 && s.comboInitTime === NONE_TIME) return

    let alpha = 1
    if (combo <= 0) {
        alpha = 1 - Math.clamp((now - s.comboInitTime) / 0.25, 0, 1)
        if (alpha <= 0) return
    }

    const shownValue = combo <= 0 ? s.comboLast : combo
    let n = 1
    if (shownValue >= 10) n = 2
    if (shownValue >= 100) n = 3
    if (shownValue >= 1000) n = 4

    const tier = s.tierLast

    let scale = 1
    if (s.comboAddTime !== NONE_TIME) {
        const t = now - s.comboAddTime
        if (t < 0.1333) scale = flatSeg(t, 0, 0.9, 0.1333, 1.1)
        else if (t < 0.15) scale = flatSeg(t, 0.1333, 1.1, 0.15, 1.0)
    }

    const cxRoot = contentCenterX(1680)
    const cyRoot = topY(528)
    const W = 120 * n - 34 * (n - 1)
    const u = hudLayout.u

    const ov = hofComboOn() && alpha >= 0.999

    if (tier > 0) hudRectAt(hudSprites.comboGlow.get(tier), contentCenterX(1676), topY(524), (W + 280) * u, 398 * u, Z.comboGlow, 0.863 * alpha, ov)

    hudRectAt(hudSprites.comboTitle.get(tier), contentCenterX(1680), topY(434.9), 168 * 1.15 * u, 38 * 1.15 * u, Z.comboTitle, alpha, ov)

    let div = glyphs.pow10.get(n - 1)
    for (let k = 0; k < n; k++) {
        const d = Math.mod(Math.floor(shownValue / div), 10)
        const dx = (-W / 2 + 60 + 86 * k) * u * scale
        const cx = cxRoot + dx
        hudRectAt(hudSprites.comboBase.get(tier * 10 + d), cx, cyRoot, 120 * u * scale, 160 * u * scale, Z.comboDigit + 2 * k, alpha, ov)
        if (!ov) skin.sprites.draw(hudSprites.comboFill.get(tier * 10 + d) as SkinSpriteId, pxRectAt(cx, cyRoot, 120, 160, scale), Z.comboDigit + 2 * k + 1, alpha)
        div = Math.floor(div / 10)
        if (div < 1) div = 1
    }
}

export const judgementY = (canvasY: number) => centerY(canvasY - (options.judgeDisplayPositionPattern === 1 ? 60 : 0))

const drawPopupSub = (timing: number, diffMs: number, cx: number, t: number, ov: boolean) => {
    if (timing < 0) return
    const scale = punchScale(t)
    const msSet = timing === 1 ? MsSet.Fast : timing === 2 ? MsSet.Late : MsSet.None
    if (options.judgeOffsetMsDisplay && msGlyphsExist(msSet)) {
        drawMsText(msSet, diffMs, cx, judgementY(605), scale, Z.popup, ov)
        return
    }
    if (timing !== 1 && timing !== 2) return
    if (!skin.sprites.judgementFast.exists || !skin.sprites.judgementLate.exists) return
    const u = hudLayout.u
    hudRectAt(timing === 1 ? skin.sprites.judgementFast.id : skin.sprites.judgementLate.id, cx, judgementY(605), 307 * u * scale, 31 * u * scale, Z.popup, 1, ov)
}

export const drawPopup = (s: ContainerType<typeof HudState>, now: number) => {
    if (!hudSprites.hasJudge) return

    if (options.judgeResultPosition !== JudgeResultPosition.Center) return

    const ov = hofPopupOn()
    const fxPath = !hofAvailable() && particle.effects.exists(POPUP_BASE as ParticleEffectId)

    for (let i = 0; i < SUB_CHANNELS; i++) {
        const ch = subChannelAt(i)
        const st = s.subStart.get(ch)
        const ts = now - st
        if (st !== NONE_TIME && ts >= 0 && ts < POPUP_SHOW_S) drawPopupSub(ch, subAbsOf(s.subAbsMs, ch), 0, ts, ov)
    }
    if (s.popStart === NONE_TIME) return
    const t = now - s.popStart
    if (t < 0 || t >= POPUP_SHOW_S) return
    const sim = s.popSim
    if (sim < SimJudgement.Miss || sim > SimJudgement.Just) return
    if (fxPath) return
    const scale = punchScale(t)
    const u = hudLayout.u
    hudRectAt(hudSprites.judge.get(sim), 0, judgementY(676), hudSprites.judgeW.get(sim) * u * scale, hudSprites.judgeH.get(sim) * u * scale, Z.popup + 1, 1, ov)
}

export const drawLanePopups = (now: number) => {
    if (!hudSprites.hasJudge || options.judgeResultPosition !== JudgeResultPosition.Lane) return
    const ov = hofPopupOn()
    const u = hudLayout.u
    const cy = judgementY(676)
    for (let i = 0; i < POPUP_POOL; i++) {
        const cx = judgeX(hudPopupPool.c.get(i)) * layout.scale

        for (let k = 0; k < SUB_CHANNELS; k++) {
            const ch = subChannelAt(k)
            const st = hudPopupPool.subStart.get(i * SUB_CHANNELS + ch)
            const ts = now - st
            if (st !== NONE_TIME && ts >= 0 && ts < POPUP_SHOW_S) drawPopupSub(ch, subAbsOf(hudPopupPool.subAbsMs.get(i), ch), cx, ts, ov)
        }
        const t = now - hudPopupPool.start.get(i)
        if (hudPopupPool.start.get(i) === NONE_TIME || t < 0 || t >= POPUP_SHOW_S) continue
        const sim = hudPopupPool.sim.get(i)
        const scale = punchScale(t)
        hudRectAt(hudSprites.judge.get(sim), cx, cy, hudSprites.judgeW.get(sim) * u * scale, hudSprites.judgeH.get(sim) * u * scale, Z.popup + 1, 1, ov)
    }
}

export const updateHudOverFrame = (s: ContainerType<typeof HudState>, now: number) => {
    const splash = options.damageEffect && skin.sprites.hudMissWall.exists && hudMiss.start !== NONE_TIME && now - hudMiss.start < MISS_SPLASH_LEN
    const type = s.finishType
    const banner = type !== FinishType.None && type !== FinishType.LiveFailure && now >= s.finishStart && now - s.finishStart < finishClip.len.get(type)
    updateHudOver(splash, banner)
}

export const drawMissSplash = (now: number) => {
    if (!options.damageEffect) return
    const sp = skin.sprites
    if (!sp.hudMissWall.exists || !sp.hudMissWallSide.exists) return
    if (hudMiss.start === NONE_TIME) return
    const t = now - hudMiss.start
    if (t < 0 || t >= MISS_SPLASH_LEN) return
    const a = t < 0.05 ? flatSeg(t, 0, 0, 0.05, 1) : flatSeg(t, 0.05, 1, MISS_SPLASH_LEN, 0)
    if (a <= 0) return
    const u = hudLayout.u
    const hw = hudLayout.halfW

    skin.sprites.draw(sp.hudMissWall.id, screenRectQuad(-hw, -1 - 150 * u, hw, -1 + 350 * u), Z.missSplash, a)

    skin.sprites.draw(sp.hudMissWall.id, screenRectQuad(hw, 1 + 150 * u, -hw, 1 - 350 * u), Z.missSplash, a)

    skin.sprites.draw(sp.hudMissWallSide.id, screenRectQuad(-hw - 150 * u, -1, -hw + 350 * u, 1), Z.missSplash, a)

    skin.sprites.draw(sp.hudMissWallSide.id, screenRectQuad(hw + 150 * u, 1, hw - 350 * u, -1), Z.missSplash, a)
}

const segAt = (tab: { get(i: number): number }, i: number, t: number) => {
    const x = t - tab.get(i)
    return ((tab.get(i + 1) * x + tab.get(i + 2)) * x + tab.get(i + 3)) * x + tab.get(i + 4)
}

const finishScaleAt = (type: number, axis: number, t: number) => {
    const b = type * 20 + axis * 10
    const tab = finishClip.scale
    const end = axis === 0 ? finishClip.scaleEndX.get(type) : finishClip.scaleEndY.get(type)
    return t >= finishClip.scaleEndT.get(type) ? end : t >= tab.get(b + 5) ? segAt(tab, b + 5, t) : t >= tab.get(b) ? segAt(tab, b, t) : tab.get(b + 4)
}

const finishAlphaAt = (tab: { get(i: number): number }, type: number, pre: number, t: number) => {
    const b = type * 20
    return t >= tab.get(b + 15) ? segAt(tab, b + 15, t) : t >= tab.get(b + 10) ? segAt(tab, b + 10, t) : t >= tab.get(b + 5) ? segAt(tab, b + 5, t) : t >= tab.get(b) ? segAt(tab, b, t) : pre
}

const finishPaddingAt = (type: number, t: number) => {
    const b = type * 10
    const tab = finishClip.pad
    return t >= tab.get(b + 5) ? segAt(tab, b + 5, t) : t >= tab.get(b) ? segAt(tab, b, t) : finishClip.padPre.get(type)
}

const FINISH_ADD_ALPHA_GAIN = 2 * 0.7843137383460999 * 0.7843137383460999

export const drawFinish = (s: ContainerType<typeof HudState>, now: number) => {
    const type = s.finishType
    if (type === FinishType.None || type === FinishType.LiveFailure) return
    const t = now - s.finishStart
    if (t < 0 || t >= finishClip.len.get(type)) return
    const background = finishBackgroundAlpha(type, t)
    if (background > 0 && hudSprites.hasBlack) {
        const size = 5000 * hudLayout.u
        skin.sprites.draw(hudSprites.black as SkinSpriteId, centeredScreenQuad(0, 0, size, size), Z.finish - 1, background)
    }
    const w = hudSprites.finishW.get(type)
    const h = hudSprites.finishH.get(type)

    const parentScale = finishGroupScale(type, t)
    const k = parentScale * finishScaleAt(type, 0, t)
    const kx = k * hudLayout.u
    const ky = parentScale * finishScaleAt(type, 1, t) * hudLayout.u
    const a = finishAlphaAt(finishClip.textA, type, finishClip.textPre.get(type), t)
    const aAdd = finishAlphaAt(finishClip.addA, type, finishClip.addPre.get(type), t)
    if (a <= 0 && aAdd <= 0) return

    const masked = t < finishClip.maskEnd.get(type) && hudSprites.hasFinishPieces
    const id = hudSprites.finish.get(type) as SkinSpriteId
    if (!masked) {
        const q = centeredScreenQuad(0, 0, w * kx, h * ky)
        if (a > 0) skin.sprites.draw(id, q, Z.finish, a)
        if (!hudSprites.hasFinishPieces && aAdd > 0) skin.sprites.draw(id, q, Z.finish + 1, Math.min(1, aAdd * FINISH_ADD_ALPHA_GAIN))
    }
    if (!hudSprites.hasFinishPieces) return
    const dAdd = Math.clamp(aAdd, 0, 1)
    const flash = 1 - (1 - dAdd) * Math.sqrt(1 - dAdd)

    const wp = masked ? Math.max(flash, a) * (0.86 + 0.14 * a) : flash
    if (wp <= 0) return

    const p = masked ? finishPaddingAt(type, t) / k : -1e6
    const soft = FINISH_MASK_SOFTNESS / 4 + 2 / k
    const n = hudSprites.finishPieceCount.get(type)
    const pw = hudSprites.finishPieceSrcW.get(type)
    const ext = hudSprites.finishPieceExtSrc.get(type)
    const base = hudSprites.finishPieceBase.get(type)
    const yb = (-h / 2) * ky
    const yt = (h / 2) * ky
    for (let i = 0; i < n; i++) {
        const xl = i * pw
        const xr = Math.min(w, xl + pw)
        const xc = (xl + xr) / 2
        const f = Math.clamp((xc - p) / soft, 0, 1) * Math.clamp((w - p - xc) / soft, 0, 1)
        if (f <= 0) continue
        const q = screenRectQuad((xl - ext - w / 2) * kx, yb, (xr + ext - w / 2) * kx, yt)
        skin.sprites.draw((base + i) as SkinSpriteId, q, Z.finish + 1, Math.min(1, wp * f))
    }
}

export const INTRO_DURATION = 5.9167

export const INTRO_CARD_SHOW = 1.5
export const INTRO_CARD_HIDE = 3.75
export const INTRO_CARD_END = INTRO_CARD_HIDE + 0.6667

export const introRootAlpha = (tau: number) => {
    if (tau < INTRO_CARD_SHOW || tau >= INTRO_CARD_END) return 0

    return flatSeg(tau - INTRO_CARD_SHOW, 0, 0, 0.1667, 1) * flatSeg(tau - INTRO_CARD_HIDE, 0, 1, 0.6667, 0)
}

export const introSafeAlpha = (tau: number) => flatSeg(tau - INTRO_CARD_SHOW, 0, 0, 0.1667, 1)

export const introContentAlpha = (tau: number) => introRootAlpha(tau) * introSafeAlpha(tau)

export const introCenterAlpha = (tau: number) => {
    const local = tau - INTRO_CARD_SHOW
    return local < 0.1667 ? 0 : flatSeg(local, 0.1667, 0, 0.5, 1)
}

export const introSideAlpha = (tau: number) => flatSeg(tau - INTRO_CARD_SHOW, 0.6667, 0, 1.3333, 1)

export const TITLE_JACKET_HALF = (512 * 0.86) / 2
export const TITLE_JACKET_X0 = 960 - TITLE_JACKET_HALF
export const TITLE_JACKET_Y0 = 453 - TITLE_JACKET_HALF
export const TITLE_JACKET_X1 = 960 + TITLE_JACKET_HALF
export const TITLE_JACKET_Y1 = 453 + TITLE_JACKET_HALF

const drawCC =(id: number, x0: number, y0: number, x1: number, y1: number, z: number, a: number) =>
    skin.sprites.draw(id as SkinSpriteId, screenRectQuad(cardCenterX(x0), cardCenterY(y1), cardCenterX(x1), cardCenterY(y0)), z, a)
const drawCaptionCC = (sp: SkinSprite, rect: readonly number[], z: number, a: number) => {
    if (sp.exists) drawCC(sp.id, rect[0]!, rect[1]!, rect[2]!, rect[3]!, z, a)
}

const bannerQuad = (x0: number, x1: number, top: number, bottom: number) =>
    screenRectQuad(cardCenterX(x0), cardBottomY(bottom), cardCenterX(x1), cardBottomY(top))

const drawTitleBanner = (a: number) => {
    const flat = skin.sprites.titleBannerFlat.id
    const grad = skin.sprites.titleBannerGradient.id
    const rows = hudMeta.expandBase > 0 ? 7 : 6
    for (let i = 0; i < rows; i++) {
        const top = 745 + 37 * i
        const bottom = top + 37
        const insetL = i < 6 ? hudSprites.bannerInsetL.get(i) : 96
        const insetR = i < 6 ? hudSprites.bannerInsetR.get(i) : 162
        skin.sprites.draw(flat, bannerQuad(277 + insetL, 460, top, bottom), Z.intro + 1, a)
        skin.sprites.draw(grad, bannerQuad(460, 960, top, bottom), Z.intro + 1, a)
        skin.sprites.draw(grad, bannerQuad(1460, 960, top, bottom), Z.intro + 1, a)
        skin.sprites.draw(flat, bannerQuad(1643 - insetR, 1460, top, bottom), Z.intro + 1, a)
    }
}

const HIGH_SCORE_NO_RECORD = 0

export const drawIntro = (tau: number) => {

    const root = introRootAlpha(tau)
    if (root <= 0) return
    const sp = skin.sprites
    if (sp.titleCardBase.exists) {

        const ox = hudLayout.halfW * 0.01
        skin.sprites.draw(sp.titleCardBase.id, screenRectQuad(-hudLayout.halfW - ox, -1.01, hudLayout.halfW + ox, 1.01), Z.intro, root)
    } else if (hudSprites.hasBlack) {
        skin.sprites.draw(hudSprites.black as SkinSpriteId, fullScreenQuad(), Z.intro, 0.42 * root)
    }

    const a = introCenterAlpha(tau) * introContentAlpha(tau)
    if (a <= 0) return
    if (sp.titleBannerFlat.exists && sp.titleBannerGradient.exists) drawTitleBanner(0.5 * a)

    if (sp.jacket.exists) drawCC(sp.jacket.id, TITLE_JACKET_X0, TITLE_JACKET_Y0, TITLE_JACKET_X1, TITLE_JACKET_Y1, Z.intro + 2, a)
    if (hudMeta.difficulty >= 1 && hudMeta.difficulty <= 4 && sp.difficultyEasy.exists) {
        drawCC(hudSprites.difficulty.get(hudMeta.difficulty), 739, 708 - 17.6, 739 + 120.8, 708 + 17.6, Z.intro + 2, a)
    }
    if (hudMeta.level > 0) {

        const wNum = numberWidth(DigitSet.Level30, hudMeta.level, 1, 0)
        drawNumber(DigitSet.Level30, DigitSet.Level30, hudMeta.level, 1, cardCenterX(882 - wNum / 2), cardCenterY(baselineMiddle(708.9, 30)), 0, Z.intro + 2, a, a, false)
    }
    drawCaptionCC(sp.titleCardHighScore, HUD_CAPTIONS.titleCardHighScore, Z.intro + 2, a)
    drawCaptionCC(sp.titleCardColon, HUD_CAPTIONS.titleCardColon, Z.intro + 2, a)

    drawGlyph(DigitSet.Level30, HIGH_SCORE_NO_RECORD, cardCenterX(1173 - glyphAdvance(DigitSet.Level30, HIGH_SCORE_NO_RECORD)), cardCenterY(baselineMiddle(707.5, 30)), Z.intro + 2, a, false)
}
