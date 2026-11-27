import { useEffect, useState } from 'react'
import './App.css'
import { ADVENT_CONTENT, DOOR_CONTENT, DOOR_ORDER } from './doors'
import { Door } from './Door'
import {
  ADVENT_SUNDAYS,
  isDateReached,
  nextUnlock,
  parseDateOverride,
  unlockedDoorCount,
} from './calendar-logic'
import { ADVENT_STORAGE_KEY, DAY_STORAGE_KEY, useOpenedDoors } from './use-opened-doors'

// Kun i udvikling: ?dato=2026-12-05 lader som om det er den dag. Fjernes i produktionsbuild.
const dateOverride = import.meta.env.DEV ? parseDateOverride(window.location.search) : null

const MONTH_NAMES: Record<number, string> = { 11: 'november', 12: 'december' }

function useNow(): Date {
  const [now, setNow] = useState(() => dateOverride ?? new Date())
  useEffect(() => {
    if (dateOverride) return
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const dayWord = days === 1 ? 'dag' : 'dage'
  const hourWord = hours === 1 ? 'time' : 'timer'
  return `${days} ${dayWord}, ${hours} ${hourWord}, ${minutes} min. og ${seconds} sek.`
}

export default function App() {
  const now = useNow()
  const unlocked = unlockedDoorCount(now)
  const days = useOpenedDoors(DAY_STORAGE_KEY)
  const advent = useOpenedDoors(ADVENT_STORAGE_KEY)
  const [message, setMessage] = useState<string | null>(null)

  const next = nextUnlock(now)

  return (
    <main className="calendar">
      <div className="snow" aria-hidden="true" />
      <header className="calendar__header">
        <h1>Julekalender 2026</h1>
        {next ? (
          <p className="calendar__status">
            {next.label} åbner om <strong>{formatCountdown(next.at.getTime() - now.getTime())}</strong>
          </p>
        ) : (
          <p className="calendar__status">
            {unlocked < 24
              ? `I dag må du åbne låge ${unlocked}.`
              : 'Alle låger er låst op. Glædelig jul!'}
          </p>
        )}
        {dateOverride && <p className="calendar__dev">Testdato: {dateOverride.toLocaleDateString('da-DK')}</p>}
      </header>

      <p className="calendar__message" role="status" aria-live="polite">
        {message ?? ' '}
      </p>

      <section className="calendar__advent" aria-labelledby="advent-heading">
        <h2 id="advent-heading">Adventsgaver</h2>
        <div className="calendar__advent-grid">
          {ADVENT_SUNDAYS.map((sunday, i) => {
            const label = `${sunday.number}. søndag i advent`
            const opensOn = `${sunday.day}. ${MONTH_NAMES[sunday.month]}`
            const isUnlocked = isDateReached(sunday.month, sunday.day, now)
            const following = ADVENT_SUNDAYS.at(i + 1) // næste søndag, hvis nogen
            const isToday =
              isUnlocked && !(following && isDateReached(following.month, following.day, now))
            return (
              <Door
                key={sunday.number}
                variant="gift"
                label={label}
                opensOn={opensOn}
                content={ADVENT_CONTENT[sunday.number]}
                isUnlocked={isUnlocked}
                isOpen={isUnlocked && advent.opened.has(sunday.number)}
                isToday={isToday && unlocked < 24}
                onOpen={() => {
                  advent.open(sunday.number)
                  setMessage(null)
                }}
                onLocked={() => setMessage(`Tålmodighed! Gaven til ${label} åbner d. ${opensOn}.`)}
              />
            )
          })}
        </div>
      </section>

      <section className="calendar__grid" aria-label="Låger 1 til 24">
        {DOOR_ORDER.map((day) => {
          const isUnlocked = day <= unlocked
          return (
            <Door
              key={day}
              label={String(day)}
              opensOn={`${day}. december`}
              content={DOOR_CONTENT[day]}
              isUnlocked={isUnlocked}
              // En låge vises kun åben, hvis datoen også er nået.
              isOpen={isUnlocked && days.opened.has(day)}
              isToday={day === unlocked}
              onOpen={() => {
                days.open(day)
                setMessage(null)
              }}
              onLocked={() => setMessage(`Tålmodighed! Låge ${day} åbner d. ${day}. december.`)}
            />
          )
        })}
      </section>
    </main>
  )
}
