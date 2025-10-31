import { useEffect, useState } from 'react'
import './App.css'
import { estimateDelay, type DelayEstimateResponse } from './services/delayEstimator'
import DatePicker2015 from './components/DatePicker2015'
import type { Airport } from './types'
import { loadAirlines, type Airline } from './services/airlines'
import { loadAirports } from './services/airports'

function App() {
  const [date, setDate] = useState<string>('2015-06-15')
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [isLoadingAirports, setIsLoadingAirports] = useState<boolean>(true)
  const [isLoadingAirlines, setIsLoadingAirlines] = useState<boolean>(true)
  const [departure, setDeparture] = useState<string>('JFK')
  const [arrival, setArrival] = useState<string>('LAX')
  const [airline, setAirline] = useState<string>('UA')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DelayEstimateResponse | null>(null)

  useEffect(() => {
    setIsLoadingAirports(true)
    loadAirports()
      .then((list) => {
        setAirports(list)
        if (list.find((a) => a.code === 'JFK')) setDeparture('JFK')
        if (list.find((a) => a.code === 'LAX')) setArrival('LAX')
        if (!list.find((a) => a.code === 'JFK') && list[0]) setDeparture(list[0].code)
        if (!list.find((a) => a.code === 'LAX') && list[1]) setArrival(list[1].code)
      })
      .catch(() => {})
      .finally(() => setIsLoadingAirports(false))
  }, [])

  useEffect(() => {
    setIsLoadingAirlines(true)
    loadAirlines()
      .then((list) => {
        setAirlines(list)
        if (list.find((a) => a.code === 'UA')) setAirline('UA')
      })
      .catch(() => {})
      .finally(() => setIsLoadingAirlines(false))
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      const dt = new Date(date + 'T00:00:00')
      const day = dt.getUTCDate()
      const month = dt.getUTCMonth() + 1
      const data = await estimateDelay({
        day,
        month,
        departureAirport: departure,
        arrivalAirport: arrival,
        airlineCode: airline,
      })
      setResult(data)
    } catch (err) {
      setError("Une erreur est survenue. Réessayez.")
    } finally {
      setIsLoading(false)
    }
  }

  const airportOptions = airports.map((a) => (
    <option key={a.code} value={a.code}>
      {a.code} — {a.name}
    </option>
  ))

  const airlineOptions = airlines.map((a) => (
    <option key={a.code} value={a.code}>
      {a.code} — {a.name}
    </option>
  ))

  if (isLoadingAirports || isLoadingAirlines) {
    // Use same background as page by reading from computed styles via CSS var
    document.documentElement.style.setProperty('--app-bg', getComputedStyle(document.documentElement).backgroundColor)
    return (
      <div className="fullscreen-loader">
        <div className="spinner" />
        <div>Chargement des données…</div>
      </div>
    )
  }

  return (
    <div className="wrapper">
      <h1>Estimation du retard de vol</h1>
      <p className="subtitle">Entrez la date et les aéroports pour obtenir une estimation.</p>

      <form className="form" onSubmit={onSubmit}>
        <div className="row">
          <label className="grow">
            Date de départ (2015)
            <DatePicker2015 value={date} onChange={setDate} />
          </label>
        </div>

        <div className="row">
          <label className="grow">
            Aéroport de départ
            <select value={departure} onChange={(e) => setDeparture(e.target.value)}>
              {airportOptions}
            </select>
          </label>
          <label className="grow">
            Aéroport de destination
            <select value={arrival} onChange={(e) => setArrival(e.target.value)}>
              {airportOptions}
            </select>
          </label>
        </div>

        <div className="row">
          <label className="grow">
            Compagnie
            <select value={airline} onChange={(e) => setAirline(e.target.value)}>
              {airlineOptions}
            </select>
          </label>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Calcul en cours…' : 'Obtenir une estimation'}
        </button>
      </form>

      {error && <div className="error" role="alert">{error}</div>}

      {result && (
        <div className="result">
          <div className="minutes">~ {result.minutes} min</div>
          <div className="confidence">Confiance: {(result.confidence * 100).toFixed(0)}%</div>
          <div className="context">
            {date} — {departure} ➜ {arrival} — {airline}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
