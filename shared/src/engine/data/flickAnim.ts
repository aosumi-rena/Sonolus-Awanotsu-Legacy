const cubic = (dt: number, c3: number, c2: number, c1: number, c0: number) => ((c3 * dt + c2) * dt + c1) * dt + c0

export const flickUpArrowY = (t: number) => {
    if (t < 0.5) return cubic(t, 15.587730407714844, -20.884658813476562, 9.14539623260498, 0.800000011920929)
    return cubic(t - 0.5, 21.56451988220215, -15.885333061218262, -0.04846354201436043, 2.0999999046325684)
}

export const flickLeftArrowX = (t: number) => {
    if (t < 0.5) return cubic(t, -8.187931060791016, 13.30079174041748, -7.603413105010986, 1.0)
    return cubic(t - 0.5, -0.2362813949584961, 0.6052802801132202, -0.4435698390007019, -0.5)
}

export const flickLeftArrowAlpha = (t: number) => {
    if (t < 0.75) return 1

    const s = (t - 0.75) / 0.25
    return 1 + (0.3 - 1) * (3 * s * s - 2 * s * s * s)
}

export const flickRightArrowX = (t: number) => {
    if (t < 0.5) return cubic(t, 7.383794784545898, -11.93160343170166, 7.1198530197143555, -0.8999999761581421)
    return cubic(t - 0.5, 1.373206377029419, -1.7387948036193848, 0.7260957360267639, 0.6000000238418579)
}

export const flickRightArrowAlpha = (t: number) => {
    if (t < 0.7) {

        const dt = 0.7
        const s = t / dt
        const h10 = s * s * s - 2 * s * s + s
        const h11 = s * s * s - s * s
        return 1 + h10 * dt * 0.592581570148468 + h11 * dt * -0.47208961844444275
    }
    const dt = 0.3
    const s = (t - 0.7) / dt
    const h00 = 2 * s * s * s - 3 * s * s + 1
    const h10 = s * s * s - 2 * s * s + s
    const h01 = -2 * s * s * s + 3 * s * s
    const h11 = s * s * s - s * s
    return h00 * 1 + h10 * dt * -0.47208967231126314 + h01 * 0.3 + h11 * dt * 0.1449630379987859
}

export const FLICK_UP_ROOT_Y = 0.35
export const FLICK_UP_ROOT_SCALE = 0.8
export const FLICK_SIDE_ARROW_Y = 1.0
export const FLICK_LOOP_SECONDS = 1.0
