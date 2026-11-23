import { CAM_COS, CAM_HEIGHT, CAM_SIN, PLANE_DIST } from '../../../../shared/src/engine/data/geometry.js'
import {
    FX_CAM_UP_Y,
    FX_CAM_UP_Z,
    FX_HB_X,
    FX_HB_YD,
    FX_HB_YU,
    FX_JZ,
    FX_PX,
    FX_PY0,
    FX_PY1,
    FX_PZ_B,
    FX_RC_M,
    FX_RC_ZF,
    FX_RC_ZN,
    FX_SUM_CIN,
    FX_SUM_COUT,
    FX_SUM_Y0,
    FX_SUM_Y1,
    FX_SUM_Z,
    FX_SUM_ZF,
    FX_SUM_ZM,
    fxPzF,
    fxWallSx,
    fxWallY0,
    fxWallY1,
    fxWallZ,
    fxWallZn,
} from './fxLayout.generated.js'

export const czOf = (y: number, z: number) => -(y - CAM_HEIGHT) * CAM_SIN + z * CAM_COS

export const kOf = (y: number, z: number) => PLANE_DIST / czOf(y, z)

export const yOf = (y: number, z: number) => ((y - CAM_HEIGHT) * CAM_COS + z * CAM_SIN) * kOf(y, z)

export const colLOf = (ww: number) => -0.51 * (ww + 0.4)

export type Lin = { a: number; b: number; c: number }
export type Row = { xA: Lin; xB: Lin; corners: [number, number][] }

export const rectCorners = (yb: number, zb: number, yt: number, zt: number): [number, number][] => [
    [kOf(yb, zb), yOf(yb, zb)],
    [kOf(yt, zt), yOf(yt, zt)],
    [kOf(yt, zt), yOf(yt, zt)],
    [kOf(yb, zb), yOf(yb, zb)],
]

export const sideCorners = (y0: number, y1: number, za: number, zb: number): [number, number][] => [
    [kOf(y0, za), yOf(y0, za)],
    [kOf(y1, za), yOf(y1, za)],
    [kOf(y1, zb), yOf(y1, zb)],
    [kOf(y0, zb), yOf(y0, zb)],
]
export const lin = (a: number, b: number, c: number): Lin => ({ a, b, c })

export const rowOfPart = (part: number, fam: number): Row => {
    const haloC = rectCorners(-FX_HB_YD * FX_CAM_UP_Y, FX_JZ - FX_HB_YD * FX_CAM_UP_Z, FX_HB_YU * FX_CAM_UP_Y, FX_JZ + FX_HB_YU * FX_CAM_UP_Z)
    const ringC = rectCorners(0, FX_JZ - FX_RC_ZN, 0, FX_JZ + FX_RC_ZF)
    const backC = rectCorners(FX_PY0, FX_JZ + FX_PZ_B, FX_PY1, FX_JZ + FX_PZ_B)
    const sumC = rectCorners(FX_SUM_Y0, FX_JZ + FX_SUM_Z, FX_SUM_Y1, FX_JZ + FX_SUM_Z)
    const sumFC = rectCorners(FX_SUM_Y0, FX_JZ + FX_SUM_ZF, FX_SUM_Y1, FX_JZ + FX_SUM_ZF)
    const sumMC = rectCorners(FX_SUM_Y0, FX_JZ + FX_SUM_ZM, FX_SUM_Y1, FX_JZ + FX_SUM_ZM)
    switch (part) {
        case 0: {
            const sx = fxWallSx(fam)
            return { xA: lin(0, -sx, 0), xB: lin(0, sx, 0), corners: rectCorners(fxWallY0(fam), FX_JZ + fxWallZ(fam), fxWallY1(fam), FX_JZ + fxWallZ(fam)) }
        }
        case 1:
        case 2: {
            const m = part === 1 ? 1 : -1
            const sx = fxWallSx(fam)
            const x = lin(0, -m * sx, 0)
            return { xA: x, xB: x, corners: sideCorners(fxWallY0(fam), fxWallY1(fam), FX_JZ + fxWallZn(fam), FX_JZ + fxWallZ(fam)) }
        }
        case 3:
        case 4: {
            const m = part === 3 ? 1 : -1
            return { xA: lin(-0.51 * m, 0, m * (-0.204 + 0.204 - FX_HB_X)), xB: lin(-0.51 * m, 0, m * (-0.204 + 0.204 + FX_HB_X)), corners: haloC }
        }
        case 5:
            return { xA: lin(-0.51, 0, -0.204 + 0.408), xB: lin(0.51, 0, 0.204 - 0.408), corners: haloC }
        case 6:
        case 19:
            return { xA: lin(-0.51, 0, -0.204 + 0.408), xB: lin(0.51, 0, 0.204 - 0.408), corners: ringC }
        case 7:
        case 8:
        case 20:
        case 21: {
            const m = part === 7 || part === 20 ? 1 : -1
            return { xA: lin(-0.51 * m, 0, m * (-0.204 - FX_RC_M)), xB: lin(-0.51 * m, 0, m * (-0.204 + 0.408 + FX_RC_M)), corners: ringC }
        }
        case 9:
        case 10: {
            const m = part === 9 ? 1 : -1
            return { xA: lin(-0.5 * m, 0, -FX_PX * m), xB: lin(-0.5 * m, 0, FX_PX * m), corners: backC }
        }
        case 14:
        case 15: {
            const m = part === 14 ? 1 : -1
            const z = fxPzF(fam)
            return { xA: lin(-0.5 * m, 0, -FX_PX * m), xB: lin(-0.5 * m, 0, FX_PX * m), corners: rectCorners(FX_PY0, FX_JZ + z, FX_PY1, FX_JZ + z) }
        }
        case 11:
        case 16:
            return { xA: lin(-0.5, 0, -FX_SUM_COUT), xB: lin(-0.5, 0, FX_SUM_CIN), corners: part === 11 ? sumC : sumFC }
        case 12:
        case 17:
            return { xA: lin(-0.5, 0, FX_SUM_CIN), xB: lin(0.5, 0, -FX_SUM_CIN), corners: part === 12 ? sumMC : sumFC }
        case 13:
        case 18:
            return { xA: lin(0.5, 0, FX_SUM_COUT), xB: lin(0.5, 0, -FX_SUM_CIN), corners: part === 13 ? sumC : sumFC }
        default:
            throw new Error(`fxTables: no part ${part}`)
    }
}

