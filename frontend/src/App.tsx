import { useEffect, useState } from 'react'
import './App.css'
import { DOOR_CONTENT, DOOR_ORDER } from './doors'
import { Door } from './Door'
import { msUntilStart, parseDateOverride, unlockedDoorCount } from './calendar-logic'
import { useOpenedDoors } from './use-opened-doors'

// Kun i udvikling: ?dato=2026-12-05 lader som om det er den dag. Fjernes i produktionsbuild.
const dateOverride = import.meta.env.DEV ? parseDateOverride(window.location.search) : null

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
  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${days} dage, ${hours} timer, ${minutes} min. og ${seconds} sek.`
}

export default function App() {
  const now = useNow()
  const unlocked = unlockedDoorCount(now)
  const { opened, open } = useOpenedDoors()
  const [message, setMessage] = useState<string | null>(null)

  const countdown = msUntilStart(now)

  return (
    <main className="calendar">
      <div className="snow" aria-hidden="true" />
      <header className="calendar__header">
        <h1>Julekalender 2026</h1>
        {countdown > 0 ? (
          <p className="calendar__status">
            Første låge åbner om <strong>{formatCountdown(countdown)}</strong>
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

      <section className="calendar__grid">
        {DOOR_ORDER.map((day) => {
          const isUnlocked = day <= unlocked
          return (
            <Door
              key={day}
              day={day}
              content={DOOR_CONTENT[day]}
              isUnlocked={isUnlocked}
              // En låge vises kun åben, hvis datoen også er nået.
              isOpen={isUnlocked && opened.has(day)}
              isToday={day === unlocked && countdown === 0}
              onOpen={(d) => {
                open(d)
                setMessage(null)
              }}
              onLocked={(d) => setMessage(`Tålmodighed! Låge ${d} åbner d. ${d}. december.`)}
            />
          )
        })}
      </section>
    </main>
  )
}
