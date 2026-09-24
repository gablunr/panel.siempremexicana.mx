"use client"

import * as React from "react"

const spaceBelow = 88

export function useBrim(
  ref: React.RefObject<HTMLElement | null>,
  fallback: number,
  enabled: boolean
) {
  const [size, setSize] = React.useState(fallback)

  React.useLayoutEffect(() => {
    const box = ref.current
    if (!enabled || !box) return

    const measure = () => {
      if (!box.offsetParent) return setSize(fallback)
      const row = box.querySelector("[data-row]")
      if (!row) return
      const { top, height } = row.getBoundingClientRect()
      const free = window.innerHeight - (top + window.scrollY) - spaceBelow
      setSize(Math.max(fallback, Math.floor(free / height)))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [ref, fallback, enabled])

  return size
}
