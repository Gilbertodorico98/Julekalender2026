// Kodeordet står bevidst IKKE her, kun dets SHA-256-hash (af kodeordet med små bogstaver).
// Nyt kodeord: kør  printf '%s' nytkodeord | sha256sum  og indsæt hashen herunder.
export const PASSWORD_HASH = '7dc6d0c69c842a63e02641c7724d24aaecafb36cc2b1391ebc896b8c2d5918a3'

export const ACCESS_STORAGE_KEY = 'julekalender2026-access'

/** Normaliserer så iPhones automatiske stort forbogstav og ekstra mellemrum ikke spænder ben. */
export function normalizePassword(input: string): string {
  return input.trim().toLowerCase()
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text) // UTF-8, så æøå hashes korrekt
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkPassword(input: string, expectedHash = PASSWORD_HASH): Promise<boolean> {
  const value = normalizePassword(input)
  if (!value) return false
  return (await sha256Hex(value)) === expectedHash
}

export function hasStoredAccess(): boolean {
  try {
    return localStorage.getItem(ACCESS_STORAGE_KEY) === PASSWORD_HASH
  } catch {
    return false
  }
}

export function storeAccess() {
  try {
    localStorage.setItem(ACCESS_STORAGE_KEY, PASSWORD_HASH)
  } catch {
    // Storage blokeret: man er logget ind i denne session og skal logge ind igen næste gang.
  }
}
