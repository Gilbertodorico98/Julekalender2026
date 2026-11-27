import { useCallback, useState } from 'react'

export const DAY_STORAGE_KEY = 'julekalender2026-opened'
export const ADVENT_STORAGE_KEY = 'julekalender2026-advent-opened'

function load(storageKey: string): Set<number> {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [])
  } catch {
    return new Set()
  }
}

function save(storageKey: string, doors: Set<number>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...doors]))
  } catch {
    // Storage blokeret (fx privat vindue): lågen er åben i denne session.
  }
}

/** Husker hvilke låger brugeren har åbnet, på tværs af besøg. */
export function useOpenedDoors(storageKey: string) {
  const [opened, setOpened] = useState(() => load(storageKey))

  const open = useCallback(
    (door: number) => {
      setOpened((prev) => {
        if (prev.has(door)) return prev
        const next = new Set(prev).add(door)
        save(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  /** Lukker alle låger igen (bruges i master-visningen). */
  const reset = useCallback(() => {
    const empty = new Set<number>()
    save(storageKey, empty)
    setOpened(empty)
  }, [storageKey])

  return { opened, open, reset }
}
