"use client"

import * as React from "react"
import { ExternalLinkIcon, SendIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postUrl } from "@/data/Compass"
import { postStatusLabels, type PostStatus } from "@/data/Lexicon"
import type { Post } from "@/data/Quill"
import { cn } from "@/lib/utils"

export type View = "text" | "details"

export type Pending = { count: number; alert: boolean }

const tall =
  "max-lg:h-10 pointer-coarse:h-10 max-lg:px-3.5 max-lg:text-sm max-lg:has-data-[icon=inline-start]:pl-3 max-lg:[&_svg:not([class*='size-'])]:size-4"

function Count({ count, alert }: Pending) {
  if (!count) return null
  return (
    <span
      className={cn(
        "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.7rem] leading-none font-semibold tabular-nums",
        alert ? "bg-destructive text-white" : "bg-foreground/10 text-foreground"
      )}
    >
      <span aria-hidden="true">{count}</span>
      <span className="sr-only">
        {alert ? `, ${count} por corregir` : `, faltan ${count}`}
      </span>
    </span>
  )
}

export function Masthead({
  post,
  status,
  progress,
  hint,
  busy,
  saveRef,
  onGuard,
  view,
  onView,
  pending,
}: {
  post?: Post
  status: PostStatus
  progress: string
  hint: string
  busy: boolean
  saveRef: React.Ref<HTMLButtonElement>
  onGuard: (event: React.MouseEvent) => void
  view: View
  onView: (view: View) => void
  pending: Record<View, Pending>
}) {
  const published = status === "publicado"

  return (
    <div className="sticky top-0 z-20 -mt-4 border-b bg-background/90 backdrop-blur md:-mt-6 max-lg:top-[calc(var(--lift,0rem)*-1)] max-lg:motion-safe:transition-[top]">
      <div className="h-11 px-4 pt-2 lg:hidden">
        <Tabs value={view} onValueChange={(value) => onView(value as View)}>
          <TabsList className="h-9! w-full">
            <TabsTrigger value="text">
              Texto
              <Count {...pending.text} />
            </TabsTrigger>
            <TabsTrigger value="details">
              Detalles
              <Count {...pending.details} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <Badge variant={published ? "default" : "outline"}>
            {postStatusLabels[status]}
          </Badge>
          <span
            aria-live="polite"
            className="max-w-full truncate text-xs text-muted-foreground sm:text-sm"
            title={hint}
          >
            {progress}
          </span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {published && post && (
            <Button
              variant="ghost"
              size="sm"
              className="pointer-coarse:h-10 max-lg:size-10 max-lg:px-0 max-lg:has-data-[icon=inline-start]:pl-0 max-lg:[&_svg:not([class*='size-'])]:size-4"
              nativeButton={false}
              render={<a href={postUrl(post.slug)} target="_blank" rel="noreferrer" />}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              <span className="max-lg:sr-only">Ver en el sitio</span>
            </Button>
          )}
          {published ? (
            <>
              <Button
                type="submit"
                name="status"
                value="borrador"
                variant="outline"
                size="sm"
                className="max-lg:hidden"
                disabled={busy}
              >
                Pasar a borrador
              </Button>
              <Button
                ref={saveRef}
                type="submit"
                name="status"
                value="publicado"
                size="sm"
                className={tall}
                disabled={busy}
                onClick={onGuard}
              >
                Guardar cambios
              </Button>
            </>
          ) : (
            <>
              <Button
                ref={saveRef}
                type="submit"
                name="status"
                value="borrador"
                variant="outline"
                size="sm"
                className={tall}
                disabled={busy}
              >
                <span className="lg:hidden">Guardar</span>
                <span className="max-lg:hidden">Guardar borrador</span>
              </Button>
              <Button
                type="submit"
                name="status"
                value="publicado"
                size="sm"
                className={tall}
                disabled={busy}
                onClick={onGuard}
              >
                <SendIcon data-icon="inline-start" />
                Publicar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
