import "server-only"

import type { PostStatus } from "@/data/Lexicon"
import { createClient, unwrap } from "@/lib/Supabase"

export type PostSummary = {
  id: string
  titulo: string
  slug: string
  estado: PostStatus
  publicado_en: string | null
  actualizada_en: string
}

export type Post = PostSummary & {
  descripcion: string
  contenido_json: unknown
  contenido_html: string
  portada_url: string | null
  portada_alt: string | null
}

const summaryColumns = "id, titulo, slug, estado, publicado_en, actualizada_en"

export async function getPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("articulos")
    .select(summaryColumns)
    .order("actualizada_en", { ascending: false })

  return unwrap(data ?? [], error) as PostSummary[]
}

export async function getPost(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("articulos")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return data as Post
}
