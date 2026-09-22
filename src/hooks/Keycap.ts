"use client"

import * as React from "react"

const subscribe = () => () => {}

const isApple = () => /Mac|iPhone|iPad/.test(navigator.userAgent)

export function useModKey() {
  return React.useSyncExternalStore(
    subscribe,
    () => (isApple() ? "⌘" : "Ctrl"),
    () => "Ctrl"
  )
}
