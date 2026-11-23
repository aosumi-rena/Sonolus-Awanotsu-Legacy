# Sonolus Awanotsu Legacy

A recreation of a certain rhythm game's engine in **[Advertisements-less Sonolus (v0.8.13)](https://wiki.sonolus.com/release-notes/versions/0.8.13_1)**.

## Run a server

Use Node.js 22.12 or later. Run these commands from the repository root.

```sh
npm ci
npm run build
npm start
```

Building all four modes can take several hours. Set `BUILD_WORKERS=1` to reduce peak memory. Add `http://<your-computer-LAN-address>:8080` in Sonolus. The catalogue starts empty. Set `PORT` to change the port or `ASSET_DIR` to point to your own asset folder. Restart after changing a pack.

## Add a level

Create `assets/levels.json` with an entry for each level.

```json
[
  { "name": "my-level", "title": "My Level", "artists": "Artist", "author": "Charter", "rating": 5 }
]
```

Place these three files in `assets/levels/my-level/`.

| File | Contents |
| --- | --- |
| `cover.png` | Square cover image |
| `bgm.mp3` | Audio timed to the chart |
| `LevelData.gz` | Gzip-compressed Sonolus LevelData for the game archetypes |

The level ID accepts lowercase ASCII letters, digits, hyphens and underscores and begins with a letter or digit. This layout uses the [Sonolus free pack](https://github.com/Sonolus/sonolus-free-pack) for visuals and effects.

To convert your own chart, run `npm run convert -- chart.json assets/levels/my-level/LevelData.gz`. The source is UTF-8 JSON, optionally gzip-compressed. It contains `score.notes` and `score.events`. Times use 480 ticks per beat. A three-second tap at 120 BPM uses the following data.

```json
{"score":{"events":{"bpm":[{"t":0,"bpm":120}]},"notes":[{"type":"tap","t":2880,"pos":8,"size":6}]}}
```

An optional final argument sets the audio lead-in in milliseconds. For the title and lane sequence, prepend 4934 ms of silence to your audio and pass `4934` to the converter. With the default of zero, chart time starts at the beginning of the audio.

## Use custom resources

Place a Sonolus Express pack's `db.json` and `repository/` in `assets/`. Each repository file is named by the lowercase SHA-1 of its exact bytes. Its item refers to `{"hash":"<sha1>","url":"/sonolus/repository/<sha1>"}`. Use gzip-compressed JSON for data and configuration, PNG for textures and images, and ZIP for effect audio. Background data for 0.8.13 requires a numeric `aspectRatio`. The SDK's installed `@sonolus/free-pack/pack/db.json` is a working example. [Resource formats](https://wiki.sonolus.com/custom-server-specs/misc/resources)

Register at least one skin, background, effect and particle. The server binds the four compiled modes and configuration to the engine named `ournotes`. If the pack omits that engine, the first resource of each kind becomes its default. Custom sprite and clip names are in `lib/resources/manifest/`, with additional note-style, rhythm and lane sprites in `play/src/engine/playData/skin.ts`. Levels may use the defaults or reference a specific resource via their `useSkin`, `useBackground`, `useEffect` and `useParticle` fields.

To offer **LIVE Quality**, register three variants of a resource in the pack. Map its logical item name to the High, Standard and Lite item names, in that order, in `assets/quality.json`.

```json
{"particles":{"sparks":["sparks","sparks-standard","sparks-lite"]}}
```

The same mapping works for `skins`, `backgrounds` and `effects`. Standard is the default. The player chooses a tier in the server configuration. Engine defaults, level overrides and resource details then use the chosen files.

To offer **Note Style**, add `{"skins":{"logical":["base","second","third"]}}` to `assets/noteStyles.json` for each level or quality skin, in the order Our Notes, Garupa (sprite `Our Notes Note Style 2`), Honeycomb (sprite `Our Notes Note Style 3`).

## Legacy client behavior

The 0.8.13 client uses scalar sprite depth and the full screen for HUD placement. Its native score weights all notes equally and its life meter applies one penalty for Bad and Miss. The custom HUD tracks the chart's note weights and both damage amounts. Replays retain per-note judgments. Slide visuals use the start and end judgments, and empty taps play effects only during live play. This client stores localized option names separately for each language and has no haptic callback.

To offer **Notes Effect**, use `assets/noteEffects.json` to map particle items to Standard and Simple. For example, `{"particles":{"sparks":["sparks","sparks-simple"]}}`. Add a matching `skins` map if the effect also changes skin layers. These selections apply after quality and note style.
