"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"

const subscribe = () => () => {}

export function Tint() {
  const { resolvedTheme } = useTheme()
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  if (!hydrated) return null

  return (
    <meta
      name="theme-color"
      content={resolvedTheme === "dark" ? "#0e1b1e" : "#fcfbf8"}
    />
  )
}
