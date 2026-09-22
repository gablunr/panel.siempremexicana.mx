import "server-only"

import { dayKey, lastDays, monthStarts, startOfDay } from "@/lib/Almanac"
import { createClient, unwrap } from "@/lib/Supabase"

export type Stats = Awaited<ReturnType<typeof getStats>>

export type QuoteSeries = Awaited<ReturnType<typeof getQuoteSeries>>

export async function getStats() {
  const supabase = await createClient()
  const months = monthStarts()
  const quotes = () =>
    supabase.from("cotizaciones").select("id", { count: "exact", head: true })
  const posts = () =>
    supabase.from("articulos").select("id", { count: "exact", head: true })

  const results = await Promise.all([
    quotes().eq("estado", "nueva"),
    quotes().gte("creada_en", months.current.toISOString()),
    quotes()
      .gte("creada_en", months.previous.toISOString())
      .lt("creada_en", months.current.toISOString()),
    quotes().eq("estado", "ganada"),
    quotes().in("estado", ["ganada", "perdida"]),
    posts().eq("estado", "publicado"),
    posts().eq("estado", "borrador"),
  ])

  const [fresh, thisMonth, lastMonth, won, closed, published, drafts] =
    results.map(({ count, error }) => unwrap(count ?? 0, error))

  return { fresh, thisMonth, lastMonth, won, closed, published, drafts }
}

export async function getQuoteSeries(days = 90) {
  const supabase = await createClient()
  const keys = lastDays(days)
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("creada_en")
    .gte("creada_en", startOfDay(keys[0]).toISOString())

  const counts = new Map<string, number>()
  for (const row of unwrap(data ?? [], error)) {
    const key = dayKey(row.creada_en)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return keys.map((date) => ({ date, quotes: counts.get(date) ?? 0 }))
}
