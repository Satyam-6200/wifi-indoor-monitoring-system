export type ApiDevice = {
  id: string
  name: string
  ip: string
  mac: string
  zone: string
  rssiDbm: number | null
  lastSeenAt: string
  status: 'online' | 'warning' | 'offline'
}

export type DashboardSnapshot = {
  generatedAt: string | null
  source: string
  devices: ApiDevice[]
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

async function request(path: string, method = 'GET') {
  const response = await fetch(`${baseUrl}${path}`, { method })
  if (!response.ok) throw new Error(`Monitoring API returned ${response.status}`)
  return response.json() as Promise<DashboardSnapshot>
}

export const getDashboard = () => request('/dashboard')
export const scanNetwork = () => request('/scans', 'POST')
