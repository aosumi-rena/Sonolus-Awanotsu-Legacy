import { legacyDepth } from '../../../../shared/src/engine/data/depth.js'
import {
    FLICK_LOOP_SECONDS,
    FLICK_SIDE_ARROW_Y,
    FLICK_UP_ROOT_SCALE,
    FLICK_UP_ROOT_Y,
    flickLeftArrowAlpha,
    flickLeftArrowX,
    flickRightArrowAlpha,
    flickRightArrowX,
    flickUpArrowY,
} from '../../../../shared/src/engine/data/flickAnim.js'
import { CENTER_LANE, LANE_UNIT } from '../../../../shared/src/engine/data/geometry.js'
import { NoteDirection, SkinUnit } from '../../../../shared/src/engine/data/notes.js'
import { centeredQuad } from './layout.js'
import { drawHoneycombGradient, gradientFirstSlice } from './honeycombGradient.js'
import { FLASH_K1, FLASH_K2, RHYTHM_BODY_2, RHYTHM_BODY_3, RHYTHM_BODY_OFFSET,
    RHYTHM_FLASH_OFFSET, RHYTHM_PIECE_OFFSET, RHYTHM_UP_ARROW_OFFSET, layer, noteStyle, skin } from './skin.js'
import { honeycombArrowBcx, honeycombArrowBcy, honeycombArrowH, honeycombArrowW, skinTables } from './skinTables.generated.js'

export const camZ = (order: number, cx: number, cy: number): number => legacyDepth(order, -(cx * cx + cy * cy))

export const noteRootOrder = (px: number, py: number) =>
    layer.noteBody + (layer.mark - layer.noteBody) / (1 + px * px + py * py)

export type NoteDepth = number

const noteDepth = (root: number, entity: number, order: number, x: number, y: number, lift: number): NoteDepth => {
    const camera = (Math.floor(127 / (1 + x * x + y * y)) + (lift > 0 ? 0.5 : 0)) / 128
    const child = (order - layer.noteBody + camera) / 512
    const group = (Math.clamp(entity, 0, 65535) + child) / 65536
    return (Math.round(root * 16) + group) / 16
}

export const tiltOf = (d: number) => (d <= 0 ? 0 : d <= 2 ? 1 : d <= 4 ? 2 : d <= 6 ? 3 : d <= 8 ? 4 : d <= 10 ? 5 : 6)

export const NoteParts = {
    lId: Number,
    rId: Number,
    lFlip: Boolean,
    rFlip: Boolean,
    lRectW: Number,
    rRectW: Number,

    xL: Number,
    xR: Number,
    xM: Number,

    mainW: Number,

    lZx: Number,
    rZx: Number,

    mainId: Number,
    mainL: Number,
    mainC: Number,
    mainR: Number,
}

