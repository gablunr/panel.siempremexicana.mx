import {
  ExternalLinkIcon,
  FileTextIcon,
  InboxIcon,
  LayoutDashboardIcon,
  type LucideIcon,
} from "lucide-react"

export const siteUrl = "https://siempremexicana.mx"

export const postUrl = (slug: string) => `${siteUrl}/blog/${slug}`

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export const mainNav: NavItem[] = [
  { title: "Resumen", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Cotizaciones", url: "/dashboard/quotes", icon: InboxIcon },
  { title: "Artículos", url: "/dashboard/posts", icon: FileTextIcon },
]

export const secondaryNav: NavItem[] = [
  { title: "Ver sitio web", url: siteUrl, icon: ExternalLinkIcon },
]

export type Crumb = {
  title: string
  url?: string
}

const postsCrumb = { title: "Artículos", url: "/dashboard/posts" }

const trails: [RegExp, Crumb[]][] = [
  [/^\/dashboard\/quotes/, [{ title: "Cotizaciones" }]],
  [/^\/dashboard\/posts\/new$/, [postsCrumb, { title: "Nuevo artículo" }]],
  [/^\/dashboard\/posts\/[^/]+$/, [postsCrumb, { title: "Editar artículo" }]],
  [/^\/dashboard\/posts/, [{ title: "Artículos" }]],
]

export const trailFor = (pathname: string) =>
  trails.find(([pattern]) => pattern.test(pathname))?.[1] ?? [{ title: "Resumen" }]
