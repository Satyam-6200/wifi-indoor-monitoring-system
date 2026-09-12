import test from 'node:test'
import assert from 'node:assert/strict'
import { parseNeighbourOutput } from './server.js'

test('parses Windows ARP cache entries', () => {
  const output = `Interface: 192.168.1.9 --- 0x11\n  Internet Address      Physical Address      Type\n  192.168.1.1           8c-85-90-12-34-56     dynamic\n  224.0.0.251           01-00-5e-00-00-fb     static`
  assert.deepEqual(parseNeighbourOutput(output, 'win32'), [{ ip: '192.168.1.1', mac: '8C:85:90:12:34:56' }])
})

test('parses Linux neighbour cache entries', () => {
  const output = '192.168.1.20 dev wlan0 lladdr aa:bb:cc:dd:ee:ff REACHABLE'
  assert.deepEqual(parseNeighbourOutput(output, 'linux'), [{ ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:FF' }])
})
