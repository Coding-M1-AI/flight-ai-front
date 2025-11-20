import type { Airport } from '../types'

type ApiAirport = {
  iata_code: string
  airport_name: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
}

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function mapApiAirports(data: ApiAirport[]): Airport[] {
  return data
    .filter((a) => a.iata_code && a.airport_name)
    .map((a) => ({ code: a.iata_code, name: a.airport_name, lat: a.latitude, lon: a.longitude }))
}

export async function loadAirports(apiBase: string = DEFAULT_API_BASE): Promise<Airport[]> {
  const url = `${apiBase}/api/v1/airports`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load airports: ${response.status}`)
  }
  const data: ApiAirport[] = await response.json()
  // Keep only USA if you want to mirror previous behavior; otherwise return all
  return mapApiAirports(data)
}

export async function loadDestinations(origin: string, apiBase: string = DEFAULT_API_BASE): Promise<Airport[]> {
  const url = `${apiBase}/api/v1/airports/destinations/${origin}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load destinations: ${response.status}`)
  }
  const data: ApiAirport[] = await response.json()
  return mapApiAirports(data)
}