export const computeNoteParts = (unit: number, c: number, w: number, out: ContainerType<typeof NoteParts>) => {
    const vw = w * LANE_UNIT
    const leftEdge = c - w / 2
    const rightEdge = c + w / 2
    const iL = unit * 7 + tiltOf(Math.abs(leftEdge - CENTER_LANE))
    const iR = unit * 7 + tiltOf(Math.abs(rightEdge - CENTER_LANE))

    let lW = 0
    let rW = 0
    let oL = 0
    let oR = 0
    let lBc = 0
    let rBc = 0
    if (leftEdge >= CENTER_LANE) {

        out.lId = skinTables.partLeftId.get(iL)
        out.lRectW = skinTables.partLeftRectW.get(iL)
        out.lFlip = false
        lW = skinTables.partLeftW.get(iL)
        oL = skinTables.partLeftOverhang.get(iL)
        lBc = skinTables.partLeftBcx.get(iL)
        out.rId = skinTables.partRightId.get(iR)
        out.rRectW = skinTables.partRightRectW.get(iR)
        out.rFlip = false
        rW = skinTables.partRightW.get(iR)
        oR = skinTables.partRightOverhang.get(iR)
        rBc = skinTables.partRightBcx.get(iR)
    } else if (rightEdge <= CENTER_LANE) {

        out.lId = skinTables.partRightId.get(iL)
        out.lRectW = skinTables.partRightRectW.get(iL)
        out.lFlip = true
        lW = skinTables.partRightW.get(iL)
        oL = skinTables.partRightOverhang.get(iL)
        lBc = -skinTables.partRightBcx.get(iL)
        out.rId = skinTables.partLeftId.get(iR)
        out.rRectW = skinTables.partLeftRectW.get(iR)
        out.rFlip = true
        rW = skinTables.partLeftW.get(iR)
        oR = skinTables.partLeftOverhang.get(iR)
        rBc = -skinTables.partLeftBcx.get(iR)
    } else {

        out.lId = skinTables.partRightId.get(iL)
        out.lRectW = skinTables.partRightRectW.get(iL)
        out.lFlip = true
        lW = skinTables.partRightW.get(iL)
        oL = skinTables.partRightOverhang.get(iL)
        lBc = -skinTables.partRightBcx.get(iL)
        out.rId = skinTables.partRightId.get(iR)
        out.rRectW = skinTables.partRightRectW.get(iR)
        out.rFlip = false
        rW = skinTables.partRightW.get(iR)
        oR = skinTables.partRightOverhang.get(iR)
        rBc = skinTables.partRightBcx.get(iR)
    }

    out.xL = lW / 2 - vw / 2 - oL
    out.xR = oR + vw / 2 - rW / 2
    out.mainW = Math.max(vw + oL + oR - lW - rW, 0)
    out.xM = (oR - oL) / 2 + (lW - rW) / 2
    out.lZx = out.xL + lBc
    out.rZx = out.xR + rBc
    out.mainId = skinTables.unitMainId.get(unit)
    const centerId = mainCenterId(unit)
    if (skin.sprites.exists(centerId as SkinSpriteId)) {
        out.mainL = mainLeftId(unit)
        out.mainC = centerId
        out.mainR = mainRightId(unit)
    } else {
        out.mainL = 0
        out.mainC = 0
        out.mainR = 0
    }
}

export const applyRhythmSupport = (unit: number, subdivision: number, parts: ContainerType<typeof NoteParts>) => {
    if (subdivision !== 2 && subdivision !== 3) return
    const stride = subdivision === 3 ? RHYTHM_BODY_3 - RHYTHM_BODY_2 : 0
    const offset = RHYTHM_BODY_OFFSET + stride
    if (!skin.sprites.exists((parts.mainId + offset) as SkinSpriteId) ||
        !skin.sprites.exists((skinTables.partLeftId.get(unit * 7) + offset) as SkinSpriteId) ||
        !skin.sprites.exists((skinTables.partRightId.get(unit * 7) + offset) as SkinSpriteId) ||
        !skin.sprites.exists((parts.lId + offset) as SkinSpriteId) || !skin.sprites.exists((parts.rId + offset) as SkinSpriteId)) return

    if (unit === SkinUnit.Tap && subdivision === 3 && noteStyle() === 2 && skin.sprites.stockRhythmGeometry.exists) {
        const left = parts.lId === skin.sprites.tapNoteRightTilt2.id ? 0.01 : 0
        const right = parts.rId === skin.sprites.tapNoteRightTilt2.id ? 0.01 : 0
        parts.xL += left / 2
        parts.xR -= right / 2
        parts.xM += (left - right) / 2
        parts.mainW = Math.max(parts.mainW - left - right, 0)
    }
    parts.mainId += offset
    parts.lId += offset
    parts.rId += offset
    const pieceOffset = RHYTHM_PIECE_OFFSET + stride
    const center = mainCenterId(unit) + pieceOffset
    if (skin.sprites.exists(center as SkinSpriteId)) {
        parts.mainL = mainLeftId(unit) + pieceOffset
        parts.mainC = center
        parts.mainR = mainRightId(unit) + pieceOffset
    } else {
        parts.mainC = 0
    }
}

