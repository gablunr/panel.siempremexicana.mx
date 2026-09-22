import { CircleCheckIcon, CircleIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { publishChecklist } from "@/data/Lexicon"
import { cn } from "@/lib/utils"

type Item = ReturnType<typeof publishChecklist>[number]

function heading(missing: number, published: boolean) {
  if (missing) return "Antes de publicar"
  return published ? "Todo listo" : "Listo para publicar"
}

export function Runway({ items, published }: { items: Item[]; published: boolean }) {
  const done = items.filter((item) => item.done).length

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{heading(items.length - done, published)}</CardTitle>
        <CardDescription>
          {done} de {items.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              {item.done ? (
                <CircleCheckIcon className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <CircleIcon className="size-4 shrink-0 text-muted-foreground/60" />
              )}
              <span className={cn(item.done && "text-muted-foreground")}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
