import { legacyDepth } from '../../../../shared/src/engine/data/depth.js'
import {
    CAM_COS,
    CAM_HEIGHT,
    CAM_SIN,
    JUDGE_Y,
    LANE3D_FAR_Z,
    LANE3D_HALF,
    LANE3D_JUDGE_Z,
    LANE3D_STEP,
    LANE_UNIT,
    PLANE_DIST,
    SPAWN_Y,
    canvasPxToPlane,
    groundToPlaneX,
    groundToPlaneY,
    judgeXCenter,
    planeScale,
    viewProgress,
    visibleHalfH,
} from '../../../../shared/src/engine/data/geometry.js'
import { approachMs } from '../../../../shared/src/engine/data/timing.js'
import { effect } from './effect.js'
import {
    CORE_QUADS,
    FLOOD_VISIBLE,
    FXL_FRAMES,
    HIT_FX_T,
    HIT_HALO_I,
    HIT_LEVELS,
    HIT_WALL_A,
    OFF_CORE_CAP,
    OFF_CORE_MID,
    OFF_HALO,
    OFF_HALO_MID,
    OFF_WALL,
    PART_COMPONENT_INDEX,
    PART_QUADS,
    POPUP_CY_PX,
    POPUP_H_PX,
    POPUP_T,
    POPUP_W_PX,
    SPARKS_QUAD,
    floodAlpha,
    floodQuad,
} from './hitFx.js'
import { instruction } from './instruction.js'
import { particle } from './particle.js'
import { skin } from './skin.js'

const layout = tutorialData({
    scale: Number,
    halfH: Number,
    canvasPx: Number,
    approachS: Number,

    popupCy: Number,
    popupHw: Number,
    popupHh: Number,
})

const hitTl = tutorialData({
    halo: Tuple(FXL_FRAMES, Number),
    wall: Tuple(FXL_FRAMES, Number),
    levels: Tuple(6, Number),
})
const TL_IDX: readonly number[] = HIT_HALO_I.map((_, i) => i)
const LEVEL_IDX: readonly number[] = HIT_LEVELS.map((_, i) => i)

const Q_ROWS: readonly (readonly number[])[] = [...PART_QUADS, ...CORE_QUADS, SPARKS_QUAD]
const Q_CORE = PART_QUADS.length
const Q_SPARKS = Q_CORE + CORE_QUADS.length
const Q_FLAT: readonly number[] = Q_ROWS.flatMap((r) => [...r])
const Q_IDX: readonly number[] = Q_FLAT.map((_, i) => i)
const COMP_IDX: readonly number[] = PART_COMPONENT_INDEX.map((_, i) => i)
const hitQ = tutorialData({
    q: Tuple(Q_FLAT.length, Number),
    comp: Tuple(PART_COMPONENT_INDEX.length, Number),
})
const rowQuad = (r: number) =>
    new Quad({
        x1: hitQ.q.get(r * 8),
        y1: hitQ.q.get(r * 8 + 1),
        x2: hitQ.q.get(r * 8 + 2),
        y2: hitQ.q.get(r * 8 + 3),
        x3: hitQ.q.get(r * 8 + 4),
        y3: hitQ.q.get(r * 8 + 5),
        x4: hitQ.q.get(r * 8 + 6),
        y4: hitQ.q.get(r * 8 + 7),
    })

const seg = tutorialMemory({ start: Number, hitT0: Number })

const NOTE_POS = 12
const NOTE_SIZE = 6
const NOTE_C = NOTE_POS + NOTE_SIZE / 2 - 0.5
const L_RECT_W = 0.36
const L_W = 0.34
const L_OVER = 0
const L_BCX = 0.01
const R_RECT_W = 0.53
const R_W = 0.44
const R_OVER = 0.09
const R_BCX = -0.045
const NOTE_H = 0.82
const MARK_W = 0.26

const MAIN_BORDER = 0.04
const VW = NOTE_SIZE * LANE_UNIT
const X_L = L_W / 2 - VW / 2 - L_OVER
const X_R = R_OVER + VW / 2 - R_W / 2
const MAIN_W = Math.max(VW + L_OVER + R_OVER - L_W - R_W, 0)
const X_M = (R_OVER - L_OVER) / 2 + (L_W - R_W) / 2
const SEGMENT_S = 3

