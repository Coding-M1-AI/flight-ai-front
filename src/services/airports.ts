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

export async function loadAirports(apiBase: string = 'http://localhost:8000'): Promise<Airport[]> {
  const url = `${apiBase}/api/v1/airports`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load airports: ${response.status}`)
  }
  const data: ApiAirport[] = await response.json()
  // Keep only USA if you want to mirror previous behavior; otherwise return all
  return data
    .filter((a) => a.iata_code && a.airport_name)
    .map((a) => ({ code: a.iata_code, name: a.airport_name }))
}