const rhythmSprite = (normal: number, subdivision: number, honeycombUp: boolean) => {
    if (subdivision !== 2 && subdivision !== 3) return normal
    const stride = subdivision === 3 ? RHYTHM_BODY_3 - RHYTHM_BODY_2 : 0
    const id = normal + (honeycombUp ? RHYTHM_UP_ARROW_OFFSET : RHYTHM_BODY_OFFSET) + stride
    return skin.sprites.exists(id as SkinSpriteId) ? id : normal
}

const MAIN_BORDER = 0.04

const mainLeftId = (unit: number) =>
    unit === SkinUnit.Tap
        ? skin.sprites.tapNoteMainL.id
        : unit === SkinUnit.Slide
          ? skin.sprites.slideNoteMainL.id
          : unit === SkinUnit.SlideEnd
            ? skin.sprites.slideEndNoteMainL.id
            : unit === SkinUnit.Connect
              ? skin.sprites.slideConnectNoteMainL.id
              : unit === SkinUnit.Trace
                ? skin.sprites.traceNoteMainL.id
                : unit === SkinUnit.Flick
                  ? skin.sprites.flickNoteMainL.id
                  : unit === SkinUnit.FlickLeft
                    ? skin.sprites.flickLeftNoteMainL.id
                    : skin.sprites.flickRightNoteMainL.id
const mainCenterId = (unit: number) =>
    unit === SkinUnit.Tap
        ? skin.sprites.tapNoteMainC.id
        : unit === SkinUnit.Slide
          ? skin.sprites.slideNoteMainC.id
          : unit === SkinUnit.SlideEnd
            ? skin.sprites.slideEndNoteMainC.id
            : unit === SkinUnit.Connect
              ? skin.sprites.slideConnectNoteMainC.id
              : unit === SkinUnit.Trace
                ? skin.sprites.traceNoteMainC.id
                : unit === SkinUnit.Flick
                  ? skin.sprites.flickNoteMainC.id
                  : unit === SkinUnit.FlickLeft
                    ? skin.sprites.flickLeftNoteMainC.id
                    : skin.sprites.flickRightNoteMainC.id
const mainRightId = (unit: number) =>
    unit === SkinUnit.Tap
        ? skin.sprites.tapNoteMainR.id
        : unit === SkinUnit.Slide
          ? skin.sprites.slideNoteMainR.id
          : unit === SkinUnit.SlideEnd
            ? skin.sprites.slideEndNoteMainR.id
            : unit === SkinUnit.Connect
              ? skin.sprites.slideConnectNoteMainR.id
              : unit === SkinUnit.Trace
                ? skin.sprites.traceNoteMainR.id
                : unit === SkinUnit.Flick
                  ? skin.sprites.flickNoteMainR.id
                  : unit === SkinUnit.FlickLeft
                    ? skin.sprites.flickLeftNoteMainR.id
                    : skin.sprites.flickRightNoteMainR.id

const drawMainBar = (
    parts: ContainerType<typeof NoteParts>,
    unitH: number,
    cx: number,
    cy: number,
    w: number,
    h: number,
    z: NoteDepth,
    a: number,
    k1: number,
    k2: number,
) => {
    const b = MAIN_BORDER * (h / unitH)
    if (parts.mainC > 0 && w > 2 * b) {

        skin.sprites.draw((parts.mainL + k2) as SkinSpriteId, centeredQuad(cx - w / 2 + b / 2, cy, b, h, false), z, a)
        skin.sprites.draw((parts.mainC + k2) as SkinSpriteId, centeredQuad(cx, cy, w - 2 * b, h, false), z, a)
        skin.sprites.draw((parts.mainR + k2) as SkinSpriteId, centeredQuad(cx + w / 2 - b / 2, cy, b, h, false), z, a)
    } else {

        skin.sprites.draw((parts.mainId + k1) as SkinSpriteId, centeredQuad(cx, cy, w, h, false), z, a)
    }
}

