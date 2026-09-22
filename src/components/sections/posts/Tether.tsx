"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { LinkIcon, UnlinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { normalizeHref } from "@/lib/Glyph"

export function Tether({
  editor,
  active,
  className,
}: {
  editor: Editor | null
  active: boolean
  className?: string
}) {
  const hrefInput = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [href, setHref] = React.useState("")
  const [text, setText] = React.useState("")
  const [needsText, setNeedsText] = React.useState(false)

  const changeOpen = (next: boolean) => {
    if (next && editor) {
      const { empty } = editor.state.selection
      const onLink = editor.isActive("link")
      setHref((editor.getAttributes("link").href as string | undefined) ?? "")
      setText("")
      setNeedsText(empty && !onLink)
    }
    setOpen(next)
  }

  const apply = () => {
    if (!editor) return
    const url = normalizeHref(href)
    const chain = editor.chain().focus().extendMarkRange("link")
    if (!url) chain.unsetLink().run()
    else if (needsText)
      chain
        .insertContent({
          type: "text",
          text: text.trim() || url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run()
    else chain.setLink({ href: url }).run()
    setOpen(false)
  }

  const remove = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    setOpen(false)
  }

  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    apply()
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Toggle
                  type="button"
                  size="sm"
                  aria-label="Enlace"
                  className={className}
                  pressed={active}
                  disabled={!editor}
                />
              }
            />
          }
        >
          <LinkIcon />
        </TooltipTrigger>
        <TooltipContent>Enlace</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-[min(20rem,calc(100vw-1.5rem))]">
        <FieldGroup className="gap-3">
          {needsText && (
            <Field>
              <FieldLabel htmlFor="link-text">Texto</FieldLabel>
              <Input
                id="link-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return
                  event.preventDefault()
                  hrefInput.current?.focus()
                }}
                enterKeyHint="next"
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="link-href">Enlace</FieldLabel>
            <Input
              ref={hrefInput}
              id="link-href"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              onKeyDown={submitOnEnter}
              placeholder="https://"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              autoFocus
            />
            <FieldDescription>Una página web o un correo.</FieldDescription>
          </Field>
          <div className="flex justify-end gap-2">
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="max-lg:h-9 max-lg:px-3 max-lg:text-sm"
                onClick={remove}
              >
                <UnlinkIcon data-icon="inline-start" />
                Quitar
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className="max-lg:h-9 max-lg:px-3 max-lg:text-sm"
              onClick={apply}
            >
              {active ? "Guardar" : "Agregar"}
            </Button>
          </div>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  )
}
