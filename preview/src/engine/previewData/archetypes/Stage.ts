import { EngineArchetypeDataName } from '@sonolus/core'
import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { PANEL_GAP, PANEL_H, PANEL_SECONDS, PANEL_W, chart, chartQuad, panelL, panelR, timeX } from '../layout.js'
import { layer, skin } from '../skin.js'

export class Stage extends Archetype {
    preprocessOrder = 2
    preprocess() {
        chart.count = Math.floor(chart.duration / PANEL_SECONDS) + 1
        canvas.set({
            scroll: Scroll.LeftToRight,
            size: (chart.count * (PANEL_W + PANEL_GAP) + PANEL_GAP) * chart.scale,
        })
    }

    render() {
        const lineId = skin.sprites.laneLine.exists ? skin.sprites.laneLine.id : skin.sprites.fbLine.id
        const outId = skin.sprites.laneOutsideLine.exists ? skin.sprites.laneOutsideLine.id : skin.sprites.fbBorder.id
        const bgId = skin.sprites.whiteRect.exists ? skin.sprites.whiteRect.id : skin.sprites.fbCover.id
        for (let i = 0; i < chart.count; i++) {
            const l = panelL(i)
            const r = panelR(i)
            skin.sprites.draw(bgId, new Rect({ l, r, b: 0, t: PANEL_H }), layer.panel, 0.08)
            for (let j = 4; j < 24; j += 4) {
                skin.sprites.draw(lineId, chartQuad(l, r, j - 0.04, j + 0.04), layer.laneLine, j === 12 ? 0.5 : 0.25)
            }
            skin.sprites.draw(outId, chartQuad(l, r, -0.12, 0), layer.laneLine, 1)
            skin.sprites.draw(outId, chartQuad(l, r, PANEL_H, PANEL_H + 0.12), layer.laneLine, 1)
        }
        for (let s = 0; s <= chart.duration; s += 5) {
            canvas.print({
                value: s,
                format: PrintFormat.Time,
                decimalPlaces: 0,
                anchor: new Vec(timeX(s), -0.3).transform(skin.transform),
                pivot: { x: 0.5, y: 1 },
                size: { x: screen.h / 10, y: screen.h / 24 },
                rotation: 0,
                color: PrintColor.Neutral,
                alpha: 1,
                horizontalAlign: HorizontalAlign.Center,
                background: false,
            })
        }
    }
}

export class BpmChange extends Archetype {
    import = this.defineImport({
        beat: { name: EngineArchetypeDataName.Beat, type: Number },
        bpm: { name: EngineArchetypeDataName.Bpm, type: Number },
    })

    render() {
        const t = bpmChanges.at(this.import.beat).time
        canvas.print({
            value: this.import.bpm,
            format: PrintFormat.BPM,
            decimalPlaces: 'auto',
            anchor: new Vec(timeX(t), PANEL_H + 0.4).transform(skin.transform),
            pivot: { x: 0.5, y: 0 },
            size: { x: screen.h / 10, y: screen.h / 24 },
            rotation: 0,
            color: PrintColor.Purple,
            alpha: 1,
            horizontalAlign: HorizontalAlign.Center,
            background: false,
        })
    }
}

export class BarLine extends Archetype {
    import = this.defineImport({
        ms: { name: DataName.Ms, type: Number },
    })

    preprocessOrder = 1
    preprocess() {
        this.import.ms -= chart.musicStartMs
        chart.duration = Math.max(chart.duration, this.import.ms / 1000)
    }

    render() {
        const x = timeX(this.import.ms / 1000)
        const id = skin.sprites.barLine.exists ? skin.sprites.barLine.id : skin.sprites.fbLine.id
        skin.sprites.draw(id, chartQuad(x - 0.03, x + 0.03, 0, PANEL_H), layer.barLine, 0.35)
    }
}

export class SkillMarker extends Archetype {
    import = this.defineImport({
        ms: { name: DataName.Ms, type: Number },
    })

    preprocessOrder = 1
    preprocess() {
        this.import.ms -= chart.musicStartMs
    }

    render() {
        const x = timeX(this.import.ms / 1000)
        const id = skin.sprites.skillLine.exists ? skin.sprites.skillLine.id : skin.sprites.fbLine.id
        skin.sprites.draw(id, chartQuad(x - 0.08, x + 0.08, 0, PANEL_H), layer.barLine, 0.7)
    }
}

export class FeverRange extends Archetype {
    import = this.defineImport({
        ms: { name: DataName.Ms, type: Number },
        endMs: { name: DataName.EndMs, type: Number },
    })

    preprocessOrder = 1
    preprocess() {

        this.import.ms -= chart.musicStartMs
        this.import.endMs -= chart.musicStartMs
    }

    render() {
        const t0 = this.import.ms / 1000
        const t1 = this.import.endMs / 1000
        const id = skin.sprites.whiteRect.exists ? skin.sprites.whiteRect.id : skin.sprites.fbCover.id
        for (let i = Math.floor(t0 / PANEL_SECONDS); i <= Math.floor(t1 / PANEL_SECONDS); i++) {
            const l = Math.max(timeX(t0), panelL(i))
            const r = Math.min(timeX(Math.min(t1, (i + 1) * PANEL_SECONDS - 0.0001)), panelR(i))
            if (r <= l) continue
            skin.sprites.draw(id, new Rect({ l, r, b: 0, t: PANEL_H }), layer.panel, 0.06)
        }
    }
}
