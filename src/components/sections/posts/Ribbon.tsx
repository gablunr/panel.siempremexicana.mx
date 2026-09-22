"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  BetweenHorizontalEndIcon,
  BetweenHorizontalStartIcon,
  BetweenVerticalEndIcon,
  BetweenVerticalStartIcon,
  BoldIcon,
  ChevronDownIcon,
  CodeIcon,
  CodeXmlIcon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ImageIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  TableIcon,
  Trash2Icon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react"

import { Tether } from "@/components/sections/posts/Tether"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModKey } from "@/hooks/Keycap"

type Level = 2 | 3 | 4

const blocks = [
  { value: "paragraph", label: "Texto normal", icon: PilcrowIcon, level: null },
  { value: "h2", label: "Título", icon: Heading2Icon, level: 2 },
  { value: "h3", label: "Subtítulo", icon: Heading3Icon, level: 3 },
  { value: "h4", label: "Título pequeño", icon: Heading4Icon, level: 4 },
] as const

type Block = (typeof blocks)[number]["value"]

type Tool = {
  key: string
  label: string
  keys: string
  icon: LucideIcon
  run: (editor: Editor) => void
}

const marks: Tool[] = [
  { key: "bold", label: "Negrita", keys: "B", icon: BoldIcon, run: (e) => e.chain().focus().toggleBold().run() },
  { key: "italic", label: "Cursiva", keys: "I", icon: ItalicIcon, run: (e) => e.chain().focus().toggleItalic().run() },
  { key: "strike", label: "Tachado", keys: "Shift S", icon: StrikethroughIcon, run: (e) => e.chain().focus().toggleStrike().run() },
  { key: "code", label: "Código", keys: "E", icon: CodeIcon, run: (e) => e.chain().focus().toggleCode().run() },
]

const lists: Tool[] = [
  { key: "bulletList", label: "Lista con viñetas", keys: "Shift 8", icon: ListIcon, run: (e) => e.chain().focus().toggleBulletList().run() },
  { key: "orderedList", label: "Lista numerada", keys: "Shift 7", icon: ListOrderedIcon, run: (e) => e.chain().focus().toggleOrderedList().run() },
  { key: "taskList", label: "Lista de tareas", keys: "Shift 9", icon: ListTodoIcon, run: (e) => e.chain().focus().toggleTaskList().run() },
  { key: "blockquote", label: "Cita", keys: "Shift B", icon: QuoteIcon, run: (e) => e.chain().focus().toggleBlockquote().run() },
  { key: "codeBlock", label: "Bloque de código", keys: "Alt C", icon: CodeXmlIcon, run: (e) => e.chain().focus().toggleCodeBlock().run() },
]

const tableActions = [
  { label: "Fila arriba", icon: BetweenHorizontalStartIcon, run: (e: Editor) => e.chain().focus().addRowBefore().run() },
  { label: "Fila abajo", icon: BetweenHorizontalEndIcon, run: (e: Editor) => e.chain().focus().addRowAfter().run() },
  { label: "Columna izquierda", icon: BetweenVerticalStartIcon, run: (e: Editor) => e.chain().focus().addColumnBefore().run() },
  { label: "Columna derecha", icon: BetweenVerticalEndIcon, run: (e: Editor) => e.chain().focus().addColumnAfter().run() },
]

const tableRemovals = [
  { label: "Quitar fila", run: (e: Editor) => e.chain().focus().deleteRow().run() },
  { label: "Quitar columna", run: (e: Editor) => e.chain().focus().deleteColumn().run() },
  { label: "Quitar tabla", run: (e: Editor) => e.chain().focus().deleteTable().run() },
]

const activeKeys = [...marks, ...lists].map((tool) => tool.key)

