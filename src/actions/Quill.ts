"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { dayKey, middayOf } from "@/lib/Almanac"
import {
  descriptionLength,
  hasContent,
  maxImageBytes,
  slugPattern,
  slugify,
  type PostStatus,
} from "@/data/Lexicon"
import { createClient } from "@/lib/Supabase"

export type PostFormState = {
  errors: Partial<Record<string, string>>
  message?: string
  savedAt?: number
  status?: PostStatus
}

const fields = [
  "id",
  "title",
  "slug",
  "description",
  "coverUrl",
  "coverAlt",
  "contentJson",
  "contentHtml",
  "status",
  "date",
] as const

const PostInput = z
  .object({
    id: z.string(),
    title: z.string().trim().min(1, "Escribe un título."),
    slug: z
      .string()
      .trim()
      .min(1, "Escribe la dirección del artículo.")
      .regex(slugPattern, "Usa solo minúsculas, números y guiones sueltos."),
    description: z.string().trim(),
    coverUrl: z.string().trim(),
    coverAlt: z.string().trim(),
    contentJson: z.string(),
    contentHtml: z.string(),
    status: z.enum(["borrador", "publicado"]),
    date: z
      .string()
      .trim()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Elige una fecha válida."),
  })
  .superRefine((post, context) => {
    if (post.status !== "publicado") return
    if (!hasContent(post.contentHtml)) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Para publicar, escribe el contenido del artículo.",
      })
    }
    const { min, max } = descriptionLength
    if (post.description.length < min || post.description.length > max) {
      context.addIssue({
        code: "custom",
        path: ["description"],
        message: `Para publicar, el resumen debe tener entre ${min} y ${max} caracteres.`,
      })
    }
    if (!post.coverUrl) {
      context.addIssue({
        code: "custom",
        path: ["coverUrl"],
        message: "Para publicar, el artículo necesita una imagen de portada.",
      })
    }
    if (!post.coverAlt) {
      context.addIssue({
        code: "custom",
        path: ["coverAlt"],
        message: "Para publicar, describe qué se ve en la portada.",
      })
    }
  })

function publicationDate(date: string, status: string, current: string | null) {
  if (!date) return status === "publicado" ? current ?? new Date().toISOString() : null
  if (current && dayKey(current) === date) return current
  return middayOf(date).toISOString()
}

export async function savePost(
  _state: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = PostInput.safeParse(
    Object.fromEntries(
      fields.map((name) => [name, String(formData.get(name) ?? "")])
    )
  )

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] ??= issue.message
    }
    return { errors, message: "Revisa los campos marcados." }
  }

  const post = parsed.data
  const supabase = await createClient()

  const current = post.id
    ? (
        await supabase
          .from("articulos")
          .select("publicado_en")
          .eq("id", post.id)
          .maybeSingle()
      ).data?.publicado_en ?? null
    : null

  const row = {
    titulo: post.title,
    slug: post.slug,
    descripcion: post.description,
    portada_url: post.coverUrl || null,
    portada_alt: post.coverAlt || null,
    contenido_json: post.contentJson ? JSON.parse(post.contentJson) : null,
    contenido_html: post.contentHtml,
    estado: post.status,
    publicado_en: publicationDate(post.date, post.status, current),
  }

  const { data, error } = post.id
    ? await supabase
        .from("articulos")
        .update(row)
        .eq("id", post.id)
        .select("id")
        .single()
    : await supabase.from("articulos").insert(row).select("id").single()

  if (error) {
    if (error.code === "23505") {
      return {
        errors: { slug: "Otro artículo ya usa esta dirección." },
        message: "Esa dirección ya está en uso.",
      }
    }
    return { errors: {}, message: error.message }
  }

  revalidatePath("/dashboard", "layout")
  if (!post.id) {
    const view = formData.get("view") === "details" ? "?view=details" : ""
    redirect(`/dashboard/posts/${data.id}${view}`)
  }
  return { errors: {}, savedAt: Date.now(), status: post.status }
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("articulos").delete().eq("id", id)
  if (error) return error.message

  revalidatePath("/dashboard", "layout")
  redirect("/dashboard/posts")
}

export async function uploadImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file")
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return { error: "Elige un archivo de imagen." }
  }
  if (file.size > maxImageBytes) {
    return { error: "La imagen no puede pesar más de 8 MB." }
  }

  const extension =
    /\.([a-z0-9]+)$/i.exec(file.name)?.[1].toLowerCase() ??
    file.type.split("/")[1]
  const name = slugify(file.name.replace(/\.[^.]+$/, "")) || "image"
  const path = `posts/${Date.now()}-${name}.${extension}`

  const supabase = await createClient()
  const { error } = await supabase.storage
    .from("blog")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" })
  if (error) return { error: error.message }

  return { url: supabase.storage.from("blog").getPublicUrl(path).data.publicUrl }
}
