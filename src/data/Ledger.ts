import "server-only"

import type { QuoteStatus } from "@/data/Lexicon"
import { createClient, readAll, unwrap } from "@/lib/Supabase"

export type Quote = {
  id: string
  nombre: string
  correo: string
  telefono: string | null
  servicio: string
  plazo: string
  presupuesto: string
  estado: QuoteStatus
  notas: string | null
  origen_url: string | null
  creada_en: string
}

const columns =
  "id, nombre, correo, telefono, servicio, plazo, presupuesto, estado, notas, origen_url, creada_en"

export async function getQuotes(limit?: number) {
  const supabase = await createClient()
  const query = () =>
    supabase
      .from("cotizaciones")
      .select(columns)
      .order("creada_en", { ascending: false })
      .order("id")

  if (!limit) return readAll<Quote>((from, to) => query().range(from, to))

  const { data, error } = await query().limit(limit)
  return unwrap(data ?? [], error) as Quote[]
}
