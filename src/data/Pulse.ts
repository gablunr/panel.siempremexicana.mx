import "server-only"

import { cache } from "react"

import { siteUrl } from "@/data/Compass"
import {
  budgetEstimates,
  campaignLabels,
  directLabel,
  referrerLabels,
  type QuoteStatus,
} from "@/data/Lexicon"
import { dayKey, lastDays, lastMonths, monthKey, monthStarts } from "@/lib/Almanac"
import { createClient, readAll, unwrap } from "@/lib/Supabase"

export type Stats = Awaited<ReturnType<typeof getStats>>

export type QuoteSeries = Awaited<ReturnType<typeof getQuoteSeries>>

export type Conversion = Awaited<ReturnType<typeof getConversion>>

export type Breakdown = Conversion["services"]

type Lead = {
  estado: QuoteStatus
  servicio: string
  presupuesto: string
  origen_url: string | null
  referrer: string | null
  creada_en: string
}

const getLeads = cache(async () => {
  const supabase = await createClient()
  return readAll<Lead>((from, to) =>
    supabase
      .from("cotizaciones")
      .select("estado, servicio, presupuesto, origen_url, referrer, creada_en")
      .order("creada_en")
      .order("id")
      .range(from, to)
  )
})

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
  const counts = new Map<string, number>()
  for (const lead of await getLeads()) {
    const key = dayKey(lead.creada_en)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return lastDays(days).map((date) => ({ date, quotes: counts.get(date) ?? 0 }))
}

const hostOf = (url: string | null) =>
  url && URL.canParse(url) ? new URL(url).hostname.replace(/^www\./, "") : null

function channelOf(lead: Lead) {
  const campaign =
    lead.origen_url && URL.canParse(lead.origen_url)
      ? new URL(lead.origen_url).searchParams.get("utm_source")?.toLowerCase()
      : null
  if (campaign) return campaignLabels[campaign] ?? campaign

  const host = hostOf(lead.referrer)
  if (!host || host === hostOf(siteUrl)) return directLabel
  return referrerLabels.find(([pattern]) => pattern.test(host))?.[1] ?? host
}

function tally(leads: Lead[], labelOf: (lead: Lead) => string) {
  const groups = new Map<string, { label: string; total: number; won: number; closed: number }>()
  for (const lead of leads) {
    const label = labelOf(lead)
    const group = groups.get(label) ?? { label, total: 0, won: 0, closed: 0 }
    group.total++
    if (lead.estado === "ganada") group.won++
    if (lead.estado === "ganada" || lead.estado === "perdida") group.closed++
    groups.set(label, group)
  }
  return [...groups.values()].sort((a, b) => b.total - a.total)
}

const estimate = (leads: Lead[]) =>
  leads.reduce((sum, lead) => sum + (budgetEstimates[lead.presupuesto] ?? 0), 0)

export async function getConversion() {
  const leads = await getLeads()
  const inStatus = (...statuses: QuoteStatus[]) =>
    leads.filter((lead) => statuses.includes(lead.estado))

  const won = inStatus("ganada")
  const byMonth = new Map(tally(leads, (lead) => monthKey(lead.creada_en)).map((group) => [group.label, group]))
  const months = lastMonths(6).map((month) => ({
    month,
    received: byMonth.get(month)?.total ?? 0,
    won: byMonth.get(month)?.won ?? 0,
  }))

  return {
    total: leads.length,
    won: won.length,
    stages: [
      { label: "Recibidas", value: leads.length },
      { label: "Atendidas", value: leads.length - inStatus("nueva").length },
      { label: "Con propuesta", value: inStatus("cotizada", "ganada").length },
      { label: "Ventas cerradas", value: won.length },
    ],
    wonValue: estimate(won),
    openValue: estimate(inStatus("contactada", "cotizada")),
    months: months.slice(Math.max(months.findIndex((month) => month.received), 0)),
    services: tally(leads, (lead) => lead.servicio),
    channels: tally(leads, channelOf),
  }
}
