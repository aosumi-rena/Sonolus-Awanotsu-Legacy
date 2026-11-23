import { legacyPartDepth } from '../../../../shared/src/engine/data/depth.js'
import {
    CAM_COS,
    CAM_HEIGHT,
    CAM_SIN,
    LANE3D_STEP,
    LANE_UNIT,
    PLANE_DIST,
    SPAWN_Y,
    groundToPlaneX,
    groundToPlaneY,
    groundZAtPlaneY,
} from '../../../../shared/src/engine/data/geometry.js'
import { NoteDirection, SimJudgement } from '../../../../shared/src/engine/data/notes.js'
import { effect, sfxDistance, sfxDistanceScheduled } from './effect.js'
import { SeFamily, SeSlot, noteSeClip } from './seGroups.js'
import {
    FXL_CORE_COLOURS,
    FXL_CORE_CROP,
    FXL_CORE_LOOP_COLOUR,
    FXL_HALO_I,
    FXL_HALO_LOOP_BASE,
    FXL_LEVELS,
    FXL_LOOP_FRAMES,
    FXL_LOOP_HALO_COLOUR,
    FXL_LOOP_WALL_COLOUR,
    FXL_MAP_HI,
    FXL_MAP_LO,
    FXL_WALL_A,
    FXL_WALL_LOOP_BASE,
} from './fxLayer.generated.js'
import { FXF_A, FXF_LOOP_BASE, FXF_LOOP_FRAMES, FXF_MAP } from './fxFlash.generated.js'
import { FX_JZ, FX_LZ0, FX_LZ1, FX_T_LOOP, FX_T_LOOP_RAMP } from './fxLayout.generated.js'
import {
    FX_CORE_PARTS,
    FX_CORE_ROW,
    FX_PARTS,
    FX_SPARKS_KB,
    FX_SPARKS_KT,
    FX_SPARKS_PART,
    FX_SPARKS_YB,
    FX_SPARKS_YT,
    fxCoreRows,
    fxCornerOf,
    fxPartXA,
    fxPartXB,
    fxRowOf,
    fxTable,
} from './fxTables.js'
import { judgeX, judgeY, layout } from './layout.js'
import { COMPONENT_COUNT, Comp, GROOVE_ID, LANE_BASE, LOOP_BASE, LOOP_SPARKS_BASE, LOOP_SPARKS_START_BASE, NOTE_BASE, SPARKS_BASE, WIDTH_VARIANTS, particle } from './particle.js'
import { flashSprite, layer, skin } from './skin.js'

const czOf = (y: number, z: number) => -(y - CAM_HEIGHT) * CAM_SIN + z * CAM_COS

const kOf = (y: number, z: number) => PLANE_DIST / czOf(y, z)

const yOf = (y: number, z: number) => ((y - CAM_HEIGHT) * CAM_COS + z * CAM_SIN) * kOf(y, z)

const adjX = (x: number) => x * (1 + layout.judgeOffset)
const adjY = (y: number) => SPAWN_Y + (y - SPAWN_Y) * (1 + layout.judgeOffset)

const rectQuad = (xa: number, xb: number, yb: number, zb: number, yt: number, zt: number) =>
    new Quad({
        x1: adjX(xa * kOf(yb, zb)),
        y1: adjY(yOf(yb, zb)),
        x2: adjX(xa * kOf(yt, zt)),
        y2: adjY(yOf(yt, zt)),
        x3: adjX(xb * kOf(yt, zt)),
        y3: adjY(yOf(yt, zt)),
        x4: adjX(xb * kOf(yb, zb)),
        y4: adjY(yOf(yb, zb)),
    })

const worldX = (c: number) => LANE3D_STEP * (c + 0.5 - 12)

const worldXEdge = (edge: number) => LANE3D_STEP * (edge - 12)

const partQuad = (r: number, xA: number, xB: number) => {
    const c = fxCornerOf(r)
    return new Quad({
        x1: adjX(xA * fxTable.corners.get(c)),
        y1: adjY(fxTable.corners.get(c + 1)),
        x2: adjX(xA * fxTable.corners.get(c + 2)),
        y2: adjY(fxTable.corners.get(c + 3)),
        x3: adjX(xB * fxTable.corners.get(c + 4)),
        y3: adjY(fxTable.corners.get(c + 5)),
        x4: adjX(xB * fxTable.corners.get(c + 6)),
        y4: adjY(fxTable.corners.get(c + 7)),
    })
}

const sparksQ = (xc: number, lanes: number) =>
    new Quad({
        x1: adjX((xc - (lanes * LANE3D_STEP + 0.08) / 2) * FX_SPARKS_KB),
        y1: adjY(FX_SPARKS_YB),
        x2: adjX((xc - (lanes * LANE3D_STEP + 0.08) / 2) * FX_SPARKS_KT),
        y2: adjY(FX_SPARKS_YT),
        x3: adjX((xc + (lanes * LANE3D_STEP + 0.08) / 2) * FX_SPARKS_KT),
        y3: adjY(FX_SPARKS_YT),
        x4: adjX((xc + (lanes * LANE3D_STEP + 0.08) / 2) * FX_SPARKS_KB),
        y4: adjY(FX_SPARKS_YB),
    })

const laneFloodQ = (edgeL: number, edgeR: number) => rectQuad(worldXEdge(edgeL), worldXEdge(edgeR), 0, FX_LZ0, 0, FX_LZ1)

const widthVariantIndex = (w: number) => {
    const n = Math.floor(w + 0.5)
    return n <= 4 ? 0 : n <= 6 ? 1 : n <= 8 ? 2 : n <= 10 ? 3 : n <= 17 ? 4 : 5
}
const WIDTH_VARIANT_COUNT = WIDTH_VARIANTS.length

export const Family = { None: -1, Normal: 0, Slide: 1, SlideConnect: 2, Flick: 3, FlickLeft: 4, FlickRight: 5 } as const

