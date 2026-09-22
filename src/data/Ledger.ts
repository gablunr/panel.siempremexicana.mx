import "server-only"

import type { QuoteStatus } from "@/data/Lexicon"
import { createClient, unwrap } from "@/lib/Supabase"

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
  const query = supabase
    .from("cotizaciones")
    .select(columns)
    .order("creada_en", { ascending: false })

  const { data, error } = await (limit ? query.limit(limit) : query)
  return unwrap(data ?? [], error) as Quote[]
}
