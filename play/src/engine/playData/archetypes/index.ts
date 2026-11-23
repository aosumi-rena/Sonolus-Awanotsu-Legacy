import {
    LiveHudBanner,
    LiveHudCombo,
    LiveHudCore,
    LiveHudHeader,
    LiveHudIntro,
    LiveHudPopup,
    LiveHudScore,
    LiveHudScorePops,
    LiveHudStatus,
    LiveHudTally,
} from '../hud/LiveHud.js'
import { LiveTitleGlyph } from '../hud/LiveTitleGlyph.js'
import { LiveMeta } from '../hud/meta.js'
import { FxLayer } from './FxLayer.js'
import { GuideConnector, SimLine, SlideConnector } from './connectors.js'
import { Initialization } from './Initialization.js'
import { InputManager } from './InputManager.js'
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
} from './notes/noteArchetypes.js'
import { Stage } from './Stage.js'

export const archetypes = defineArchetypes({
    Initialization,
    InputManager,
    Stage,

    LiveHudCore,
    LiveHudHeader,
    LiveHudScore,
    LiveHudScorePops,
    LiveHudStatus,
    LiveHudCombo,
    LiveHudPopup,
    LiveHudBanner,
    LiveHudTally,
    LiveHudIntro,

    LiveMeta,

    LiveTitleGlyph,

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