export const LaneType = { None: -1, Normal: 0, Slide: 1, Flick: 2, FlickLeft: 3, FlickRight: 4, InVain: 5, Gekisou: 6 } as const

const LOOP_FAM = 6

export const EffectIds = {

    fam: Number,

    lane: Number,

    sePerfect: Number,
    seGreat: Number,
    seGood: Number,

    tX: Number,
    tT: Number,
    tW: Number,
    tWm: Number,
    tBase: Number,
}

const pickClip = (c: EffectClip, fallback: EffectClip) => (c.exists ? c.id : fallback.id)

export const NO_SE = -1

export const familyOf = (op: number, dir: number) =>
    op === 1 || op === 101
        ? Family.Normal
        : op === 20 || op === 22
          ? Family.Slide
          : op === 21 || op === 60 || op === 61 || op === 62 || op === 63 || op === 104 || op === 105
            ? Family.SlideConnect
            : op === 40 || op === 41 || op === 42 || op === 102
              ? dir === NoteDirection.Left
                  ? Family.FlickLeft
                  : dir === NoteDirection.Right
                    ? Family.FlickRight
                    : Family.Flick
              : Family.None

export const laneTypeOf = (op: number, dir: number) =>
    op === 1 || op === 101
        ? LaneType.Normal
        : op === 20 || op === 22
          ? LaneType.Slide
          : op === 40 || op === 41 || op === 42 || op === 102
            ? dir === NoteDirection.Left
                ? LaneType.FlickLeft
                : dir === NoteDirection.Right
                  ? LaneType.FlickRight
                  : LaneType.Flick
            : LaneType.None

export const resolveNoteEffectIds = (op: number, dir: number, out: ContainerType<typeof EffectIds>) => {
    out.fam = familyOf(op, dir)
    out.lane = laneTypeOf(op, dir)

    if (op === 1 || op === 20 || op === 22 || op === 101) {
        out.sePerfect = noteSeClip(SeSlot.Perfect, SeFamily.Tap, effect.clips.fbPerfect)
        out.seGreat = noteSeClip(SeSlot.Great, SeFamily.Tap, effect.clips.fbGreat)
        out.seGood = noteSeClip(SeSlot.Good, SeFamily.Tap, effect.clips.fbGood)
    } else if (op === 40 || op === 41 || op === 42 || op === 102) {
        const se =
            dir === NoteDirection.Normal
                ? noteSeClip(SeSlot.Flick, SeFamily.Flick, effect.clips.fbPerfectAlternative)
                : noteSeClip(SeSlot.FlickDirection, SeFamily.SideFlick, effect.clips.fbPerfectAlternative)
        out.sePerfect = se
        out.seGreat = se
        out.seGood = se
    } else if (op === 21 || op === 60 || op === 61 || op === 62 || op === 63 || op === 104 || op === 105) {

        const se = op === 21 ? noteSeClip(SeSlot.SlideConnect, SeFamily.Slide, effect.clips.fbPerfect) : noteSeClip(SeSlot.Trace, SeFamily.Trace, effect.clips.fbPerfect)
        out.sePerfect = se
        out.seGreat = se
        out.seGood = se
    } else {
        out.sePerfect = NO_SE
        out.seGreat = NO_SE
        out.seGood = NO_SE
    }
}

const seOf = (ids: ContainerType<typeof EffectIds>, sim: number) =>
    sim === SimJudgement.Great
        ? ids.seGreat
        : sim === SimJudgement.Good
          ? ids.seGood
          : sim === SimJudgement.Perfect || sim === SimJudgement.Just
            ? ids.sePerfect
            : NO_SE

export const judgeIndex = (sim: number) =>
    sim === SimJudgement.Perfect || sim === SimJudgement.Just ? 0 : sim === SimJudgement.Great ? 1 : sim === SimJudgement.Good ? 2 : sim === SimJudgement.Bad ? 3 : -1

const noteEffectDuration = (fam: number, j: number) => {
    if (fam === Family.Slide || fam === Family.SlideConnect) return j === 0 ? 35 / 60 : 25 / 60
    if (fam >= Family.Flick) return j === 0 ? 25 / 60 : j === 3 ? 35 / 60 : 30 / 60
    return 25 / 60
}

const laneFloodDuration = (laneType: number) => (laneType === LaneType.Gekisou ? 27 / 60 : 14 / 60)

export const FX_FRAME_S = 1 / 60

export const playJudgeEffects = (
    ids: ContainerType<typeof EffectIds>,
    sim: number,
    c: number,
    w: number,
    edgeL: number,
    edgeR: number,
    sfx: boolean,
    noteFx: boolean,
    laneFx: boolean,
) => {
    const j = judgeIndex(sim)
    if (j < 0) return
    if (sfx) {
        const se = seOf(ids, sim)
        if (se >= 0) effect.clips.play(se as EffectClipId, sfxDistance)
    }

    if (noteFx && ids.fam >= 0) spawnNoteEffect(ids, j, c, w)
}

export const hasLaneFlood = (ids: ContainerType<typeof EffectIds>, sim: number) => ids.lane >= 0 && judgeIndex(sim) >= 0 && judgeIndex(sim) <= 2

const LANE_COUNT_FX = 24

const LANE_FLOOD_PLAYING = 1.0

const laneFloodTable = levelMemory({
    inst: Tuple(LANE_COUNT_FX, Number),
    type: Tuple(LANE_COUNT_FX, Number),
    t: Tuple(LANE_COUNT_FX, Number),
})

const laneStartOf = (edgeL: number) => Math.max(0, Math.floor(edgeL + 1e-6))
const laneEndOf = (edgeR: number) => Math.min(LANE_COUNT_FX - 1, Math.ceil(edgeR - 1e-6) - 1)

const spawnLaneFloodId = (laneType: number, q: Quad) => {
    const id = (LANE_BASE + laneType) as ParticleEffectId
    if (particle.effects.exists(id)) return particle.effects.spawn(id, q, laneFloodDuration(laneType), false)
    if (particle.effects.fbLane.exists) return particle.effects.fbLane.spawn(q, laneFloodDuration(laneType), false)
    return 0 as ParticleEffectInstanceId
}

