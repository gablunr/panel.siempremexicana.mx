"use client"

import * as React from "react"
import type { JSONContent } from "@tiptap/react"
import { ExternalLinkIcon, SendIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Easel } from "@/components/sections/posts/Easel"
import { Herald } from "@/components/sections/posts/Herald"
import { Prose, type ProseContent } from "@/components/sections/posts/Prose"
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
import { Badge } from "@/components/ui/badge"
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
import { postUrl, siteUrl } from "@/data/Compass"
import {
  maxImageBytes,
  postStatusLabels,
  publishChecklist,
  slugify,
  type PostStatus,
} from "@/data/Lexicon"
import type { Post } from "@/data/Quill"
import { useModKey } from "@/hooks/Keycap"
import { dayKey } from "@/lib/Almanac"

const initialState: PostFormState = { errors: {} }

const savedNotices = {
  "borrador>borrador": "Borrador guardado",
  "borrador>publicado": "Artículo publicado",
  "publicado>publicado": "Cambios publicados",
  "publicado>borrador": "El artículo volvió a borrador y ya no se ve en el sitio",
} as const

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
            className="w-full text-destructive hover:text-destructive"
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

export function Scribe({ post }: { post?: Post }) {
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
  const form = React.useRef<HTMLFormElement>(null)
  const saveButton = React.useRef<HTMLButtonElement>(null)
  const mod = useModKey()
  const { errors } = state

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

  React.useEffect(() => {
    if (state.savedAt) {
      setSavedSnapshot(submitted.current.snapshot)
      toast.success(submitted.current.notice)
    } else if (state.message) toast.error(state.message)
  }, [state])

  React.useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
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
    toast.error("Falta completar", {
      description: missing.map((item) => item.label).join(", "),
    })
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
    <form ref={form} action={submit} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="coverUrl" value={cover} />
      <input type="hidden" name="contentJson" value={content.json} />
      <input type="hidden" name="contentHtml" value={content.html} />

      <div className="sticky top-0 z-20 -mt-4 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:-mt-6 lg:px-6">
        <Badge variant={published ? "default" : "outline"}>
          {postStatusLabels[status]}
        </Badge>
        <span
          className="hidden truncate text-sm text-muted-foreground sm:inline"
          title={`Guarda con ${mod} S`}
        >
          {progress}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {published && post && (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<a href={postUrl(post.slug)} target="_blank" rel="noreferrer" />}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              <span className="hidden md:inline">Ver en el sitio</span>
            </Button>
          )}
          {published ? (
            <>
              <Button
                type="submit"
                name="status"
                value="borrador"
                variant="outline"
                size="sm"
                disabled={busy}
              >
                Pasar a borrador
              </Button>
              <Button
                ref={saveButton}
                type="submit"
                name="status"
                value="publicado"
                size="sm"
                disabled={busy}
                onClick={guardPublish}
              >
                Guardar cambios
              </Button>
            </>
          ) : (
            <>
              <Button
                ref={saveButton}
                type="submit"
                name="status"
                value="borrador"
                variant="outline"
                size="sm"
                disabled={busy}
              >
                Guardar borrador
              </Button>
              <Button
                type="submit"
                name="status"
                value="publicado"
                size="sm"
                disabled={busy}
                onClick={guardPublish}
              >
                <SendIcon data-icon="inline-start" />
                Publicar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-4 lg:px-6 @5xl/main:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-2">
          <Prose
            initialContent={
              (post?.contenido_json as JSONContent | null) ??
              post?.contenido_html ??
              ""
            }
            onChange={setContent}
            onUpload={sendImage}
            lead={(focusEditor) => (
              <Field data-invalid={Boolean(errors.title)} className="mb-4">
                <FieldLabel htmlFor="title" className="sr-only">
                  Título
                </FieldLabel>
                <textarea
                  id="title"
                  name="title"
                  rows={1}
                  value={title}
                  onChange={(event) => changeTitle(event.target.value.replace(/\n/g, " "))}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return
                    event.preventDefault()
                    focusEditor()
                  }}
                  placeholder="Título"
                  aria-invalid={Boolean(errors.title)}
                  className="field-sizing-content w-full resize-none bg-transparent text-3xl leading-tight font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
                />
                <FieldError>{errors.title}</FieldError>
              </Field>
            )}
          />
          {errors.content && (
            <p className="px-1 text-sm text-destructive">{errors.content}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Runway items={checklist} published={published} />

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
                    aria-invalid={Boolean(errors.slug)}
                  />
                  <FieldDescription className="break-all">
                    {siteUrl.replace(/^https?:\/\//, "")}/blog/{slug || "..."}
                  </FieldDescription>
                  {slugEdited && title && slug !== slugify(title) && (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="self-start px-0"
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
                  />
                  <FieldDescription>
                    Si la dejas vacía, se usa el día en que publiques.
                  </FieldDescription>
                  <FieldError>{errors.date}</FieldError>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {post && <DeletePost post={post} />}
        </div>
      </div>
    </form>
  )
}
