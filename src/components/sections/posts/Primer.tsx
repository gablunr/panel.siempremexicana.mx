"use client"

import { CircleHelpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

const shortcuts = [
  { type: "## Texto", result: "Título" },
  { type: "### Texto", result: "Subtítulo" },
  { type: "#### Texto", result: "Título pequeño" },
  { type: "**texto**", result: "Negrita" },
  { type: "*texto*", result: "Cursiva" },
  { type: "~~texto~~", result: "Tachado" },
  { type: "`texto`", result: "Código" },
  { type: "- Texto", result: "Lista con viñetas" },
  { type: "1. Texto", result: "Lista numerada" },
  { type: "[ ] Texto", result: "Lista de tareas" },
  { type: "> Texto", result: "Cita" },
  { type: "```", result: "Bloque de código" },
  { type: "---", result: "Línea divisoria" },
]

export function Primer() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Guía de Markdown"
          />
        }
      >
        <CircleHelpIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-3 p-3">
        <PopoverHeader>
          <PopoverTitle>Atajos de Markdown</PopoverTitle>
          <PopoverDescription>
            Escríbelos al inicio de la línea o alrededor del texto.
          </PopoverDescription>
        </PopoverHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.result} className="contents">
              <dt>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {shortcut.type}
                </code>
              </dt>
              <dd className="text-muted-foreground">{shortcut.result}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Si pegas texto en Markdown, se convierte solo.
        </p>
      </PopoverContent>
    </Popover>
  )
}