export const requestLaneFlood = (laneType: number, edgeL: number, edgeR: number, t0: number) => {
    const l0 = laneStartOf(edgeL)
    const l1 = laneEndOf(edgeR)
    const skinMode = skin.sprites.laneFloodNormal.exists
    for (let lane = l0; lane <= l1; lane++) {
        const cur = laneFloodTable.inst.get(lane)
        const playing = cur !== 0 && time.now - laneFloodTable.t.get(lane) < LANE_FLOOD_PLAYING

        if (playing && laneType === LaneType.InVain && laneFloodTable.type.get(lane) !== LaneType.InVain) continue
        if (playing && laneFloodTable.t.get(lane) === t0 && laneFloodTable.type.get(lane) < laneType) continue
        if (cur !== 0 && !skinMode) particle.effects.destroy(cur as ParticleEffectInstanceId)
        laneFloodTable.inst.set(lane, skinMode ? 1 : spawnLaneFloodId(laneType, laneFloodQ(lane, lane + 1)))
        laneFloodTable.type.set(lane, laneType)
        laneFloodTable.t.set(lane, t0)
    }
}

export const requestJudgeLaneFlood = (
    ids: ContainerType<typeof EffectIds>,
    sim: number,
    edgeL: number,
    edgeR: number,
    vainEdge: number,
    t0: number,
    laneFx: boolean,
    c: number,
    w: number,
    noteFx: boolean,
) => {

    if (noteFx) registerFxLayer(ids.fam, judgeIndex(sim), c, w, t0)
    const hit = hasLaneFlood(ids, sim)
    if (!laneFx || (!hit && vainEdge < 0)) return
    const block = Math.clamp(Math.floor(vainEdge), 0, 23) - (Math.clamp(Math.floor(vainEdge), 0, 23) % 2)
    requestLaneFlood(hit ? ids.lane : LaneType.InVain, hit ? edgeL : block, hit ? edgeR : block + 2, t0)
}

const FLOOD_U_PER_S = 2 / 0.45
const FLOOD_VISIBLE = 0.45 / 2

const FLOOD_ALPHA_KNEE = 0.4441138

const floodHalfLength = (u: number) =>
    70 *
    ((2 * u * u * u - 3 * u * u + 1) * 0.473175 +
        (u * u * u - 2 * u * u + u) * 1.1440189 +
        (-2 * u * u * u + 3 * u * u) * 1.0 +
        (u * u * u - u * u) * 0.0986695)

export const drawLaneFloods = (covered: (lane: number) => boolean) => {
    if (!skin.sprites.laneFloodNormal.exists) return
    const zMask = laneFloodZMask()
    let run = -1
    for (let lane = 0; lane <= LANE_COUNT_FX; lane++) {
        const k = Math.min(lane, LANE_COUNT_FX - 1)
        const age = time.now - laneFloodTable.t.get(k)

        const live = lane < LANE_COUNT_FX && laneFloodTable.inst.get(k) !== 0 && age >= 0 && age < FLOOD_VISIBLE - FX_FRAME_S && !covered(k)
        const same =
            run >= 0 &&
            live &&
            laneFloodTable.t.get(k) === laneFloodTable.t.get(run) &&
            laneFloodTable.type.get(k) === laneFloodTable.type.get(run)
        if (run >= 0 && !same) drawFloodRunAt(run, lane, laneFloodTable.type.get(run), time.now - laneFloodTable.t.get(run), zMask)
        run = same ? run : live ? lane : -1
    }
}

export const laneFloodZMask = () => (layout.maskY < (PLANE_DIST * CAM_SIN) / CAM_COS ? groundZAtPlaneY(layout.maskY) : 1e9)

export const laneFloodHitPlaying = (lane: number) =>
    laneFloodTable.inst.get(lane) !== 0 && time.now - laneFloodTable.t.get(lane) < LANE_FLOOD_PLAYING && laneFloodTable.type.get(lane) !== LaneType.InVain

export const drawFloodRunAt = (l0: number, l1: number, type: number, age: number, zMask: number) => {
    const u = (age + FX_FRAME_S) * FLOOD_U_PER_S
    const a = u <= FLOOD_ALPHA_KNEE ? 1 : (1 - u) / (1 - FLOOD_ALPHA_KNEE)
    const z1 = Math.min(floodHalfLength(u), zMask)
    const xl = worldXEdge(l0)
    const xr = worldXEdge(l1)
    skin.sprites.draw(
        (skin.sprites.laneFloodNormal.id + type) as SkinSpriteId,
        new Quad({
            x1: groundToPlaneX(xl, 0),
            y1: groundToPlaneY(0),
            x2: groundToPlaneX(xl, z1),
            y2: groundToPlaneY(z1),
            x3: groundToPlaneX(xr, z1),
            y3: groundToPlaneY(z1),
            x4: groundToPlaneX(xr, 0),
            y4: groundToPlaneY(0),
        }),
        layer.laneFlood,
        a,
    )
}

export const resetLaneFloods = () => {
    for (let lane = 0; lane < LANE_COUNT_FX; lane++) laneFloodTable.inst.set(lane, 0)
}

export const LANE_QUEUE_LEAD = 0.5
const LANE_QUEUE = 64
const laneQueue = levelMemory({
    head: Number,
    tail: Number,
    hit: Tuple(LANE_QUEUE, Number),
    type: Tuple(LANE_QUEUE, Number),
    edgeL: Tuple(LANE_QUEUE, Number),
    edgeR: Tuple(LANE_QUEUE, Number),
})
export const enqueueLaneFlood = (
    ids: ContainerType<typeof EffectIds>,
    sim: number,
    edgeL: number,
    edgeR: number,
    hit: number,
    c: number,
    w: number,
    laneFx: boolean,
    noteFx: boolean,
) => {

    if (noteFx) registerFxLayer(ids.fam, judgeIndex(sim), c, w, hit)
    if (!laneFx || !hasLaneFlood(ids, sim)) return
    if (laneQueue.tail - laneQueue.head >= LANE_QUEUE) return
    const i = laneQueue.tail % LANE_QUEUE
    laneQueue.hit.set(i, hit)
    laneQueue.type.set(i, ids.lane)
    laneQueue.edgeL.set(i, edgeL)
    laneQueue.edgeR.set(i, edgeR)
    laneQueue.tail = laneQueue.tail + 1
}

