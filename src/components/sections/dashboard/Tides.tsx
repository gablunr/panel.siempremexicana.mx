"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { Conversion } from "@/data/Pulse"
import { formatMonth } from "@/lib/Almanac"

const chartConfig = {
  received: { label: "Recibidas", color: "var(--chart-4)" },
  won: { label: "Cerradas", color: "var(--chart-1)" },
} satisfies ChartConfig

export function Tides({ months }: { months: Conversion["months"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes y ventas por mes</CardTitle>
        <CardDescription>
          Los meses recientes todavía tienen cotizaciones en curso
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-2 @xl/main:px-(--card-spacing)">
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <BarChart data={months}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatMonth}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatMonth(String(value))}
                  indicator="dot"
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="received" fill="var(--color-received)" radius={4} />
            <Bar dataKey="won" fill="var(--color-won)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
