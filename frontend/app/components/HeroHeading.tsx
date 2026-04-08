"use client"

import { useRef, useState, useCallback } from "react"

const FROM = "Hej, tu Kacper."
const TO = "Hello World."
const CHAR_DELAY = 35 // ms per character
// Longest string determines the reserved width so layout never shifts
// and hover target never shrinks mid-animation.
const LONGEST = FROM.length >= TO.length ? FROM : TO

export default function HeroHeading() {
  const [displayed, setDisplayed] = useState(FROM)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAnim = () => {
    if (animRef.current) clearTimeout(animRef.current)
  }

  const animate = useCallback((from: string, to: string) => {
    clearAnim()
    let step = 0
    const totalSteps = from.length + to.length

    const tick = () => {
      step++
      if (step <= from.length) {
        setDisplayed(from.slice(0, from.length - step))
      } else if (step <= totalSteps) {
        const charIndex = step - from.length
        setDisplayed(to.slice(0, charIndex))
      } else {
        return
      }
      animRef.current = setTimeout(tick, CHAR_DELAY)
    }

    animRef.current = setTimeout(tick, CHAR_DELAY)
  }, [])

  const handleEnter = useCallback(() => {
    animate(displayed, TO)
  }, [animate, displayed])

  const handleLeave = useCallback(() => {
    animate(displayed, FROM)
  }, [animate, displayed])

  return (
    <h1
      id="hero-heading"
      className="font-display text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight"
    >
      <span
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="relative inline-block align-baseline text-gold brightness-125 cursor-default"
      >
        {/* Invisible placeholder reserves width = longest text, so hover zone
            stays stable and prevents CLS. */}
        <span className="invisible whitespace-pre" aria-hidden="true">
          {LONGEST}
        </span>
        <span className="absolute inset-0 whitespace-pre">{displayed}</span>
      </span>
      {" "}
      Tu lądują rzeczy, które warto ugotować.
    </h1>
  )
}
