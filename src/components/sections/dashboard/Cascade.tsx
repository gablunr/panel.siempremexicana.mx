import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Conversion } from "@/data/Pulse"
import { formatCount, formatMoney, formatShare } from "@/lib/Abacus"

export function Cascade({ conversion }: { conversion: Conversion }) {
  const figures = [
    { label: "Conversión", value: formatShare(conversion.won, conversion.total) },
    { label: "Vendido", value: formatMoney(conversion.wonValue) },
    { label: "En negociación", value: formatMoney(conversion.openValue) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de ventas</CardTitle>
        <CardDescription>De la solicitud a la venta cerrada</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ol className="flex flex-col gap-4">
          {conversion.stages.map((stage) => (
            <li key={stage.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span>{stage.label}</span>
                <span className="flex items-baseline gap-2 tabular-nums">
                  <span className="font-medium">{formatCount(stage.value)}</span>
                  <span className="w-10 text-right text-muted-foreground">
                    {formatShare(stage.value, conversion.total)}
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{
                    width: `${conversion.total ? (stage.value / conversion.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        <dl className="grid grid-cols-3 gap-4">
          {figures.map((figure) => (
            <div key={figure.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{figure.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{figure.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Los montos salen del rango de presupuesto que eligió cada cliente.
        </p>
      </CardFooter>
    </Card>
  )
}
