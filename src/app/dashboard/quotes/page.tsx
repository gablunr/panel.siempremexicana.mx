import type { Metadata } from "next"

import { DataTable } from "@/components/sections/shared/data-table"
import { getQuotes } from "@/data/Ledger"

export const metadata: Metadata = { title: "Cotizaciones" }

export default async function Page() {
  const quotes = await getQuotes()

  return <DataTable quotes={quotes} />
}