const FLASH_DZ = 1e-6

export const drawNoteParts = (
    unit: number,
    parts: ContainerType<typeof NoteParts>,
    px: number,
    py: number,
    v: number,
    a: number,
    flash: number,
    hasRhythm: boolean,
    root: number,
    entity: number,
) => {
    const h = skinTables.unitHeight.get(unit)
    const xl = px + v * parts.lZx
    const xm = px + v * parts.xM
    const xr = px + v * parts.rZx
    for (let pass = 0; pass < (flash > 0 ? 2 : 1); pass++) {
        const alt = hasRhythm && parts.mainId >= RHYTHM_BODY_2
        const k1 = pass * (alt ? RHYTHM_FLASH_OFFSET : FLASH_K1)
        const k2 = pass * (alt ? RHYTHM_FLASH_OFFSET : FLASH_K2)
        const aa = pass === 0 ? a : flash * a
        const dz = pass * FLASH_DZ
        skin.sprites.draw((parts.lId + k1) as SkinSpriteId, centeredQuad(px + v * parts.xL, py, v * parts.lRectW, v * h, parts.lFlip), noteDepth(root, entity, layer.noteBody, xl, py, dz), aa)
        if (parts.mainW > 0) drawMainBar(parts, h, xm, py, v * parts.mainW, v * h, noteDepth(root, entity, layer.noteBody, xm, py, dz), aa, k1, k2)
        skin.sprites.draw((parts.rId + k1) as SkinSpriteId, centeredQuad(px + v * parts.xR, py, v * parts.rRectW, v * h, parts.rFlip), noteDepth(root, entity, layer.noteBody, xr, py, dz), aa)
    }
}

export const drawNoteMark = (unit: number, px: number, py: number, v: number, a: number, main: number, root: number, entity: number) => {
    const order =
        unit === SkinUnit.Trace
            ? layer.traceMark
            : unit === SkinUnit.Connect
              ? layer.arrowBase + Math.round(500 * Math.clamp(v, 0, 1))
              : layer.mark
    skin.sprites.draw(
        rhythmSprite(skinTables.unitMarkId.get(unit), main >= RHYTHM_BODY_3 ? 3 : main >= RHYTHM_BODY_2 ? 2 : 0, false) as SkinSpriteId,
        centeredQuad(px, py, v * skinTables.unitMarkW.get(unit), v * skinTables.unitMarkH.get(unit), false),
        noteDepth(root, entity, order, px, py, 0),
        a,
    )
}

const arrowIndexUp = (wLanes: number) =>
    wLanes < skinTables.arrowUpMax.get(0) ? 0 : wLanes < skinTables.arrowUpMax.get(1) ? 1 : wLanes < skinTables.arrowUpMax.get(2) ? 2 : 3
const arrowIndexSide = (wLanes: number, left: boolean) => {
    for (let i = 0; i < 7; i++) {
        const max = left ? skinTables.arrowLeftMax.get(i) : skinTables.arrowRightMax.get(i)
        if (wLanes < max) return i
    }
    return 7
}

