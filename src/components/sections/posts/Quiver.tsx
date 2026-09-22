"use client"

import type { Editor } from "@tiptap/react"
import {
  CircleHelpIcon,
  EllipsisIcon,
  FileCodeIcon,
  MinusIcon,
  Redo2Icon,
  TableIcon,
} from "lucide-react"

import type { Tool } from "@/components/sections/posts/Ribbon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Quiver({
  editor,
  tools,
  active,
  canRedo,
  inTable,
  onMarkdown,
  onHelp,
  className,
}: {
  editor: Editor | null
  tools: Tool[]
  active: Record<string, boolean>
  canRedo: boolean
  inTable: boolean
  onMarkdown: () => void
  onHelp: () => void
  className?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Más opciones"
            disabled={!editor}
            className={cn("shrink-0 max-lg:size-9", className)}
          />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" finalFocus={false}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Formato</DropdownMenuLabel>
          {tools.map((tool) => (
            <DropdownMenuCheckboxItem
              key={tool.key}
              closeOnClick
              checked={active[tool.key] ?? false}
              onCheckedChange={() => editor && tool.run(editor)}
            >
              <tool.icon />
              {tool.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Agregar</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={!editor || inTable}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon />
            Tabla
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!editor}
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            <MinusIcon />
            Línea divisoria
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2Icon />
          Rehacer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onMarkdown}>
          <FileCodeIcon />
          Escribir en Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHelp}>
          <CircleHelpIcon />
          Guía de Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
