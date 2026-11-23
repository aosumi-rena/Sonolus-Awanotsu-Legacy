import { writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { loadChart } from './chart.js'
import { convertChart } from './convert.js'

const [source, destination, leadIn = '0'] = process.argv.slice(2)
const leadInMs = Number(leadIn)
if (!source || !destination || !Number.isSafeInteger(leadInMs) || leadInMs < 0) {
    throw new Error('Usage: npm run convert -- <chart.json[.gz]> <LevelData.gz> [lead-in-ms]')
}
const { data } = convertChart(loadChart(source), { leadInMs })
writeFileSync(destination, gzipSync(JSON.stringify(data)))
