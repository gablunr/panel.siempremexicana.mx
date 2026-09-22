import { Badge } from "@/components/ui/badge"
import { quoteStatusLabels, type QuoteStatus } from "@/data/Lexicon"

const statusBadges: Record<QuoteStatus, React.ComponentProps<typeof Badge>> = {
  nueva: { variant: "default", className: "bg-brand text-brand-foreground" },
  contactada: { variant: "outline" },
  cotizada: { variant: "outline" },
  ganada: { variant: "secondary" },
  perdida: { variant: "outline", className: "text-muted-foreground" },
}

export function Stamp({ status }: { status: QuoteStatus }) {
  return <Badge {...statusBadges[status]}>{quoteStatusLabels[status]}</Badge>
}
