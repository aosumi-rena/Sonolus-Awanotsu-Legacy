import { HONEYCOMB_FIRST, HONEYCOMB_SUPPORT_FIRST, noteStyle, skin } from './skin.js'

export const hasHoneycombGradient = () => noteStyle() === 3 && skin.sprites.exists(HONEYCOMB_FIRST as SkinSpriteId)

export const gradientPeriod = 0.36000001430511475
export const gradientSlots = 32

export const gradientFirstSlice = (dir: number, size: number, normal: boolean, subdivision: number) => {
    if ((!normal && subdivision !== 3) || !skin.sprites.exists(HONEYCOMB_FIRST as SkinSpriteId)) return -1
    const first = (normal ? HONEYCOMB_FIRST : HONEYCOMB_SUPPORT_FIRST) + (dir * 8 + size) * 35
    return skin.sprites.exists(first as SkinSpriteId) ? first : -1
}

export const drawHoneycombGradient = (dir: number, first: number, quad: Quad, z: number, alpha: number, origin: number) => {
    const phase = Math.mod(time.now-origin,gradientPeriod)/gradientPeriod
    const width = dir === 0 ? 0.17000000178813934 : 0.30000001192092896
    for (let group=0; group<7; group++) {
        const middle = (group+0.5)/7
        const distance = dir === 0 ? Math.abs(Math.abs(middle-0.5)-phase*0.5) : Math.abs(middle-phase)
        if (distance >= width+0.5/7) {
            skin.sprites.draw((first+28+group) as SkinSpriteId,quad,z,alpha*0.7)
        } else {
            for (let lane=0; lane<4; lane++) {
                const slice = 4*group+lane
                const u = (slice+0.5)/28
                const d = dir === 0 ? Math.abs(Math.abs(u-0.5)-phase*0.5) : Math.abs(u-phase)
                const intensity = 0.7+0.3*Math.max(0,1-d/width)
                skin.sprites.draw((first+slice) as SkinSpriteId,quad,z,alpha*intensity)
            }
        }
    }
}
