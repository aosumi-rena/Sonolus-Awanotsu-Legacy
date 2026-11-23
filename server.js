import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import express from 'express'
import * as core from '@sonolus/core'
import { Sonolus, filterBackgrounds, filterEffects, filterParticles, filterSkins, paginateItems } from '@sonolus/express'
import { packPath } from '@sonolus/free-pack'

const root = import.meta.dirname
const clientVersion = core.sonolusVersion ?? core.version?.sonolus ?? core.default?.version.sonolus
const assets = realpathSync(process.env.ASSET_DIR || join(root, 'assets'))
const blobs = new Map()
const hashes = new Set()
const levelFiles = new Map()
const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
function localManifest(name) {
    const file = join(assets, name)
    if (!existsSync(file)) return undefined
    if (realpathSync(file) !== file) throw new Error(name + ' must be a file inside the asset directory.')
    return file
}
const strings = readJson(join(root, 'server', 'options.json'))
const groups = ['post', 'playlist', 'level', 'skin', 'background', 'effect', 'particle', 'engine', 'replay']
const filters = { skin: filterSkins, background: filterBackgrounds, effect: filterEffects, particle: filterParticles }
const resourceGroups = Object.keys(filters)
const qualityFile = localManifest('quality.json')
const mappings = qualityFile ? readJson(qualityFile) : {}
const hasQuality = resourceGroups.some(group => Object.keys(mappings[group + 's'] ?? {}).length > 0)
const stylesFile = localManifest('noteStyles.json')
const styles = stylesFile ? readJson(stylesFile).skins ?? {} : {}
const hasStyles = Object.keys(styles).length > 0
const effectFile = localManifest('noteEffects.json')
const noteEffects = effectFile ? readJson(effectFile) : {}
const hasNoteEffects = ['skins', 'particles'].some(group => Object.keys(noteEffects[group] ?? {}).length > 0)
const serverOptions = { configuration: { options: {
    ...(hasQuality ? { liveQuality: strings.quality } : {}),
    ...(hasStyles ? { noteStyle: strings.noteStyle } : {}),
    ...(hasNoteEffects ? { noteEffect: strings.noteEffect } : {}),
} } }
const base = new Sonolus(serverOptions)

function collectResources(value) {
    if (!value || typeof value !== 'object') return
    if ('hash' in value || 'url' in value) {
        if (!value.hash && !value.url) return
        if (!/^[a-f0-9]{40}$/.test(value.hash) || value.url !== '/sonolus/repository/' + value.hash)
            throw new Error('Resource URLs must point to their SHA-1 file in repository/.')
        hashes.add(value.hash)
        return
    }
    Object.values(value).forEach(collectResources)
}

function addBlob(buffer) {
    const hash = createHash('sha1').update(buffer).digest('hex')
    blobs.set(hash, buffer)
    return { hash, url: '/sonolus/repository/' + hash }
}

const databaseFile = localManifest('db.json')
const levelsFile = localManifest('levels.json')
const pack = databaseFile ? assets : levelsFile ? realpathSync(packPath) : undefined
if (pack) {
    base.load(pack)
    collectResources(base.banner)
    for (const group of groups) collectResources(base[group].items)
}
const titles = Object.fromEntries(Object.entries(base.title ?? {}).filter(([, value]) => value?.trim()))
base.title = { en: Object.values(titles)[0] ?? 'Awanotsu', ...titles }
const repository = join(pack ?? assets, 'repository')
if (hashes.size && realpathSync(repository) !== repository)
    throw new Error('repository/ must be a directory inside the asset pack.')

