import Link from "next/link"
import { ExternalLinkIcon, PencilIcon } from "lucide-react"

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

export function Shelf({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
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
                <TableCell className="max-w-md">
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="font-medium hover:underline"
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
                        className="size-8 text-muted-foreground"
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
                      className="size-8 text-muted-foreground"
                      nativeButton={false}
                      render={<Link href={`/dashboard/posts/${post.id}`} />}
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
                Aún no hay artículos. Escribe el primero.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
