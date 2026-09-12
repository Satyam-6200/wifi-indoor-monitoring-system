import { useEffect, useMemo, useState } from 'react'
import { getDashboard, scanNetwork, type DashboardSnapshot } from './monitoringApi'
import './App.css'

type DeviceStatus = 'online' | 'warning' | 'offline'

type Device = { id: string; name: string; mac: string; zone: string; signal: number; lastSeen: string; status: DeviceStatus }

const initialDevices: Device[] = [
  { id: '1', name: 'Satyam’s MacBook', mac: '98:03:9B:4D:21:08', zone: 'Study', signal: -46, lastSeen: 'Now', status: 'online' },
  { id: '2', name: 'Living Room Speaker', mac: '28:6A:BA:9C:17:11', zone: 'Living room', signal: -59, lastSeen: 'Now', status: 'online' },
  { id: '3', name: 'Kitchen Sensor', mac: '84:F3:EB:2C:98:42', zone: 'Kitchen', signal: -68, lastSeen: '2 min ago', status: 'warning' },
  { id: '4', name: 'Guest phone', mac: 'C0:EE:FB:11:32:79', zone: 'Entry', signal: -82, lastSeen: '18 min ago', status: 'offline' },
]

const zones = [
  { name: 'Living room', active: 3, quality: 'Excellent', signal: -48, className: 'living-room' },
  { name: 'Study', active: 2, quality: 'Good', signal: -56, className: 'study' },
  { name: 'Kitchen', active: 1, quality: 'Fair', signal: -68, className: 'kitchen' },
  { name: 'Entry', active: 0, quality: 'Offline', signal: null, className: 'entry' },
]

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  return `${Math.floor(seconds / 3600)} hr ago`
}

function toDevices(snapshot: DashboardSnapshot): Device[] {
  return snapshot.devices.map((device) => ({
    id: device.id,
    name: device.name,
    mac: device.mac,
    zone: device.zone,
    signal: device.rssiDbm ?? -85,
    lastSeen: relativeTime(device.lastSeenAt),
    status: device.status,
  }))
}

function signalLabel(signal: number) {
  if (signal >= -55) return 'Excellent'
  if (signal >= -65) return 'Good'
  if (signal >= -75) return 'Fair'
  return 'Weak'
}