if (levelsFile && !databaseFile) {
    const skin = base.skin.items[0]
    const data = JSON.parse(gunzipSync(readFileSync(join(repository, skin.data.hash))))
    const sprites = new Map(data.sprites.map(sprite => [sprite.name, sprite]))
    const alias = (name, standard, sideways = false) => {
        const sprite = sprites.get(standard)
        if (!sprite) throw new Error('Missing free-pack sprite ' + standard)
        const { x1, y1, x2, y2, x3, y3, x4, y4 } = sprite.transform
        const transform = sideways ? { x1: x2, y1: y2, x2: x3, y2: y3, x3: x4, y3: y4, x4: x1, y4: y1 } : sprite.transform
        data.sprites.push({ ...sprite, name: 'Our Notes ' + name, transform })
    }
    const bodies = {
        'Tap Note': 'HEAD_CYAN', 'Slide Note': 'HEAD_GREEN', 'Slide End Note': 'TAIL_GREEN',
        'Slide Connect Note': 'TICK_GREEN', 'Trace Note': 'TICK_BLUE', 'Flick Note': 'HEAD_RED',
        'Flick Left Note': 'HEAD_PURPLE', 'Flick Right Note': 'HEAD_YELLOW',
    }
    const parts = ['', ' Mark', ' Left', ' Right', ' Right Tilt 6']
    for (let tilt = 1; tilt <= 5; tilt++) parts.push(' Left Tilt ' + tilt, ' Right Tilt ' + tilt)
    for (const [name, color] of Object.entries(bodies))
        for (const part of parts) alias(name + part, '#NOTE_' + color)
    for (const [direction, color] of [['', 'RED'], [' Left', 'PURPLE'], [' Right', 'YELLOW']]) {
        const sizes = direction ? [1, 2, 3, 4, 5, 6, 7, 8] : ['S', 'M', 'L', 'LL']
        const name = 'Flick' + direction + ' Arrow'
        alias(name, '#DIRECTIONAL_MARKER_' + color)
        for (const size of sizes) alias(name + ' ' + size, '#DIRECTIONAL_MARKER_' + color, Boolean(direction))
    }
    skin.data = addBlob(gzipSync(JSON.stringify(data)))
}

if (levelsFile) {
    const usedNames = new Set(base.level.items.map(item => item.name))
    for (const { name, title, artists, author, rating } of readJson(levelsFile)) {
        if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,95}$/.test(name) || usedNames.has(name))
            throw new Error('Level names must be unique lowercase IDs.')
        if (![title, artists, author].every(text => typeof text === 'string') || !Number.isSafeInteger(rating) || rating < 0)
            throw new Error('Each level requires title, artists, author and a nonnegative integer rating.')
        usedNames.add(name)
        const directory = join(assets, 'levels', name)
        const file = filename => {
            const path = join(directory, filename)
            if (realpathSync(path) !== path) throw new Error('Level resources must be regular files within their level directory.')
            const hash = createHash('sha1').update(readFileSync(path)).digest('hex')
            levelFiles.set(hash, path)
            return { hash, url: '/sonolus/repository/' + hash }
        }
        base.level.items.push({
            name, title: { en: title }, artists: { en: artists }, author: { en: author }, rating, version: 1,
            engine: 'ournotes', tags: [], useSkin: { useDefault: true }, useBackground: { useDefault: true },
            useEffect: { useDefault: true }, useParticle: { useDefault: true },
            cover: file('cover.png'), bgm: file('bgm.mp3'), data: file('LevelData.gz'),
        })
    }
}

let engine = base.engine.items.find(item => item.name === 'ournotes')
if (!engine && resourceGroups.every(group => base[group].items.length)) {
    engine = {
        name: 'ournotes', version: 13, title: { en: 'Awanotsu' }, subtitle: {}, author: {}, tags: [], description: {},
        thumbnail: base.skin.items[0].thumbnail,
        ...Object.fromEntries(resourceGroups.map(group => [group, base[group].items[0].name])),
    }
    base.engine.items.push(engine)
}
const localized = new Map()
if (engine) {
    for (const field of ['playData', 'watchData', 'previewData', 'tutorialData', 'configuration']) {
        const filename = 'Engine' + field[0].toUpperCase() + field.slice(1)
        engine[field] = addBlob(readFileSync(join(root, 'dist', filename)))
    }
    engine.version = 13
    delete engine.rom
    const configuration = JSON.parse(gunzipSync(blobs.get(engine.configuration.hash)))
    for (const [locale, labels] of Object.entries(strings.locales)) {
        const options = configuration.options.map(option => {
            const texts = labels.options[option.name]
            if (!texts) return option
            const translated = { ...option, ...texts }
            if (clientVersion === '0.8.13' && translated.title) {
                translated.name = translated.title
                delete translated.title
            }
            return translated
        })
        const variant = { ...configuration, options }
        if (variant.optionCategories) variant.optionCategories = variant.optionCategories.map(category => ({
            ...category, title: labels.categories[category.name] ?? category.title,
        }))
        localized.set(locale, addBlob(gzipSync(JSON.stringify(variant))))
    }
}

function localeKey(code) {
    const value = String(code ?? '').toLowerCase().replaceAll('_', '-')
    if (/^ja(?:-|$)/.test(value)) return 'ja'
    if (/^ko(?:-|$)/.test(value)) return 'ko'
    if (/^(zht|zh-(hant|tw|hk|mo))(?:-|$)/.test(value)) return 'zht'
    if (/^(zh|zhs)(?:-|$)/.test(value)) return 'zhs'
    return 'en'
}

