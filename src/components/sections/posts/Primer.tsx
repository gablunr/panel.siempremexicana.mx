"use client"

import { CircleHelpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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

function Shortcuts() {
  return (
    <>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm max-lg:gap-y-2">
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
    </>
  )
}

export function Primer({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Guía de Markdown"
            className={className}
          />
        }
      >
        <CircleHelpIcon />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(20rem,calc(100vw-1.5rem))] gap-3 p-3"
      >
        <PopoverHeader>
          <PopoverTitle>Atajos de Markdown</PopoverTitle>
          <PopoverDescription>
            Escríbelos al inicio de la línea o alrededor del texto.
          </PopoverDescription>
        </PopoverHeader>
        <Shortcuts />
      </PopoverContent>
    </Popover>
  )
}

export function PrimerDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={(next) => onOpenChange(next)} showSwipeHandle>
      <DrawerContent className="sm:mx-auto sm:max-w-md">
        <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-left">
          <DrawerTitle>Atajos de Markdown</DrawerTitle>
          <DrawerDescription>
            Escríbelos al inicio de la línea o alrededor del texto.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Shortcuts />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
