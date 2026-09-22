const fence = /^\s*(```|~~~)/

function outsideFences(markdown: string, map: (line: string) => string) {
  let fenced = false
  return markdown
    .split("\n")
    .map((line) => {
      if (fence.test(line)) {
        fenced = !fenced
        return line
      }
      return fenced ? line : map(line)
    })
    .join("\n")
}

const headingMarker = /^(#{1,6})(?=\s)/

export function tidyMarkdown(markdown: string) {
  const levels: number[] = []
  outsideFences(markdown, (line) => {
    const match = headingMarker.exec(line)
    if (match) levels.push(match[1].length)
    return line
  })
  const shift = levels.includes(1) ? 1 : 0
  return outsideFences(markdown, (line) =>
    line.replace(headingMarker, (hashes) =>
      "#".repeat(Math.min(4, Math.max(2, hashes.length + shift)))
    )
  )
}

const markdownSyntax = [
  /^#{1,6}\s/m,
  /^\s*[-*+]\s+\S/m,
  /^\s*\d+[.)]\s+\S/m,
  /^>\s?/m,
  /^\s*(```|~~~)/m,
  /^\s*\|.+\|\s*$/m,
  /^\s*([-*_])\1{2,}\s*$/m,
  /\*\*[^*\n]+\*\*/,
  /~~[^~\n]+~~/,
  /`[^`\n]+`/,
  /!?\[[^\]\n]+\]\([^)\s]+\)/,
]

export const looksLikeMarkdown = (text: string) =>
  markdownSyntax.some((pattern) => pattern.test(text))

export function normalizeHref(value: string) {
  const href = value.trim()
  if (!href) return ""
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return href
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) return `mailto:${href}`
  return `https://${href}`
}
