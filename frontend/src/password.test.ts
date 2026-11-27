import { beforeAll, describe, expect, it } from 'vitest'
import { PASSWORD_HASH, checkPassword, sha256Hex } from './password'

// Det rigtige kodeord må ikke stå i det offentlige repo, så testene bruger et testkodeord.
const TEST_PASSWORD = 'nissehue'

// Det rigtige kodeord kan gives udefra: CALENDAR_PASSWORD=... npm test
const realPassword = (globalThis as { process?: { env: Record<string, string | undefined> } })
  .process?.env.CALENDAR_PASSWORD

describe('checkPassword', () => {
  let testHash: string
  beforeAll(async () => {
    testHash = await sha256Hex(TEST_PASSWORD)
  })

  it('godkender kodeordet uanset store/små bogstaver og mellemrum', async () => {
    expect(await checkPassword('nissehue', testHash)).toBe(true)
    expect(await checkPassword('Nissehue', testHash)).toBe(true)
    expect(await checkPassword('  NISSEHUE ', testHash)).toBe(true)
  })

  it('afviser forkerte og tomme kodeord', async () => {
    expect(await checkPassword('nissehu', testHash)).toBe(false)
    expect(await checkPassword('nissehue2', testHash)).toBe(false)
    expect(await checkPassword('', testHash)).toBe(false)
    expect(await checkPassword('   ', testHash)).toBe(false)
  })

  it('hasher kendt værdi korrekt (SHA-256 af "abc")', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('har en gyldig hash som standard', () => {
    expect(PASSWORD_HASH).toMatch(/^[0-9a-f]{64}$/)
  })

  it.skipIf(!realPassword)('det rigtige kodeord matcher hashen', async () => {
    expect(await checkPassword(realPassword!)).toBe(true)
  })
})
