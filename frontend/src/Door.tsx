import { useState } from 'react'
import type { DoorContent } from './doors'

type Props = {
  day: number
  content: DoorContent
  isOpen: boolean
  isUnlocked: boolean
  isToday: boolean
  onOpen: (day: number) => void
  onLocked: (day: number) => void
}

export function Door({ day, content, isOpen, isUnlocked, isToday, onOpen, onLocked }: Props) {
  const [shaking, setShaking] = useState(false)

  function handleClick() {
    if (isOpen) return
    if (isUnlocked) {
      onOpen(day)
      return
    }
    onLocked(day)
    setShaking(true)
  }

  const classes = [
    'door',
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
      onAnimationEnd={() => setShaking(false)}
      aria-label={
        isOpen
          ? `Låge ${day}: ${content.title}`
          : isUnlocked
            ? `Åbn låge ${day}`
            : `Låge ${day} er låst indtil ${day}. december`
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
        <span className="door__number">{day}</span>
        {!isUnlocked && <span className="door__lock">🔒</span>}
      </span>
    </button>
  )
}
