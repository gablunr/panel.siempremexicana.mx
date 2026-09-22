import { ChevronRightIcon, CircleCheckIcon, CircleIcon } from "lucide-react"

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

export function Runway({
  items,
  published,
  onPick,
}: {
  items: Item[]
  published: boolean
  onPick?: (key: string) => void
}) {
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
        <ul className="flex flex-col gap-1 text-sm">
          {items.map((item) => (
            <li key={item.key}>
              {item.done || !onPick ? (
                <span className="flex min-h-7 items-center gap-2">
                  {item.done ? (
                    <CircleCheckIcon className="size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <CircleIcon className="size-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className={cn(item.done && "text-muted-foreground")}>
                    {item.label}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPick(item.key)}
                  className="-mx-1.5 flex min-h-7 w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:min-h-10 pointer-coarse:min-h-10"
                >
                  <CircleIcon className="size-4 shrink-0 text-muted-foreground/60" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
