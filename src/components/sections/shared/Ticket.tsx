import { CalendarClockIcon, WalletIcon } from "lucide-react"

import type { DossierHandle } from "@/components/sections/shared/Dossier"
import { Stamp } from "@/components/sections/shared/Stamp"
import { DrawerTrigger } from "@/components/ui/drawer"
import type { Quote } from "@/data/Ledger"
import { formatDate } from "@/lib/Almanac"

export function Ticket({
  quote,
  dossier,
  actions,
}: {
  quote: Quote
  dossier: DossierHandle
  actions: React.ReactNode
}) {
  return (
    <li className="relative flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40 has-aria-expanded:bg-muted/50 has-[[data-slot=drawer-trigger]:active]:bg-muted/60">
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <DrawerTrigger
            handle={dossier}
            payload={quote}
            className="text-left text-base leading-snug font-medium wrap-break-word outline-none [-webkit-tap-highlight-color:transparent] after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {quote.nombre}
          </DrawerTrigger>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Stamp status={quote.estado} />
            <time
              dateTime={quote.creada_en}
              className="text-xs text-muted-foreground"
            >
              <span className="sr-only">Recibida el </span>
              {formatDate(quote.creada_en)}
            </time>
          </div>
        </div>
        <div className="relative z-10 -mt-1.5 -mr-2 shrink-0 pointer-coarse:-mt-2.5">
          {actions}
        </div>
      </div>
      <p className="text-sm wrap-break-word">{quote.servicio}</p>
      <dl className="grid gap-1.5 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <dt className="flex h-5 shrink-0 items-center">
            <WalletIcon aria-hidden className="size-4" />
            <span className="sr-only">Presupuesto</span>
          </dt>
          <dd className="min-w-0 wrap-break-word">{quote.presupuesto}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="flex h-5 shrink-0 items-center">
            <CalendarClockIcon aria-hidden className="size-4" />
            <span className="sr-only">Plazo</span>
          </dt>
          <dd className="min-w-0 wrap-break-word">{quote.plazo}</dd>
        </div>
      </dl>
    </li>
  )
}
