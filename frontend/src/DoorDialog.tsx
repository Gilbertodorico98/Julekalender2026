import { useEffect, useRef } from 'react'
import type { DoorContent } from './doors'

type Props = {
  /** Fx "Låge 10" eller "1. søndag i advent". */
  name: string
  content: DoorContent
  onClose: () => void
}

/**
 * Popup med lågens fulde indhold. Egen overlay i stedet for <dialog>,
 * fordi <dialog> først virker fra iOS 15.4.
 */
export function DoorDialog({ name, content, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.() // fokus tilbage til lågen
    }
  }, [onClose])

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-text"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="dialog__name">{name}</p>
        <div className="dialog__emoji" aria-hidden="true">
          {content.emoji}
        </div>
        <h2 id="dialog-title" className="dialog__title">
          {content.title}
        </h2>
        <p id="dialog-text" className="dialog__text">
          {content.text}
        </p>
        <button ref={closeRef} type="button" className="dialog__close" onClick={onClose}>
          Luk
        </button>
      </div>
    </div>
  )
}
