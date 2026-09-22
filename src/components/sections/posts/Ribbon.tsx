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
  CircleHelpIcon,
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
  Loader2Icon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  TableIcon,
  Trash2Icon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react"

import { Primer, PrimerDrawer } from "@/components/sections/posts/Primer"
import { Quiver } from "@/components/sections/posts/Quiver"
import { Tether } from "@/components/sections/posts/Tether"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModKey } from "@/hooks/Keycap"
import { cn } from "@/lib/utils"

export type Mode = "visual" | "markdown"

type Level = 2 | 3 | 4

const blocks = [
  { value: "paragraph", label: "Texto normal", icon: PilcrowIcon, level: null },
  { value: "h2", label: "Título", icon: Heading2Icon, level: 2 },
  { value: "h3", label: "Subtítulo", icon: Heading3Icon, level: 3 },
  { value: "h4", label: "Título pequeño", icon: Heading4Icon, level: 4 },
] as const

type Block = (typeof blocks)[number]["value"]

export type Tool = {
  key: string
  label: string
  keys: string
  icon: LucideIcon
  run: (editor: Editor) => void
  essential?: boolean
}

const marks: Tool[] = [
  { key: "bold", label: "Negrita", keys: "B", icon: BoldIcon, essential: true, run: (e) => e.chain().focus().toggleBold().run() },
  { key: "italic", label: "Cursiva", keys: "I", icon: ItalicIcon, essential: true, run: (e) => e.chain().focus().toggleItalic().run() },
  { key: "strike", label: "Tachado", keys: "Shift S", icon: StrikethroughIcon, run: (e) => e.chain().focus().toggleStrike().run() },
  { key: "code", label: "Código", keys: "E", icon: CodeIcon, run: (e) => e.chain().focus().toggleCode().run() },
]

const lists: Tool[] = [
  { key: "bulletList", label: "Lista con viñetas", keys: "Shift 8", icon: ListIcon, essential: true, run: (e) => e.chain().focus().toggleBulletList().run() },
  { key: "orderedList", label: "Lista numerada", keys: "Shift 7", icon: ListOrderedIcon, essential: true, run: (e) => e.chain().focus().toggleOrderedList().run() },
  { key: "taskList", label: "Lista de tareas", keys: "Shift 9", icon: ListTodoIcon, run: (e) => e.chain().focus().toggleTaskList().run() },
  { key: "blockquote", label: "Cita", keys: "Shift B", icon: QuoteIcon, run: (e) => e.chain().focus().toggleBlockquote().run() },
  { key: "codeBlock", label: "Bloque de código", keys: "Alt C", icon: CodeXmlIcon, run: (e) => e.chain().focus().toggleCodeBlock().run() },
]

const extras = [...marks, ...lists].filter((item) => !item.essential)

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

const touch =
  "max-lg:size-9 max-lg:min-w-9 max-lg:px-0 max-lg:[&_svg:not([class*='size-'])]:size-4"

function keepFocus(event: React.MouseEvent<HTMLElement>) {
  const target = event.target as Element
  if (!event.currentTarget.contains(target)) return
  if (target.closest("input, textarea, [role='tab']")) return
  event.preventDefault()
}

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
  return (
    <Separator
      orientation="vertical"
      className="mx-1 h-5 data-vertical:self-auto max-lg:hidden"
    />
  )
}

function currentBlock(editor: Editor): Block {
  for (const level of [2, 3, 4] as Level[]) {
    if (editor.isActive("heading", { level })) return `h${level}` as Block
  }
  return "paragraph"
}

