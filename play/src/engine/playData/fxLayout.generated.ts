export const FX_JZ = 9.62
export const FX_RC_M = 0.3
export const FX_RC_ZN = 1.175
export const FX_RC_ZF = 1.175
export const FX_HB_X = 2.6
export const FX_HB_YD = 3.0
export const FX_HB_YU = 2.9
export const FX_CAM_UP_Y = 0.869456133
export const FX_CAM_UP_Z = 0.494010155
export const FX_PZ_B = 0.64
export const FX_PX = 3.4
export const FX_PY0 = -4.0
export const FX_PY1 = 7.4
export const FX_EY0 = -4.6

export const FX_SUM_CIN = 0.7
export const FX_SUM_COUT = 2.2
export const FX_SUM_Y0 = -2.6
export const FX_SUM_Y1 = 10.0
export const FX_SUM_Z = 0.62
export const FX_SUM_ZF = -0.57
export const FX_SUM_ZM = 0.0
export const FX_SY1 = 13.0
export const FX_LZ0 = 5.0
export const FX_LZ1 = 72.0
export const FX_T_LOOP = 1.0
export const FX_T_LOOP_RAMP = 1.1

export const fxPzF = (fam: number) => fam === 0 ? -0.61 : fam === 1 ? -0.54 : fam === 2 ? -0.54 : fam === 3 ? -0.54 : fam === 4 ? -0.54 : fam === 5 ? -0.54 : -0.54

export const fxWallSx = (fam: number) => fam === 0 ? 0.515129 : fam === 1 ? 0.515129 : fam === 2 ? 0.515129 : fam === 3 ? 0.515129 : fam === 4 ? 0.515129 : fam === 5 ? 0.515129 : 0.500125
export const fxWallY0 = (fam: number) => fam === 0 ? -1.669092 : fam === 1 ? -1.669092 : fam === 2 ? -1.669092 : fam === 3 ? -1.669092 : fam === 4 ? -1.517357 : fam === 5 ? -1.517357 : -1.517357
export const fxWallY1 = (fam: number) => fam === 0 ? 6.278967 : fam === 1 ? 6.278967 : fam === 2 ? 6.278967 : fam === 3 ? 6.278967 : fam === 4 ? 5.708152 : fam === 5 ? 5.708152 : 5.708152
export const fxWallZ = (fam: number) => fam === 0 ? 0.638539 : fam === 1 ? 0.638539 : fam === 2 ? 0.638539 : fam === 3 ? 0.638539 : fam === 4 ? 0.638539 : fam === 5 ? 0.638539 : 0.653933
export const fxWallZn = (fam: number) => fam === 0 ? -0.538539 : fam === 1 ? -0.538539 : fam === 2 ? -0.538539 : fam === 3 ? -0.538539 : fam === 4 ? -0.538539 : fam === 5 ? -0.538539 : -0.653933
