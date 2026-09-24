import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Breakdown } from "@/data/Pulse"
import { formatCount, formatShare } from "@/lib/Abacus"

export function Prism({
  title,
  description,
  heading,
  rows,
}: {
  title: string
  description: string
  heading: string
  rows: Breakdown
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-(--card-spacing)">{heading}</TableHead>
              <TableHead className="text-right">Solicitudes</TableHead>
              <TableHead className="hidden text-right @sm/card:table-cell">
                Cerradas
              </TableHead>
              <TableHead className="pr-(--card-spacing) text-right">
                Tasa de cierre
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="pl-(--card-spacing) whitespace-normal">
                  {row.label}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(row.total)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums @sm/card:table-cell">
                  {formatCount(row.won)}
                </TableCell>
                <TableCell className="pr-(--card-spacing) text-right font-medium tabular-nums">
                  {formatShare(row.won, row.closed)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
