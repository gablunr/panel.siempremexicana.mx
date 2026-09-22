"use client"

import * as React from "react"
import { ImagePlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Easel({
  cover,
  alt,
  uploading,
  coverError,
  altError,
  onFile,
  onRemove,
  onAltChange,
}: {
  cover: string
  alt: string
  uploading: boolean
  coverError?: string
  altError?: string
  onFile: (file?: File) => void
  onRemove: () => void
  onAltChange: (alt: string) => void
}) {
  const fileInput = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portada</CardTitle>
        <CardDescription>
          Se ve en el blog y cuando alguien comparte el artículo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={Boolean(coverError)}>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                onFile(event.dataTransfer.files[0])
              }}
              aria-label={cover ? "Cambiar portada" : "Subir portada"}
              className={cn(
                "group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                cover && "border-solid",
                dragging && "border-brand bg-brand/5",
                coverError && "border-destructive"
              )}
            >
              {cover ? (
                <>
                  <img src={cover} alt={alt} className="size-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {uploading ? "Subiendo..." : "Cambiar foto"}
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 px-4 text-center">
                  <ImagePlusIcon className="size-6" />
                  {uploading ? "Subiendo..." : "Subir foto"}
                </span>
              )}
            </button>
            <FieldError>{coverError}</FieldError>
          </Field>
          {cover && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground"
              onClick={onRemove}
            >
              <Trash2Icon data-icon="inline-start" />
              Quitar
            </Button>
          )}
          <Field data-invalid={Boolean(altError)}>
            <FieldLabel htmlFor="coverAlt">Descripción</FieldLabel>
            <Input
              id="coverAlt"
              name="coverAlt"
              value={alt}
              onChange={(event) => onAltChange(event.target.value)}
              placeholder="Qué se ve en la foto"
              aria-invalid={Boolean(altError)}
            />
            <FieldDescription>
              La usan Google y quien navega con lector de pantalla.
            </FieldDescription>
            <FieldError>{altError}</FieldError>
          </Field>
        </FieldGroup>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            onFile(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </CardContent>
    </Card>
  )
}
