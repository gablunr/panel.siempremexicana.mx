"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { siteUrl } from "@/data/Compass"
import { descriptionLength } from "@/data/Lexicon"
import { cn } from "@/lib/utils"

function lengthStatus(length: number) {
  const { min, max } = descriptionLength
  if (!length)
    return { tone: "idle", text: `Entre ${min} y ${max} caracteres.` }
  if (length < min)
    return { tone: "short", text: `Faltan ${min - length} caracteres.` }
  if (length > max)
    return { tone: "long", text: `Sobran ${length - max} caracteres.` }
  return { tone: "good", text: "Buen largo." }
}

export function Herald({
  title,
  slug,
  description,
  error,
  onChange,
}: {
  title: string
  slug: string
  description: string
  error?: string
  onChange: (description: string) => void
}) {
  const length = description.trim().length
  const status = lengthStatus(length)
  const host = siteUrl.replace(/^https?:\/\//, "")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen</CardTitle>
        <CardDescription>
          Una o dos frases que inviten a leer. Se ve en el blog y en Google.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="description" className="sr-only">
              Resumen
            </FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={(event) => onChange(event.target.value)}
              aria-invalid={Boolean(error)}
            />
            <div className="flex flex-col gap-1.5">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    status.tone === "good" && "bg-emerald-600",
                    status.tone === "short" && "bg-amber-500",
                    status.tone === "long" && "bg-destructive"
                  )}
                  style={{
                    width: `${Math.min(100, (length / descriptionLength.max) * 100)}%`,
                  }}
                />
              </div>
              <p className="flex justify-between text-xs text-muted-foreground">
                <span>{status.text}</span>
                <span className="tabular-nums">
                  {length}/{descriptionLength.max}
                </span>
              </p>
            </div>
            <FieldError>{error}</FieldError>
          </Field>
          <div className="flex flex-col gap-0.5 rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Vista en Google
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {host}/blog/{slug || "..."}
            </p>
            <p className="line-clamp-2 text-base leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
              {title.trim() || "Título del artículo"}
            </p>
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {description.trim() || "Resumen del artículo"}
            </p>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
