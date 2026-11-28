import { describe, expect, it } from 'vitest'
import { EARLY_ADVENT, checkEarlyCode, normalizeCode } from './early-access'
import { sha256Hex } from './password'

// Den rigtige kode står ikke i repoet: CALENDAR_EARLY_CODE=... npm test
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
const realCode = env.CALENDAR_EARLY_CODE

describe('tyvstart-kode', () => {
  it('normaliserer store bogstaver og mellemrum', () => {
    expect(normalizeCode('  Glædelig   JUL ')).toBe('glædelig jul')
  })

  it('godkender kun den rigtige kode (testkode)', async () => {
    const hash = await sha256Hex('rød nisse')
    expect(await checkEarlyCode('Rød  Nisse', hash)).toBe(true)
    expect(await checkEarlyCode('rød nisser', hash)).toBe(false)
    expect(await checkEarlyCode('', hash)).toBe(false)
  })

  it('gælder 1. søndag i advent og har tyvstart-teksten', () => {
    expect(EARLY_ADVENT.sunday).toBe(1)
    expect(EARLY_ADVENT.content.text).toContain('Du har tyvstartet')
    expect(EARLY_ADVENT.codeHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it.skipIf(!realCode)('den rigtige kode matcher hashen', async () => {
    expect(await checkEarlyCode(realCode!)).toBe(true)
    expect(await checkEarlyCode(realCode!.toUpperCase())).toBe(true)
  })
})
