import { skin } from '../skin.js'
import { contentCenterX, hudLayout, leftX, rightX, topY } from './canvas.js'

export const hudSpritesAvailable = () => skin.sprites.comboNormalDigit0Base.exists && skin.sprites.judgementPerfect.exists

export const HIDE_BUILTIN_MENU = true

const builtinMenuAlpha = () => (HIDE_BUILTIN_MENU && skin.sprites.pauseIcon.exists ? 0 : ui.configuration.menu.alpha)

export const pauseIconAlpha = () => 1 - Math.clamp(builtinMenuAlpha(), 0, 1)

export const setupBuiltinUI = () => {
    const custom = hudSpritesAvailable()
    const hide = custom ? 0 : 1

    const menuSize = 80 * hudLayout.u * ui.configuration.menu.scale
    ui.menu.set({
        anchor: { x: rightX(1860), y: topY(59) },
        pivot: { x: 0.5, y: 0.5 },
        size: new Vec(menuSize, menuSize),
        rotation: 0,
        alpha: builtinMenuAlpha(),
        horizontalAlign: HorizontalAlign.Center,
        background: !custom,
    })

    ui.metric.primary.bar.set({
        anchor: { x: leftX(42), y: topY(160) },
        pivot: { x: 0, y: 1 },
        size: new Vec(0.75, 0.15).mul(ui.configuration.metric.primary.scale),
        rotation: 0,
        alpha: ui.configuration.metric.primary.alpha * hide,
        horizontalAlign: HorizontalAlign.Left,
        background: !custom,
    })
    ui.metric.primary.value.set({
        anchor: { x: leftX(42) + 0.715 * ui.configuration.metric.primary.scale, y: topY(160) - 0.035 * ui.configuration.metric.primary.scale },
        pivot: { x: 1, y: 1 },
        size: new Vec(0, 0.08).mul(ui.configuration.metric.primary.scale),
        rotation: 0,
        alpha: ui.configuration.metric.primary.alpha * hide,
        horizontalAlign: HorizontalAlign.Right,
        background: false,
    })

    ui.metric.secondary.bar.set({
        anchor: { x: rightX(1804), y: topY(19) },
        pivot: { x: 1, y: 1 },
        size: new Vec(0.55, 0.15).mul(ui.configuration.metric.secondary.scale),
        rotation: 0,
        alpha: ui.configuration.metric.secondary.alpha * hide,
        horizontalAlign: HorizontalAlign.Left,
        background: !custom,
    })
    ui.metric.secondary.value.set({
        anchor: { x: rightX(1804) - 0.035 * ui.configuration.metric.secondary.scale, y: topY(19) - 0.035 * ui.configuration.metric.secondary.scale },
        pivot: { x: 1, y: 1 },
        size: new Vec(0, 0.08).mul(ui.configuration.metric.secondary.scale),
        rotation: 0,
        alpha: ui.configuration.metric.secondary.alpha * hide,
        horizontalAlign: HorizontalAlign.Right,
        background: false,
    })

    const comboX = contentCenterX(1680)
    ui.combo.value.set({
        anchor: { x: comboX, y: topY(528) },
        pivot: { x: 0.5, y: 0.5 },
        size: new Vec(0, 160 * hudLayout.u).mul(ui.configuration.combo.scale),
        rotation: 0,
        alpha: ui.configuration.combo.alpha * hide,
        horizontalAlign: HorizontalAlign.Center,
        background: false,
    })
    ui.combo.text.set({
        anchor: { x: comboX, y: topY(434.9) },
        pivot: { x: 0.5, y: 0.5 },
        size: new Vec(0, 43.7 * hudLayout.u).mul(ui.configuration.combo.scale),
        rotation: 0,
        alpha: ui.configuration.combo.alpha * hide,
        horizontalAlign: HorizontalAlign.Center,
        background: false,
    })

    ui.judgment.set({
        anchor: { x: 0, y: (540 - 676) * hudLayout.u },
        pivot: { x: 0.5, y: 0.5 },
        size: new Vec(0, 89 * hudLayout.u).mul(ui.configuration.judgment.scale),
        rotation: 0,
        alpha: ui.configuration.judgment.alpha * hide,
        horizontalAlign: HorizontalAlign.Center,
        background: false,
    })
}
