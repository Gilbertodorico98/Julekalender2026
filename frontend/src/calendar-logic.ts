export const CALENDAR_YEAR = 2026
export const DOOR_COUNT = 24
const TIME_ZONE = 'Europe/Copenhagen'

/** 1. december 2026 kl. 00:00 dansk tid (CET = UTC+1). */
export const CALENDAR_START = new Date(Date.UTC(CALENDAR_YEAR, 10, 30, 23, 0, 0))

type CalendarDate = { year: number; month: number; day: number }

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

/** Datoen i Danmark for et givet tidspunkt, uanset brugerens egen tidszone. */
export function getCopenhagenDate(now: Date): CalendarDate {
  const parts = formatter.formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}

/** Antal låger der må være åbne på tidspunktet `now` (0–24). */
export function unlockedDoorCount(now: Date): number {
  const { year, month, day } = getCopenhagenDate(now)
  if (year > CALENDAR_YEAR) return DOOR_COUNT
  if (year < CALENDAR_YEAR || month < 12) return 0
  return Math.min(day, DOOR_COUNT)
}

export function isDoorUnlocked(door: number, now: Date): boolean {
  return door >= 1 && door <= unlockedDoorCount(now)
}

/** De fire søndage i advent 2026 (1. advent ligger før 1. december). */
export const ADVENT_SUNDAYS = [
  { number: 1, month: 11, day: 29 },
  { number: 2, month: 12, day: 6 },
  { number: 3, month: 12, day: 13 },
  { number: 4, month: 12, day: 20 },
] as const

/** Er datoen (måned/dag i 2026) nået i dansk tid? */
export function isDateReached(month: number, day: number, now: Date): boolean {
  const d = getCopenhagenDate(now)
  if (d.year !== CALENDAR_YEAR) return d.year > CALENDAR_YEAR
  if (d.month !== month) return d.month > month
  return d.day >= day
}

/** Kl. 00:00 dansk tid på en dato i nov/dec 2026 (vintertid, UTC+1). */
function copenhagenMidnight(month: number, day: number): Date {
  return new Date(Date.UTC(CALENDAR_YEAR, month - 1, day, 0, 0, 0) - 60 * 60 * 1000)
}

/** Næste åbning før kalenderen er i gang, til nedtællingen. `null` fra 1. december. */
export function nextUnlock(now: Date): { label: string; at: Date } | null {
  const first = ADVENT_SUNDAYS[0]
  const events = [
    { label: '1. søndag i advent', at: copenhagenMidnight(first.month, first.day) },
    { label: 'Første låge', at: CALENDAR_START },
  ]
  return events.find((e) => e.at.getTime() > now.getTime()) ?? null
}

export function msUntilStart(now: Date): number {
  return Math.max(0, CALENDAR_START.getTime() - now.getTime())
}

/** Parser `?dato=YYYY-MM-DD` til kl. 12:00 dansk tid den dag. Bruges kun i dev. */
export function parseDateOverride(search: string): Date | null {
  const value = new URLSearchParams(search).get('dato')
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00+01:00`)
  return Number.isNaN(date.getTime()) ? null : date
}
