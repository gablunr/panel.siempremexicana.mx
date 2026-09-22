"use server"

import { revalidatePath } from "next/cache"

import { isQuoteStatus } from "@/data/Lexicon"
import { createClient } from "@/lib/Supabase"

type Result = { error?: string }

export async function updateQuote(
  id: string,
  changes: { status?: string; notes?: string }
): Promise<Result> {
  const update: { estado?: string; notas?: string | null } = {}

  if (changes.status !== undefined) {
    if (!isQuoteStatus(changes.status)) return { error: "Ese estado no existe." }
    update.estado = changes.status
  }
  if (changes.notes !== undefined) {
    update.notas = changes.notes.trim().slice(0, 5000) || null
  }

  const supabase = await createClient()
  const { error } = await supabase.from("cotizaciones").update(update).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/dashboard", "layout")
  return {}
}

export async function deleteQuote(id: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("cotizaciones").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/dashboard", "layout")
  return {}
}
