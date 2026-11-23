import { LiveMeta } from '../../../../../play/src/engine/playData/hud/meta.js'
import { WatchTitleGlyph } from '../titleGlyph.js'
import { FxLayer } from './FxLayer.js'
import { GuideConnector, SimLine, SlideConnector } from './connectors.js'
import { Initialization } from './Initialization.js'
import { BarLine, FeverRange, SkillMarker } from './markers.js'
import {
    FlickNote,
    GuideAnchorNote,
    GuideEndTraceNote,
    GuideHiddenEndNote,
    GuideHiddenStartNote,
    GuideStartFlickNote,
    GuideStartNote,
    GuideStartTraceNote,
    SlideAnchorNote,
    SlideComboNote,
    SlideComboSkipNote,
    SlideEndFlickNote,
    SlideEndNote,
    SlideEndTraceNote,
    SlideHiddenEndNote,
    SlideHiddenStartNote,
    SlideStartFlickNote,
    SlideStartNote,
    SlideStartTraceNote,
    SlideTickNote,
    SlideTraceTickNote,
    TapNote,
    TraceNote,
} from './notes.js'
import { Stage } from './Stage.js'

export const archetypes = defineArchetypes({
    Initialization,
    Stage,

    LiveMeta,

    LiveTitleGlyph: WatchTitleGlyph,

    TapNote,
    FlickNote,
    TraceNote,

    SlideStartNote,
    SlideStartFlickNote,
    SlideStartTraceNote,
    SlideHiddenStartNote,

    SlideTickNote,
    SlideTraceTickNote,
    SlideAnchorNote,
    SlideComboNote,
    SlideComboSkipNote,

    SlideEndNote,
    SlideEndFlickNote,
    SlideEndTraceNote,
    SlideHiddenEndNote,

    SlideConnector,

    GuideStartNote,
    GuideStartFlickNote,
    GuideStartTraceNote,
    GuideHiddenStartNote,
    GuideAnchorNote,
    GuideEndTraceNote,
    GuideHiddenEndNote,
    GuideConnector,

    SimLine,
    SkillMarker,
    FeverRange,
    BarLine,

    FxLayer,
})
