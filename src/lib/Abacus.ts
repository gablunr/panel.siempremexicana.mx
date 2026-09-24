const countFormat = new Intl.NumberFormat("es-MX")

const percentFormat = new Intl.NumberFormat("es-MX", {
  style: "percent",
  maximumFractionDigits: 0,
})

const moneyFormat = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  notation: "compact",
  maximumFractionDigits: 1,
})

export const formatCount = (value: number) => countFormat.format(value)

export const formatShare = (part: number, whole: number) =>
  whole ? percentFormat.format(part / whole) : "—"

export const formatMoney = (value: number) => moneyFormat.format(value)