const camZ = (order: number, cx: number, cy: number): number => legacyDepth(order, -(cx * cx + cy * cy))

const preprocess = () => {
    layout.scale = planeScale(screen.aspectRatio)
    layout.halfH = visibleHalfH(screen.aspectRatio)
    layout.canvasPx = canvasPxToPlane(screen.aspectRatio)
    layout.approachS = approachMs(5) / 1000
    skin.transform.set(Mat.identity.scale(layout.scale, layout.scale))
    particle.transform.set(Mat.identity.scale(layout.scale, layout.scale))

    const gap = 0.05
    const uiRect = screen.rect.shrink(gap, gap)
    ui.menu.set({
        anchor: uiRect.rt,
        pivot: { x: 1, y: 1 },
        size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
        rotation: 0,
        alpha: ui.configuration.menu.alpha,
        background: true,
    })
    ui.navigation.previous.set({
        anchor: uiRect.cl,
        pivot: { x: 0, y: 0.5 },
        size: new Vec(0.15, 0.15).mul(ui.configuration.navigation.scale),
        rotation: 0,
        alpha: ui.configuration.navigation.alpha,
        background: true,
    })
    ui.navigation.next.set({
        anchor: uiRect.cr,
        pivot: { x: 1, y: 0.5 },
        size: new Vec(0.15, 0.15).mul(ui.configuration.navigation.scale),
        rotation: 0,
        alpha: ui.configuration.navigation.alpha,
        background: true,
    })
    ui.instruction.set({
        anchor: new Vec(0, 0.6),
        pivot: { x: 0.5, y: 0.5 },
        size: new Vec(1.2, 0.15).mul(ui.configuration.instruction.scale),
        rotation: 0,
        alpha: ui.configuration.instruction.alpha,
        background: true,
    })

    for (const i of TL_IDX) {
        hitTl.halo.set(i, HIT_HALO_I[i]!)
        hitTl.wall.set(i, HIT_WALL_A[i]!)
    }
    for (const i of LEVEL_IDX) hitTl.levels.set(i, HIT_LEVELS[i]!)
    for (const i of Q_IDX) hitQ.q.set(i, Q_FLAT[i]!)
    for (const i of COMP_IDX) hitQ.comp.set(i, PART_COMPONENT_INDEX[i]!)
    const u = Math.min(screen.aspectRatio / 960, 1 / 540)
    layout.popupCy = ((540 - POPUP_CY_PX) * u) / layout.scale
    layout.popupHw = (POPUP_W_PX * u) / 2 / layout.scale
    layout.popupHh = (POPUP_H_PX * u) / 2 / layout.scale

    seg.start = time.now
    seg.hitT0 = -1e6
    instruction.texts.tap.show()
}

const navigate = () => {
    seg.start = time.now
    seg.hitT0 = -1e6
}

const groundQuad = (x0: number, x1: number, z0: number, z1: number) =>
    new Quad({
        x1: groundToPlaneX(x0, z0),
        y1: groundToPlaneY(z0),
        x2: groundToPlaneX(x0, z1),
        y2: groundToPlaneY(z1),
        x3: groundToPlaneX(x1, z1),
        y3: groundToPlaneY(z1),
        x4: groundToPlaneX(x1, z0),
        y4: groundToPlaneY(z0),
    })

const worldToPlaneX = (x: number, y: number, z: number) => (x * PLANE_DIST) / ((CAM_HEIGHT - y) * CAM_SIN + z * CAM_COS)
const worldToPlaneY = (y: number, z: number) =>
    (((y - CAM_HEIGHT) * CAM_COS + z * CAM_SIN) * PLANE_DIST) / ((CAM_HEIGHT - y) * CAM_SIN + z * CAM_COS)

