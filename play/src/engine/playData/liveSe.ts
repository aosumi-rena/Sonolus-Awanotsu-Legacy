import { options } from '../configuration/options.js'
import { effect } from './effect.js'
import { FinishType } from './hud/hudState.js'
import { layout } from './layout.js'

export const START_CHEER_LEAD = 59 / 12

export const FINISH_CHEER_HEAD = 467969 / 48000

export const scheduleStartCheer = () => {

    if (options.liveSeMute) return
    const at = layout.musicStart - START_CHEER_LEAD

    if (layout.musicStart <= 0) return
    if (effect.clips.liveStartCheer.exists) {
        effect.clips.liveStartCheer.schedule(at, 0)
        return
    }

    if (effect.clips.liveStartCheerRaw.exists) effect.clips.scheduleStopLoop(effect.clips.liveStartCheerRaw.scheduleLoop(at), layout.musicStart)
}

const finishJingleOf = (type: number) =>
    type === FinishType.PerfectCombo
        ? effect.clips.liveAllPerfect.id
        : type === FinishType.FullCombo
          ? effect.clips.liveFullCombo.id
          : type === FinishType.AssistFullCombo
            ? effect.clips.liveAssistFullCombo.id
            : type === FinishType.LiveClear
              ? effect.clips.liveClear.id
              : -1

export const playFinishSe = (type: number, at: number) => {
    if (options.liveSeMute) return
    const j = finishJingleOf(type)
    if (at > time.now) {
        if (j >= 0 && effect.clips.exists(j as EffectClipId)) effect.clips.schedule(j as EffectClipId, at, 0)
        if (effect.clips.liveFinishCheer.exists) effect.clips.liveFinishCheer.schedule(at, 0)
        if (effect.clips.liveFinishCheerLoop.exists) effect.clips.liveFinishCheerLoop.scheduleLoop(at + FINISH_CHEER_HEAD)
        return
    }
    if (j >= 0 && effect.clips.exists(j as EffectClipId)) effect.clips.play(j as EffectClipId, 0)
    if (effect.clips.liveFinishCheer.exists) effect.clips.liveFinishCheer.play(0)
    if (effect.clips.liveFinishCheerLoop.exists) effect.clips.liveFinishCheerLoop.scheduleLoop(time.now + FINISH_CHEER_HEAD)
}

export const scheduleFinishSe = (type: number, at: number) => {
    if (options.liveSeMute) return
    const j = finishJingleOf(type)
    if (j >= 0 && effect.clips.exists(j as EffectClipId)) effect.clips.schedule(j as EffectClipId, at, 0)
    if (effect.clips.liveFinishCheer.exists) effect.clips.liveFinishCheer.schedule(at, 0)
    if (effect.clips.liveFinishCheerLoop.exists) effect.clips.liveFinishCheerLoop.scheduleLoop(at + FINISH_CHEER_HEAD)
}
