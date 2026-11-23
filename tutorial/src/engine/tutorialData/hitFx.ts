import { LANE3D_STEP, groundToPlaneX, groundToPlaneY } from '../../../../shared/src/engine/data/geometry.js'
import { FX_PART_COMPONENT_NAMES, fxCoreRows, kOf, refPartRaw, yOf } from '../../../../play/src/engine/playData/fxGeometry.js'
import {
    FXL_CORE_COLOURS,
    FXL_CORE_CROP,
    FXL_HALO_COLOURS,
    FXL_HALO_I,
    FXL_LEVELS,
    FXL_MAP_HI,
    FXL_MAP_LO,
    FXL_SKIN_SPRITES,
    FXL_WALL_A,
    FXL_WALL_COLOURS,
} from '../../../../play/src/engine/playData/fxLayer.generated.js'
import { FX_EY0, FX_JZ, FX_SY1 } from '../../../../play/src/engine/playData/fxLayout.generated.js'

const NOTE_C = 14.5
const NOTE_W = 6
const EDGE_L = 12
const EDGE_R = 18

const XC = LANE3D_STEP * (NOTE_C + 0.5 - 12)
const WW = NOTE_W * LANE3D_STEP
const WM = Math.max(WW - 0.15, 0)

export const HIT_FX_T = 25 / 60

export const POPUP_T = 0.3

const FX_FRAME_S = 1 / 60

const KEY = 0
const M_LO = FXL_MAP_LO[KEY]!
const M_HI = FXL_MAP_HI[KEY]!
const H_BASE = M_LO % 256
const W_BASE = Math.floor(M_LO / 256)
export const FXL_FRAMES = M_HI % 64
const HALO_COLOUR = Math.floor(M_HI / 64) % 8
const WALL_COLOUR = Math.floor(Math.floor(M_HI / 64) / 8)

export const HIT_HALO_I: readonly number[] = FXL_HALO_I.slice(H_BASE, H_BASE + FXL_FRAMES)
export const HIT_WALL_A: readonly number[] = FXL_WALL_A.slice(W_BASE, W_BASE + FXL_FRAMES)
export const HIT_LEVELS: readonly number[] = [...FXL_LEVELS]

const fxlName = (key: string) => (FXL_SKIN_SPRITES as Record<string, string>)[key]!
const range = (n: number) => Array.from({ length: n }, (_, i) => i)
export const HIT_FX_SPRITES: Record<string, string> = Object.fromEntries([
    ...range(6).map((k) => [`hitHalo${k}`, fxlName(`fxlHalo${HALO_COLOUR}${k}`)]),
    ...range(6).map((k) => [`hitHaloMid${k}`, fxlName(`fxlHaloMid${HALO_COLOUR}${k}`)]),
    ['hitWallFront', fxlName(`fxlWall${WALL_COLOUR}Front`)],
    ['hitWallSideL', fxlName(`fxlWall${WALL_COLOUR}SideL`)],
    ['hitWallSideR', fxlName(`fxlWall${WALL_COLOUR}SideR`)],
    ...range(10).map((s) => [`hitCoreMid${s}`, fxlName(`fxlCoreGlowMid${HALO_COLOUR}${s}`)]),
    ...range(10).map((s) => [`hitCoreCap${s}`, fxlName(`fxlCoreGlowCap${HALO_COLOUR}${s}`)]),
])

if (HALO_COLOUR >= FXL_HALO_COLOURS || WALL_COLOUR >= FXL_WALL_COLOURS || HALO_COLOUR >= FXL_CORE_COLOURS)
    throw new Error('tutorial hitFx: FX-layer colour index out of the generated roster')

export const OFF_HALO = 0
export const OFF_HALO_MID = 6
export const OFF_WALL = 12
export const OFF_CORE_MID = 15
export const OFF_CORE_CAP = 25
export const HIT_FX_SPRITE_COUNT = 35