export const flushLaneFloodQueue = (skip: boolean) => {
    if (skip) {
        laneQueue.head = laneQueue.tail
        resetLaneFloods()
        return
    }
    while (laneQueue.head < laneQueue.tail) {
        const i = laneQueue.head % LANE_QUEUE
        if (laneQueue.hit.get(i) > time.now) break
        requestLaneFlood(laneQueue.type.get(i), laneQueue.edgeL.get(i), laneQueue.edgeR.get(i), time.now)
        laneQueue.head = laneQueue.head + 1
    }
}

const spawnPart = (id: number, q: Quad, T: number) => {
    if (particle.effects.exists(id as ParticleEffectId)) particle.effects.spawn(id as ParticleEffectId, q, T, false)
}

const spawnNoteEffect = (ids: ContainerType<typeof EffectIds>, j: number, c: number, w: number) => {
    ids.tX = worldX(c)
    ids.tT = noteEffectDuration(ids.fam, j)
    ids.tW = w * LANE3D_STEP
    ids.tWm = Math.max(ids.tW - 0.15, 0)
    ids.tBase = NOTE_BASE + (ids.fam * 4 + j) * COMPONENT_COUNT
    if (!particle.effects.exists((ids.tBase + Comp.RingCap) as ParticleEffectId)) {
        spawnFallbackNoteEffect(ids.fam, c, w, ids.tT)
        return
    }

    for (let part = fxLayerOn() ? FXL_FIRST_PARTICLE_PART : 0; part < FX_PARTS; part++) {
        if (fxSkinPartNote(part)) continue
        const id = ids.tBase + fxTable.partComp.get(part)
        if (!particle.effects.exists(id as ParticleEffectId)) continue
        const r = fxRowOf(part, ids.fam)
        particle.effects.spawn(id as ParticleEffectId, partQuad(r, fxPartXA(r, ids.tX, ids.tW, ids.tWm), fxPartXB(r, ids.tX, ids.tW, ids.tWm)), ids.tT, false)
    }
    ids.tBase = SPARKS_BASE + (ids.fam * 4 + j) * WIDTH_VARIANT_COUNT + widthVariantIndex(w)
    spawnPart(ids.tBase, sparksQ(ids.tX, w), ids.tT)
}

const spawnFallbackNoteEffect = (fam: number, c: number, w: number, T: number) => {

    const fxId =
        fam === Family.Flick
            ? particle.effects.fbNoteFlick.id
            : fam === Family.FlickLeft
              ? particle.effects.fbNoteFlickLeft.id
              : fam === Family.FlickRight
                ? particle.effects.fbNoteFlickRight.id
                : fam === Family.Slide
                  ? particle.effects.fbNoteSlide.id
                  : fam === Family.SlideConnect
                    ? particle.effects.fbNoteTrace.id
                    : particle.effects.fbNoteTap.id
    if (!particle.effects.exists(fxId as ParticleEffectId)) return
    particle.effects.spawn(fxId as ParticleEffectId, footprintQuad(c, w), T, false)
}

const footprintQuad = (c: number, w: number) => {
    const x = judgeX(c)
    const y = judgeY()
    const hw = (w * LANE_UNIT) / 2
    const hh = LANE_UNIT
    return new Quad({ x1: x - hw, y1: y - hh, x2: x - hw, y2: y + hh, x3: x + hw, y3: y + hh, x4: x + hw, y4: y - hh })
}

export const scheduleJudgeSfx = (ids: ContainerType<typeof EffectIds>, sim: number, at: number) => {
    const se = seOf(ids, sim)
    if (se >= 0) effect.clips.schedule(se as EffectClipId, at, sfxDistanceScheduled)
}

export const playEmptyTapEffects = (edge: number, sfx: boolean, laneFx: boolean) => {

    const vainClip = noteSeClip(SeSlot.InVain, SeFamily.EmptyTap, effect.clips.fbStage)
    if (sfx && vainClip >= 0) effect.clips.play(vainClip as EffectClipId, sfxDistance)
    if (laneFx) {
        const lane = Math.clamp(Math.floor(edge), 0, 23)
        const block = lane - (lane % 2)

        requestLaneFlood(LaneType.InVain, block, block + 2, time.now)
    }
}

export const playEmptyTapEffectsParallel = (_edge: number, sfx: boolean, _laneFx: boolean) => {

    const vainClip = noteSeClip(SeSlot.InVain, SeFamily.EmptyTap, effect.clips.fbStage)
    if (sfx && vainClip >= 0) effect.clips.play(vainClip as EffectClipId, sfxDistance)
}

const HOLD_SLOTS = 16
const HOLD_PARTS = FX_PARTS + 1
const holdFx = levelMemory({
    next: Number,

    ids: Tuple(HOLD_SLOTS * HOLD_PARTS, Number),

    lanes: Tuple(HOLD_SLOTS, Number),

    t0: Tuple(HOLD_SLOTS, Number),
    loopOn: Tuple(HOLD_SLOTS, Number),

    tl: Tuple(HOLD_SLOTS, Number),

    x: Tuple(HOLD_SLOTS, Number),
    w: Tuple(HOLD_SLOTS, Number),
    judgeOffset: Tuple(HOLD_SLOTS, Number),
    scale: Tuple(HOLD_SLOTS, Number),
    seen: Tuple(HOLD_SLOTS, Number),
})

const holdSfx = levelMemory({
    instance: LoopedEffectClipInstanceId,
    wantCur: Number,
    wantPrev: Number,

    decided: Number,

    frame: Number,
})

