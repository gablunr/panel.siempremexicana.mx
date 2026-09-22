"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import {
  CopyIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Stamp } from "@/components/sections/shared/Stamp"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { deleteQuote, updateQuote } from "@/actions/Ledger"
import type { Quote } from "@/data/Ledger"
import {
  quoteStatusLabels,
  quoteStatuses,
  type QuoteStatus,
} from "@/data/Lexicon"
import { formatDateTime } from "@/lib/Almanac"

const statusItems = quoteStatuses.map((value) => ({
  value,
  label: quoteStatusLabels[value],
}))

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 10 ? `52${digits}` : digits
}

function dialable(phone: string) {
  return phone.replace(/[^\d+]/g, "")
}

function pagePath(url: string) {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copiado`)
  } catch {
    toast.error("No se pudo copiar")
  }
}

export function useDossier() {
  const [handle] = React.useState(() => DrawerPrimitive.createHandle())
  return handle
}

export type DossierHandle = ReturnType<typeof useDossier>

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function ContactRow({
  icon: Icon,
  value,
  href,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  href: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 pr-1.5 pl-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <a href={href} className="min-w-0 flex-1 font-medium wrap-anywhere hover:underline">
        {value}
      </a>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Copiar ${label.toLowerCase()}`}
        onClick={() => void copy(value, label)}
      >
        <CopyIcon />
      </Button>
    </div>
  )
}

function Details({ quote, onClose }: { quote: Quote; onClose: () => void }) {
  const [status, setStatus] = React.useState<QuoteStatus>(quote.estado)
  const [notes, setNotes] = React.useState(quote.notas ?? "")
  const [confirming, setConfirming] = React.useState(false)
  const [saving, startSaving] = React.useTransition()
  const [removing, startRemoving] = React.useTransition()
  const phone = quote.telefono

  const dirty =
    status !== quote.estado || notes.trim() !== (quote.notas ?? "").trim()

  const save = () =>
    startSaving(async () => {
      const result = await updateQuote(quote.id, { status, notes })
      if (result.error) toast.error(result.error)
      else toast.success("Cotización actualizada")
    })

  const remove = () =>
    startRemoving(async () => {
      const result = await deleteQuote(quote.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setConfirming(false)
      onClose()
      toast.success("Cotización eliminada")
    })

  return (
    <>
      <DrawerHeader className="gap-1 pb-3 group-data-[swipe-axis=y]/drawer-popup:text-left max-md:border-b max-md:pt-3">
        <div className="flex items-start justify-between gap-3">
          <DrawerTitle className="min-w-0 flex-1 text-lg leading-tight wrap-break-word">
            {quote.nombre}
          </DrawerTitle>
          <Stamp status={quote.estado} />
        </div>
        <DrawerDescription className="text-pretty">
          Recibida el {formatDateTime(quote.creada_en)}
          {quote.origen_url && (
            <>
              {" "}desde{" "}
              <a
                href={quote.origen_url}
                target="_blank"
                rel="noreferrer"
                className="wrap-anywhere underline-offset-4 hover:underline pointer-coarse:underline"
              >
                {pagePath(quote.origen_url)}
              </a>
            </>
          )}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-2 text-sm max-md:py-4">
        <Section title="Contacto">
          <div className="divide-y rounded-lg border">
            <ContactRow
              icon={MailIcon}
              value={quote.correo}
              href={`mailto:${quote.correo}`}
              label="Correo"
            />
            {phone ? (
              <ContactRow
                icon={PhoneIcon}
                value={phone}
                href={`tel:${dialable(phone)}`}
                label="Teléfono"
              />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground">
                <PhoneIcon className="size-4 shrink-0" />
                No dejó teléfono
              </div>
            )}
          </div>
          <div className={phone ? "grid grid-cols-3 gap-2" : "grid"}>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={`mailto:${quote.correo}`} />}
            >
              <MailIcon data-icon="inline-start" />
              Correo
            </Button>
            {phone && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href={`tel:${dialable(phone)}`} />}
                >
                  <PhoneIcon data-icon="inline-start" />
                  Llamar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://wa.me/${whatsappNumber(phone)}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <MessageCircleIcon data-icon="inline-start" />
                  WhatsApp
                </Button>
              </>
            )}
          </div>
        </Section>

        <Section title="Proyecto">
          <dl className="grid grid-cols-1 gap-y-3 rounded-lg border p-3 md:grid-cols-2 md:gap-x-4">
            <div className="grid gap-0.5 md:col-span-2">
              <dt className="text-muted-foreground">Servicio</dt>
              <dd className="font-medium break-words">{quote.servicio}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-muted-foreground">Presupuesto</dt>
              <dd className="font-medium break-words">{quote.presupuesto}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-muted-foreground">Plazo</dt>
              <dd className="font-medium break-words">{quote.plazo}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Seguimiento">
          <div className="flex flex-col gap-4 rounded-lg border p-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`status-${quote.id}`}>Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as QuoteStatus)
                }}
                items={statusItems}
              >
                <SelectTrigger id={`status-${quote.id}`} className="w-full">
                  <SelectValue>
                    {(value: QuoteStatus) => quoteStatusLabels[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`notes-${quote.id}`}>Notas</Label>
              <Textarea
                id={`notes-${quote.id}`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Llamadas, visitas, siguientes pasos..."
                maxLength={5000}
                className="max-h-[40dvh] min-h-24"
              />
            </div>
          </div>
        </Section>

        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive md:hidden"
          onClick={() => setConfirming(true)}
          disabled={removing}
        >
          <Trash2Icon data-icon="inline-start" />
          Eliminar cotización
        </Button>
      </div>

      <DrawerFooter className="pb-[max(1rem,env(safe-area-inset-bottom))] max-md:border-t max-md:pt-3">
        <div className="grid grid-cols-2 gap-2">
          <DrawerClose render={<Button variant="outline" />}>Cerrar</DrawerClose>
          <Button onClick={save} disabled={saving || removing || !dirty}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive max-md:hidden"
          onClick={() => setConfirming(true)}
          disabled={removing}
        >
          <Trash2Icon data-icon="inline-start" />
          Eliminar cotización
        </Button>
      </DrawerFooter>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              La solicitud de {quote.nombre} se borrará para siempre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={remove}
              disabled={removing}
            >
              {removing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function Dossier({
  handle,
  quotes,
}: {
  handle: DossierHandle
  quotes: Quote[]
}) {
  const isMobile = useIsMobile()

  return (
    <Drawer handle={handle} swipeDirection={isMobile ? "down" : "right"}>
      {({ payload }) => {
        const picked = payload as Quote | undefined
        const quote = picked
          ? (quotes.find((item) => item.id === picked.id) ?? picked)
          : undefined

        return (
          <DrawerPrimitive.VirtualKeyboardProvider>
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-3rem)] data-[swipe-direction=right]:pr-[env(safe-area-inset-right)]">
              <div
                aria-hidden="true"
                className="mx-auto mt-2 hidden h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30 group-data-[swipe-direction=down]/drawer-popup:block"
              />
              {quote && (
                <Details key={quote.id} quote={quote} onClose={() => handle.close()} />
              )}
            </DrawerContent>
          </DrawerPrimitive.VirtualKeyboardProvider>
        )
      }}
    </Drawer>
  )
}
