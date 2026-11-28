import { useState, type FormEvent, type ReactNode } from 'react'
import { checkPassword, getStoredRole, storeRole, type Role } from './password'
import { Aurora, SelbuStar, WinterScene } from './Decorations'

/** Viser kalenderen først, når et rigtigt kodeord er skrevet (huskes på enheden). */
export function PasswordGate({ children }: { children: (role: Role) => ReactNode }) {
  const [role, setRole] = useState<Role | null>(getStoredRole)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [checking, setChecking] = useState(false)

  if (role) return <>{children(role)}</>

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (checking) return
    setChecking(true)
    const result = await checkPassword(value)
    setChecking(false)
    if (result) {
      storeRole(result)
      setRole(result)
      return
    }
    setError(true)
    setShaking(true)
    setValue('')
  }

  return (
    <main className="gate">
      <Aurora />
      <WinterScene />
      <div className="snow snow--far" aria-hidden="true" />
      <div className="snow" aria-hidden="true" />
      <form className="gate__box" onSubmit={handleSubmit}>
        <SelbuStar className="gate__icon" />
        <h1>Julekalender 2026</h1>
        <label htmlFor="gate-password">Skriv kodeordet for at åbne kalenderen</label>
        <input
          id="gate-password"
          className={shaking ? 'gate__input gate__input--shake' : 'gate__input'}
          onAnimationEnd={() => setShaking(false)}
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={error}
          aria-describedby="gate-error"
          autoFocus
        />
        <p id="gate-error" className="gate__error" role="alert">
          {error ? 'Forkert kodeord. Prøv igen.' : ' '}
        </p>
        <button type="submit" className="gate__button" disabled={checking}>
          Lås op
        </button>
      </form>
    </main>
  )
}
