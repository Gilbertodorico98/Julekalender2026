import { describe, expect, it } from 'vitest'
import {
  ADVENT_SUNDAYS,
  isDateReached,
  isDoorUnlocked,
  nextUnlock,
  msUntilStart,
  parseDateOverride,
  unlockedDoorCount,
} from './calendar-logic'

const utc = (iso: string) => new Date(iso)

describe('unlockedDoorCount', () => {
  it('er 0 før december', () => {
    expect(unlockedDoorCount(utc('2026-11-27T12:00:00Z'))).toBe(0)
    expect(unlockedDoorCount(utc('2025-12-24T12:00:00Z'))).toBe(0)
  })

  it('er 0 ét minut før midnat dansk tid d. 30. november', () => {
    expect(unlockedDoorCount(utc('2026-11-30T22:59:00Z'))).toBe(0)
  })

  it('åbner låge 1 ved midnat dansk tid (23:00 UTC)', () => {
    expect(unlockedDoorCount(utc('2026-11-30T23:00:00Z'))).toBe(1)
  })

  it('bruger dansk tid, ikke UTC', () => {
    // 23:30 UTC d. 4. dec = 00:30 d. 5. dec i Danmark
    expect(unlockedDoorCount(utc('2026-12-04T23:30:00Z'))).toBe(5)
  })

  it('er 24 juleaften og bagefter', () => {
    expect(unlockedDoorCount(utc('2026-12-24T10:00:00Z'))).toBe(24)
    expect(unlockedDoorCount(utc('2026-12-31T10:00:00Z'))).toBe(24)
    expect(unlockedDoorCount(utc('2027-01-15T10:00:00Z'))).toBe(24)
  })
})

describe('isDoorUnlocked', () => {
  const dec5 = utc('2026-12-05T12:00:00Z')

  it('tillader låger op til i dag', () => {
    expect(isDoorUnlocked(1, dec5)).toBe(true)
    expect(isDoorUnlocked(5, dec5)).toBe(true)
  })

  it('afviser fremtidige og ugyldige låger', () => {
    expect(isDoorUnlocked(6, dec5)).toBe(false)
    expect(isDoorUnlocked(24, dec5)).toBe(false)
    expect(isDoorUnlocked(0, dec5)).toBe(false)
    expect(isDoorUnlocked(25, utc('2027-01-01T12:00:00Z'))).toBe(false)
  })
})

describe('msUntilStart', () => {
  it('tæller ned til 1. dec og stopper på 0', () => {
    expect(msUntilStart(utc('2026-11-30T22:00:00Z'))).toBe(60 * 60 * 1000)
    expect(msUntilStart(utc('2026-12-02T00:00:00Z'))).toBe(0)
  })
})

describe('advent', () => {
  it('1. advent åbner ved midnat dansk tid d. 29. november', () => {
    expect(isDateReached(11, 29, utc('2026-11-28T22:59:00Z'))).toBe(false)
    expect(isDateReached(11, 29, utc('2026-11-28T23:00:00Z'))).toBe(true)
  })

  it('3. advent er låst d. 12. dec og åben d. 13. dec', () => {
    expect(isDateReached(12, 13, utc('2026-12-12T12:00:00Z'))).toBe(false)
    expect(isDateReached(12, 13, utc('2026-12-13T12:00:00Z'))).toBe(true)
  })

  it('november-datoer er nået i december, og alt er nået i 2027', () => {
    expect(isDateReached(11, 29, utc('2026-12-02T12:00:00Z'))).toBe(true)
    expect(isDateReached(12, 20, utc('2027-01-02T12:00:00Z'))).toBe(true)
    expect(isDateReached(11, 29, utc('2025-12-30T12:00:00Z'))).toBe(false)
  })

  it('adventssøndagene er søndage', () => {
    for (const s of ADVENT_SUNDAYS) {
      expect(new Date(Date.UTC(2026, s.month - 1, s.day)).getUTCDay()).toBe(0)
    }
  })
})

describe('nextUnlock', () => {
  it('peger på 1. advent før d. 29. november', () => {
    const next = nextUnlock(utc('2026-11-27T12:00:00Z'))
    expect(next?.label).toBe('1. søndag i advent')
    expect(next?.at.toISOString()).toBe('2026-11-28T23:00:00.000Z')
  })

  it('peger på første låge efter 1. advent', () => {
    const next = nextUnlock(utc('2026-11-29T12:00:00Z'))
    expect(next?.label).toBe('Første låge')
    expect(next?.at.toISOString()).toBe('2026-11-30T23:00:00.000Z')
  })

  it('er null når kalenderen er i gang', () => {
    expect(nextUnlock(utc('2026-12-01T12:00:00Z'))).toBeNull()
  })
})

describe('parseDateOverride', () => {
  it('parser gyldig dato', () => {
    expect(unlockedDoorCount(parseDateOverride('?dato=2026-12-05')!)).toBe(5)
  })

  it('ignorerer ugyldige værdier', () => {
    expect(parseDateOverride('')).toBeNull()
    expect(parseDateOverride('?dato=5-12-2026')).toBeNull()
    expect(parseDateOverride('?dato=2026-13-45')).toBeNull()
  })
})
