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
