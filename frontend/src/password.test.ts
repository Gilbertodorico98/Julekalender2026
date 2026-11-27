import { beforeAll, describe, expect, it } from 'vitest'
import { MASTER_HASH, PASSWORD_HASH, checkPassword, sha256Hex } from './password'

// De rigtige kodeord må ikke stå i det offentlige repo, så testene bruger testkodeord.
const TEST_FAMILY = 'nissehue'
const TEST_MASTER = 'julemand'

// De rigtige kodeord kan gives udefra:
// CALENDAR_PASSWORD=... CALENDAR_MASTER_PASSWORD=... npm test
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
const realFamily = env.CALENDAR_PASSWORD
const realMaster = env.CALENDAR_MASTER_PASSWORD

describe('checkPassword', () => {
  let hashes: { family: string; master: string }
  beforeAll(async () => {
    hashes = { family: await sha256Hex(TEST_FAMILY), master: await sha256Hex(TEST_MASTER) }
  })

  it('giver familie-rollen uanset store/små bogstaver og mellemrum', async () => {
    expect(await checkPassword('nissehue', hashes)).toBe('family')
    expect(await checkPassword('Nissehue', hashes)).toBe('family')
    expect(await checkPassword('  NISSEHUE ', hashes)).toBe('family')
  })

  it('giver master-rollen for master-kodeordet', async () => {
    expect(await checkPassword('Julemand', hashes)).toBe('master')
  })

  it('afviser forkerte og tomme kodeord', async () => {
    expect(await checkPassword('nissehu', hashes)).toBeNull()
    expect(await checkPassword('nissehue2', hashes)).toBeNull()
    expect(await checkPassword('', hashes)).toBeNull()
    expect(await checkPassword('   ', hashes)).toBeNull()
  })

  it('hasher kendt værdi korrekt (SHA-256 af "abc")', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('har to gyldige og forskellige hashes', () => {
    expect(PASSWORD_HASH).toMatch(/^[0-9a-f]{64}$/)
    expect(MASTER_HASH).toMatch(/^[0-9a-f]{64}$/)
    expect(MASTER_HASH).not.toBe(PASSWORD_HASH)
  })

  it.skipIf(!realFamily)('det rigtige familiekodeord giver familie-rollen', async () => {
    expect(await checkPassword(realFamily!)).toBe('family')
  })

  it.skipIf(!realMaster)('det rigtige master-kodeord giver master-rollen', async () => {
    expect(await checkPassword(realMaster!)).toBe('master')
  })
})