const FX_T_LOOP_PILLAR = 0.1

const loopSumP01 = (comp: number) => {
    const id = particle.effects.loopSumLP01.id + (comp >= Comp.SumFrontL ? comp - Comp.SumFrontL + 3 : comp - Comp.SumL)
    return ((comp >= Comp.SumL && comp <= Comp.SumR) || (comp >= Comp.SumFrontL && comp <= Comp.SumFrontR)) &&
        particle.effects.exists(id as ParticleEffectId)
        ? id
        : -1
}

const loopPillarP01 = (comp: number) =>
    comp === Comp.PillarBack && particle.effects.loopPillarBackP01.exists
        ? particle.effects.loopPillarBackP01.id
        : comp === Comp.PillarFront && particle.effects.loopPillarFrontP01.exists
          ? particle.effects.loopPillarFrontP01.id
          : loopSumP01(comp)
const loopSpawn = (slot: number, part: number, id: number, q: Quad) =>
    holdFx.ids.set(
        slot * HOLD_PARTS + part,
        id >= 0 && particle.effects.exists(id as ParticleEffectId) ? particle.effects.spawn(id as ParticleEffectId, q, FX_T_LOOP, true) : 0,
    )
const loopMove = (slot: number, part: number, q: Quad) => {
    const id = holdFx.ids.get(slot * HOLD_PARTS + part)
    if (id) particle.effects.move(id as ParticleEffectInstanceId, q)
}

export const startHoldFx = (noteFx: boolean, c: number, w: number) => {
    if (!noteFx) return 0 as ParticleEffectInstanceId
    const slot = holdFx.next % HOLD_SLOTS
    holdFx.next = holdFx.next + 1

    destroySlot(slot)
    if (!particle.effects.exists((LOOP_BASE + Comp.RingCap) as ParticleEffectId)) {
        holdFx.lanes.set(slot, -1)
        holdFx.ids.set(
            slot * HOLD_PARTS,
            particle.effects.fbSlideLoop.exists ? particle.effects.fbSlideLoop.spawn(footprintQuad(c, w), FX_T_LOOP, true) : 0,
        )
        return (slot + 1) as ParticleEffectInstanceId
    }
    const wi = widthVariantIndex(w)
    holdFx.lanes.set(slot, wi)
    holdFx.t0.set(slot, time.now)

    const xc = worldX(c)
    const ww = w * LANE3D_STEP
    const wm = Math.max(ww - 0.15, 0)
    holdFx.x.set(slot, xc)
    holdFx.w.set(slot, ww)
    holdFx.judgeOffset.set(slot, layout.judgeOffset)
    holdFx.scale.set(slot, layout.scale)
    for (let part = fxLayerOn() ? FXL_FIRST_PARTICLE_PART : 0; part < FX_PARTS; part++) {
        const r = fxRowOf(part, LOOP_FAM)
        const comp = fxTable.partComp.get(part)
        const q = partQuad(r, fxPartXA(r, xc, ww, wm), fxPartXB(r, xc, ww, wm))

        const p01 = fxSkinPartLoop(part) ? -1 : loopPillarP01(comp)
        if (p01 >= 0) holdFx.ids.set(slot * HOLD_PARTS + part, particle.effects.spawn(p01 as ParticleEffectId, q, FX_T_LOOP_PILLAR, true))
        else loopSpawn(slot, part, fxSkinPartLoop(part) ? -1 : LOOP_BASE + comp, q)
    }

    if (particle.effects.exists((LOOP_SPARKS_START_BASE + wi) as ParticleEffectId)) {
        holdFx.loopOn.set(slot, 0)
        holdFx.ids.set(slot * HOLD_PARTS + FX_SPARKS_PART, particle.effects.spawn((LOOP_SPARKS_START_BASE + wi) as ParticleEffectId, sparksQ(xc, w), FX_T_LOOP_RAMP, false))
    } else {
        holdFx.loopOn.set(slot, 1)
        holdFx.tl.set(slot, time.now)
        loopSpawn(slot, FX_SPARKS_PART, LOOP_SPARKS_BASE + wi, sparksQ(xc, w))
    }
    return (slot + 1) as ParticleEffectInstanceId
}

export const moveHoldFx = (instance: ParticleEffectInstanceId, c: number, w: number) => {
    if (!instance) return
    const slot = instance - 1
    if (holdFx.lanes.get(slot) < 0) {
        loopMove(slot, 0, footprintQuad(c, w))
        return
    }
    const xc = worldX(c)
    const ww = w * LANE3D_STEP

    const moved = xc !== holdFx.x.get(slot) || ww !== holdFx.w.get(slot)
        || layout.judgeOffset !== holdFx.judgeOffset.get(slot) || layout.scale !== holdFx.scale.get(slot)
    if (moved) {
        holdFx.x.set(slot, xc)
        holdFx.w.set(slot, ww)
        holdFx.judgeOffset.set(slot, layout.judgeOffset)
        holdFx.scale.set(slot, layout.scale)
        const wm = Math.max(ww - 0.15, 0)
        for (let part = fxLayerOn() ? FXL_FIRST_PARTICLE_PART : 0; part < FX_PARTS; part++) {
            const r = fxRowOf(part, LOOP_FAM)
            loopMove(slot, part, partQuad(r, fxPartXA(r, xc, ww, wm), fxPartXB(r, xc, ww, wm)))
        }
    }

    const wi = widthVariantIndex(w)
    const handOver = holdFx.loopOn.get(slot) === 0 && time.now - holdFx.t0.get(slot) >= FX_T_LOOP
    const reclass = holdFx.loopOn.get(slot) === 1 && wi !== holdFx.lanes.get(slot) && Math.mod(time.now - holdFx.tl.get(slot), FX_T_LOOP) < time.delta
    if (handOver || reclass) {
        const old = holdFx.ids.get(slot * HOLD_PARTS + FX_SPARKS_PART)
        if (old) particle.effects.destroy(old as ParticleEffectInstanceId)
        holdFx.lanes.set(slot, wi)
        holdFx.tl.set(slot, time.now)
        loopSpawn(slot, FX_SPARKS_PART, LOOP_SPARKS_BASE + wi, sparksQ(xc, w))
        holdFx.loopOn.set(slot, 1)
        return
    }
    if (moved) loopMove(slot, FX_SPARKS_PART, sparksQ(xc, w))
}

