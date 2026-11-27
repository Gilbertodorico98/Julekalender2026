// Kodeordene står bevidst IKKE her, kun deres SHA-256-hash (af kodeordet med små bogstaver).
// Nyt kodeord: kør  printf '%s' nytkodeord | sha256sum  og indsæt hashen herunder.
/** Familiens kodeord: lågerne åbner på deres dag. */
export const PASSWORD_HASH = '7dc6d0c69c842a63e02641c7724d24aaecafb36cc2b1391ebc896b8c2d5918a3'
/** Master-kodeord: alle låger kan åbnes med det samme, til at tjekke indholdet. */
export const MASTER_HASH = '49b191cf813fa62a2a280ca07b6812df23be3f3c2437604e7fcd2dee72f1f527'

export const ACCESS_STORAGE_KEY = 'julekalender2026-access'
export const MASTER_STORAGE_KEY = 'julekalender2026-master'

export type Role = 'family' | 'master'

type Hashes = { family: string; master: string }
const DEFAULT_HASHES: Hashes = { family: PASSWORD_HASH, master: MASTER_HASH }

/** Normaliserer så iPhones automatiske stort forbogstav og ekstra mellemrum ikke spænder ben. */
export function normalizePassword(input: string): string {
  return input.trim().toLowerCase()
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text) // UTF-8, så æøå hashes korrekt
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Hvilken rolle giver kodeordet? `null` hvis det er forkert. */
export async function checkPassword(input: string, hashes: Hashes = DEFAULT_HASHES): Promise<Role | null> {
  const value = normalizePassword(input)
  if (!value) return null
  const hash = await sha256Hex(value)
  if (hash === hashes.master) return 'master'
  if (hash === hashes.family) return 'family'
  return null
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage blokeret: adgangen gælder kun i denne session.
  }
}

/** Den gemte rolle på denne enhed, hvis man har logget ind før. */
export function getStoredRole(): Role | null {
  if (read(MASTER_STORAGE_KEY) === MASTER_HASH) return 'master'
  if (read(ACCESS_STORAGE_KEY) === PASSWORD_HASH) return 'family'
  return null
}

export function storeRole(role: Role) {
  // Master giver også almindelig adgang, så "Afslut master" lander i den normale kalender.
  write(ACCESS_STORAGE_KEY, PASSWORD_HASH)
  write(MASTER_STORAGE_KEY, role === 'master' ? MASTER_HASH : null)
}

export function leaveMaster() {
  write(MASTER_STORAGE_KEY, null)
}
