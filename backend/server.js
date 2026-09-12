import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const directory = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(directory, 'data')
const stateFile = path.join(dataDirectory, 'state.json')
const port = Number.parseInt(process.env.PORT ?? '8787', 10)

const emptyState = () => ({ devices: [], events: [], generatedAt: null, source: 'neighbour-cache' })

async function readState() {
  try {
    return JSON.parse(await fs.readFile(stateFile, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyState()
    throw error
  }
}

async function writeState(state) {
  await fs.mkdir(dataDirectory, { recursive: true })
  await fs.writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

function normaliseMac(value) {
  const mac = value.replace(/-/g, ':').toUpperCase()
  return /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac) ? mac : null
}

function isUsableAddress(address) {
  return address && !address.startsWith('224.') && !address.startsWith('239.') && address !== '255.255.255.255'
}

export function parseNeighbourOutput(output, platform = process.platform) {
  const devices = new Map()
  const add = (ip, candidateMac) => {
    const mac = normaliseMac(candidateMac)
    if (!mac || !isUsableAddress(ip) || mac === 'FF:FF:FF:FF:FF:FF') return
    devices.set(mac, { ip, mac })
  }

  if (platform === 'win32') {
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/^\s*(\d{1,3}(?:\.\d{1,3}){3})\s+([0-9a-f-]{17})\s+(?:dynamic|static)\s*$/i)
      if (match) add(match[1], match[2])
    }
  } else {
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/(\d{1,3}(?:\.\d{1,3}){3}).*?(?:lladdr|at)\s+([0-9a-f:]{17})/i)
      if (match) add(match[1], match[2])
    }
  }
  return [...devices.values()]
}

async function readNeighbourTable() {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execFileAsync('arp', ['-a'], { windowsHide: true, timeout: 5_000 })
      return parseNeighbourOutput(stdout, 'win32')
    }
    const { stdout } = await execFileAsync('ip', ['neigh'], { timeout: 5_000 })
    return parseNeighbourOutput(stdout)
  } catch {
    return []
  }
}

function friendlyName(mac) {
  return `Device ${mac.slice(-5).replace(':', '')}`
}

function makeDashboard(state) {
  return {
    generatedAt: state.generatedAt,
    source: state.source,
    devices: state.devices,
    zones: [{ name: 'Unknown', activeDevices: state.devices.length, rssiDbm: null }],
    events: state.events.slice(0, 20),
  }
}

async function scan() {
  const previous = await readState()
  const found = await readNeighbourTable()
  const now = new Date().toISOString()
  const previousByMac = new Map(previous.devices.map((device) => [device.mac, device]))
  const events = []
  const devices = found.map(({ ip, mac }) => {
    const existing = previousByMac.get(mac)
    if (!existing) {
      events.push({ id: randomUUID(), type: 'device-discovered', message: `${friendlyName(mac)} discovered`, at: now })
    }
    return {
      id: existing?.id ?? randomUUID(),
      name: existing?.name ?? friendlyName(mac),
      ip,
      mac,
      zone: existing?.zone ?? 'Unknown',
      rssiDbm: null,
      lastSeenAt: now,
      status: 'online',
    }
  })
  const state = {
    devices,
    events: [...events, ...previous.events].slice(0, 100),
    generatedAt: now,
    source: 'neighbour-cache',
  }
  await writeState(state)
  return makeDashboard(state)
}

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  response.end(`${JSON.stringify(body)}\n`)
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  try {
    if (request.method === 'GET' && request.url === '/api/v1/health') {
      return send(response, 200, { status: 'ok', platform: os.platform(), service: 'pulsewifi-backend' })
    }
    if (request.method === 'GET' && request.url === '/api/v1/dashboard') {
      return send(response, 200, makeDashboard(await readState()))
    }
    if (request.method === 'POST' && request.url === '/api/v1/scans') {
      return send(response, 200, await scan())
    }
    return send(response, 404, { error: 'Not found' })
  } catch (error) {
    console.error(error)
    return send(response, 500, { error: 'Unable to complete request' })
  }
})

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(port, () => console.log(`PulseWiFi API listening on http://localhost:${port}`))
}

export { makeDashboard, scan }