const ribbonQuad = (x: number, z0: number, z1: number, w0: number, w1: number) => {
    const n = (100 + x * x) ** 0.5
    const rx = -10 / n
    const ry = -x / n
    return new Quad({
        x1: worldToPlaneX(x + (rx * w0) / 2, (ry * w0) / 2, z0),
        y1: worldToPlaneY((ry * w0) / 2, z0),
        x2: worldToPlaneX(x + (rx * w1) / 2, (ry * w1) / 2, z1),
        y2: worldToPlaneY((ry * w1) / 2, z1),
        x3: worldToPlaneX(x - (rx * w1) / 2, -(ry * w1) / 2, z1),
        y3: worldToPlaneY(-(ry * w1) / 2, z1),
        x4: worldToPlaneX(x - (rx * w0) / 2, -(ry * w0) / 2, z0),
        y4: worldToPlaneY(-(ry * w0) / 2, z0),
    })
}

const TUTORIAL_BACKGROUND_BRIGHTNESS = 70
const TUTORIAL_LANE_OPACITY = 80
const TUTORIAL_GUIDELINE_OPACITY = 25

const drawStage = () => {

    const shadow = Math.clamp(1 - TUTORIAL_BACKGROUND_BRIGHTNESS / 100, 0, 1)
    const hh = 2 * layout.halfH
    const hw = hh * screen.aspectRatio
    if (shadow > 0 && skin.sprites.stageShadow.exists)
        skin.sprites.stageShadow.draw(new Quad({ x1: -hw, y1: -hh, x2: -hw, y2: hh, x3: hw, y3: hh, x4: hw, y4: -hh }), 3990, shadow)

    const k = layout.canvasPx
    const laneAlpha = TUTORIAL_LANE_OPACITY / 100
    if (skin.sprites.laneBase.exists) {
        skin.sprites.laneBase.draw(
            new Quad({ x1: -1024 * k, y1: -1069 * k, x2: -1024 * k, y2: 575 * k, x3: 1024 * k, y3: 575 * k, x4: 1024 * k, y4: -1069 * k }),
            4000,
            laneAlpha,
        )
    } else {
        skin.sprites.fbLane.draw(new Quad({ x1: -9.6, y1: -5.4, x2: -0.48, y2: 5.4, x3: 0.48, y3: 5.4, x4: 9.6, y4: -5.4 }), 4000, laneAlpha)
    }

    const aa = skin.sprites.laneLineAaGrey.exists
    const lineId = aa ? skin.sprites.laneLineAaGrey.id : skin.sprites.laneLine.exists ? skin.sprites.laneLine.id : skin.sprites.fbLine.id
    const lineAlpha = (TUTORIAL_GUIDELINE_OPACITY / 100) * (aa ? 1 : 0.6132)

    const main = 6
    const sub = 12
    for (let i = 1; i < 24; i++) {
        const x = -LANE3D_HALF + i * LANE3D_STEP
        const isNormal = main > 0 && i % (24 / main) === 0
        const isSpace = !isNormal && main > 0 && sub > 0 && i % (24 / sub) === 0
        if (isNormal) skin.sprites.draw(lineId, ribbonQuad(x, 0, LANE3D_FAR_Z, 0.15, 0.3), 4100, lineAlpha)
        else if (isSpace) skin.sprites.draw(lineId, ribbonQuad(x, LANE3D_JUDGE_Z - 0.65, LANE3D_JUDGE_Z + 0.65, 0.15, 0.15), 4100, lineAlpha)
    }
    const outId = skin.sprites.laneOutsideLineAa.exists
        ? skin.sprites.laneOutsideLineAa.id
        : skin.sprites.laneOutsideLine.exists
          ? skin.sprites.laneOutsideLine.id
          : skin.sprites.fbLine.id
    skin.sprites.draw(outId, ribbonQuad(-9.64, 0, LANE3D_FAR_Z, 0.16, 0.16), 4100, 1)
    skin.sprites.draw(outId, ribbonQuad(9.64, 0, LANE3D_FAR_Z, 0.16, 0.16), 4100, 1)

    const z0 = LANE3D_JUDGE_Z - 1.05
    const z3 = LANE3D_JUDGE_Z + 1.05
    if (skin.sprites.laneTapAreaColC.exists) {
        const t = (2 * 9.35) / 126
        skin.sprites.laneTapAreaColC.draw(groundQuad(-9.35 - t, 9.35 + t, z0, z3), 4101, 1)
        skin.sprites.laneTapAreaColL.draw(groundQuad(-10.05, -9.25, z0, z3), 4101.5, 1)
        skin.sprites.laneTapAreaColR.draw(groundQuad(9.25, 10.05, z0, z3), 4101.5, 1)
    } else {
        const tapId = skin.sprites.laneTapArea.exists ? skin.sprites.laneTapArea.id : skin.sprites.fbJudgmentLine.id
        skin.sprites.draw(tapId, groundQuad(-10.05, 10.05, z0, z3), 4101, 1)
    }
}

