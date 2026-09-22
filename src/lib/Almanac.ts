export const timeZone = "America/Mexico_City"

const utcOffset = "-06:00"

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const dateFormat = new Intl.DateTimeFormat("es-MX", {
  timeZone,
  dateStyle: "medium",
})

const dateTimeFormat = new Intl.DateTimeFormat("es-MX", {
  timeZone,
  dateStyle: "medium",
  timeStyle: "short",
})

export const dayKey = (value: string | Date) => dayFormat.format(new Date(value))

export const formatDate = (value: string | Date) =>
  dateFormat.format(new Date(value))

export const formatDateTime = (value: string | Date) =>
  dateTimeFormat.format(new Date(value))

export const startOfDay = (key: string) => new Date(`${key}T00:00:00${utcOffset}`)

export const middayOf = (key: string) => new Date(`${key}T12:00:00${utcOffset}`)

export function lastDays(count: number, now = new Date()) {
  const midday = middayOf(dayKey(now)).getTime()
  return Array.from({ length: count }, (_, index) =>
    dayKey(new Date(midday - (count - 1 - index) * 86_400_000))
  )
}

export function monthStarts(now = new Date()) {
  const [year, month] = dayKey(now).split("-").map(Number)
  const [previousYear, previousMonth] =
    month === 1 ? [year - 1, 12] : [year, month - 1]
  const firstOf = (y: number, m: number) =>
    startOfDay(`${y}-${String(m).padStart(2, "0")}-01`)
  return {
    current: firstOf(year, month),
    previous: firstOf(previousYear, previousMonth),
  }
}
