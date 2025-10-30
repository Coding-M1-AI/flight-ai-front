import { useEffect, useMemo, useRef, useState } from 'react'
import './DatePicker2015.css'

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (next: string) => void;
  label?: string;
};

const MONTH_NAMES = [
  'Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'
]

function toDateParts(value: string): { y: number; m: number; d: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  return { y, m: m - 1, d }
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

export default function DatePicker2015({ value, onChange, label }: Props) {
  const initial = toDateParts(value) ?? { y: 2015, m: 5, d: 15 }
  const [open, setOpen] = useState(false)
  const [monthIndex, setMonthIndex] = useState<number>(initial.m)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    // keep month in sync with selected value
    const parts = toDateParts(value)
    if (parts && parts.y === 2015) setMonthIndex(parts.m)
  }, [value])

  const grid = useMemo(() => {
    const firstDay = new Date(Date.UTC(2015, monthIndex, 1)).getUTCDay() // 0..6 (Sun..Sat)
    const leading = (firstDay + 6) % 7 // convert so week starts Monday
    const totalDays = daysInMonth(2015, monthIndex)
    const cells: Array<{ day: number | null }> = []
    for (let i = 0; i < leading; i++) cells.push({ day: null })
    for (let d = 1; d <= totalDays; d++) cells.push({ day: d })
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push({ day: null })
    return cells
  }, [monthIndex])

  const selected = toDateParts(value)
  const selectedDay = selected?.d ?? null
  const selectedMonth = selected?.m ?? null

  function selectDay(d: number) {
    const dd = String(d).padStart(2, '0')
    const mm = String(monthIndex + 1).padStart(2, '0')
    onChange(`2015-${mm}-${dd}`)
    setOpen(false)
  }

  function prevMonth() { setMonthIndex((m) => Math.max(0, m - 1)) }
  function nextMonth() { setMonthIndex((m) => Math.min(11, m + 1)) }

  return (
    <div className="datepicker" ref={ref}>
      {label && <div className="datepicker-label">{label}</div>}
      <button
        type="button"
        className="date-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="date-trigger-icon" aria-hidden>📅</span>
        <span>
          {value || 'Sélectionner une date'}
        </span>
      </button>
      {open && (
        <div className="datepicker-popover" role="dialog" aria-label="Sélecteur de date 2015">
          <div className="datepicker-header">
            <button
              type="button"
              className="nav"
              onClick={prevMonth}
              disabled={monthIndex === 0}
              aria-label="Mois précédent"
            >
              ◀
            </button>
            <div className="current-month">{MONTH_NAMES[monthIndex]} 2015</div>
            <button
              type="button"
              className="nav"
              onClick={nextMonth}
              disabled={monthIndex === 11}
              aria-label="Mois suivant"
            >
              ▶
            </button>
          </div>
          <div className="weekday-row">
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>
          <div className="grid">
            {grid.map((cell, i) => {
              if (cell.day === null) return <div key={i} className="cell empty" />
              const isSelected = selectedMonth === monthIndex && selectedDay === cell.day
              return (
                <button
                  key={i}
                  type="button"
                  className={"cell day" + (isSelected ? ' selected' : '')}
                  onClick={() => selectDay(cell.day!)}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