const destroySlot = (slot: number) => {
    for (let k = HOLD_PARTS - 1; k >= 0; k--) {
        const id = holdFx.ids.get(slot * HOLD_PARTS + k)
        if (id) particle.effects.destroy(id as ParticleEffectInstanceId)
    }
}

export const stopHoldFx = (instance: ParticleEffectInstanceId) => {
    if (!instance) return
    destroySlot(instance - 1)
}

export const markHoldFx = (instance: ParticleEffectInstanceId) => {
    if (!instance) return
    const slot = instance - 1

    if (time.now >= holdFx.t0.get(slot)) holdFx.seen.set(slot, time.now)
}

export const wantHoldSfx = () => {
    if (holdSfx.wantCur === time.now) return
    holdSfx.wantPrev = holdSfx.wantCur
    holdSfx.wantCur = time.now
}

export const decideHoldSfx = (frameTime: number, sfx: boolean) => {
    const active = sfx && (holdSfx.wantCur === frameTime || holdSfx.wantPrev === frameTime)
    holdSfx.decided = frameTime
    if (active && !holdSfx.instance) {
        const loopClip = noteSeClip(SeSlot.SlideLoop, SeFamily.Slide, effect.clips.fbHold)
        if (loopClip >= 0) holdSfx.instance = effect.clips.loop(loopClip as EffectClipId)
    } else if (!active && holdSfx.instance) {
        effect.clips.stopLoop(holdSfx.instance)
        holdSfx.instance = 0 as LoopedEffectClipInstanceId
    }
}

export const decideHoldSfxLate = (sfx: boolean) => {
    const prev = holdSfx.frame
    if (holdSfx.decided !== prev) decideHoldSfx(prev, sfx)
    holdSfx.frame = time.now
}

const FXL_SLOTS = 48

const LOOP_WALL_ONSET_F = 0.125 * 60 - 1

const FXL_FIRST_PARTICLE_PART = 6
const fxLayer = levelMemory({
    host: Number,
    next: Number,
    t0: Tuple(FXL_SLOTS, Number),
    end: Tuple(FXL_SLOTS, Number),

    key: Tuple(FXL_SLOTS, Number),

    x: Tuple(FXL_SLOTS, Number),
    w: Tuple(FXL_SLOTS, Number),
})
const fxLayerTl = levelMemory({
    halo: Tuple(FXL_HALO_I.length, Number),
    wall: Tuple(FXL_WALL_A.length, Number),

    mapLo: Tuple(FXL_MAP_LO.length, Number),
    mapHi: Tuple(FXL_MAP_HI.length, Number),
    levels: Tuple(FXL_LEVELS.length, Number),

    core: Tuple(FX_CORE_PARTS * FX_CORE_ROW, Number),
})
const FXL_CORE_TABLE = fxCoreRows(FXL_CORE_CROP)
const CORE_IDX = FXL_CORE_TABLE.map((_, i) => i)

const FXL_LOOP_LO = FXL_HALO_LOOP_BASE + 256 * FXL_WALL_LOOP_BASE
const FXL_LOOP_HI = FXL_LOOP_FRAMES + 64 * (FXL_LOOP_HALO_COLOUR + 8 * FXL_LOOP_WALL_COLOUR)

const nonZero = (a: readonly number[]) => a.map((v, i) => (v !== 0 ? i : -1)).filter((i) => i >= 0)
const HALO_NZ = nonZero(FXL_HALO_I)
const WALL_NZ = nonZero(FXL_WALL_A)
const MAP_IDX = FXL_MAP_LO.map((_, i) => i)
const LEVEL_IDX = FXL_LEVELS.map((_, i) => i)

export const fillFxLayerTables = () => {
    for (const i of HALO_NZ) fxLayerTl.halo.set(i, FXL_HALO_I[i]!)
    for (const i of WALL_NZ) fxLayerTl.wall.set(i, FXL_WALL_A[i]!)
    for (const i of MAP_IDX) fxLayerTl.mapLo.set(i, FXL_MAP_LO[i]!)
    for (const i of MAP_IDX) fxLayerTl.mapHi.set(i, FXL_MAP_HI[i]!)
    for (const i of LEVEL_IDX) fxLayerTl.levels.set(i, FXL_LEVELS[i]!)
    for (const i of CORE_IDX) fxLayerTl.core.set(i, FXL_CORE_TABLE[i]!)
    fxLayer.host = 1
}

const fxLayerOn = () => fxLayer.host === 1 && skin.sprites.fxlHalo00.exists

const fxCoresOn = () => fxLayerOn() && skin.sprites.fxlCoreGlowCap00.exists

const fxSkinPartNote = (part: number) => part <= 8 && fxCoresOn()
const fxSkinPartLoop = (part: number) => (part <= 8 || part >= 19) && fxCoresOn()

const registerFxLayer = (fam: number, j: number, c: number, w: number, t0: number) => {
    if (fam < 0 || j < 0 || !fxLayerOn()) return
    const s = fxLayer.next % FXL_SLOTS
    fxLayer.next = fxLayer.next + 1
    fxLayer.t0.set(s, t0)
    fxLayer.end.set(s, t0 + noteEffectDuration(fam, j))
    fxLayer.key.set(s, fam * 4 + j)
    fxLayer.x.set(s, worldX(c))
    fxLayer.w.set(s, w * LANE3D_STEP)
}

export const resetFxLayer = () => {
    for (let s = 0; s < FXL_SLOTS; s++) fxLayer.end.set(s, 0)
}