function forVariants(quality, style, effect) {
    const server = new Sonolus(serverOptions)
    for (const key of ['title', 'description', 'banner']) server[key] = base[key]
    for (const group of groups) {
        const items = base[group].items
        const choices = []
        if (resourceGroups.includes(group)) choices.push([mappings[group + 's'], quality, 3])
        if (group === 'skin' && hasStyles) choices.push([styles, style, 3])
        if (group === 'skin' || group === 'particle') choices.push([noteEffects[group + 's'], effect, 2])
        const selectors = choices.filter(([mapping]) => mapping && Object.keys(mapping).length)
        if (!selectors.length) {
            server[group].items.push(...items)
            continue
        }
        const byName = new Map(items.map(item => [item.name, item]))
        const choiceNames = new Set()
        const logicalNames = new Set()
        for (const [mapping, , length] of selectors) {
            for (const logical of Object.keys(mapping))
                if (!choiceNames.has(logical)) logicalNames.add(logical)
            for (const [logical, variants] of Object.entries(mapping)) {
                if (!byName.has(logical) || !Array.isArray(variants) || variants.length !== length || variants.some(name => !byName.has(name)))
                    throw new Error('Invalid variant mapping for ' + group + ' ' + logical)
                for (const name of variants) choiceNames.add(name)
            }
        }
        for (const item of items) {
            let selectedName = item.name
            for (const [mapping, index] of selectors)
                if (Object.hasOwn(mapping, selectedName)) selectedName = mapping[selectedName][index]
            const selected = byName.get(selectedName)
            server[group].items.push(selected === item ? item : { ...selected, name: item.name })
        }
        const library = server[group]
        const visible = library.items.filter(item => logicalNames.has(item.name) || !choiceNames.has(item.name))
        const defaultInfo = library.infoHandler
        library.infoHandler = context => {
            const info = defaultInfo(context)
            info.sections[0].items = visible.slice(0, 5)
            return info
        }
        library.listHandler = ({ search, page }) => ({
            searches: library.searches,
            ...paginateItems(filters[group](visible, search.type === 'quick' ? String(search.options.keywords) : ''), page),
        })
    }
    return server
}

const servers = new Map()
function serverFor(query) {
    if (!hasQuality && !hasStyles && !hasNoteEffects) return base
    const quality = hasQuality && query.liveQuality === '0' ? 0 : hasQuality && query.liveQuality === '2' ? 2 : 1
    const style = hasStyles && query.noteStyle === '1' ? 1 : hasStyles && query.noteStyle === '2' ? 2 : 0
    const effect = hasNoteEffects && query.noteEffect === '1' ? 1 : 0
    const key = quality * 6 + style * 2 + effect
    if (!servers.has(key)) servers.set(key, forVariants(quality, style, effect))
    return servers.get(key)
}
serverFor({})
const app = express()
app.disable('x-powered-by')
app.use('/sonolus/repository', (request, response) => {
    const match = /^\/([a-f0-9]{40})$/.exec(request.path)
    if (!match || !['GET', 'HEAD'].includes(request.method)) return response.sendStatus(404)
    const key = match[1]
    if (blobs.has(key)) return response.type('application/octet-stream').send(blobs.get(key))
    if (!hashes.has(key) && !levelFiles.has(key)) return response.sendStatus(404)
    const path = levelFiles.get(key) ?? resolve(repository, key)
    try {
        const actual = realpathSync(path)
        if (actual !== path) return response.sendStatus(404)
        return response.sendFile(actual)
    } catch {
        return response.sendStatus(404)
    }
})
app.use((request, response, next) => {
    if (!['GET', 'HEAD'].includes(request.method)) return response.sendStatus(405)
    if (localized.size) {
        const blob = localized.get(localeKey(request.query.localization))
        const json = response.json.bind(response)
        response.json = body => json(JSON.parse(JSON.stringify(body, (key, value) =>
            key === 'configuration' && value?.hash === engine.configuration.hash ? blob : value)))
    }
    serverFor(request.query).router(request, response, next)
})
app.listen(Number(process.env.PORT ?? 8080), process.env.HOST ?? '0.0.0.0', function () {
    console.log('Awanotsu · Sonolus ' + clientVersion + ' · port ' + this.address().port)
})