function Hint({
  label,
  keys,
  children,
}: {
  label: string
  keys?: string
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>
        {label}
        {keys && <span className="opacity-60">{keys}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

function Divider() {
  return <Separator orientation="vertical" className="mx-1 h-5 data-vertical:self-auto" />
}

function currentBlock(editor: Editor): Block {
  for (const level of [2, 3, 4] as Level[]) {
    if (editor.isActive("heading", { level })) return `h${level}` as Block
  }
  return "paragraph"
}

export function Ribbon({
  editor,
  visual,
  uploading,
  onPickImage,
  trailing,
}: {
  editor: Editor | null
  visual: boolean
  uploading: boolean
  onPickImage: () => void
  trailing: React.ReactNode
}) {
  const mod = useModKey()
  const shortcut = (keys: string) => `${mod} ${keys}`

  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null
      const image = editor.isActive("image")
      return {
        block: currentBlock(editor),
        active: Object.fromEntries(
          activeKeys.map((key) => [key, editor.isActive(key)])
        ) as Record<string, boolean>,
        link: editor.isActive("link"),
        table: editor.isActive("table"),
        image,
        alt: image ? ((editor.getAttributes("image").alt as string | null) ?? "") : "",
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      }
    },
  })

  const block = blocks.find((item) => item.value === state?.block) ?? blocks[0]

  const changeBlock = (value: Block) => {
    if (!editor) return
    const target = blocks.find((item) => item.value === value)
    if (!target?.level) editor.chain().focus().setParagraph().run()
    else editor.chain().focus().setHeading({ level: target.level }).run()
  }

  const changeAlt = (alt: string) => {
    if (!editor) return
    const { from } = editor.state.selection
    editor.chain().updateAttributes("image", { alt }).setNodeSelection(from).run()
  }

  const tool = (item: Tool) => (
    <Hint key={item.key} label={item.label} keys={shortcut(item.keys)}>
      <Toggle
        type="button"
        size="sm"
        aria-label={item.label}
        disabled={!editor}
        pressed={state?.active[item.key] ?? false}
        onPressedChange={() => editor && item.run(editor)}
      >
        <item.icon />
      </Toggle>
    </Hint>
  )

  return (
    <div className="sticky top-14 z-10 rounded-t-xl border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="flex flex-wrap items-center gap-1 p-1.5">
        {visual ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-40 justify-between"
                    disabled={!editor}
                  />
                }
              >
                <span className="flex items-center gap-1.5">
                  <block.icon />
                  {block.label}
                </span>
                <ChevronDownIcon className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuRadioGroup
                  value={block.value}
                  onValueChange={(value) => changeBlock(value as Block)}
                >
                  {blocks.map((item) => (
                    <DropdownMenuRadioItem key={item.value} value={item.value}>
                      <item.icon />
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Divider />
            {marks.map(tool)}
            <Tether editor={editor} active={state?.link ?? false} />
            <Divider />
            {lists.map(tool)}
            <Divider />
            <Hint label="Imagen">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Imagen"
                disabled={!editor || uploading}
                onClick={onPickImage}
              >
                <ImageIcon />
              </Button>
            </Hint>
            <Hint label="Tabla">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tabla"
                disabled={!editor || state?.table}
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <TableIcon />
              </Button>
            </Hint>
            <Hint label="Línea divisoria">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Línea divisoria"
                disabled={!editor}
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              >
                <MinusIcon />
              </Button>
            </Hint>
            <Divider />
            <Hint label="Deshacer" keys={shortcut("Z")}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Deshacer"
                disabled={!state?.canUndo}
                onClick={() => editor?.chain().focus().undo().run()}
              >
                <Undo2Icon />
              </Button>
            </Hint>
            <Hint label="Rehacer" keys={shortcut("Shift Z")}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Rehacer"
                disabled={!state?.canRedo}
                onClick={() => editor?.chain().focus().redo().run()}
              >
                <Redo2Icon />
              </Button>
            </Hint>
          </>
        ) : (
          <p className="px-2 text-sm text-muted-foreground">Editando en Markdown</p>
        )}
        <div className="ml-auto flex items-center gap-1">{trailing}</div>
      </div>

      {visual && state?.table && editor && (
        <div className="flex flex-wrap items-center gap-1 border-t px-1.5 py-1 text-xs">
          <span className="px-2 text-muted-foreground">Tabla:</span>
          {tableActions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => action.run(editor)}
            >
              <action.icon data-icon="inline-start" />
              {action.label}
            </Button>
          ))}
          <Divider />
          {tableRemovals.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive"
              onClick={() => action.run(editor)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {visual && state?.image && editor && (
        <div className="flex flex-wrap items-center gap-2 border-t px-3 py-1.5">
          <label htmlFor="image-alt" className="text-xs text-muted-foreground">
            Descripción
          </label>
          <Input
            id="image-alt"
            value={state.alt}
            onChange={(event) => changeAlt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                editor.commands.focus()
              }
            }}
            placeholder="Qué se ve en la imagen"
            aria-invalid={!state.alt.trim()}
            className="h-7 min-w-0 flex-1 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-destructive hover:text-destructive"
            onClick={() => editor.chain().focus().deleteSelection().run()}
          >
            <Trash2Icon data-icon="inline-start" />
            Quitar
          </Button>
        </div>
      )}
    </div>
  )
}
