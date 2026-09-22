"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import type { JSONContent } from "@tiptap/react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Easel } from "@/components/sections/posts/Easel"
import { Herald } from "@/components/sections/posts/Herald"
import {
  Masthead,
  type Pending,
  type View,
} from "@/components/sections/posts/Masthead"
import {
  Prose,
  type ProseContent,
  type ProseHandle,
} from "@/components/sections/posts/Prose"
import { Runway } from "@/components/sections/posts/Runway"
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
import {
  deletePost,
  savePost,
  uploadImage,
  type PostFormState,
} from "@/actions/Quill"
import { siteUrl } from "@/data/Compass"
import {
  maxImageBytes,
  publishChecklist,
  slugify,
  type PostStatus,
} from "@/data/Lexicon"
import type { Post } from "@/data/Quill"
import { useModKey } from "@/hooks/Keycap"
import { useStretch } from "@/hooks/Stretch"
import { dayKey } from "@/lib/Almanac"
import { cn } from "@/lib/utils"
import { confirmLeave } from "@/lib/Warden"

const initialState: PostFormState = { errors: {} }

const savedNotices = {
  "borrador>borrador": "Borrador guardado",
  "borrador>publicado": "Artículo publicado",
  "publicado>publicado": "Cambios publicados",
  "publicado>borrador": "El artículo volvió a borrador y ya no se ve en el sitio",
} as const

const spots: Record<string, { view: View; target?: string }> = {
  title: { view: "text", target: "title" },
  content: { view: "text" },
  coverUrl: { view: "details", target: "cover" },
  coverAlt: { view: "details", target: "coverAlt" },
  description: { view: "details", target: "description" },
  slug: { view: "details", target: "slug" },
  date: { view: "details", target: "date" },
}

const spotKeys = Object.keys(spots)
const detailKeys = spotKeys.filter((key) => spots[key].view === "details")

async function sendImage(file: File) {
  if (!file.type.startsWith("image/")) {
    toast.error("Elige un archivo de imagen.")
    return null
  }
  if (file.size > maxImageBytes) {
    toast.error("La imagen no puede pesar más de 8 MB.")
    return null
  }
  const data = new FormData()
  data.append("file", file)
  const result = await uploadImage(data)
  if (!result.url) toast.error(result.error ?? "No se pudo subir la imagen.")
  return result.url ?? null
}

