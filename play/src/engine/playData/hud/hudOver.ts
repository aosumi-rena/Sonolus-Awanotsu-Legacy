import {
    HOF_BASE,
    HOF_FADE_BASE,
    HOF_FADE_STEPS,
    HOF_F_HI,
    HOF_F_LO,
    HOF_R1_LO,
    HOF_R1_N,
    HOF_R2_LO,
    particle,
} from '../particle.js'
import { skin } from '../skin.js'
import { hudLayout } from './canvas.js'

export const HOF_LIFE = 1e-4

const HOF_MIN_ALPHA = 0.5 / 32

export const hofLevel = levelMemory({

    available: Number,

    on: Number,

    combo: Number,

    popup: Number,
})

export const setupHudOver = () => {
    const sp = skin.sprites
    hofLevel.available =
        particle.effects.exists((HOF_BASE + sp.hudDigit440.id - HOF_R1_LO) as ParticleEffectId) &&
        particle.effects.exists((HOF_BASE + HOF_R1_N + sp.hudHeaderBase.id - HOF_R2_LO) as ParticleEffectId) &&
        particle.effects.exists((HOF_BASE + sp.comboAPDigit9Base.id - HOF_R1_LO) as ParticleEffectId) &&
        sp.hudHeaderBase.exists &&
        sp.hudRankGaugeFillL0P0.exists &&
        sp.hudLifeFillNormalL.exists &&
        sp.hudLifeTrackCapsule.exists &&
        sp.hudRankGaugeWell.exists
            ? 1
            : 0
    hofLevel.on = 0
    hofLevel.combo = 0
    hofLevel.popup = hofLevel.available
}

export const updateHudOver = (missSplash: boolean, finishing: boolean) => {
    const on = hofLevel.available > 0 && !missSplash
    hofLevel.on = on ? 1 : 0
    hofLevel.combo = on && !finishing ? 1 : 0
    hofLevel.popup = hofLevel.available > 0 && !finishing ? 1 : 0
}

export const hofOn = () => hofLevel.on > 0
export const hofComboOn = () => hofLevel.combo > 0
export const hofPopupOn = () => hofLevel.popup > 0

export const hofAvailable = () => hofLevel.available > 0

const hofEffectId = (id: number, a: number) => {
    const fade = id >= HOF_F_LO && id <= HOF_F_HI && a < 0.999
    const level = Math.clamp(Math.floor(a * 32 + 0.5), 1, HOF_FADE_STEPS)
    const solid = id >= HOF_R2_LO ? HOF_BASE + HOF_R1_N + id - HOF_R2_LO : HOF_BASE + id - HOF_R1_LO
    return fade ? HOF_FADE_BASE + (id - HOF_F_LO) * HOF_FADE_STEPS + level - 1 : solid
}

export const hudRect = (id: number, l: number, b: number, r: number, t: number, z: number, a: number, ov: boolean) => {
    const sid = id
    const al = a
    const k = hudLayout.invScale
    const x0 = l * k
    const x1 = r * k
    const y0 = b * k
    const y1 = t * k
    if (ov) {
        if (al >= HOF_MIN_ALPHA)
            particle.effects.spawn(
                hofEffectId(sid, al) as ParticleEffectId,
                new Quad({ x1: x0, y1: y0, x2: x0, y2: y1, x3: x1, y3: y1, x4: x1, y4: y0 }),
                HOF_LIFE,
                false,
            )
    } else {
        skin.sprites.draw(sid as SkinSpriteId, new Quad({ x1: x0, y1: y0, x2: x0, y2: y1, x3: x1, y3: y1, x4: x1, y4: y0 }), z, al)
    }
}

export const hudRectAt = (id: number, cx: number, cy: number, w: number, h: number, z: number, a: number, ov: boolean) => {
    const hw = w / 2
    const hh = h / 2
    const x = cx
    const y = cy
    hudRect(id, x - hw, y - hh, x + hw, y + hh, z, a, ov)
}
