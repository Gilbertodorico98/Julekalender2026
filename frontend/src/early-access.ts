import { useCallback, useState } from 'react'
import type { DoorContent } from './doors'
import { sha256Hex } from './password'

// Tyvstart: en adventsgave kan åbnes før sin dag med en hemmelig kode.
// Koden står bevidst IKKE her, kun SHA-256 af den normaliserede kode (små bogstaver, ét mellemrum).
// Ny kode: printf '%s' 'ny kode' | sha256sum
export const EARLY_ADVENT = {
  /** Hvilken adventssøndag koden virker for. */
  sunday: 1,
  codeHash: '52c8101fb08b457567931bfbee63e5a64045d97114a2967e4afb9e7b12bf7f9a',
  content: {
    emoji: '🤫',
    title: 'Tyvstart!',
    text: 'Du har tyvstartet. Det kan få konsekvenser, men pakken ligger i vindueskarmen',
  } satisfies DoorContent,
}

export const EARLY_STORAGE_KEY = 'julekalender2026-advent-early'

export function normalizeCode(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function checkEarlyCode(input: string, expectedHash = EARLY_ADVENT.codeHash): Promise<boolean> {
  const value = normalizeCode(input)
  if (!value) return false
  return (await sha256Hex(value)) === expectedHash
}

function load(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

/** Husker om gaven er tyvstartet på denne enhed. */
export function useEarlyUnlock(storageKey: string) {
  const [unlocked, setUnlocked] = useState(() => load(storageKey))
  const unlock = useCallback(() => {
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Storage blokeret: tyvstarten gælder kun i denne session.
    }
    setUnlocked(true)
  }, [storageKey])
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // ignorer
    }
    setUnlocked(false)
  }, [storageKey])
  return { unlocked, unlock, reset }
}
