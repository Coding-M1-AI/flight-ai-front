import { useEffect, useState } from 'react'
import './App.css'
import { getDistanceInMiles } from './utils/distance'
import { estimateDelay, type DelayEstimateResponse } from './services/delayEstimator'
import type { Airport } from './types'
import { loadAirlines, type Airline } from './services/airlines'
import { loadAirports, loadDestinations } from './services/airports'

function App() {
  const [date, setDate] = useState<string>('2015-06-15')
  const [airports, setAirports] = useState<Airport[]>([])
  const [availableDestinations, setAvailableDestinations] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [isLoadingAirports, setIsLoadingAirports] = useState<boolean>(true)
  const [isLoadingAirlines, setIsLoadingAirlines] = useState<boolean>(true)
  const [departure, setDeparture] = useState<string>('JFK')
  const [arrival, setArrival] = useState<string>('LAX')
  const [airline, setAirline] = useState<string>('UA')
  const [distance, setDistance] = useState<number>(0)
  const [departureTime, setDepartureTime] = useState<string>('08:00')
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

  useEffect(() => {
    if (departure) {
      loadDestinations(departure)
        .then((destinations) => {
          setAvailableDestinations(destinations)
          if (destinations.length > 0) {
            const isCurrentArrivalValid = destinations.find((a) => a.code === arrival)
            if (!isCurrentArrivalValid) {
              setArrival(destinations[0].code)
            }
          }
        })
        .catch(() => {
          setAvailableDestinations([])
        })
    }
  }, [departure])

  useEffect(() => {
    const departureAirport = airports.find((a) => a.code === departure)
    const arrivalAirport = airports.find((a) => a.code === arrival)
    if (departureAirport && arrivalAirport) {
      const dist = getDistanceInMiles(departureAirport.lat, departureAirport.lon, arrivalAirport.lat, arrivalAirport.lon)
      setDistance(Math.round(dist))
    }
  }, [departure, arrival, airports])


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      const dt = new Date(date + 'T00:00:00')
      const month = dt.getUTCMonth() + 1
      const dayOfWeek = dt.getUTCDay() === 0 ? 7 : dt.getUTCDay()
      const scheduledDeparture = parseInt(departureTime.replace(':', ''), 10)

      const data = await estimateDelay({
        AIRLINE: airline,
        ORIGIN_AIRPORT: departure,
        DESTINATION_AIRPORT: arrival,
        MONTH: month,
        DAY_OF_WEEK: dayOfWeek,
        SCHEDULED_DEPARTURE: scheduledDeparture,
        DISTANCE: distance,
      })
      setResult(data)
    } catch (err) {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  const airportOptions = airports.map((a) => (
    <option key={a.code} value={a.code}>
      {a.code} — {a.name}
    </option>
  ))

  const destinationOptions = availableDestinations.map((a) => (
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
      <p className="subtitle">Entrez les détails du vol pour obtenir une estimation.</p>

      <form className="form" onSubmit={onSubmit}>
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
              {availableDestinations.length > 0 ? destinationOptions : airportOptions}
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

        <div className="row">
          <label>
            Date de départ (2015)
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              min="2015-01-01" 
              max="2015-12-31"
            />
          </label>
          <label>
            Heure de départ
            <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </label>
          <label>
            Distance (miles)
            <input type="number" value={distance} onChange={(e) => setDistance(parseInt(e.target.value, 10))} min="0" readOnly />
          </label>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Calcul en cours…' : 'Obtenir une estimation'}
        </button>
      </form>

      {error && <div className="error" role="alert">{error}</div>}

      {result && (
        <div className="result">
          <div className="minutes">~ {result.predicted_delay.toFixed(1)} min</div>
          <div className="confidence">Modèle: {result.model_version}</div>
          <div className="context">
            {date} {departureTime} — {departure} ➜ {arrival} — {airline}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
