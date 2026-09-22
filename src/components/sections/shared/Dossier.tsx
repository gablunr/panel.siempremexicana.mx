"use client"

import * as React from "react"
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
  AlertDialogTrigger,
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
  DrawerTrigger,
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
      <a href={href} className="min-w-0 flex-1 truncate font-medium hover:underline">
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

export function Dossier({ quote }: { quote: Quote }) {
  const isMobile = useIsMobile()
  const [status, setStatus] = React.useState<QuoteStatus>(quote.estado)
  const [notes, setNotes] = React.useState(quote.notas ?? "")
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => setStatus(quote.estado), [quote.estado])

  const dirty =
    status !== quote.estado || notes.trim() !== (quote.notas ?? "").trim()

  const save = () =>
    startTransition(async () => {
      const result = await updateQuote(quote.id, { status, notes })
      if (result.error) toast.error(result.error)
      else toast.success("Cotización actualizada")
    })

  const remove = () =>
    startTransition(async () => {
      const result = await deleteQuote(quote.id)
      if (result.error) toast.error(result.error)
      else toast.success("Cotización eliminada")
    })

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button variant="link" className="w-fit px-0 text-left text-foreground" />
        }
      >
        {quote.nombre}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <DrawerTitle className="text-lg leading-tight">{quote.nombre}</DrawerTitle>
            <Stamp status={quote.estado} />
          </div>
          <DrawerDescription>
            Recibida el {formatDateTime(quote.creada_en)}
            {quote.origen_url && (
              <>
                {" "}desde{" "}
                <a
                  href={quote.origen_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {pagePath(quote.origen_url)}
                </a>
              </>
            )}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-2 text-sm">
          <Section title="Contacto">
            <div className="divide-y rounded-lg border">
              <ContactRow
                icon={MailIcon}
                value={quote.correo}
                href={`mailto:${quote.correo}`}
                label="Correo"
              />
              {quote.telefono ? (
                <ContactRow
                  icon={PhoneIcon}
                  value={quote.telefono}
                  href={`tel:${quote.telefono}`}
                  label="Teléfono"
                />
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground">
                  <PhoneIcon className="size-4 shrink-0" />
                  No dejó teléfono
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href={`mailto:${quote.correo}`} />}
              >
                <MailIcon data-icon="inline-start" />
                Correo
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                disabled={!quote.telefono}
                render={quote.telefono ? <a href={`tel:${quote.telefono}`} /> : <span />}
              >
                <PhoneIcon data-icon="inline-start" />
                Llamar
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                disabled={!quote.telefono}
                render={
                  quote.telefono ? (
                    <a
                      href={`https://wa.me/${whatsappNumber(quote.telefono)}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  ) : (
                    <span />
                  )
                }
              >
                <MessageCircleIcon data-icon="inline-start" />
                WhatsApp
              </Button>
            </div>
          </Section>

          <Section title="Proyecto">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border p-3">
              <div className="col-span-2 grid gap-0.5">
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
                  rows={5}
                />
              </div>
            </div>
          </Section>
        </div>

        <DrawerFooter>
          <div className="grid grid-cols-2 gap-2">
            <DrawerClose render={<Button variant="outline" />}>Cerrar</DrawerClose>
            <Button onClick={save} disabled={pending || !dirty}>
              {pending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={pending}
                />
              }
            >
              <Trash2Icon data-icon="inline-start" />
              Eliminar cotización
            </AlertDialogTrigger>
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
                  disabled={pending}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
