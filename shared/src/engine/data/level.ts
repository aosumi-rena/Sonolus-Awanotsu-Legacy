export const TICKS_PER_BEAT = 480

export const LIVE_LEAD_IN_MS_R4 = 5917

export const LIVE_INTRO_START_MS = 500

export const LIVE_SEQ_CARD_MS = 266000 / 60

export const LIVE_SEQ_LANE_MS = 34000 / 12

export const LIVE_LEAD_IN_MS = Math.ceil(LIVE_INTRO_START_MS + LIVE_SEQ_CARD_MS)

export const introStartMsOf = (leadInMs: number) => Math.floor(leadInMs - LIVE_SEQ_CARD_MS)

export const ArchetypeName = {
    Initialization: 'Initialization',
    Stage: 'Stage',
    InputManager: 'InputManager',
    BpmChange: '#BPM_CHANGE',

    TapNote: 'TapNote',

    FlickNote: 'FlickNote',

    TraceNote: 'TraceNote',

    SlideStartNote: 'SlideStartNote',
    SlideStartFlickNote: 'SlideStartFlickNote',
    SlideStartTraceNote: 'SlideStartTraceNote',
    SlideHiddenStartNote: 'SlideHiddenStartNote',

    SlideTickNote: 'SlideTickNote',

    SlideTraceTickNote: 'SlideTraceTickNote',

    SlideAnchorNote: 'SlideAnchorNote',

    SlideComboNote: 'SlideComboNote',

    SlideComboSkipNote: 'SlideComboSkipNote',

    SlideEndNote: 'SlideEndNote',
    SlideEndFlickNote: 'SlideEndFlickNote',
    SlideEndTraceNote: 'SlideEndTraceNote',
    SlideHiddenEndNote: 'SlideHiddenEndNote',

    SlideConnector: 'SlideConnector',

    GuideStartNote: 'GuideStartNote',

    GuideStartFlickNote: 'GuideStartFlickNote',

    GuideStartTraceNote: 'GuideStartTraceNote',

    GuideHiddenStartNote: 'GuideHiddenStartNote',

    GuideAnchorNote: 'GuideAnchorNote',

    GuideEndTraceNote: 'GuideEndTraceNote',

    GuideHiddenEndNote: 'GuideHiddenEndNote',
    GuideConnector: 'GuideConnector',

    SimLine: 'SimLine',

    SkillMarker: 'SkillMarker',
    FeverRange: 'FeverRange',
    BarLine: 'BarLine',

    LiveMeta: 'LiveMeta',

    FxLayer: 'FxLayer',
} as const

export const DataName = {
    Beat: '#BEAT',
    Bpm: '#BPM',

    Ms: 'ms',

    MusicStartMs: 'musicStartMs',

    IntroStartMs: 'introStartMs',

    BgZoom: 'bgZoom',

    BgBand: 'bgBand',

    EndMs: 'endMs',

    Pos: 'pos',

    Size: 'size',

    Lane: 'lane',

    Width: 'width',

    Crit: 'crit',

    Dir: 'dir',

    Op: 'op',

    Auto: 'auto',

    Slot: 'slot',
    SlotB: 'slotB',

    Fever: 'fever',

    Id: 'id',

    EaseL: 'easeL',
    EaseR: 'easeR',

    LineId: 'lineId',

    Unit: 'unit',
    UnitCount: 'unitCount',

    Line0: 'line0',
    Line1: 'line1',
    LineLaneStart: 'lineLaneStart',
    LineLaneEndX: 'lineLaneEndX',

    Start: 'start',
    End: 'end',
    Head: 'head',
    Tail: 'tail',
    A: 'a',
    B: 'b',

    RankC: 'rankC',
    RankB: 'rankB',
    RankA: 'rankA',
    RankS: 'rankS',
    RankSS: 'rankSS',
    ApScore: 'apScore',
    Difficulty: 'difficulty',
    Level: 'level',

    ExpandBase: 'expandBase',

    RhythmSupportClass: 'rhythmSupportClass',
} as const

export const ExportName = {

    Sim: 'sim',

    Timing: 'timing',

    DirMismatch: 'dirMismatch',
} as const
