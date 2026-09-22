import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Shelf } from "@/components/sections/posts/Shelf"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/data/Quill"

export const metadata: Metadata = { title: "Artículos" }

export default async function Page() {
  const posts = await getPosts()

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Artículos del blog</h2>
          <p className="text-sm text-muted-foreground">
            Crea y edita los artículos del blog.
          </p>
        </div>
        <Button
          className="hidden md:inline-flex"
          nativeButton={false}
          render={<Link href="/dashboard/posts/new" />}
        >
          <PlusIcon data-icon="inline-start" />
          Nuevo artículo
        </Button>
      </div>
      <Shelf posts={posts} />
    </div>
  )
}
