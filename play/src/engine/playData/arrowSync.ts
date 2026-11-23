import { gradientPeriod, gradientSlots } from './honeycombGradient.js'

export const arrowSync = levelMemory({
    alive: Boolean,
    origin: Number,
    owner: Number,
})

export const arrowEnable = (owner: number) => {
    const alive = arrowSync.alive
    const origin = alive ? arrowSync.origin : time.now
    arrowSync.origin = origin
    arrowSync.owner = alive ? arrowSync.owner : owner
    arrowSync.alive = true
    return origin
}

export const arrowDisable = (owner: number) => {
    arrowSync.alive = arrowSync.alive && arrowSync.owner !== owner
}

const createGradientPool = () => levelMemory({depth:Tuple(3,Number),phase:Tuple(3*gradientSlots,Number)})
let gradients: ReturnType<typeof createGradientPool>
export const allocatePlayGradientPool = () => { gradients = createGradientPool() }

export const rentGradient = (dir: number) => {
    const count = gradients.depth.get(dir)
    if (count <= 0) return time.now
    gradients.depth.set(dir,count-1)
    return time.now-gradients.phase.get(dir*gradientSlots+count-1)
}

export const returnGradient = (dir: number, origin: number) => {
    const count = gradients.depth.get(dir)
    if (count >= gradientSlots) return
    gradients.phase.set(dir*gradientSlots+count,Math.mod(time.now-origin,gradientPeriod))
    gradients.depth.set(dir,count+1)
}