const fxlSample = (wall: boolean, base: number, f: number, frames: number) => {
    const i0 = Math.floor(f)
    const i1 = i0 + 1 >= frames ? 0 : i0 + 1
    const fr = f - i0
    const v0 = wall ? fxLayerTl.wall.get(base + i0) : fxLayerTl.halo.get(base + i0)
    const v1 = wall ? fxLayerTl.wall.get(base + i1) : fxLayerTl.halo.get(base + i1)
    return v0 + (v1 - v0) * fr
}

export const drawFxLayer = () => {
    if (!fxLayerOn()) return
    for (let i = 0; i < FXL_SLOTS + HOLD_SLOTS; i++) {
        const hold = i >= FXL_SLOTS
        const h = hold ? i - FXL_SLOTS : 0
        const n = hold ? 0 : i
        const t0 = hold ? holdFx.t0.get(h) : fxLayer.t0.get(n)

        const live = hold ? holdFx.seen.get(h) === time.now && holdFx.lanes.get(h) >= 0 : time.now >= t0 && time.now < fxLayer.end.get(n)
        if (!live) continue
        const key = fxLayer.key.get(n)
        drawFxPartsAt(
            hold,
            hold ? LOOP_FAM : Math.floor(key / 4),
            hold ? FXL_LOOP_LO : fxLayerTl.mapLo.get(key),
            hold ? FXL_LOOP_HI : fxLayerTl.mapHi.get(key),
            (time.now - t0) * 60,
            hold ? holdFx.x.get(h) : fxLayer.x.get(n),
            hold ? holdFx.w.get(h) : fxLayer.w.get(n),
            t0,
            i,
        )
    }
}

export const fxLayerMapLo = (key: number) => fxLayerTl.mapLo.get(key)
export const fxLayerMapHi = (key: number) => fxLayerTl.mapHi.get(key)

export const fxLayerActive = () => fxLayerOn()

export const drawFxPartsAt = (hold: boolean, fam: number, mLo: number, mHi: number, fIn: number, xc: number, ww: number, t0: number, idx: number) => {
    const haloBase = skin.sprites.fxlHalo00.id
    const haloMidBase = skin.sprites.fxlHaloMid00.id
    const wallBase = skin.sprites.fxlWall0Front.id
    const coreBase = skin.sprites.fxlCoreGlowMid00.id
    const hBase = Math.mod(mLo, 256)
    const wBase = Math.floor(mLo / 256)
    const frames = Math.mod(mHi, 64)
    const m3 = Math.floor(mHi / 64)
    const hc = Math.mod(m3, 8)
    const wc = Math.floor(m3 / 8)
    const f = hold ? Math.mod(fIn, frames) : fIn

    const aWall = hold && fIn < LOOP_WALL_ONSET_F ? 0 : fxlSample(true, wBase, f, frames)
    const I = Math.min(fxlSample(false, hBase, f, frames), 1)

    const k = I > 0.55 ? 0 : I > 0.3 ? 1 : I > 0.16 ? 2 : I > 0.085 ? 3 : I > 0.045 ? 4 : 5
    const hi = fxLayerTl.levels.get(k)
    const lo = k < 5 ? fxLayerTl.levels.get(Math.min(k + 1, 5)) : 0
    const wHi = k < 5 ? (I - lo) / (hi - lo) : I / hi
    const wLo = k < 5 ? 1 - wHi : 0
    const wm = Math.max(ww - 0.15, 0)
    for (let part = 0; part < FXL_FIRST_PARTICLE_PART; part++) {
        const isWall = part < 3
        const a = isWall ? aWall : I > 0 ? wHi : 0
        if (a <= 0) continue
        const r = fxRowOf(part, fam)
        const q = partQuad(r, fxPartXA(r, xc, ww, wm), fxPartXB(r, xc, ww, wm))
        const id = isWall ? wallBase + wc * 3 + part : (part < 5 ? haloBase : haloMidBase) + hc * 6 + k
        skin.sprites.draw(id as SkinSpriteId, q, legacyPartDepth(layer.fxUnder, t0, idx * 16 + part * 2), Math.min(a, 1))
        if (!isWall && wLo > 0) skin.sprites.draw((id + 1) as SkinSpriteId, q, legacyPartDepth(layer.fxUnder, t0, idx * 16 + part * 2 + 1), wLo)
    }

    if (!fxCoresOn() || I <= 0) return
    const cb = hold ? FXL_CORE_LOOP_COLOUR : hc
    for (let j = hold ? 3 : 0; j < (hold ? 6 : 3); j++) {
        const kind = j === 0 ? 0 : j < 3 ? 1 : j === 3 ? 2 : 3
        const q = coreQuad(j, xc, ww, wm)
        const base = coreBase + (kind * FXL_CORE_COLOURS + cb) * 10
        skin.sprites.draw((base + Math.min(k, 4)) as SkinSpriteId, q, legacyPartDepth(layer.fxCore, t0, idx * 16 + j * 2), k < 5 ? 1 : wHi)
        if (k < 5 && wHi > 0) skin.sprites.draw((base + 5 + k) as SkinSpriteId, q, legacyPartDepth(layer.fxCore, t0, idx * 16 + j * 2 + 1), wHi)
    }
}

export const snapFxLayerSlots = () => {
    for (let s = 0; s < FXL_SLOTS; s++) {
        const t0 = fxLayer.t0.get(s)
        if (fxLayer.end.get(s) > time.now && t0 <= time.now && t0 > time.now - time.delta + 5e-5) {
            fxLayer.end.set(s, fxLayer.end.get(s) + (time.now - t0))
            fxLayer.t0.set(s, time.now)
        }
    }
}

