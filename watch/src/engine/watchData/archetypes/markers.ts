import { DataName } from '../../../../../shared/src/engine/data/level.js'
import { options } from '../../../../../play/src/engine/configuration/options.js'
import { note } from '../../../../../play/src/engine/playData/note.js'
import { drawBarLine } from '../../../../../play/src/engine/playData/stageDraw.js'
import { chartTime } from '../../../../../play/src/engine/playData/layout.js'

abstract class TimedLine extends Archetype {
    import = this.defineImport({
        ms: { name: DataName.Ms, type: Number },
    })

    abstract isSkill: boolean
    abstract get enabled(): boolean

    t = this.entityMemory(Number)

    preprocess() {
        this.t = chartTime(this.import.ms)
    }

    spawnTime() {
        return note.spawnTime(this.t)
    }

    despawnTime() {
        return this.t
    }

    updateParallel() {
        if (!this.enabled) return
        drawBarLine(note.progress(this.t), this.isSkill)
    }
}

export class BarLine extends TimedLine {
    isSkill = false
    get enabled() {
        return options.measureLine
    }
}

export class SkillMarker extends TimedLine {
    isSkill = true
    get enabled() {
        return options.skillLine
    }
}

export class FeverRange extends Archetype {
    import = this.defineImport({
        ms: { name: DataName.Ms, type: Number },
        endMs: { name: DataName.EndMs, type: Number },
    })

    spawnTime() {
        return chartTime(this.import.ms)
    }

    despawnTime() {
        return chartTime(this.import.endMs)
    }
}
