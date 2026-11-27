import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { ADVENT_CONTENT, DOOR_CONTENT, DOOR_ORDER, type DoorContent } from './doors'
import { Door } from './Door'
import { DoorDialog } from './DoorDialog'
import {
  ADVENT_SUNDAYS,
  isDateReached,
  nextUnlock,
  parseDateOverride,
  unlockedDoorCount,
} from './calendar-logic'
import { ADVENT_STORAGE_KEY, DAY_STORAGE_KEY, useOpenedDoors } from './use-opened-doors'
import { leaveMaster } from './password'

// Kun i udvikling: ?dato=2026-12-05 lader som om det er den dag. Fjernes i produktionsbuild.
const dateOverride = import.meta.env.DEV ? parseDateOverride(window.location.search) : null

const MONTH_NAMES: Record<number, string> = { 11: 'november', 12: 'december' }

/** Varighed af lågens flip (se .door__front transition i App.css). */
const FLIP_MS = 700

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

/** Valgmuligheder i master-visningens "Vis som dato". */
const MASTER_VIEW_OPTIONS = [
  { value: 'all', label: 'Alt låst op' },
  { value: '2026-11-28', label: '28. nov' },
  { value: '2026-11-29', label: '29. nov (1. advent)' },
  ...Array.from({ length: 24 }, (_, i) => ({
    value: `2026-12-${String(i + 1).padStart(2, '0')}`,
    label: `${i + 1}. dec`,
  })),
]

/** "Alt låst op" = 2. juledag, hvor alle låger og adventsgaver er nået. */
function masterViewDate(value: string): Date {
  return new Date(`${value === 'all' ? '2026-12-26' : value}T12:00:00+01:00`)
}

export default function App({ master = false }: { master?: boolean }) {
  const realNow = useNow()
  const [viewValue, setViewValue] = useState('all')
  const now = master ? masterViewDate(viewValue) : realNow
  const unlocked = unlockedDoorCount(now)
  // Master-visningen gemmer sine åbnede låger for sig, så de rigtige låger ikke er åbnet i forvejen.
  const days = useOpenedDoors(master ? `${DAY_STORAGE_KEY}-master` : DAY_STORAGE_KEY)
  const advent = useOpenedDoors(master ? `${ADVENT_STORAGE_KEY}-master` : ADVENT_STORAGE_KEY)
  const [message, setMessage] = useState<string | null>(null)
  const [shown, setShown] = useState<{ name: string; content: DoorContent } | null>(null)
  const showTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(showTimer.current), [])

  const closeDialog = useCallback(() => setShown(null), [])

  /** Viser indholdet i popup'en; efter et nyt åbn venter vi på flip-animationen. */
  function show(name: string, content: DoorContent, afterFlip: boolean) {
    window.clearTimeout(showTimer.current)
    setMessage(null)
    if (!afterFlip) return setShown({ name, content })
    showTimer.current = window.setTimeout(() => setShown({ name, content }), FLIP_MS)
  }

  const next = nextUnlock(now)

  return (
    <main className="calendar">
      <div className="snow" aria-hidden="true" />
      {master && (
        <section className="master" aria-label="Master-visning">
          <p className="master__title">
            <strong>Master-visning</strong> – familien ser kun lågerne på deres dag
          </p>
          <div className="master__controls">
            <label className="master__field">
              Vis som dato
              <select value={viewValue} onChange={(e) => setViewValue(e.target.value)}>
                {MASTER_VIEW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="master__button"
              onClick={() => {
                days.reset()
                advent.reset()
                setShown(null)
              }}
            >
              Luk alle låger igen
            </button>
            <button
              type="button"
              className="master__button master__button--exit"
              onClick={() => {
                leaveMaster()
                window.location.reload()
              }}
            >
              Afslut master
            </button>
          </div>
        </section>
      )}
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
            const following = ADVENT_SUNDAYS[i + 1] as (typeof ADVENT_SUNDAYS)[number] | undefined // næste søndag, hvis nogen (ikke .at(): kræver iOS 15.4)
            const isToday =
              isUnlocked && !(following && isDateReached(following.month, following.day, now))
            return (
              <Door
                key={sunday.number}
                variant="gift"
                label={label}
                name={label}
                opensOn={opensOn}
                content={ADVENT_CONTENT[sunday.number]}
                isUnlocked={isUnlocked}
                isOpen={isUnlocked && advent.opened.has(sunday.number)}
                isToday={isToday && unlocked < 24}
                onOpen={() => {
                  advent.open(sunday.number)
                  show(label, ADVENT_CONTENT[sunday.number], true)
                }}
                onShow={() => show(label, ADVENT_CONTENT[sunday.number], false)}
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
              name={`Låge ${day}`}
              opensOn={`${day}. december`}
              content={DOOR_CONTENT[day]}
              isUnlocked={isUnlocked}
              // En låge vises kun åben, hvis datoen også er nået.
              isOpen={isUnlocked && days.opened.has(day)}
              isToday={day === unlocked}
              onOpen={() => {
                days.open(day)
                show(`Låge ${day}`, DOOR_CONTENT[day], true)
              }}
              onShow={() => show(`Låge ${day}`, DOOR_CONTENT[day], false)}
              onLocked={() => setMessage(`Tålmodighed! Låge ${day} åbner d. ${day}. december.`)}
            />
          )
        })}
      </section>

      {shown && <DoorDialog name={shown.name} content={shown.content} onClose={closeDialog} />}
    </main>
  )
}
