"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { QuoteSeries } from "@/data/Pulse"

const chartConfig = {
  quotes: {
    label: "Cotizaciones",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const ranges = [
  { value: "90d", label: "Últimos 3 meses", short: "3 meses", days: 90 },
  { value: "30d", label: "Últimos 30 días", short: "30 días", days: 30 },
  { value: "7d", label: "Últimos 7 días", short: "7 días", days: 7 },
]

const formatDay = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("es-MX", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

function Periods({
  value,
  onChange,
  size,
  className,
}: {
  value: string
  onChange: (value: string) => void
  size?: "default" | "lg"
  className?: string
}) {
  return (
    <ToggleGroup
      multiple={false}
      value={[value]}
      onValueChange={(next) => {
        if (next[0]) onChange(next[0])
      }}
      variant="outline"
      size={size}
      className={className}
    >
      {ranges.map((item) => (
        <ToggleGroupItem key={item.value} value={item.value} aria-label={item.label}>
          <span className="@[767px]/card:hidden">{item.short}</span>
          <span className="hidden @[767px]/card:inline">{item.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function ChartAreaInteractive({ data }: { data: QuoteSeries }) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const range = ranges.find((item) => item.value === timeRange) ?? ranges[0]
  const visible = data.slice(-range.days)
  const total = visible.reduce((sum, day) => sum + day.quotes, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Solicitudes de cotización</CardTitle>
        <CardDescription>
          {total} {total === 1 ? "solicitud" : "solicitudes"} en los{" "}
          {range.label.toLowerCase()}
        </CardDescription>
        <CardAction>
          <Periods
            value={timeRange}
            onChange={setTimeRange}
            className="hidden @xl/card:flex @[767px]/card:*:data-[slot=toggle-group-item]:px-4!"
          />
        </CardAction>
      </CardHeader>
      <div className="px-(--card-spacing) @xl/card:hidden">
        <Periods
          value={timeRange}
          onChange={setTimeRange}
          size="lg"
          className="w-full *:data-[slot=toggle-group-item]:flex-1"
        />
      </div>
      <CardContent className="px-2 pt-0 @xl/card:px-6 @xl/card:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-50 w-full @xl/card:h-[250px]"
        >
          <AreaChart data={visible}>
            <defs>
              <linearGradient id="fillQuotes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-quotes)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-quotes)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDay}
            />
            <ChartTooltip
              cursor={false}
              position={{ y: 0 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDay(String(value))}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="quotes"
              type="monotone"
              fill="url(#fillQuotes)"
              stroke="var(--color-quotes)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
