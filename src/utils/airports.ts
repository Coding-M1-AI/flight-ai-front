import type { Airport } from '../types'

export async function loadUsAirports(): Promise<Airport[]> {
  const resp = await fetch('/airports.csv')
  const text = await resp.text()
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return []
  const headers = lines[0].split(',')
  const idxCode = headers.indexOf('IATA_CODE')
  const idxAirport = headers.indexOf('AIRPORT')
  const idxCountry = headers.indexOf('COUNTRY')
  const parsed: Airport[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const code = cols[idxCode]?.trim()
    const name = cols[idxAirport]?.trim()
    const country = cols[idxCountry]?.trim()
    if (code && name && country === 'USA') parsed.push({ code, name })
  }
  const seen = new Set<string>()
  return parsed.filter((a) => !seen.has(a.code) && seen.add(a.code))
}