export function Ribbon({
  editor,
  mode,
  onModeChange,
  uploading,
  onPickImage,
}: {
  editor: Editor | null
  mode: Mode
  onModeChange: (mode: Mode) => void
  uploading: boolean
  onPickImage: () => void
}) {
  const mod = useModKey()
  const shortcut = (keys: string) => `${mod} ${keys}`
  const visual = mode === "visual"
  const [guideOpen, setGuideOpen] = React.useState(false)

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
        className={cn(touch, !item.essential && "max-lg:hidden")}
        disabled={!editor}
        pressed={state?.active[item.key] ?? false}
        onPressedChange={() => editor && item.run(editor)}
      >
        <item.icon />
      </Toggle>
    </Hint>
  )

  return (
    <div
      data-ribbon
      onMouseDown={keepFocus}
      className="sticky top-14 z-10 rounded-t-xl border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 max-lg:top-[calc(6.25rem-var(--lift,0rem))] max-lg:motion-safe:transition-[top] max-sm:rounded-none"
    >
      <div className="flex flex-wrap items-center gap-1 p-1.5 max-lg:flex-nowrap max-lg:p-1">
        {visual ? (
          <>
            <div className="contents max-lg:no-scrollbar max-lg:flex max-lg:min-w-0 max-lg:flex-1 max-lg:items-center max-lg:overflow-x-auto max-lg:overscroll-x-contain">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-40 justify-between max-lg:h-9 max-lg:w-auto max-lg:gap-0.5 max-lg:px-2 max-lg:[&_svg:not([class*='size-'])]:size-4"
                      disabled={!editor}
                    />
                  }
                >
                  <span className="flex items-center gap-1.5">
                    <block.icon />
                    <span className="max-lg:sr-only">{block.label}</span>
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
              <Tether editor={editor} active={state?.link ?? false} className={touch} />
              <Divider />
              {lists.map(tool)}
              <Divider />
              <Hint label="Imagen">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Imagen"
                  className="max-lg:size-9"
                  disabled={!editor || uploading}
                  onClick={onPickImage}
                >
                  {uploading ? <Loader2Icon className="animate-spin" /> : <ImageIcon />}
                </Button>
              </Hint>
              <Hint label="Tabla">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Tabla"
                  className="max-lg:hidden"
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
                  className="max-lg:hidden"
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
                  className="max-lg:size-9"
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
                  className="max-lg:hidden"
                  disabled={!state?.canRedo}
                  onClick={() => editor?.chain().focus().redo().run()}
                >
                  <Redo2Icon />
                </Button>
              </Hint>
            </div>
            <Quiver
              editor={editor}
              tools={extras}
              active={state?.active ?? {}}
              canRedo={state?.canRedo ?? false}
              inTable={state?.table ?? false}
              onMarkdown={() => onModeChange("markdown")}
              onHelp={() => setGuideOpen(true)}
              className="lg:hidden"
            />
          </>
        ) : (
          <p className="px-2 text-sm text-muted-foreground max-lg:hidden">
            Editando en Markdown
          </p>
        )}
        <div
          className={cn(
            "ml-auto flex items-center gap-1 max-lg:ml-0 max-lg:w-full",
            visual && "max-lg:hidden"
          )}
        >
          <Primer className="max-lg:hidden" />
          <Tabs value={mode} onValueChange={(value) => onModeChange(value as Mode)}>
            <TabsList className="h-7! max-lg:h-9!">
              <TabsTrigger value="visual" className="px-2 text-xs max-lg:px-3 max-lg:text-sm">
                Visual
              </TabsTrigger>
              <TabsTrigger value="markdown" className="px-2 text-xs max-lg:px-3 max-lg:text-sm">
                Markdown
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Guía de Markdown"
            className="ml-auto max-lg:size-9 lg:hidden"
            onClick={() => setGuideOpen(true)}
          >
            <CircleHelpIcon />
          </Button>
        </div>
      </div>

      {visual && state?.table && editor && (
        <>
          <div className="flex flex-wrap items-center gap-1 border-t px-1.5 py-1 text-xs max-lg:hidden">
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
          <div className="flex items-center gap-1 border-t px-1.5 py-1 lg:hidden">
            <span className="px-2 text-sm text-muted-foreground">Tabla:</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-3 pointer-coarse:h-9"
                  />
                }
              >
                <PlusIcon data-icon="inline-start" />
                Agregar
                <ChevronDownIcon data-icon="inline-end" className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" finalFocus={false}>
                {tableActions.map((action) => (
                  <DropdownMenuItem key={action.label} onClick={() => action.run(editor)}>
                    <action.icon />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-3 text-destructive hover:text-destructive pointer-coarse:h-9"
                  />
                }
              >
                <Trash2Icon data-icon="inline-start" />
                Quitar
                <ChevronDownIcon data-icon="inline-end" className="opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44" finalFocus={false}>
                {tableRemovals.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    variant="destructive"
                    onClick={() => action.run(editor)}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {visual && state?.image && editor && (
        <div className="flex flex-wrap items-center gap-2 border-t px-3 py-1.5 max-lg:flex-nowrap max-lg:px-2">
          <label
            htmlFor="image-alt"
            className="shrink-0 text-xs text-muted-foreground max-sm:sr-only"
          >
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
            enterKeyHint="done"
            placeholder="Qué se ve en la imagen"
            aria-invalid={!state.alt.trim()}
            className="h-7 min-w-0 flex-1 max-lg:h-9 pointer-coarse:h-9"
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Quitar imagen"
            className="text-destructive hover:text-destructive max-lg:h-9 pointer-coarse:h-9 max-sm:w-9 max-sm:px-0 max-sm:has-data-[icon=inline-start]:pl-0 max-sm:[&_svg:not([class*='size-'])]:size-4"
            onClick={() => editor.chain().focus().deleteSelection().run()}
          >
            <Trash2Icon data-icon="inline-start" />
            <span className="max-sm:sr-only">Quitar</span>
          </Button>
        </div>
      )}

      <PrimerDrawer open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  )
}
