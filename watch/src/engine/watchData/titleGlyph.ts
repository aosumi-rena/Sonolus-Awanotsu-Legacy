import { TITLE_CARD_END_TIME, drawTitleGlyph, titleGlyphAlpha, titleGlyphImport } from '../../../../play/src/engine/playData/hud/titleCard.js'
import { layout } from '../../../../play/src/engine/playData/layout.js'

export class WatchTitleGlyph extends Archetype {
    import = this.defineImport(titleGlyphImport)

    spawnTime() {
        return -999999
    }

    despawnTime() {

        return layout.liveStart + TITLE_CARD_END_TIME
    }

    updateParallel() {
        const a = titleGlyphAlpha(time.now, this.import.grp)
        if (a <= 0) return
        drawTitleGlyph(this.import.set, this.import.g, this.import.x0, this.import.y0, this.import.x1, this.import.y1, a)
    }
}