const coreQuad = (p: number, xc: number, ww: number, wm: number) => {
    const o = p * FX_CORE_ROW
    const xA = xc + fxLayerTl.core.get(o) * ww + fxLayerTl.core.get(o + 1) * wm + fxLayerTl.core.get(o + 2)
    const xB = xc + fxLayerTl.core.get(o + 3) * ww + fxLayerTl.core.get(o + 4) * wm + fxLayerTl.core.get(o + 5)
    return new Quad({
        x1: adjX(xA * fxLayerTl.core.get(o + 6)),
        y1: adjY(fxLayerTl.core.get(o + 7)),
        x2: adjX(xA * fxLayerTl.core.get(o + 8)),
        y2: adjY(fxLayerTl.core.get(o + 9)),
        x3: adjX(xB * fxLayerTl.core.get(o + 10)),
        y3: adjY(fxLayerTl.core.get(o + 11)),
        x4: adjX(xB * fxLayerTl.core.get(o + 12)),
        y4: adjY(fxLayerTl.core.get(o + 13)),
    })
}

const FLASH_BINS = 5
const flashLane = levelMemory({
    a: Tuple(LANE_COUNT_FX * FLASH_BINS, Number),
    on: Number,
})
const fxfTl = levelMemory({
    a: Tuple(FXF_A.length, Number),
    map: Tuple(FXF_MAP.length, Number),
})
const FXF_IDX = FXF_A.map((_, i) => i)
const FXF_MAP_IDX = FXF_MAP.map((_, i) => i)

export const fillFlashTables = () => {
    for (const i of FXF_IDX) fxfTl.a.set(i, FXF_A[i]!)
    for (const i of FXF_MAP_IDX) fxfTl.map.set(i, FXF_MAP[i]!)
}

const fxfBin = (packed: number, b: number) =>
    b === 0 ? Math.mod(packed, 256) / 255 : Math.mod(Math.floor(packed / (256 * Math.pow(16, b - 1))), 16) / 15

export const updateFlashTable = () => {
    const on = fxLayerOn() && flashSprite('flashA_tapNote').exists
    flashLane.on = on ? 1 : 0
    if (!on) return
    for (let i = 0; i < LANE_COUNT_FX * FLASH_BINS; i++) flashLane.a.set(i, 0)
    for (let i = 0; i < FXL_SLOTS + HOLD_SLOTS; i++) {
        const hold = i >= FXL_SLOTS
        const h = hold ? i - FXL_SLOTS : 0
        const n = hold ? 0 : i
        const t0 = hold ? holdFx.t0.get(h) : fxLayer.t0.get(n)

        const live = hold ? holdFx.lanes.get(h) >= 0 && holdFx.seen.get(h) >= time.now - 2 * time.delta && holdFx.seen.get(h) > 0 : time.now >= t0 && time.now < fxLayer.end.get(n)
        if (!live) continue
        const base = hold ? FXF_LOOP_BASE : fxfTl.map.get(fxLayer.key.get(n))

        const fr = hold ? Math.mod((time.now - t0) * 60 + 1, FXF_LOOP_FRAMES) : (time.now - t0) * 60 + 1
        const f0 = Math.floor(fr)
        const f1 = hold ? Math.mod(f0 + 1, FXF_LOOP_FRAMES) : f0 + 1
        const w = fr - f0
        const p0 = fxfTl.a.get(base + f0)
        const p1 = fxfTl.a.get(base + f1)

        const xc = hold ? holdFx.x.get(h) : fxLayer.x.get(n)
        const half = (hold ? holdFx.w.get(h) : fxLayer.w.get(n)) / LANE3D_STEP / 2
        const c = xc / LANE3D_STEP + 11.5
        const l0 = Math.max(0, Math.ceil(c - half - 1e-6))
        const l1 = Math.min(LANE_COUNT_FX - 1, Math.floor(c + half + 1e-6))
        for (let b = 0; b < FLASH_BINS; b++) {
            const v = fxfBin(p0, b) * (1 - w) + fxfBin(p1, b) * w
            for (let lane = l0; lane <= l1; lane++) {
                const k = lane * FLASH_BINS + b
                if (v > flashLane.a.get(k)) flashLane.a.set(k, v)
            }
        }
    }
}

export const noteFlashAlpha = (c: number, w: number, p: number) => {
    if (!flashLane.on || p < 0.8) return 0
    const q = Math.min(p, 1)
    const pb = q >= 0.97 ? (1 - q) / 0.03 : q >= 0.93 ? 1 + (0.97 - q) / 0.04 : q >= 0.87 ? 2 + (0.93 - q) / 0.06 : 3 + (0.87 - q) / 0.07
    const b = Math.min(Math.floor(pb), FLASH_BINS - 2)
    const fr = Math.min(pb - b, 1)
    const l0 = Math.max(0, Math.ceil(c - w / 2 - 1e-6))
    const l1 = Math.min(LANE_COUNT_FX - 1, Math.floor(c + w / 2 + 1e-6))
    let best = 0
    for (let lane = l0; lane <= l1; lane++) {
        const k = lane * FLASH_BINS + b
        best = Math.max(best, flashLane.a.get(k) * (1 - fr) + flashLane.a.get(k + 1) * fr)
    }
    return Math.min(best, 1)
}

const K0 = LANE_UNIT / LANE3D_STEP

export const grooveLoopQuad = (px: number, py: number, v: number) => {
    const hw = 2 * K0 * v
    const h = 4 * K0 * v
    return new Quad({ x1: px - hw, y1: py, x2: px - hw, y2: py + h, x3: px + hw, y3: py + h, x4: px + hw, y4: py })
}
export const spawnGrooveLoop = (px: number, py: number, v: number) =>
    particle.effects.exists(GROOVE_ID as ParticleEffectId)
        ? particle.effects.spawn(GROOVE_ID as ParticleEffectId, grooveLoopQuad(px, py, v), FX_T_LOOP, true)
        : (0 as ParticleEffectInstanceId)
export const moveGrooveLoop = (instance: ParticleEffectInstanceId, px: number, py: number, v: number) => {
    if (instance) particle.effects.move(instance, grooveLoopQuad(px, py, v))
}
export const destroyGrooveLoop = (instance: ParticleEffectInstanceId) => {
    if (instance) particle.effects.destroy(instance)
}

export const effectGeometry = { K0, czOf, kOf, yOf, worldX, worldXEdge, rectQuad, laneFloodQ, FX_JZ }
