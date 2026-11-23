import { liveTime } from '../layout.js'
import { TITLE_CARD_END_TIME, drawTitleGlyph, titleGlyphAlpha, titleGlyphImport } from './titleCard.js'

export class LiveTitleGlyph extends Archetype {
    import = this.defineImport(titleGlyphImport)

    updateParallel() {

        if (liveTime(time.now) >= TITLE_CARD_END_TIME) {
            this.despawn = true
            return
        }
        const a = titleGlyphAlpha(time.now, this.import.grp)
        if (a <= 0) return
        drawTitleGlyph(this.import.set, this.import.g, this.import.x0, this.import.y0, this.import.x1, this.import.y1, a)
    }
}
