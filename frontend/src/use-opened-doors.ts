import { useCallback, useState } from 'react'

const STORAGE_KEY = 'julekalender2026-opened'

function load(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [])
  } catch {
    return new Set()
  }
}

function save(doors: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...doors]))
  } catch {
    // Storage blokeret (fx privat vindue): lågen er åben i denne session.
  }
}

/** Husker hvilke låger brugeren har åbnet, på tværs af besøg. */
export function useOpenedDoors() {
  const [opened, setOpened] = useState(load)

  const open = useCallback((door: number) => {
    setOpened((prev) => {
      if (prev.has(door)) return prev
      const next = new Set(prev).add(door)
      save(next)
      return next
    })
  }, [])

  return { opened, open }
}
