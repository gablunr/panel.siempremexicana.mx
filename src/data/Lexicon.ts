export const quoteStatusLabels = {
  nueva: "Sin contactar",
  contactada: "En seguimiento",
  cotizada: "Propuesta enviada",
  ganada: "Venta cerrada",
  perdida: "Venta perdida",
} as const

export type QuoteStatus = keyof typeof quoteStatusLabels

export const quoteStatuses = Object.keys(quoteStatusLabels) as QuoteStatus[]

export const isQuoteStatus = (value: string): value is QuoteStatus =>
  Object.hasOwn(quoteStatusLabels, value)

export const postStatusLabels = {
  borrador: "Borrador",
  publicado: "Publicado",
} as const

export type PostStatus = keyof typeof postStatusLabels

export const postStatuses = Object.keys(postStatusLabels) as PostStatus[]

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const descriptionLength = { min: 120, max: 160 }

export const maxImageBytes = 8 * 1024 * 1024

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const wordsPerMinute = 200

export const hasContent = (html: string) =>
  /<img\s/i.test(html) ||
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0

export type Draft = {
  title: string
  html: string
  cover: string
  coverAlt: string
  description: string
}

export function publishChecklist(draft: Draft) {
  const length = draft.description.trim().length
  return [
    { key: "title", label: "Título", done: Boolean(draft.title.trim()) },
    { key: "content", label: "Contenido", done: hasContent(draft.html) },
    { key: "coverUrl", label: "Imagen de portada", done: Boolean(draft.cover) },
    { key: "coverAlt", label: "Descripción de la portada", done: Boolean(draft.coverAlt.trim()) },
    {
      key: "description",
      label: "Resumen",
      done: length >= descriptionLength.min && length <= descriptionLength.max,
    },
  ]
}
