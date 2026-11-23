import { SimJudgement } from '../../../../../../shared/src/engine/data/notes.js'
import { options } from '../../../configuration/options.js'
import { inHitArea } from '../../layout.js'
import { drawFlickArrow } from '../../noteRender.js'
import { PassNote } from './Note.js'
import { InputMode, VisibleNote } from './VisibleNote.js'

export abstract class TapInputNote extends VisibleNote {
    inputMode = InputMode.Tap
    hasArrow = false

    touchInput() {
        this.touchTap()
    }

    tryReservedFlick() {
        return false
    }

    afterClaimJudge() {
        if (this.n.pSim === SimJudgement.Bad || this.n.pSim === SimJudgement.Miss) this.inVainAt(touches.get(this.n.claimIndex).position.x)
    }

    drawArrow(_px: number, _py: number, _v: number) {}
}

export abstract class FlickInputNote extends VisibleNote {
    inputMode = InputMode.Flick
    hasArrow = true

    touchInput() {
        this.touchFlick()
    }

    tryReservedFlick() {
        return this.n.flickReserved && this.nowAdj >= this.targetTime && inHitArea(this.n.flickBeginEdge, this.import.pos, this.import.size, this.n.area)
    }

    afterClaimJudge() {}

    drawArrow(px: number, py: number, v: number, root: number) {
        drawFlickArrow(this.import.dir, this.n.w, px, py, v, 1, this.n.arrowReady ? this.n.arrowT0 : time.now, this.hasRhythmSupport && options.rhythmSupport ? this.import.rhythmSupportClass : 0, root, this.info.index)
    }
}

export abstract class HoldInputNote extends VisibleNote {

    inputMode: number = InputMode.Trace
    hasArrow = false

    touchInput() {
        this.touchHold()
    }

    tryReservedFlick() {
        return false
    }

    afterClaimJudge() {}

    drawArrow(_px: number, _py: number, _v: number) {}
}

export class TapNote extends TapInputNote {
    hasRhythmSupport = true
    drawn = true
    lineBegin = false
}

export class FlickNote extends FlickInputNote {
    hasRhythmSupport = true
    drawn = true
    lineBegin = false

    guardsInVain = true
}

export class TraceNote extends HoldInputNote {
    drawn = true
    lineBegin = false
}

export class SlideStartNote extends TapInputNote {
    hasRhythmSupport = true
    drawn = true
    lineBegin = true
}

export class SlideStartFlickNote extends FlickInputNote {
    hasRhythmSupport = true
    drawn = true
    lineBegin = true
}

export class SlideStartTraceNote extends HoldInputNote {
    drawn = true
    lineBegin = true
}

export class SlideHiddenStartNote extends PassNote {}

export class SlideTickNote extends HoldInputNote {
    drawn = true
    lineBegin = false
}

export class SlideTraceTickNote extends HoldInputNote {
    drawn = true
    lineBegin = false
}

export class SlideAnchorNote extends PassNote {}

export class SlideComboNote extends HoldInputNote {
    drawn = false
    lineBegin = false

    render() {}
}

export class SlideComboSkipNote extends PassNote {}

export class SlideEndNote extends HoldInputNote {
    inputMode = InputMode.SlideEnd
    drawn = true
    lineBegin = false
}

export class SlideEndFlickNote extends FlickInputNote {
    drawn = true
    lineBegin = false
}

export class SlideEndTraceNote extends HoldInputNote {
    drawn = true
    lineBegin = false
}

export class SlideHiddenEndNote extends PassNote {}

export class GuideStartNote extends TapInputNote {
    drawn = true
    lineBegin = true
}

export class GuideStartFlickNote extends FlickInputNote {
    drawn = true
    lineBegin = true
}

export class GuideStartTraceNote extends HoldInputNote {
    drawn = true
    lineBegin = true
}

export class GuideHiddenStartNote extends PassNote {}

export class GuideAnchorNote extends PassNote {}

export class GuideEndTraceNote extends HoldInputNote {
    drawn = true
    lineBegin = false
}

export class GuideHiddenEndNote extends PassNote {}
