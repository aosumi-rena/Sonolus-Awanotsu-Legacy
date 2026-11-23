import { legacyDepth } from '../../../../../shared/src/engine/data/depth.js'
import { lineEase } from '../../../../../shared/src/engine/data/ease.js'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { options } from '../../configuration/options.js'
import { PANEL_SECONDS, chartQuad, panelIndex, timeXIn } from '../layout.js'
import { layer, skin } from '../skin.js'
import { archetypes } from './index.js'

const SLICES = 8

export abstract class LineConnector extends Archetype {
    import = this.defineImport({
        headRef: { name: DataName.Head, type: Number },
        tailRef: { name: DataName.Tail, type: Number },
        startRef: { name: DataName.Start, type: Number },
        endRef: { name: DataName.End, type: Number },
        easeL: { name: DataName.EaseL, type: Number },
        easeR: { name: DataName.EaseR, type: Number },
        unit: { name: DataName.Unit, type: Number },
        unitCount: { name: DataName.UnitCount, type: Number },
    })

    abstract isGuide: boolean

    render() {
        const h = archetypes.TapNote.import.get(this.import.headRef)
        const t = archetypes.TapNote.import.get(this.import.tailRef)
        const t0 = h.ms / 1000
        const t1 = t.ms / 1000
        if (t1 <= t0) return
        const hL = h.pos
        const hR = h.pos + h.size
        const tL = t.pos
        const tR = t.pos + t.size
        const easeL = options.mirror ? this.import.easeR : this.import.easeL
        const easeR = options.mirror ? this.import.easeL : this.import.easeR

        const midSlide = skin.sprites.slideMidNormal00.exists
        const midGuide = skin.sprites.guideLineMid.exists
        const fbId = this.isGuide
            ? skin.sprites.guideLine.exists
                ? skin.sprites.guideLine.id
                : skin.sprites.fbGuideLine.id
            : skin.sprites.slideLine.exists
              ? skin.sprites.slideLine.id
              : skin.sprites.fbSlideLine.id
        const z = legacyDepth(this.isGuide ? layer.guide : layer.connector, -t0)
        const a = this.isGuide ? (midGuide ? options.guideOpacity / 100 : 0.5) : midSlide ? options.slideOpacity / 100 : 0.8

        const lineBegin = archetypes.TapNote.import.get(this.import.startRef).ms / 1000
        const lineEnd = archetypes.TapNote.import.get(this.import.endRef).ms / 1000
        const invSpan = lineEnd - lineBegin >= 0.001 ? 1 / (lineEnd - lineBegin) : 0

        for (let p = panelIndex(t0); p <= panelIndex(t1 - 0.0001); p++) {
            const pa = Math.max(t0, p * PANEL_SECONDS)
            const pb = Math.min(t1, (p + 1) * PANEL_SECONDS)
            if (pb <= pa) continue
            for (let i = 0; i < SLICES; i++) {
                const ta = Math.lerp(pa, pb, i / SLICES)
                const tb = Math.lerp(pa, pb, (i + 1) / SLICES)
                const sa = Math.unlerp(t0, t1, ta)
                const sb = Math.unlerp(t0, t1, tb)
                const la = Math.lerp(hL, tL, lineEase(sa, easeL))
                const lb = Math.lerp(hL, tL, lineEase(sb, easeL))
                const ra = Math.lerp(hR, tR, lineEase(sa, easeR))
                const rb = Math.lerp(hR, tR, lineEase(sb, easeR))
                const xa = timeXIn(ta, p)
                const xb = timeXIn(tb, p)
                const k = Math.round(Math.clamp(invSpan * ((ta + tb) / 2 - lineBegin), 0, 1) * 15)
                const id = this.isGuide
                    ? midGuide
                        ? skin.sprites.guideLineMid.id
                        : fbId
                    : midSlide
                      ? ((skin.sprites.slideMidNormal00.id + k) as SkinSpriteId)
                      : fbId

                skin.sprites.draw(id, new Quad({ x1: xa, y1: la, x2: xb, y2: lb, x3: xb, y3: rb, x4: xa, y4: ra }), z, a)
            }
        }
    }
}

export class SlideConnector extends LineConnector {
    isGuide = false
}

export class GuideConnector extends LineConnector {
    isGuide = true
}

export class SimLine extends Archetype {
    import = this.defineImport({
        aRef: { name: DataName.A, type: Number },
        bRef: { name: DataName.B, type: Number },
    })

    render() {
        if (!options.simLineEnabled) return
        const a = archetypes.TapNote.import.get(this.import.aRef)
        const b = archetypes.TapNote.import.get(this.import.bRef)
        const t = a.ms / 1000
        const ca = a.lane + a.width / 2
        const cb = b.lane + b.width / 2
        const x = timeXIn(t, panelIndex(t))
        const id = skin.sprites.pairLine.exists ? skin.sprites.pairLine.id : skin.sprites.fbPairLine.id
        skin.sprites.draw(id, chartQuad(x - 0.06, x + 0.06, Math.min(ca, cb), Math.max(ca, cb)), legacyDepth(layer.pairLine, -t), 1)
    }
}