function DeletePost({ post }: { post: Post }) {
  const [pending, startTransition] = React.useTransition()

  const remove = () =>
    startTransition(async () => {
      const error = await deletePost(post.id)
      if (error) toast.error(error)
    })

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="w-full text-destructive hover:text-destructive max-lg:h-10"
            disabled={pending}
          />
        }
      >
        <Trash2Icon data-icon="inline-start" />
        Eliminar artículo
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este artículo?</AlertDialogTitle>
          <AlertDialogDescription>
            También se borra del sitio. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            onClick={remove}
            disabled={pending}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function Scribe({
  post,
  view: initialView = "text",
}: {
  post?: Post
  view?: View
}) {
  const [state, formAction, saving] = React.useActionState(savePost, initialState)
  const [title, setTitle] = React.useState(post?.titulo ?? "")
  const [slug, setSlug] = React.useState(post?.slug ?? "")
  const [slugEdited, setSlugEdited] = React.useState(Boolean(post))
  const [description, setDescription] = React.useState(post?.descripcion ?? "")
  const [date, setDate] = React.useState(
    post?.publicado_en ? dayKey(post.publicado_en) : ""
  )
  const [cover, setCover] = React.useState(post?.portada_url ?? "")
  const [coverAlt, setCoverAlt] = React.useState(post?.portada_alt ?? "")
  const [uploading, setUploading] = React.useState(false)
  const [content, setContent] = React.useState<ProseContent>({
    json: post?.contenido_json ? JSON.stringify(post.contenido_json) : "",
    html: post?.contenido_html ?? "",
  })
  const [view, setView] = React.useState<View>(initialView)
  const scrolls = React.useRef<Record<View, number>>({ text: 0, details: 0 })
  const restore = React.useRef<number | null>(null)
  const form = React.useRef<HTMLFormElement>(null)
  const saveButton = React.useRef<HTMLButtonElement>(null)
  const prose = React.useRef<ProseHandle>(null)
  const titleField = React.useRef<HTMLTextAreaElement>(null)
  const mod = useModKey()
  const { errors } = state
  useStretch(titleField, title)

  const status: PostStatus = state.status ?? post?.estado ?? "borrador"
  const published = status === "publicado"
  const busy = saving || uploading
  const checklist = publishChecklist({
    title,
    html: content.html,
    cover,
    coverAlt,
    description,
  })
  const missing = checklist.filter((item) => !item.done)

  const snapshot = JSON.stringify([title, slug, description, date, cover, coverAlt, content.html])
  const [savedSnapshot, setSavedSnapshot] = React.useState(snapshot)
  const submitted = React.useRef({ snapshot, notice: "" })
  const dirty = snapshot !== savedSnapshot

  const flagged = (key: string) =>
    Boolean(errors[key]) || missing.some((item) => item.key === key)

  const pending: Record<View, Pending> = {
    text: {
      count: spotKeys.filter((key) => spots[key].view === "text" && errors[key]).length,
      alert: true,
    },
    details: {
      count: detailKeys.filter(flagged).length,
      alert: detailKeys.some((key) => errors[key]),
    },
  }

  const changeView = (next: View) => {
    if (next === view) return
    scrolls.current[view] = window.scrollY
    restore.current = scrolls.current[next]
    setView(next)
  }

  React.useLayoutEffect(() => {
    if (restore.current === null) return
    window.scrollTo({ top: restore.current })
    restore.current = null
  }, [view])

  const pick = (keys: string[]) =>
    keys.find((key) => spots[key]?.view === view) ?? keys.find((key) => spots[key])

  const reveal = (key?: string) => {
    const spot = key ? spots[key] : undefined
    if (!spot) return
    if (spot.view !== view) {
      scrolls.current[view] = window.scrollY
      flushSync(() => setView(spot.view))
    }
    if (!spot.target) {
      prose.current?.focus()
      return
    }
    const field = document.getElementById(spot.target)
    field?.focus({ preventScroll: true })
    field?.scrollIntoView({ block: "center", behavior: "smooth" })
  }

  React.useEffect(() => {
    if (state.savedAt) {
      setSavedSnapshot(submitted.current.snapshot)
      toast.success(submitted.current.notice)
      return
    }
    if (!state.message) return
    toast.error(state.message)
    const key = pick(spotKeys.filter((key) => state.errors[key]))
    if (key) queueMicrotask(() => reveal(key))
  }, [state])

  React.useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a[href]")
      if (!(link instanceof HTMLAnchorElement) || link.isContentEditable) return
      if (link.target === "_blank" || link.hasAttribute("download")) return
      if (link.origin !== window.location.origin) return
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (confirmLeave()) return
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener("beforeunload", warn)
    window.addEventListener("click", leave, true)
    return () => {
      window.removeEventListener("beforeunload", warn)
      window.removeEventListener("click", leave, true)
    }
  }, [dirty])

  React.useEffect(() => {
    const save = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return
      event.preventDefault()
      form.current?.requestSubmit(saveButton.current)
    }
    window.addEventListener("keydown", save)
    return () => window.removeEventListener("keydown", save)
  }, [])

  const submit = (data: FormData) => {
    const next = String(data.get("status")) as PostStatus
    submitted.current = { snapshot, notice: savedNotices[`${status}>${next}`] }
    formAction(data)
  }

  const guardPublish = (event: React.MouseEvent) => {
    if (!missing.length) return
    event.preventDefault()
    reveal(pick(missing.map((item) => item.key)))
    toast.error("Falta completar", {
      description: missing.map((item) => item.label).join(", "),
    })
  }

  const holdEnter = (event: React.KeyboardEvent<HTMLFormElement>) => {
    const field = event.target
    if (event.key !== "Enter" || event.defaultPrevented || event.nativeEvent.isComposing) return
    if (!(field instanceof HTMLInputElement) || field.form !== event.currentTarget) return
    event.preventDefault()
    if (window.matchMedia("(pointer: coarse)").matches) field.blur()
    else if (!busy) event.currentTarget.requestSubmit(saveButton.current)
  }

  const changeTitle = (value: string) => {
    setTitle(value)
    if (!slugEdited) setSlug(slugify(value))
  }

  const settleSlug = () => {
    const clean = slugify(slug)
    if (clean) setSlug(clean)
    else {
      setSlug(slugify(title))
      setSlugEdited(false)
    }
  }

  const changeCover = async (file?: File) => {
    if (!file) return
    setUploading(true)
    const url = await sendImage(file)
    setUploading(false)
    if (url) setCover(url)
  }

  const progress = saving
    ? "Guardando..."
    : dirty
      ? "Sin guardar"
      : post
        ? "Guardado"
        : ""

  return (
    <form
      ref={form}
      action={submit}
      onKeyDown={holdEnter}
      data-unsaved={dirty ? "" : undefined}
      className="flex flex-col gap-4 max-lg:typing:[--lift:2.75rem] max-lg:typing:[--tail:50svh]"
    >
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="coverUrl" value={cover} />
      <input type="hidden" name="contentJson" value={content.json} />
      <input type="hidden" name="contentHtml" value={content.html} />
      <input type="hidden" name="view" value={view} />

      <Masthead
        post={post}
        status={status}
        progress={progress}
        hint={`Guarda con ${mod} S`}
        busy={busy}
        saveRef={saveButton}
        onGuard={guardPublish}
        view={view}
        onView={changeView}
        pending={pending}
      />

      <div className="grid gap-4 px-4 pb-[var(--tail,0rem)] lg:px-6 @5xl/main:grid-cols-[minmax(0,1fr)_20rem]">
        <div
          className={cn(
            "flex min-w-0 flex-col gap-2 max-sm:-mx-4",
            view !== "text" && "max-lg:hidden"
          )}
        >
          <Prose
            ref={prose}
            initialContent={
              (post?.contenido_json as JSONContent | null) ??
              post?.contenido_html ??
              ""
            }
            onChange={setContent}
            onUpload={sendImage}
            lead={(focusEditor) => (
              <Field data-invalid={Boolean(errors.title)} className="mb-4 max-sm:mb-3">
                <FieldLabel htmlFor="title" className="sr-only">
                  Título
                </FieldLabel>
                <textarea
                  ref={titleField}
                  id="title"
                  name="title"
                  rows={1}
                  enterKeyHint="next"
                  value={title}
                  onChange={(event) => changeTitle(event.target.value.replace(/\n/g, " "))}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return
                    event.preventDefault()
                    focusEditor()
                  }}
                  placeholder="Título"
                  aria-invalid={Boolean(errors.title)}
                  className="field-sizing-content w-full resize-none bg-transparent text-2xl leading-tight font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50 sm:text-3xl"
                />
                <FieldError>{errors.title}</FieldError>
              </Field>
            )}
          />
          {errors.content && (
            <p className="px-1 text-sm text-destructive max-sm:px-4">
              {errors.content}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col gap-4",
            view !== "details" && "max-lg:hidden"
          )}
        >
          <Runway items={checklist} published={published} onPick={reveal} />

          <Easel
            cover={cover}
            alt={coverAlt}
            uploading={uploading}
            coverError={errors.coverUrl}
            altError={errors.coverAlt}
            onFile={(file) => void changeCover(file)}
            onRemove={() => setCover("")}
            onAltChange={setCoverAlt}
          />

          <Herald
            title={title}
            slug={slug}
            description={description}
            error={errors.description}
            onChange={setDescription}
          />

          <Card>
            <CardHeader>
              <CardTitle>Dirección y fecha</CardTitle>
              <CardDescription>
                Se llenan solas. Cámbialas solo si lo necesitas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.slug)}>
                  <FieldLabel htmlFor="slug">Dirección</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugEdited(true)
                      setSlug(event.target.value)
                    }}
                    onBlur={settleSlug}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    aria-invalid={Boolean(errors.slug)}
                    className="max-lg:h-10"
                  />
                  <FieldDescription className="break-all">
                    {siteUrl.replace(/^https?:\/\//, "")}/blog/{slug || "..."}
                  </FieldDescription>
                  {slugEdited && title && slug !== slugify(title) && (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="self-start px-0 max-lg:h-8"
                      onClick={() => {
                        setSlug(slugify(title))
                        setSlugEdited(false)
                      }}
                    >
                      Usar el título
                    </Button>
                  )}
                  {published && post && slug !== post.slug && (
                    <FieldDescription className="text-amber-600 dark:text-amber-500">
                      Los enlaces que ya se compartieron dejarán de funcionar.
                    </FieldDescription>
                  )}
                  <FieldError>{errors.slug}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.date)}>
                  <FieldLabel htmlFor="date">Fecha de publicación</FieldLabel>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    enterKeyHint="done"
                    className="max-lg:h-10 [&::-webkit-date-and-time-value]:text-left"
                  />
                  <FieldDescription>
                    Si la dejas vacía, se usa el día en que publiques.
                  </FieldDescription>
                  <FieldError>{errors.date}</FieldError>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {published && post && (
            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle>Publicación</CardTitle>
                <CardDescription>
                  Si lo pasas a borrador, deja de verse en el sitio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="submit"
                  name="status"
                  value="borrador"
                  variant="outline"
                  className="h-10 w-full"
                  disabled={busy}
                >
                  Pasar a borrador
                </Button>
              </CardContent>
            </Card>
          )}

          {post && <DeletePost post={post} />}
        </div>
      </div>
    </form>
  )
}
