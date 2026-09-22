"use client"

import * as React from "react"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TableKit } from "@tiptap/extension-table"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { Markdown } from "@tiptap/markdown"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"

import { Primer } from "@/components/sections/posts/Primer"
import { Ribbon } from "@/components/sections/posts/Ribbon"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { wordsPerMinute } from "@/data/Lexicon"
import { looksLikeMarkdown, tidyMarkdown } from "@/lib/Glyph"

export type ProseContent = {
  json: string
  html: string
}

type Mode = "visual" | "markdown"

const imagesIn = (files?: FileList | null) =>
  Array.from(files ?? []).filter((file) => file.type.startsWith("image/"))

function selectImage(editor: Editor, src: string) {
  let found: number | null = null
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "image" && node.attrs.src === src) found = pos
  })
  if (found !== null) editor.commands.setNodeSelection(found)
}

export function Prose({
  initialContent,
  onChange,
  onUpload,
  lead,
}: {
  initialContent: JSONContent | string
  onChange: (content: ProseContent) => void
  onUpload: (file: File) => Promise<string | null>
  lead?: (focusEditor: () => void) => React.ReactNode
}) {
  const fileInput = React.useRef<HTMLInputElement>(null)
  const editorRef = React.useRef<Editor | null>(null)
  const [pending, setPending] = React.useState(0)
  const [mode, setMode] = React.useState<Mode>("visual")
  const [source, setSource] = React.useState("")

  const place = async (file: File, at?: number) => {
    setPending((count) => count + 1)
    const src = await onUpload(file)
    setPending((count) => count - 1)
    const editor = editorRef.current
    if (!src || !editor) return
    const image = { type: "image", attrs: { src, alt: "" } }
    const chain = editor.chain().focus()
    if (at === undefined) chain.insertContent(image).run()
    else chain.insertContentAt(at, image).run()
    selectImage(editor, src)
  }

  const placeRef = React.useRef(place)
  React.useEffect(() => {
    placeRef.current = place
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        underline: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({
        placeholder: ({ editor }) =>
          editor.isEmpty
            ? "Empieza a escribir. Usa ## para un título o pega Markdown."
            : "",
      }),
      CharacterCount,
      Markdown,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose-editor min-h-96 pb-10 focus:outline-none",
        "aria-label": "Contenido del artículo",
      },
      handlePaste: (_view, event) => {
        const current = editorRef.current
        const clipboard = event.clipboardData
        if (!current || !clipboard) return false
        const images = imagesIn(clipboard.files)
        if (images.length) {
          images.forEach((file) => void placeRef.current(file))
          return true
        }
        const text = clipboard.getData("text/plain")
        if (
          clipboard.getData("text/html") ||
          !text ||
          current.isActive("codeBlock") ||
          !looksLikeMarkdown(text)
        )
          return false
        current.commands.insertContent(tidyMarkdown(text), {
          contentType: "markdown",
        })
        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        const images = imagesIn(event.dataTransfer?.files)
        if (moved || !images.length) return false
        event.preventDefault()
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        images.forEach((file) => void placeRef.current(file, at))
        return true
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
    },
    onUpdate: ({ editor }) =>
      onChange({ json: JSON.stringify(editor.getJSON()), html: editor.getHTML() }),
  })

  const words = useEditorState({
    editor,
    selector: ({ editor }) => editor?.storage.characterCount.words() ?? 0,
  })

  const changeMode = (next: Mode) => {
    if (next === "markdown" && editor) setSource(editor.getMarkdown())
    setMode(next)
    if (next === "visual") requestAnimationFrame(() => editor?.commands.focus())
  }

  const editSource = (value: string) => {
    setSource(value)
    editor?.commands.setContent(tidyMarkdown(value), {
      contentType: "markdown",
      emitUpdate: true,
    })
  }

  const minutes = Math.max(1, Math.round((words ?? 0) / wordsPerMinute))

  return (
    <Card className="gap-0 overflow-visible py-0">
      <Ribbon
        editor={editor}
        visual={mode === "visual"}
        uploading={pending > 0}
        onPickImage={() => fileInput.current?.click()}
        trailing={
          <>
            <Primer />
            <Tabs value={mode} onValueChange={(value) => changeMode(value as Mode)}>
              <TabsList className="h-7!">
                <TabsTrigger value="visual" className="px-2 text-xs">
                  Visual
                </TabsTrigger>
                <TabsTrigger value="markdown" className="px-2 text-xs">
                  Markdown
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
      />
      <div className="mx-auto w-full max-w-3xl px-5 pt-6 sm:px-8">
        {lead?.(() => editor?.commands.focus("start"))}
        <div hidden={mode !== "visual"}>
          <EditorContent editor={editor} />
        </div>
        {mode === "markdown" && (
          <textarea
            value={source}
            onChange={(event) => editSource(event.target.value)}
            spellCheck={false}
            aria-label="Contenido en Markdown"
            className="field-sizing-content min-h-96 w-full resize-none bg-transparent pb-10 font-mono text-sm leading-6 focus:outline-none"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t px-4 py-2 text-xs text-muted-foreground">
        <span className="flex gap-3">
          <span>
            {words ?? 0} {words === 1 ? "palabra" : "palabras"}
          </span>
          <span>{minutes} min de lectura</span>
        </span>
        <span>
          {pending > 0 ? "Subiendo imagen..." : "Puedes arrastrar o pegar imágenes en el texto."}
        </span>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const images = imagesIn(event.target.files)
          event.target.value = ""
          images.forEach((file) => void place(file))
        }}
      />
    </Card>
  )
}