export const rectRaw = (xa: number, xb: number, yb: number, zb: number, yt: number, zt: number) => [
    xa * kOf(yb, zb),
    yOf(yb, zb),
    xa * kOf(yt, zt),
    yOf(yt, zt),
    xb * kOf(yt, zt),
    yOf(yt, zt),
    xb * kOf(yb, zb),
    yOf(yb, zb),
]
export const sideRaw = (x: number, y0: number, y1: number, za: number, zb: number) => [
    x * kOf(y0, za),
    yOf(y0, za),
    x * kOf(y1, za),
    yOf(y1, za),
    x * kOf(y1, zb),
    yOf(y1, zb),
    x * kOf(y0, zb),
    yOf(y0, zb),
]
export const refPartRaw = (part: number, fam: number, xc: number, ww: number) => {
    const cl = colLOf(ww)
    const halo = (m: number) =>
        rectRaw(
            xc + m * (cl + 0.204 - FX_HB_X),
            xc + m * (cl + 0.204 + FX_HB_X),
            -FX_HB_YD * FX_CAM_UP_Y,
            FX_JZ - FX_HB_YD * FX_CAM_UP_Z,
            FX_HB_YU * FX_CAM_UP_Y,
            FX_JZ + FX_HB_YU * FX_CAM_UP_Z,
        )
    const pillar = (z: number, m: number) => rectRaw(xc + m * (-ww / 2 - FX_PX), xc + m * (-ww / 2 + FX_PX), FX_PY0, FX_JZ + z, FX_PY1, FX_JZ + z)
    switch (part) {
        case 0:
            return rectRaw(
                xc - fxWallSx(fam) * Math.max(ww - 0.15, 0),
                xc + fxWallSx(fam) * Math.max(ww - 0.15, 0),
                fxWallY0(fam),
                FX_JZ + fxWallZ(fam),
                fxWallY1(fam),
                FX_JZ + fxWallZ(fam),
            )
        case 1:
            return sideRaw(xc - 1 * fxWallSx(fam) * Math.max(ww - 0.15, 0), fxWallY0(fam), fxWallY1(fam), FX_JZ + fxWallZn(fam), FX_JZ + fxWallZ(fam))
        case 2:
            return sideRaw(xc - -1 * fxWallSx(fam) * Math.max(ww - 0.15, 0), fxWallY0(fam), fxWallY1(fam), FX_JZ + fxWallZn(fam), FX_JZ + fxWallZ(fam))
        case 3:
            return halo(1)
        case 4:
            return halo(-1)
        case 5:
            return rectRaw(xc + cl + 0.408, xc - cl - 0.408, -FX_HB_YD * FX_CAM_UP_Y, FX_JZ - FX_HB_YD * FX_CAM_UP_Z, FX_HB_YU * FX_CAM_UP_Y, FX_JZ + FX_HB_YU * FX_CAM_UP_Z)
        case 6:
        case 19:
            return rectRaw(xc + cl + 0.408, xc - cl - 0.408, 0, FX_JZ - FX_RC_ZN, 0, FX_JZ + FX_RC_ZF)
        case 7:
        case 20:
            return rectRaw(xc + (cl - FX_RC_M), xc + (cl + 0.408 + FX_RC_M), 0, FX_JZ - FX_RC_ZN, 0, FX_JZ + FX_RC_ZF)
        case 8:
        case 21:
            return rectRaw(xc - (cl - FX_RC_M), xc - (cl + 0.408 + FX_RC_M), 0, FX_JZ - FX_RC_ZN, 0, FX_JZ + FX_RC_ZF)
        case 9:
            return pillar(FX_PZ_B, 1)
        case 10:
            return pillar(FX_PZ_B, -1)
        case 14:
            return pillar(fxPzF(fam), 1)
        case 15:
            return pillar(fxPzF(fam), -1)
        case 11:
        case 16: {
            const z = part === 11 ? FX_SUM_Z : FX_SUM_ZF
            return rectRaw(xc - ww / 2 - FX_SUM_COUT, xc - ww / 2 + FX_SUM_CIN, FX_SUM_Y0, FX_JZ + z, FX_SUM_Y1, FX_JZ + z)
        }
        case 12:
        case 17: {
            const z = part === 12 ? FX_SUM_ZM : FX_SUM_ZF
            return rectRaw(xc - ww / 2 + FX_SUM_CIN, xc + ww / 2 - FX_SUM_CIN, FX_SUM_Y0, FX_JZ + z, FX_SUM_Y1, FX_JZ + z)
        }
        case 13:
        case 18: {
            const z = part === 13 ? FX_SUM_Z : FX_SUM_ZF
            return rectRaw(xc + ww / 2 + FX_SUM_COUT, xc + ww / 2 - FX_SUM_CIN, FX_SUM_Y0, FX_JZ + z, FX_SUM_Y1, FX_JZ + z)
        }
        default:
            throw new Error(`fxTables: no part ${part}`)
    }
}

