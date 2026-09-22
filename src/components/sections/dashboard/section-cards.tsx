import {
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Stats } from "@/data/Pulse"

function monthlyTrend(thisMonth: number, lastMonth: number) {
  if (!lastMonth) {
    return { badge: null, icon: MinusIcon, headline: "Todavía no hay con qué comparar" }
  }
  const change = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
  if (change === 0) {
    return { badge: "0%", icon: MinusIcon, headline: "Igual que el mes pasado" }
  }
  return {
    badge: `${change > 0 ? "+" : ""}${change}%`,
    icon: change > 0 ? TrendingUpIcon : TrendingDownIcon,
    headline: `${change > 0 ? "Sube" : "Baja"} ${Math.abs(change)}% respecto al mes pasado`,
  }
}

export function SectionCards({ stats }: { stats: Stats }) {
  const trend = monthlyTrend(stats.thisMonth, stats.lastMonth)
  const winRate = stats.closed
    ? Math.round((stats.won / stats.closed) * 100)
    : null

  const cards = [
    {
      label: "Sin contactar",
      value: stats.fresh,
      headline: stats.fresh ? "Esperan una primera respuesta" : "Todas tienen seguimiento",
      detail: "Cotizaciones que nadie ha atendido",
    },
    {
      label: "Cotizaciones este mes",
      value: stats.thisMonth,
      badge: trend.badge,
      icon: trend.icon,
      headline: trend.headline,
      detail: `${stats.lastMonth} el mes pasado`,
    },
    {
      label: "Ventas cerradas",
      value: stats.won,
      badge: winRate === null ? null : `${winRate}%`,
      icon: TrophyIcon,
      headline:
        winRate === null
          ? "Aún no hay ventas cerradas ni perdidas"
          : `Tasa de cierre del ${winRate}%`,
      detail: `De ${stats.closed} cotizaciones con resultado`,
    },
    {
      label: "Artículos publicados",
      value: stats.published,
      headline: `${stats.drafts} ${stats.drafts === 1 ? "borrador" : "borradores"} sin publicar`,
      detail: "Visibles en el blog",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:gap-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map(({ label, value, badge, icon: Icon, headline, detail }) => (
        <Card
          key={label}
          className="@container/card [--card-spacing:--spacing(3)] @xl/main:[--card-spacing:--spacing(4)]"
        >
          <CardHeader>
            <CardDescription className="col-span-full text-xs @xl/main:col-span-1 @xl/main:text-sm">
              {label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {value}
            </CardTitle>
            {badge && Icon && (
              <CardAction className="row-span-1 row-start-2 self-center @xl/main:row-span-2 @xl/main:row-start-1 @xl/main:self-start">
                <Badge variant="outline">
                  <Icon />
                  {badge}
                </Badge>
              </CardAction>
            )}
          </CardHeader>
          <CardFooter className="grow flex-col items-start gap-1 text-xs @xl/main:grow-0 @xl/main:gap-1.5 @xl/main:text-sm">
            <div className="line-clamp-2 font-medium">{headline}</div>
            <div className="line-clamp-2 text-muted-foreground">{detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