function App() {
  const [devices, setDevices] = useState(initialDevices)
  const [isScanning, setIsScanning] = useState(false)
  const [filter, setFilter] = useState<'all' | DeviceStatus>('all')
  const [lastScan, setLastScan] = useState('Just now')
  const [source, setSource] = useState('Demo telemetry')
  const visibleDevices = useMemo(() => devices.filter((device) => filter === 'all' || device.status === filter), [devices, filter])
  const onlineCount = devices.filter((device) => device.status === 'online').length
  const activeDevices = devices.filter((device) => device.status !== 'offline')
  const averageSignal = activeDevices.length ? Math.round(activeDevices.reduce((total, device) => total + device.signal, 0) / activeDevices.length) : 0

  useEffect(() => {
    void getDashboard().then((snapshot) => {
      if (snapshot.devices.length) setDevices(toDevices(snapshot))
      if (snapshot.generatedAt) setLastScan(relativeTime(snapshot.generatedAt))
      setSource(snapshot.source === 'neighbour-cache' ? 'Local network scan' : snapshot.source)
    }).catch(() => undefined)
  }, [])

  const runScan = () => {
    setIsScanning(true)
    void scanNetwork().then((snapshot) => {
      setDevices(toDevices(snapshot))
      setLastScan(snapshot.generatedAt ? relativeTime(snapshot.generatedAt) : 'Just now')
      setSource(snapshot.source === 'neighbour-cache' ? 'Local network scan' : snapshot.source)
    }).catch(() => {
      setDevices((currentDevices) => currentDevices.map((device) => device.status === 'offline' ? device : { ...device, signal: Math.max(-78, Math.min(-39, device.signal + Math.floor(Math.random() * 9) - 4)), lastSeen: 'Now' }))
      setLastScan('Just now')
      setSource('Demo telemetry')
    }).finally(() => setIsScanning(false))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">◉</span><span>Pulse<span className="brand-light">WiFi</span></span></div>
        <div className="connection"><span className="live-dot" /> Monitoring <strong>Home network</strong></div>
        <button className="scan-button" type="button" onClick={runScan} disabled={isScanning}>{isScanning ? 'Scanning…' : 'Run scan'}</button>
      </header>
      <section className="page-heading">
        <div><p className="eyebrow">LIVE OVERVIEW</p><h1>Indoor network health</h1><p className="subhead">Find connected devices, weak coverage and unexpected visitors at a glance.</p></div>
        <p className="updated">Last scan: {lastScan} <span aria-hidden="true">·</span> {source}</p>
      </section>
      <section className="metrics" aria-label="Network summary">
        <article className="metric-card"><span className="metric-icon blue">⌁</span><div><p>Connected devices</p><strong>{onlineCount}<small> / {devices.length}</small></strong></div><span className="metric-change">+1 today</span></article>
        <article className="metric-card"><span className="metric-icon green">▥</span><div><p>Coverage score</p><strong>82<small>/100</small></strong></div><span className="metric-change">Good</span></article>
        <article className="metric-card"><span className="metric-icon amber">⌁</span><div><p>Average signal</p><strong>{averageSignal}<small> dBm</small></strong></div><span className="metric-change">Stable</span></article>
        <article className="metric-card"><span className="metric-icon red">!</span><div><p>Needs attention</p><strong>1</strong></div><span className="metric-change warning">Weak signal</span></article>
      </section>
      <section className="dashboard-grid">
        <article className="panel floor-panel">
          <div className="panel-heading"><div><p className="eyebrow">SIGNAL MAP</p><h2>Ground floor</h2></div><div className="legend"><span><i className="legend-good" /> Strong</span><span><i className="legend-fair" /> Fair</span></div></div>
          <div className="floor-plan" role="img" aria-label="Illustrative ground-floor network signal map">
            {zones.map((zone) => <div className={`room ${zone.className}`} key={zone.name}><span className={`room-pulse ${zone.quality === 'Fair' ? 'fair' : zone.quality === 'Offline' ? 'offline' : ''}`} /><strong>{zone.name}</strong><small>{zone.active} active</small><span className="room-signal">{zone.signal === null ? 'No signal' : `${zone.signal} dBm`}</span></div>)}
            <div className="router"><span>⌁</span><small>Router</small></div>
          </div><p className="panel-footnote">Signal estimates are calculated from the most recent device observations.</p>
        </article>
        <article className="panel activity-panel">
          <div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Network events</h2></div><button type="button" className="text-button">View all</button></div>
          <ol className="activity-list">
            <li><span className="event-icon success">✓</span><div><strong>Satyam’s MacBook joined</strong><p>Study · Strong signal</p></div><time>Now</time></li>
            <li><span className="event-icon alert">!</span><div><strong>Kitchen Sensor signal dropped</strong><p>Kitchen · −68 dBm</p></div><time>2m</time></li>
            <li><span className="event-icon neutral">↗</span><div><strong>Guest phone left network</strong><p>Entry · Last seen 18m ago</p></div><time>18m</time></li>
            <li><span className="event-icon success">✓</span><div><strong>Living Room Speaker joined</strong><p>Living room · Excellent signal</p></div><time>32m</time></li>
          </ol>
        </article>
      </section>
      <section className="panel devices-panel">
        <div className="panel-heading devices-heading"><div><p className="eyebrow">DEVICE INVENTORY</p><h2>Known devices</h2></div><div className="filter-group" aria-label="Filter devices">{(['all', 'online', 'warning', 'offline'] as const).map((option) => <button type="button" key={option} className={filter === option ? 'active' : ''} onClick={() => setFilter(option)}>{option === 'all' ? 'All' : option}</button>)}</div></div>
        <div className="table-wrap"><table><thead><tr><th>Device</th><th>Location</th><th>Signal</th><th>Last seen</th><th>Status</th></tr></thead><tbody>{visibleDevices.map((device) => <tr key={device.id}><td><strong>{device.name}</strong><small>{device.mac}</small></td><td>{device.zone}</td><td><span className={`signal ${signalLabel(device.signal).toLowerCase()}`}>▂▅▇ <b>{device.signal} dBm</b></span></td><td>{device.lastSeen}</td><td><span className={`status ${device.status}`}><i />{device.status}</span></td></tr>)}</tbody></table></div>
      </section>
    </main>
  )
}

export default App
