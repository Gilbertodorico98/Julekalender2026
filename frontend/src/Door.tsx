import { useState } from 'react'
import type { DoorContent } from './doors'

type Props = {
  /** Tekst på lågens forside, fx "7" eller "1. søndag i advent". */
  label: string
  /** Navn til skærmlæser, fx "Låge 7" eller "1. søndag i advent". */
  name: string
  /** Hvornår lågen åbner, fx "7. december". Bruges i besked og skærmlæser. */
  opensOn: string
  content: DoorContent
  isOpen: boolean
  isUnlocked: boolean
  isToday: boolean
  variant?: 'day' | 'gift'
  onOpen: () => void
  onLocked: () => void
}

export function Door({
  label,
  name,
  opensOn,
  content,
  isOpen,
  isUnlocked,
  isToday,
  variant = 'day',
  onOpen,
  onLocked,
}: Props) {
  const [shaking, setShaking] = useState(false)

  function handleClick() {
    if (isOpen) return
    if (isUnlocked) {
      onOpen()
      return
    }
    onLocked()
    setShaking(true)
  }

  const classes = [
    'door',
    variant === 'gift' && 'door--gift',
    isOpen && 'door--open',
    !isUnlocked && 'door--locked',
    isToday && !isOpen && 'door--today',
    shaking && 'door--shake',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      onAnimationEnd={(e) => {
        if (e.animationName === 'shake') setShaking(false)
      }}
      aria-label={
        isOpen
          ? `${name}: ${content.title}`
          : isUnlocked
            ? `Åbn ${name}`
            : `${name} er låst indtil ${opensOn}`
      }
    >
      <span className="door__inside" aria-hidden={!isOpen}>
        {isOpen && (
          <>
            <span className="door__emoji">{content.emoji}</span>
            <strong className="door__title">{content.title}</strong>
            <span className="door__text">{content.text}</span>
          </>
        )}
      </span>
      <span className="door__front" aria-hidden="true">
        {variant === 'gift' && <span className="door__bow">🎀</span>}
        <span className="door__number">{label}</span>
        {!isUnlocked && <span className="door__lock">🔒</span>}
      </span>
    </button>
  )
}
