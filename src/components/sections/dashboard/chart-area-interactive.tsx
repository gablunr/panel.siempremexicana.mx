"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  { value: "90d", label: "Últimos 3 meses", days: 90 },
  { value: "30d", label: "Últimos 30 días", days: 30 },
  { value: "7d", label: "Últimos 7 días", days: 7 },
]

const formatDay = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("es-MX", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })

export function ChartAreaInteractive({ data }: { data: QuoteSeries }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

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
          <ToggleGroup
            multiple={false}
            value={[timeRange]}
            onValueChange={(value) => setTimeRange(value[0] ?? "90d")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            {ranges.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value}>
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) setTimeRange(value)
            }}
            items={ranges}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Elige un periodo"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ranges.map((item) => (
                <SelectItem key={item.value} value={item.value} className="rounded-lg">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
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
