import { CAM_COS, CAM_HEIGHT, CAM_SIN, LANE3D_STEP, PLANE_DIST } from '../../../../shared/src/engine/data/geometry.js'
import { FX_EY0, FX_JZ, FX_SY1 } from './fxLayout.generated.js'
import { Comp, EFFECT_COMPONENTS } from './particle.js'
import { FX_PART_COMPONENT_NAMES, type Row, refPartRaw, rowOfPart } from './fxGeometry.js'
export { FX_CORE_PARTS, FX_CORE_ROW, fxCoreRows } from './fxGeometry.js'

export const FX_PARTS = 22

export const FX_ROW = 7

export const FX_FAMILIES = 7

export const FX_SPARKS_PART = FX_PARTS

const SHARED_PARTS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21] as const
const VARYING_PARTS = [0, 1, 2, 14, 15] as const
export const FX_ROWS = SHARED_PARTS.length + VARYING_PARTS.length * FX_FAMILIES

export const FX_SPARKS_KB = PLANE_DIST / (-(FX_EY0 - CAM_HEIGHT) * CAM_SIN + FX_JZ * CAM_COS)
export const FX_SPARKS_YB = ((FX_EY0 - CAM_HEIGHT) * CAM_COS + FX_JZ * CAM_SIN) * FX_SPARKS_KB
export const FX_SPARKS_KT = PLANE_DIST / (-(FX_SY1 - CAM_HEIGHT) * CAM_SIN + FX_JZ * CAM_COS)
export const FX_SPARKS_YT = ((FX_SY1 - CAM_HEIGHT) * CAM_COS + FX_JZ * CAM_SIN) * FX_SPARKS_KT

export const FX_PART_COMP: readonly number[] = [
    Comp.WallFront,
    Comp.WallSideL,
    Comp.WallSideR,
    Comp.RingHalo,
    Comp.RingHalo,
    Comp.RingHaloMid,
    Comp.RingGlowMid,
    Comp.RingGlowCap,
    Comp.RingGlowCap,
    Comp.PillarBack,
    Comp.PillarBack,
    Comp.SumL,
    Comp.SumMid,
    Comp.SumR,
    Comp.PillarFront,
    Comp.PillarFront,
    Comp.SumFrontL,
    Comp.SumFrontMid,
    Comp.SumFrontR,
    Comp.RingMid,
    Comp.RingCap,
    Comp.RingCap,
]

const rowIndexOf = (part: number, fam: number) => {
    const s = SHARED_PARTS.indexOf(part as (typeof SHARED_PARTS)[number])
    if (s >= 0) return s
    return SHARED_PARTS.length + fam * VARYING_PARTS.length + VARYING_PARTS.indexOf(part as (typeof VARYING_PARTS)[number])
}

const buildTable = () => {
    const coef = new Array<number>(FX_ROWS * FX_ROW).fill(0)
    const corners: number[] = []
    const setOf = (r: Row) => {
        const flat = r.corners.flatMap(([k, y]) => [k, y])
        for (let o = 0; o < corners.length; o += 8) if (flat.every((v, i) => corners[o + i] === v)) return o
        corners.push(...flat)
        return corners.length - 8
    }
    const put = (row: number, r: Row) => {
        const o = row * FX_ROW
        coef[o] = r.xA.a
        coef[o + 1] = r.xA.b
        coef[o + 2] = r.xA.c
        coef[o + 3] = r.xB.a
        coef[o + 4] = r.xB.b
        coef[o + 5] = r.xB.c
        coef[o + 6] = setOf(r)
    }
    for (const part of SHARED_PARTS) put(rowIndexOf(part, 0), rowOfPart(part, 0))
    for (let fam = 0; fam < FX_FAMILIES; fam++) for (const part of VARYING_PARTS) put(rowIndexOf(part, fam), rowOfPart(part, fam))
    return { coef, corners }
}

const TABLE = buildTable()
const COEF = TABLE.coef
const CORNERS = TABLE.corners

export const FX_CORNER_COUNT = CORNERS.length

export const fxTable = levelData({
    coef: Tuple(FX_ROWS * FX_ROW, Number),
    corners: Tuple(FX_CORNER_COUNT, Number),
    partBase: Tuple(FX_PARTS, Number),
    partStride: Tuple(FX_PARTS, Number),

    partComp: Tuple(FX_PARTS, Number),
})

