import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { PANEL_H, chart, verticalScale } from '../layout.js'
import { skin } from '../skin.js'

export class Initialization extends Archetype {

    import = this.defineImport({
        musicStartMs: { name: DataName.MusicStartMs, type: Number, def: 0 },
    })

    preprocess() {

        chart.musicStartMs = this.import.musicStartMs

        chart.scale = ((screen.h * 0.9) / PANEL_H) * verticalScale()
        chart.duration = 0
        chart.count = 1

        const transform = Mat.identity.scale(chart.scale, chart.scale).translate(screen.l + 0.1, -(PANEL_H * chart.scale) / 2)
        skin.transform.set(transform)

        const gap = 0.05
        const uiRect = screen.rect.shrink(gap, gap)

        ui.menu.set({
            anchor: uiRect.rt,
            pivot: { x: 1, y: 1 },
            size: new Vec(0.15, 0.15).mul(ui.configuration.menu.scale),
            rotation: 0,
            alpha: ui.configuration.menu.alpha,
            background: true,
        })

        ui.progress.set({
            anchor: uiRect.lb,
            pivot: { x: 0, y: 0 },
            size: { x: uiRect.w, y: 0.15 * ui.configuration.progress.scale },
            rotation: 0,
            alpha: ui.configuration.progress.alpha,
            background: true,
        })
    }
}