export const drawFlickArrow = (dir: number, wLanes: number, px: number, py: number, v: number, a: number, t0: number, subdivision: number, rootOrder: number, entity: number) => {
    const style = noteStyle()
    const garupa = style === 2
    const honeycomb = style === 3
    const t = Math.mod(time.now - t0, garupa ? 0.5 : FLICK_LOOP_SECONDS)
    const order = layer.arrowBase + Math.round(500 * Math.clamp(v, 0, 1))
    if (dir === NoteDirection.Left) {
        const i = arrowIndexSide(wLanes, true)
        const ax = px + v * (garupa ? -3 * t : honeycomb ? -1.08 : flickLeftArrowX(t))
        const ay = py + v * (garupa ? 0.85 : honeycomb ? 1.04 : FLICK_SIDE_ARROW_Y)
        const s = v * (garupa ? 0.8 : honeycomb ? 1.3 : 1)
        const normal = skinTables.arrowLeftId.get(i)
        const selected = rhythmSprite(normal, subdivision, false)
        const gradient = honeycomb ? gradientFirstSlice(dir, i, selected === normal, subdivision) : -1
        const support = selected !== normal && gradient >= 0
        const q = centeredQuad(ax, ay, s * (support ? 1.35 + 0.60 * i : skinTables.arrowLeftW.get(i)),
            s * (support ? 1.32 : skinTables.arrowLeftH.get(i)), false).swapRotate180()
        const z = noteDepth(rootOrder, entity, order, support ? ax : ax - s * skinTables.arrowLeftBcx.get(i),
            support ? ay : ay - s * skinTables.arrowLeftBcy.get(i), 0)
        if (gradient >= 0) drawHoneycombGradient(dir,gradient,q,z,a,t0)
        else skin.sprites.draw(selected as SkinSpriteId, q, z, garupa || honeycomb ? a : a * Math.min(flickLeftArrowAlpha(t), 1))
    } else if (dir === NoteDirection.Right) {
        const i = arrowIndexSide(wLanes, false)
        const ax = px + v * (garupa ? 3 * t : honeycomb ? 1.08 : flickRightArrowX(t))
        const ay = py + v * (garupa ? 0.85 : honeycomb ? 1.04 : FLICK_SIDE_ARROW_Y)
        const s = v * (garupa ? 0.8 : honeycomb ? 1.3 : 1)
        const normal = skinTables.arrowRightId.get(i)
        const selected = rhythmSprite(normal, subdivision, false)
        const gradient = honeycomb ? gradientFirstSlice(dir, i, selected === normal, subdivision) : -1
        const support = selected !== normal && gradient >= 0
        const q = centeredQuad(ax, ay, s * (support ? 1.35 + 0.60 * i : skinTables.arrowRightW.get(i)),
            s * (support ? 1.32 : skinTables.arrowRightH.get(i)), false)
        const z = noteDepth(rootOrder, entity, order, support ? ax : ax + s * skinTables.arrowRightBcx.get(i),
            support ? ay : ay + s * skinTables.arrowRightBcy.get(i), 0)
        if (gradient >= 0) drawHoneycombGradient(dir,gradient,q,z,a,t0)
        else skin.sprites.draw(selected as SkinSpriteId, q, z, garupa || honeycomb ? a : a * Math.min(flickRightArrowAlpha(t), 1))
    } else {
        const i = honeycomb ? arrowIndexSide(wLanes, false) : arrowIndexUp(wLanes)
        const root = v * FLICK_UP_ROOT_SCALE
        const s = root * (garupa ? 0.8 : honeycomb ? 1.375 : 1)
        const ax = px
        const ay = py + v * FLICK_UP_ROOT_Y + root * (garupa ? 0.8 + 2.6 * t : honeycomb ? 0.65 : flickUpArrowY(t))
        const q = centeredQuad(ax, ay, s * (honeycomb ? honeycombArrowW(i) : skinTables.arrowUpW.get(i)),
            s * (honeycomb ? honeycombArrowH(i) : skinTables.arrowUpH.get(i)), false)
        const z = noteDepth(rootOrder, entity, order, ax + s * (honeycomb ? honeycombArrowBcx(i) : skinTables.arrowUpBcx.get(i)),
            ay + s * (honeycomb ? honeycombArrowBcy(i) : skinTables.arrowUpBcy.get(i)), 0)
        const id = honeycomb ? skin.sprites.flickUpArrow1.id + i : skinTables.arrowUpId.get(i)
        const selected = rhythmSprite(id, subdivision, honeycomb)
        const gradient = honeycomb ? gradientFirstSlice(0, i, selected === id, subdivision) : -1
        if (gradient >= 0) drawHoneycombGradient(0,gradient,q,z,a,t0)
        else skin.sprites.draw(selected as SkinSpriteId, q, z, a)
    }
}

export const unitHasMark = (unit: number) => unit !== SkinUnit.SlideEnd