const tablePartRaw = (part: number, fam: number, xc: number, ww: number) => {
    const o = rowIndexOf(part, fam) * FX_ROW
    const wm = Math.max(ww - 0.15, 0)
    const xA = xc + COEF[o]! * ww + COEF[o + 1]! * wm + COEF[o + 2]!
    const xB = xc + COEF[o + 3]! * ww + COEF[o + 4]! * wm + COEF[o + 5]!
    const c = COEF[o + 6]!
    return [xA * CORNERS[c]!, CORNERS[c + 1]!, xA * CORNERS[c + 2]!, CORNERS[c + 3]!, xB * CORNERS[c + 4]!, CORNERS[c + 5]!, xB * CORNERS[c + 6]!, CORNERS[c + 7]!]
}

export const checkFxTables = () => {
    const samples: [number, number][] = [
        [-5.1, 3.2],
        [0, 4.78],
        [3.3, 9.56],
        [7, 19.12],
        [-8.4, 0.1],
    ]
    let worst = 0
    for (let fam = 0; fam < FX_FAMILIES; fam++)
        for (let part = 0; part < FX_PARTS; part++)
            for (const [xc, ww] of samples) {
                const ref = refPartRaw(part, fam, xc, ww)
                const tab = tablePartRaw(part, fam, xc, ww)
                for (let i = 0; i < 8; i++) {
                    const d = Math.abs(ref[i]! - tab[i]!)
                    if (d > worst) worst = d
                    if (d > 1e-9) throw new Error(`fxTables: part ${part} fam ${fam} corner ${i} at (${xc}, ${ww}): table ${tab[i]} vs quad builder ${ref[i]}`)
                }
            }
    return worst
}

export const FX_TABLE_WORST_DIFF = checkFxTables()

if (FX_PART_COMP.length !== FX_PARTS || FX_PART_COMP.some((c, part) => EFFECT_COMPONENTS[c] !== FX_PART_COMPONENT_NAMES[part]))
    throw new Error('fxTables: fxGeometry.FX_PART_COMPONENT_NAMES differs from FX_PART_COMP / particle.ts EFFECT_COMPONENTS')

const COEF_INDICES: readonly number[] = COEF.map((_, i) => i)
const CORNER_INDICES: readonly number[] = CORNERS.map((_, i) => i)
const PART_INDICES: readonly number[] = Array.from({ length: FX_PARTS }, (_, part) => part)
const PART_BASE: readonly number[] = PART_INDICES.map((part) => {
    const shared = SHARED_PARTS.indexOf(part as (typeof SHARED_PARTS)[number])
    return shared >= 0 ? shared : SHARED_PARTS.length + VARYING_PARTS.indexOf(part as (typeof VARYING_PARTS)[number])
})
const PART_STRIDE: readonly number[] = PART_INDICES.map((part) => (SHARED_PARTS.includes(part as (typeof SHARED_PARTS)[number]) ? 0 : VARYING_PARTS.length))

export const fillFxTables = () => {
    for (const i of COEF_INDICES) fxTable.coef.set(i, COEF[i]!)
    for (const i of CORNER_INDICES) fxTable.corners.set(i, CORNERS[i]!)
    for (const part of PART_INDICES) {
        fxTable.partBase.set(part, PART_BASE[part]!)
        fxTable.partStride.set(part, PART_STRIDE[part]!)
        fxTable.partComp.set(part, FX_PART_COMP[part]!)
    }
}

export const fxRowOf = (part: number, fam: number) => (fxTable.partBase.get(part) + fam * fxTable.partStride.get(part)) * FX_ROW

export const fxCornerOf = (r: number) => fxTable.coef.get(r + 6)

export const fxPartXA = (r: number, tX: number, tW: number, tWm: number) => tX + fxTable.coef.get(r) * tW + fxTable.coef.get(r + 1) * tWm + fxTable.coef.get(r + 2)
export const fxPartXB = (r: number, tX: number, tW: number, tWm: number) => tX + fxTable.coef.get(r + 3) * tW + fxTable.coef.get(r + 4) * tWm + fxTable.coef.get(r + 5)

export const fxGeometryConstants = { LANE3D_STEP, SHARED_PARTS, VARYING_PARTS }