const centered = (cx: number, cy: number, w: number, h: number, flipX: boolean) => {
    const l = flipX ? cx + w / 2 : cx - w / 2
    const r = flipX ? cx - w / 2 : cx + w / 2
    return new Quad({ x1: l, y1: cy - h / 2, x2: l, y2: cy + h / 2, x3: r, y3: cy + h / 2, x4: r, y4: cy - h / 2 })
}

const drawNote = () => {
    const t = Math.mod(time.now - seg.start, SEGMENT_S)
    const p = t / layout.approachS
    if (p > 1) return
    const v = viewProgress(p)
    const px = v * judgeXCenter(NOTE_C)
    const py = SPAWN_Y + (JUDGE_Y - SPAWN_Y) * v
    if (skin.sprites.tapNoteLeft.exists) {
        const h = v * NOTE_H
        skin.sprites.tapNoteLeft.draw(centered(px + v * X_L, py, v * L_RECT_W, h, false), camZ(5000, px + v * (X_L + L_BCX), py), 1)
        const xm = px + v * X_M
        const w = v * MAIN_W
        const b = v * MAIN_BORDER
        const zm = camZ(5000, xm, py)
        if (skin.sprites.tapNoteMainC.exists && w > 2 * b) {
            skin.sprites.tapNoteMainL.draw(centered(xm - w / 2 + b / 2, py, b, h, false), zm, 1)
            skin.sprites.tapNoteMainC.draw(centered(xm, py, w - 2 * b, h, false), zm, 1)
            skin.sprites.tapNoteMainR.draw(centered(xm + w / 2 - b / 2, py, b, h, false), zm, 1)
        } else {
            skin.sprites.tapNote.draw(centered(xm, py, w, h, false), zm, 1)
        }
        const rId = skin.sprites.tapNoteRightTilt3.exists ? skin.sprites.tapNoteRightTilt3.id : skin.sprites.tapNoteRight.id
        skin.sprites.draw(rId, centered(px + v * X_R, py, v * R_RECT_W, h, false), camZ(5000, px + v * (X_R + R_BCX), py), 1)
        skin.sprites.tapNoteMark.draw(centered(px, py, v * MARK_W, v * MARK_W, false), camZ(5500, px, py), 1)
    } else {
        skin.sprites.fbTap.draw(centered(px, py, v * VW, v * NOTE_H, false), 5000, 1)
    }
}

const drawHand = () => {
    const t = Math.mod(time.now - seg.start, SEGMENT_S)
    const x = judgeXCenter(NOTE_C) * layout.scale
    const y = JUDGE_Y * layout.scale
    const phase = Math.clamp((t - layout.approachS + 0.3) / 0.3, 0, 1)
    instruction.icons.hand.paint(
        new Vec(x, y - 0.25 * ui.configuration.instruction.scale).translate(0.05, -0.1 * (1 - phase)),
        0.25 * ui.configuration.instruction.scale,
        60 - 20 * phase,
        0,
        ui.configuration.instruction.alpha,
    )
}

