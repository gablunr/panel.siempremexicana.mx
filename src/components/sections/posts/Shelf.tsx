import Link from "next/link"
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  FileTextIcon,
  PencilIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { postUrl } from "@/data/Compass"
import { postStatusLabels } from "@/data/Lexicon"
import type { PostSummary } from "@/data/Quill"
import { formatDate } from "@/lib/Almanac"

const editUrl = (id: string) => `/dashboard/posts/${id}`

const emptyMessage = "Aún no hay artículos. Escribe el primero."

export function Shelf({ posts }: { posts: PostSummary[] }) {
  return (
    <>
      <ShelfCards posts={posts} />
      <ShelfTable posts={posts} />
    </>
  )
}

function ShelfCards({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center @2xl/main:hidden">
        <FileTextIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ul
      role="list"
      aria-label="Artículos"
      className="flex flex-col gap-3 @2xl/main:hidden"
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </ul>
  )
}

function PostCard({ post }: { post: PostSummary }) {
  const published = post.estado === "publicado"

  return (
    <li className="relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40 has-[h3_a:active]:bg-muted/60">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={published ? "default" : "outline"}>
          {postStatusLabels[post.estado]}
        </Badge>
        {published && post.publicado_en && (
          <span>
            <span className="sr-only">Fecha de publicación: </span>
            {formatDate(post.publicado_en)}
          </span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <h3 className="line-clamp-3 min-w-0 flex-1 text-base leading-snug font-medium text-pretty wrap-break-word">
          <Link
            href={editUrl(post.id)}
            className="outline-none [-webkit-tap-highlight-color:transparent] after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {post.titulo}
          </Link>
        </h3>
        <ChevronRightIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          Editado el {formatDate(post.actualizada_en)}
        </p>
        {published && (
          <Button
            variant="outline"
            className="relative z-10"
            nativeButton={false}
            render={
              <a href={postUrl(post.slug)} target="_blank" rel="noreferrer" />
            }
          >
            Ver en el sitio
            <ExternalLinkIcon data-icon="inline-end" />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </Button>
        )}
      </div>
    </li>
  )
}

function ShelfTable({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border @2xl/main:block">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Publicado</TableHead>
            <TableHead>Última edición</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length ? (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="min-w-48 whitespace-normal">
                  <Link
                    href={editUrl(post.id)}
                    className="line-clamp-2 font-medium hover:underline"
                  >
                    {post.titulo}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={post.estado === "publicado" ? "default" : "outline"}
                  >
                    {postStatusLabels[post.estado]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.publicado_en ? formatDate(post.publicado_en) : "Sin fecha"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(post.actualizada_en)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {post.estado === "publicado" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        nativeButton={false}
                        render={
                          <a
                            href={postUrl(post.slug)}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        <ExternalLinkIcon />
                        <span className="sr-only">Ver en el sitio</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      nativeButton={false}
                      render={<Link href={editUrl(post.id)} />}
                    >
                      <PencilIcon />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
