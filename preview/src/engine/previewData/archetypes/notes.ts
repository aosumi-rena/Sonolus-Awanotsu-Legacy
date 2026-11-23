import { legacyDepth } from '../../../../../shared/src/engine/data/depth.js'
import { EngineArchetypeDataName } from '@sonolus/core'
import { LANE_COUNT, LANE_UNIT } from '../../../../../shared/src/engine/data/geometry.js'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { NoteDirection, SkinUnit, isFlickOp, skinUnitOfView, viewTypeOf } from '../../../../../shared/src/engine/data/notes.js'
import { options } from '../../configuration/options.js'
import { chart, chartQuad, chartQuad180, timeX } from '../layout.js'
import { layer, skin } from '../skin.js'

const NOTE_HALF_T = 0.35

const MAIN_CAP = 0.04 / LANE_UNIT

const SIDE_ARROW_LEN = 1.2
const SIDE_ARROW_HALF_T = 0.6

export abstract class Note extends Archetype {
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        ms: { name: DataName.Ms, type: Number },
        pos: { name: DataName.Pos, type: Number },
        size: { name: DataName.Size, type: Number },
        lane: { name: DataName.Lane, type: Number },
        width: { name: DataName.Width, type: Number },
        crit: { name: DataName.Crit, type: Number },
        dir: { name: DataName.Dir, type: Number },
        op: { name: DataName.Op, type: Number },
        fever: { name: DataName.Fever, type: Number },
    })

    shared = this.defineSharedMemory({ time: Number })

    preprocessOrder = 1
    preprocess() {

        this.import.ms -= chart.musicStartMs
        this.shared.time = this.import.ms / 1000
        chart.duration = Math.max(chart.duration, this.shared.time)
        if (options.mirror) {
            this.import.pos = LANE_COUNT - this.import.pos - this.import.size
            if (this.import.dir === NoteDirection.Left) this.import.dir = NoteDirection.Right
            else if (this.import.dir === NoteDirection.Right) this.import.dir = NoteDirection.Left
        }
    }

    get edgeL() {
        return this.import.pos
    }
    get edgeR() {
        return this.import.pos + this.import.size
    }
}

export class PassNote extends Note {}

const unitSpriteId = (unit: number) =>
    unit === SkinUnit.Tap
        ? skin.sprites.tapNote.exists
            ? skin.sprites.tapNote.id
            : skin.sprites.fbTap.id
        : unit === SkinUnit.Slide
          ? skin.sprites.slideNote.exists
              ? skin.sprites.slideNote.id
              : skin.sprites.fbSlide.id
          : unit === SkinUnit.SlideEnd
            ? skin.sprites.slideEndNote.exists
                ? skin.sprites.slideEndNote.id
                : skin.sprites.fbSlideEnd.id
            : unit === SkinUnit.Connect
              ? skin.sprites.slideConnectNote.exists
                  ? skin.sprites.slideConnectNote.id
                  : skin.sprites.fbTick.id
              : unit === SkinUnit.Trace
                ? skin.sprites.traceNote.exists
                    ? skin.sprites.traceNote.id
                    : skin.sprites.fbTrace.id
                : unit === SkinUnit.Flick
                  ? skin.sprites.flickNote.exists
                      ? skin.sprites.flickNote.id
                      : skin.sprites.fbFlick.id
                  : unit === SkinUnit.FlickLeft
                    ? skin.sprites.flickLeftNote.exists
                        ? skin.sprites.flickLeftNote.id
                        : skin.sprites.fbFlick.id
                    : skin.sprites.flickRightNote.exists
                      ? skin.sprites.flickRightNote.id
                      : skin.sprites.fbFlick.id

export class VisibleNote extends Note {
    render() {
        const unit = skinUnitOfView(viewTypeOf(this.import.op, this.import.dir))
        if (unit < 0) return
        const x = timeX(this.shared.time)
        const l = x - NOTE_HALF_T
        const r = x + NOTE_HALF_T
        const z = legacyDepth(layer.note, -this.shared.time)
        const eL = this.edgeL
        const eR = this.edgeR
        const cap = Math.min(MAIN_CAP, (eR - eL) / 2)
        if (skin.sprites.mainTapL.exists) {
            const base = skin.sprites.mainTapL.id + unit * 3
            skin.sprites.draw(base as SkinSpriteId, chartQuad(l, r, eL, eL + cap), z, 1)
            skin.sprites.draw((base + 1) as SkinSpriteId, chartQuad(l, r, eL + cap, eR - cap), z, 1)
            skin.sprites.draw((base + 2) as SkinSpriteId, chartQuad(l, r, eR - cap, eR), z, 1)
        } else {
            skin.sprites.draw(unitSpriteId(unit), chartQuad(l, r, eL, eR), z, 1)
        }

        if (!isFlickOp(this.import.op)) return
        const za = legacyDepth(layer.arrow, -this.shared.time)
        if (this.import.dir === NoteDirection.Normal) {

            const id = skin.sprites.flickArrow.exists ? skin.sprites.flickArrow.id : skin.sprites.fbFlickArrow.id
            const cy = (eL + eR) / 2
            skin.sprites.draw(id, chartQuad(r + 0.1, r + 1.6, cy - 0.8, cy + 0.8), za, 1)
        } else if (this.import.dir === NoteDirection.Left) {

            const id = skin.sprites.flickLeftArrow.exists ? skin.sprites.flickLeftArrow.id : skin.sprites.fbFlickArrow.id
            skin.sprites.draw(id, chartQuad180(x - SIDE_ARROW_HALF_T, x + SIDE_ARROW_HALF_T, eL - SIDE_ARROW_LEN, eL), za, 1)
        } else {
            const id = skin.sprites.flickRightArrow.exists ? skin.sprites.flickRightArrow.id : skin.sprites.fbFlickArrow.id
            skin.sprites.draw(id, chartQuad(x - SIDE_ARROW_HALF_T, x + SIDE_ARROW_HALF_T, eR, eR + SIDE_ARROW_LEN), za, 1)
        }
    }
}

export class TapNote extends VisibleNote {}
export class FlickNote extends VisibleNote {}
export class TraceNote extends VisibleNote {}
export class SlideStartNote extends VisibleNote {}
export class SlideStartFlickNote extends VisibleNote {}
export class SlideStartTraceNote extends VisibleNote {}
export class SlideHiddenStartNote extends PassNote {}
export class SlideTickNote extends VisibleNote {}
export class SlideTraceTickNote extends VisibleNote {}
export class SlideAnchorNote extends PassNote {}
export class SlideComboNote extends PassNote {}
export class SlideComboSkipNote extends PassNote {}
export class SlideEndNote extends VisibleNote {}
export class SlideEndFlickNote extends VisibleNote {}
export class SlideEndTraceNote extends VisibleNote {}
export class SlideHiddenEndNote extends PassNote {}
export class GuideStartNote extends VisibleNote {}
export class GuideStartFlickNote extends VisibleNote {}
export class GuideStartTraceNote extends VisibleNote {}
export class GuideHiddenStartNote extends PassNote {}
export class GuideAnchorNote extends PassNote {}
export class GuideEndTraceNote extends VisibleNote {}
export class GuideHiddenEndNote extends PassNote {}
