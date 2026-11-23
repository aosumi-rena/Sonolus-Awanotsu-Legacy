export const NoteOp = {
    None: 0,
    Normal: 1,
    SlideBegin: 20,
    SlideConnection: 21,
    SlideEnd: 22,
    Flick: 40,
    SlideBeginFlick: 41,
    SlideEndFlick: 42,
    Trace: 60,
    SlideBeginTrace: 61,
    SlideEndTrace: 62,
    SlideConnectionTrace: 63,
    HiddenSlideBegin: 80,
    HiddenSlideEnd: 82,
    GuideBegin: 100,
    GuideBeginNormal: 101,
    GuideBeginFlick: 102,
    GuideEnd: 103,
    GuideBeginTrace: 104,
    GuideEndTrace: 105,
    Combo: 120,
    ComboSkip: 121,
    Hidden: 122,
    InvalidHidden: 123,
} as const
export type NoteOp = (typeof NoteOp)[keyof typeof NoteOp]

export const NoteDirection = { Normal: 0, Left: 1, Right: 2 } as const
export type NoteDirection = (typeof NoteDirection)[keyof typeof NoteDirection]

export const LineEase = { Linear: 0, EaseIn: 1, EaseOut: 2 } as const
export type LineEase = (typeof LineEase)[keyof typeof LineEase]

export const JudgementType = {
    None: 0,
    Normal: 1,
    EasyNormal: 2,
    Flick: 5,
    SlideBegin: 10,
    SlideEnd: 11,
    SlideEndFlick: 12,
    SlideBeginEasy: 15,
    Trace: 21,
    SlideEndTrace: 22,
} as const
export type JudgementType = (typeof JudgementType)[keyof typeof JudgementType]

export const SimJudgement = {
    None: -1,
    Wait: 0,
    Miss: 1,
    Bad: 2,
    Good: 3,
    Great: 4,
    Perfect: 5,
    Just: 6,
    Pass: 7,
    Excellent: 8,
} as const

export const ViewType = {
    None: 1,
    Tap: 10,
    Slide: 20,
    Connection: 21,
    SlideCombo: 25,
    SlideComboSkip: 26,
    SlideEnd: 27,
    Flick: 30,
    FlickLeft: 31,
    FlickRight: 32,
    Trace: 40,
    Guide: 50,
} as const

export const SkinUnit = { Tap: 0, Slide: 1, SlideEnd: 2, Connect: 3, Trace: 4, Flick: 5, FlickLeft: 6, FlickRight: 7 } as const

export const isFlickOp = (op: number) => op === 40 || op === 41 || op === 42 || op === 102

export const isAsyncJudgementOp = (op: number) =>
    op === 21 || op === 22 || op === 60 || op === 61 || op === 62 || op === 63 || op === 104 || op === 105 || op === 120

export const isJudgementOp = (op: number) =>
    !(op === 0 || op === 80 || op === 82 || op === 100 || op === 103 || op === 121 || op === 122 || op === 123)

export const isLineBeginOp = (op: number) =>
    op === 20 || op === 41 || op === 61 || op === 80 || op === 100 || op === 101 || op === 102 || op === 104

export const isLineEndOp = (op: number) => op === 22 || op === 42 || op === 62 || op === 82 || op === 103 || op === 105

export const freezesAfterJudge = (op: number) => op === 21 || op === 63

export const LineType = { None: 0, Long: 1, Guide: 2 } as const

export const scorePercentOf = (op: number) => (op === 21 || (op >= 60 && op <= 63) || op === 104 || op === 105 || op === 120 ? 10 : 100)

export const judgementTypeOf = (op: number, crit: boolean): number => {
    if (op === 1) return crit ? JudgementType.EasyNormal : JudgementType.Normal
    if (op === 101) return JudgementType.Normal
    if (op === 20) return crit ? JudgementType.SlideBeginEasy : JudgementType.SlideBegin
    if (op === 22) return JudgementType.SlideEnd
    if (op === 40 || op === 41 || op === 42 || op === 102) return JudgementType.Flick
    if (op === 62 || op === 105) return JudgementType.SlideEndTrace
    if (op === 21 || op === 60 || op === 61 || op === 63 || op === 104 || op === 120) return JudgementType.Trace
    return JudgementType.Normal
}

export const areaOffsetTypeOf = (op: number, crit: boolean): number => {
    if (op === 1) return crit ? 8 : 0
    if (op === 20) return crit ? 9 : 2
    if (op === 21 || op === 120 || op === 121) return 1
    if (op === 22) return 3
    if (op === 40 || op === 41 || op === 42) return 4
    if (op === 60 || op === 61 || op === 62 || op === 63 || op === 104 || op === 105) return 5
    return 0
}

export const viewTypeOf = (op: number, dir: number): number => {
    if (op === 1 || op === 101) return ViewType.Tap
    if (op === 20) return ViewType.Slide
    if (op === 21) return ViewType.Connection
    if (op === 22) return ViewType.SlideEnd
    if (op === 40 || op === 41 || op === 42 || op === 102) {
        if (dir === NoteDirection.Left) return ViewType.FlickLeft
        if (dir === NoteDirection.Right) return ViewType.FlickRight
        return ViewType.Flick
    }
    if (op === 60 || op === 61 || op === 62 || op === 63 || op === 104 || op === 105) return ViewType.Trace
    if (op === 80 || op === 82 || op === 100 || op === 103) return ViewType.Guide
    if (op === 120) return ViewType.SlideCombo
    if (op === 121) return ViewType.SlideComboSkip
    return ViewType.None
}

export const skinUnitOfView = (view: number): number => {
    if (view === ViewType.Tap) return SkinUnit.Tap
    if (view === ViewType.Slide) return SkinUnit.Slide
    if (view === ViewType.SlideEnd) return SkinUnit.SlideEnd
    if (view === ViewType.Connection) return SkinUnit.Connect
    if (view === ViewType.Trace) return SkinUnit.Trace
    if (view === ViewType.Flick) return SkinUnit.Flick
    if (view === ViewType.FlickLeft) return SkinUnit.FlickLeft
    if (view === ViewType.FlickRight) return SkinUnit.FlickRight
    return -1
}
