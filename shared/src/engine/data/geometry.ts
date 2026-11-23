export const LANE_COUNT = 24

export const CENTER_LANE = 11.5

export const LANE_UNIT = 0.6423704

export const SPAWN_X = 0
export const SPAWN_Y = 5.968421

export const JUDGE_Y = -3.16

export const LANE_TOP_Y = 5.4

export const LANE_X_MIN = -7.708444
export const LANE_X_MAX = 7.708444

export const PLANE_HALF_H = 5.404944
export const PLANE_HALF_W16 = 9.608789
export const PLANE_DIST = 10.6078
export const ASPECT_16_9 = 16 / 9

export const APPROACH_BASE = 1.065
export const APPROACH_K = 45

export const V_AT_SPAWN = 1.065 ** -45

export const CAM_SIN = 0.494034
export const CAM_COS = 0.869437
export const TAN_HALF_FOV = 0.5095254
export const CAM_HEIGHT = 10

export const viewProgress = (p: number) => APPROACH_BASE ** (APPROACH_K * (p - 1))

export const judgeXCenter = (c: number) => LANE_UNIT * (c + 0.5 - 12)

export const judgeXEdge = (edge: number) => LANE_UNIT * (edge - 12)

export const noteX = (c: number, v: number, o: number) => v * (1 + o) * judgeXCenter(c)
export const noteY = (v: number, o: number) => SPAWN_Y + (JUDGE_Y - SPAWN_Y) * (1 + o) * v

export const noteXEdge = (edge: number, v: number, o: number) => v * (1 + o) * judgeXEdge(edge)

export const judgeOffsetOf = (option104: number) => Math.clamp(-option104 / 100, -0.05, 0.05)

export const planeScale = (aspect: number) => Math.min(1 / PLANE_HALF_H, aspect / PLANE_HALF_W16)

export const visibleHalfH = (aspect: number) => Math.max(PLANE_HALF_H, PLANE_HALF_W16 / aspect)

export const clampedCenter = (c: number, w: number) => {
    const l = c - w / 2
    const r = c + w / 2
    return c + Math.max(-0.5 - l, 0) / 2 - Math.max(r - (LANE_COUNT - 0.5), 0) / 2
}
export const clampedWidth = (c: number, w: number) => {
    const l = c - w / 2
    const r = c + w / 2
    return w - Math.max(-0.5 - l, 0) - Math.max(r - (LANE_COUNT - 0.5), 0)
}

export const groundToPlaneX = (x: number, z: number) => (x * PLANE_DIST) / (CAM_HEIGHT * CAM_SIN + z * CAM_COS)
export const groundToPlaneY = (z: number) =>
    ((-CAM_HEIGHT * CAM_COS + z * CAM_SIN) * PLANE_DIST) / (CAM_HEIGHT * CAM_SIN + z * CAM_COS)

export const groundZAtPlaneY = (yPlane: number) => {

    return (yPlane * CAM_HEIGHT * CAM_SIN + CAM_HEIGHT * CAM_COS * PLANE_DIST) / (CAM_SIN * PLANE_DIST - yPlane * CAM_COS)
}

export const JUDGE_GROUND_Z = groundZAtPlaneY(JUDGE_Y)

export const LANE3D_WIDTH = 19.12
export const LANE3D_HALF = 9.56
export const LANE3D_STEP = 19.12 / 24
export const LANE3D_JUDGE_Z = 9.62
export const LANE3D_FAR_Z = 217.6

export const canvasPxToPlane = (_aspect: number) => PLANE_HALF_H / 540
