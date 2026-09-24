import type { Metadata } from "next"

import { Cascade } from "@/components/sections/dashboard/Cascade"
import { ChartAreaInteractive } from "@/components/sections/dashboard/chart-area-interactive"
import { Prism } from "@/components/sections/dashboard/Prism"
import { SectionCards } from "@/components/sections/dashboard/section-cards"
import { Tides } from "@/components/sections/dashboard/Tides"
import { DataTable } from "@/components/sections/shared/data-table"
import { getQuotes } from "@/data/Ledger"
import { getConversion, getQuoteSeries, getStats } from "@/data/Pulse"

export const metadata: Metadata = { title: "Resumen" }

export default async function Page() {
  const [stats, series, conversion, quotes] = await Promise.all([
    getStats(),
    getQuoteSeries(),
    getConversion(),
    getQuotes(8),
  ])

  return (
    <>
      <SectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={series} />
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-2 @5xl/main:gap-6">
        <Cascade conversion={conversion} />
        <Tides months={conversion.months} />
        <Prism
          title="Por servicio"
          description="Qué piden más y qué se cierra mejor"
          heading="Servicio"
          rows={conversion.services}
        />
        <Prism
          title="Por origen"
          description="De dónde llegan las solicitudes"
          heading="Origen"
          rows={conversion.channels}
        />
      </div>
      <DataTable quotes={quotes} compact />
    </>
  )
}