const hitEffects = () => {
    const t = Math.mod(time.now - seg.start, SEGMENT_S)

    if (t < layout.approachS || t - layout.approachS >= time.delta) return
    seg.hitT0 = time.now
    const clip = effect.clips.perfect.exists ? effect.clips.perfect.id : effect.clips.fbPerfect.id
    effect.clips.play(clip, 0)
    if (!particle.effects.hitC0.exists) {
        const x = judgeXCenter(NOTE_C)
        const hw = VW / 2
        if (particle.effects.fbTap.exists)
            particle.effects.spawn(
                particle.effects.fbTap.id as ParticleEffectId,
                new Quad({ x1: x - hw, y1: JUDGE_Y - LANE_UNIT, x2: x - hw, y2: JUDGE_Y + LANE_UNIT, x3: x + hw, y3: JUDGE_Y + LANE_UNIT, x4: x + hw, y4: JUDGE_Y - LANE_UNIT }),
                0.5,
                false,
            )
        return
    }

    const first = !skin.sprites.hitHalo0.exists ? 0 : skin.sprites.hitCoreCap0.exists ? 9 : 6

    for (let part = first; part < Q_CORE; part++) {
        const id = (particle.effects.hitC0.id + hitQ.comp.get(part)) as ParticleEffectId
        if (particle.effects.exists(id)) particle.effects.spawn(id, rowQuad(part), HIT_FX_T, false)
    }
    if (particle.effects.hitSparks.exists) particle.effects.spawn(particle.effects.hitSparks.id as ParticleEffectId, rowQuad(Q_SPARKS), HIT_FX_T, false)
    if (particle.effects.hitPopup.exists) {
        const cy = layout.popupCy
        const hw = layout.popupHw
        const hh = layout.popupHh
        particle.effects.spawn(particle.effects.hitPopup.id as ParticleEffectId, new Quad({ x1: -hw, y1: cy - hh, x2: -hw, y2: cy + hh, x3: hw, y3: cy + hh, x4: hw, y4: cy - hh }), POPUP_T, false)
    }
}

const tlSample = (wall: boolean, f: number) => {
    const i0 = Math.floor(f)
    const i1 = i0 + 1 >= FXL_FRAMES ? 0 : i0 + 1
    const fr = f - i0
    const v0 = wall ? hitTl.wall.get(i0) : hitTl.halo.get(i0)
    const v1 = wall ? hitTl.wall.get(i1) : hitTl.halo.get(i1)
    return v0 + (v1 - v0) * fr
}

const drawHitSkin = () => {
    const age = time.now - seg.hitT0
    if (age < 0 || age >= HIT_FX_T) return
    if (age < FLOOD_VISIBLE && skin.sprites.laneFloodNormal.exists) skin.sprites.laneFloodNormal.draw(floodQuad(age), 4099, floodAlpha(age))
    if (!skin.sprites.hitHalo0.exists) return
    const f = age * 60
    const aWall = tlSample(true, f)
    const I = Math.min(tlSample(false, f), 1)

    const k = I > 0.55 ? 0 : I > 0.3 ? 1 : I > 0.16 ? 2 : I > 0.085 ? 3 : I > 0.045 ? 4 : 5
    const hi = hitTl.levels.get(k)
    const lo = k < 5 ? hitTl.levels.get(Math.min(k + 1, 5)) : 0
    const wHi = k < 5 ? (I - lo) / (hi - lo) : I / hi
    const wLo = k < 5 ? 1 - wHi : 0
    const base = skin.sprites.hitHalo0.id
    for (let part = 0; part < 6; part++) {
        const isWall = part < 3
        const a = isWall ? aWall : I > 0 ? wHi : 0
        if (a <= 0) continue
        const id = base + (isWall ? OFF_WALL + part : (part < 5 ? OFF_HALO : OFF_HALO_MID) + k)
        skin.sprites.draw(id as SkinSpriteId, rowQuad(part), legacyDepth(4099.5, part * 2), Math.min(a, 1))
        if (!isWall && wLo > 0) skin.sprites.draw((id + 1) as SkinSpriteId, rowQuad(part), legacyDepth(4099.5, part * 2 + 1), wLo)
    }
    if (!skin.sprites.hitCoreCap0.exists || I <= 0) return
    for (let j = 0; j < 3; j++) {
        const cb = base + (j === 0 ? OFF_CORE_MID : OFF_CORE_CAP)
        skin.sprites.draw((cb + Math.min(k, 4)) as SkinSpriteId, rowQuad(Q_CORE + j), legacyDepth(4100.5, j * 2), k < 5 ? 1 : wHi)
        if (k < 5 && wHi > 0) skin.sprites.draw((cb + 5 + k) as SkinSpriteId, rowQuad(Q_CORE + j), legacyDepth(4100.5, j * 2 + 1), wHi)
    }
}

export const tutorial = {
    preprocess: [preprocess],
    navigate: [navigate],

    update: [hitEffects, drawStage, drawNote, drawHitSkin, drawHand],
}
