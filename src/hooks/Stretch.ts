"use client"

import * as React from "react"

function sizesItself() {
  return typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")
}

export function useStretch(ref: React.RefObject<HTMLTextAreaElement | null>, value: unknown) {
  const fit = React.useCallback(() => {
    const field = ref.current
    if (!field || sizesItself() || !field.getClientRects().length) return
    field.style.height = "auto"
    field.style.height = `${field.scrollHeight}px`
  }, [ref])

  React.useLayoutEffect(fit, [fit, value])

  React.useEffect(() => {
    const field = ref.current
    if (!field || sizesItself()) return
    const observer = new ResizeObserver(fit)
    observer.observe(field)
    return () => observer.disconnect()
  }, [ref, fit])
}