export const FX_CORE_ROW = 14
export const FX_CORE_PARTS = 6
export const CORE_SOURCE_PART = [6, 7, 8, 19, 20, 21] as const

export const CORE_KIND_OF_ROW = [0, 1, 1, 2, 3, 3] as const
export const fxCoreRows = (crop: readonly number[]): number[] => {
    const out: number[] = []
    const z0 = FX_JZ - FX_RC_ZN
    const z1 = FX_JZ + FX_RC_ZF
    for (let p = 0; p < FX_CORE_PARTS; p++) {
        const r = rowOfPart(CORE_SOURCE_PART[p]!, 0)
        const k = CORE_KIND_OF_ROW[p]! * 4
        const at = (u: number): Lin => lin(r.xA.a + u * (r.xB.a - r.xA.a), r.xA.b + u * (r.xB.b - r.xA.b), r.xA.c + u * (r.xB.c - r.xA.c))
        const xA = at(crop[k]!)
        const xB = at(crop[k + 1]!)
        const corners = rectCorners(0, z0 + crop[k + 2]! * (z1 - z0), 0, z0 + crop[k + 3]! * (z1 - z0))
        out.push(xA.a, xA.b, xA.c, xB.a, xB.b, xB.c, ...corners.flatMap(([kk, y]) => [kk, y]))
    }
    return out
}

export const FX_PART_COMPONENT_NAMES: readonly string[] = [
    'Wall Front',
    'Wall Side L',
    'Wall Side R',
    'Ring Halo',
    'Ring Halo',
    'Ring Halo Mid',
    'Ring Glow Mid',
    'Ring Glow Cap',
    'Ring Glow Cap',
    'Pillar Back',
    'Pillar Back',
    'Sum L',
    'Sum Mid',
    'Sum R',
    'Pillar Front',
    'Pillar Front',
    'Sum Front L',
    'Sum Front Mid',
    'Sum Front R',
    'Ring Mid',
    'Ring Cap',
    'Ring Cap',
]
