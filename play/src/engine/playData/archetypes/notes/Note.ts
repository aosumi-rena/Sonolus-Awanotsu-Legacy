import { EngineArchetypeDataName } from '@sonolus/core'
import { LANE_COUNT } from '../../../../../../shared/src/engine/data/geometry.js'
import { DataName } from '../../../../../../shared/src/engine/data/level.js'
import { NoteDirection } from '../../../../../../shared/src/engine/data/notes.js'
import { options } from '../../../configuration/options.js'
import { note } from '../../note.js'
import { chartTime } from '../../layout.js'

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

        line0: { name: DataName.Line0, type: Number },
        line1: { name: DataName.Line1, type: Number },
        rhythmSupportClass: { name: DataName.RhythmSupportClass, type: Number },
    })

    line = this.defineSharedMemory({
        judged: Boolean,
        missed: Boolean,
        pressed: Boolean,
        holdActive: Boolean,

        holdSfx: LoopedEffectClipInstanceId,
        holdFx: ParticleEffectInstanceId,

        arrowT0: Number,
        arrowSet: Boolean,

        enabled: Boolean,
        lmissed: Boolean,

        beginGood: Boolean,
        missCount: Number,
        missSeen: Number,
        extL: Number,
        extR: Number,
        sfxOn: Boolean,

        forceMiss: Boolean,

        done: Boolean,

        bT: Number,
        bMinX: Number,
        bMaxX: Number,
        bMinY: Number,
        bMaxY: Number,

        endT: Number,
    })

    targetTime = this.entityMemory(Number)

    preprocess() {
        this.targetTime = chartTime(this.import.ms)

        if (options.mirror) {
            this.import.pos = LANE_COUNT - this.import.pos - this.import.size
            this.import.lane = LANE_COUNT - this.import.lane - this.import.width
            if (this.import.dir === NoteDirection.Left) this.import.dir = NoteDirection.Right
            else if (this.import.dir === NoteDirection.Right) this.import.dir = NoteDirection.Left
        }
    }

    get spawnTime() {
        return note.spawnTime(this.targetTime)
    }

    spawnOrder() {
        return 1000 + this.spawnTime
    }

    shouldSpawn() {
        return time.now >= this.spawnTime
    }

    get edgeL() {
        return this.import.pos
    }
    get edgeR() {
        return this.import.pos + this.import.size
    }
}

export class PassNote extends Note {
    hasInput = false

    updateSequential() {
        if (time.now >= this.targetTime) {

            this.line.judged = true
            this.line.done = true
            this.despawn = true
        }
    }
}
