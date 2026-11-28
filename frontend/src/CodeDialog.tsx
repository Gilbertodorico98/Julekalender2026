import { useEffect, useRef, useState, type FormEvent } from 'react'
import { checkEarlyCode } from './early-access'

type Props = {
  /** Fx "1. søndag i advent". */
  name: string
  onSuccess: () => void
  onCancel: () => void
}

/** Popup hvor man kan skrive den hemmelige kode og tyvstarte en gave. */
export function CodeDialog({ name, onSuccess, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [onCancel])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (checking) return
    setChecking(true)
    const ok = await checkEarlyCode(value)
    setChecking(false)
    if (ok) return onSuccess()
    setError(true)
    setShaking(true)
    setValue('')
  }

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="code-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <p className="dialog__name">{name}</p>
        <div className="dialog__emoji" aria-hidden="true">
          🔐
        </div>
        <h2 id="code-title" className="dialog__title">
          Kan du ikke vente?
        </h2>
        <label htmlFor="early-code" className="dialog__text dialog__label">
          Skriv den hemmelige kode for at tyvstarte
        </label>
        <input
          ref={inputRef}
          id="early-code"
          className={shaking ? 'gate__input gate__input--shake' : 'gate__input'}
          onAnimationEnd={() => setShaking(false)}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={error}
          aria-describedby="early-code-error"
        />
        <p id="early-code-error" className="dialog__error" role="alert">
          {error ? 'Forkert kode' : ' '}
        </p>
        <button type="submit" className="dialog__close" disabled={checking}>
          Åbn gaven
        </button>
        <button type="button" className="dialog__secondary" onClick={onCancel}>
          Annullér
        </button>
      </form>
    </div>
  )
}
