import type { Metadata } from "next"

import { Scribe } from "@/components/sections/posts/Scribe"

export const metadata: Metadata = { title: "Nuevo artículo" }

export default function Page() {
  return <Scribe />
}