export const PART_QUADS: readonly (readonly number[])[] = range(22).map((part) => refPartRaw(part, 0, XC, WW))

const CORE = fxCoreRows(FXL_CORE_CROP)
export const CORE_QUADS: readonly (readonly number[])[] = range(3).map((p) => {
    const o = p * 14
    const xA = XC + CORE[o]! * WW + CORE[o + 1]! * WM + CORE[o + 2]!
    const xB = XC + CORE[o + 3]! * WW + CORE[o + 4]! * WM + CORE[o + 5]!
    return [xA * CORE[o + 6]!, CORE[o + 7]!, xA * CORE[o + 8]!, CORE[o + 9]!, xB * CORE[o + 10]!, CORE[o + 11]!, xB * CORE[o + 12]!, CORE[o + 13]!]
})

const SPARK_HW = (NOTE_W * LANE3D_STEP + 0.08) / 2
export const SPARKS_QUAD: readonly number[] = [
    (XC - SPARK_HW) * kOf(FX_EY0, FX_JZ),
    yOf(FX_EY0, FX_JZ),
    (XC - SPARK_HW) * kOf(FX_SY1, FX_JZ),
    yOf(FX_SY1, FX_JZ),
    (XC + SPARK_HW) * kOf(FX_SY1, FX_JZ),
    yOf(FX_SY1, FX_JZ),
    (XC + SPARK_HW) * kOf(FX_EY0, FX_JZ),
    yOf(FX_EY0, FX_JZ),
]

export const SPARKS_NAME = 'Our Notes Note Effect Normal Perfect Sparks W6'

export const PART_COMPONENTS: readonly string[] = [...new Set(FX_PART_COMPONENT_NAMES)]
export const PART_COMPONENT_INDEX: readonly number[] = FX_PART_COMPONENT_NAMES.map((n) => PART_COMPONENTS.indexOf(n))
export const partEffectName = (component: string) => `Our Notes Note Effect Normal Perfect ${component}`

const FLOOD_U_PER_S = 2 / 0.45
export const FLOOD_VISIBLE = 0.45 / 2 - FX_FRAME_S
const FLOOD_ALPHA_KNEE = 0.4441138
const floodHalfLength = (u: number) =>
    70 *
    ((2 * u * u * u - 3 * u * u + 1) * 0.473175 +
        (u * u * u - 2 * u * u + u) * 1.1440189 +
        (-2 * u * u * u + 3 * u * u) * 1.0 +
        (u * u * u - u * u) * 0.0986695)
const FLOOD_XL = LANE3D_STEP * (EDGE_L - 12)
const FLOOD_XR = LANE3D_STEP * (EDGE_R - 12)

export const floodAlpha = (age: number) => {
    const u = (age + FX_FRAME_S) * FLOOD_U_PER_S
    return u <= FLOOD_ALPHA_KNEE ? 1 : (1 - u) / (1 - FLOOD_ALPHA_KNEE)
}
export const floodQuad = (age: number) => {
    const z1 = floodHalfLength((age + FX_FRAME_S) * FLOOD_U_PER_S)
    return new Quad({
        x1: groundToPlaneX(FLOOD_XL, 0),
        y1: groundToPlaneY(0),
        x2: groundToPlaneX(FLOOD_XL, z1),
        y2: groundToPlaneY(z1),
        x3: groundToPlaneX(FLOOD_XR, z1),
        y3: groundToPlaneY(z1),
        x4: groundToPlaneX(FLOOD_XR, 0),
        y4: groundToPlaneY(0),
    })
}

export const POPUP_CY_PX = 676
export const POPUP_W_PX = 323
export const POPUP_H_PX = 89

export const quadOf = (q: readonly number[]) => new Quad({ x1: q[0]!, y1: q[1]!, x2: q[2]!, y2: q[3]!, x3: q[4]!, y3: q[5]!, x4: q[6]!, y4: q[7]! })
