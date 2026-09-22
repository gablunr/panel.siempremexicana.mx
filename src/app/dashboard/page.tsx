import type { Metadata } from "next"

import { ChartAreaInteractive } from "@/components/sections/dashboard/chart-area-interactive"
import { SectionCards } from "@/components/sections/dashboard/section-cards"
import { DataTable } from "@/components/sections/shared/data-table"
import { getQuotes } from "@/data/Ledger"
import { getQuoteSeries, getStats } from "@/data/Pulse"

export const metadata: Metadata = { title: "Resumen" }

export default async function Page() {
  const [stats, series, quotes] = await Promise.all([
    getStats(),
    getQuoteSeries(),
    getQuotes(8),
  ])

  return (
    <>
      <SectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={series} />
      </div>
      <DataTable quotes={quotes} compact />
    </>
  )
}
