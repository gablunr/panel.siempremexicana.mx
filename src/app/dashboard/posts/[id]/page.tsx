import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Scribe } from "@/components/sections/posts/Scribe"
import { getPost } from "@/data/Quill"

export const metadata: Metadata = { title: "Editar artículo" }

export default async function Page({
  params,
  searchParams,
}: PageProps<"/dashboard/posts/[id]">) {
  const [{ id }, { view }] = await Promise.all([params, searchParams])
  const post = await getPost(id)
  if (!post) notFound()

  return (
    <Scribe
      key={post.id}
      post={post}
      view={view === "details" ? "details" : "text"}
    />
  )
}
