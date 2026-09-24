import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { supabasePublishableKey, supabaseUrl } from "@/lib/Vault"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export function unwrap<T>(data: T, error: { message: string } | null) {
  if (error) throw new Error(`Supabase query failed: ${error.message}`)
  return data
}

const batchSize = 1000

type Batch<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

export async function readAll<T>(batch: (from: number, to: number) => Batch<T>) {
  const rows: T[] = []
  for (let from = 0; ; from += batchSize) {
    const { data, error } = await batch(from, from + batchSize - 1)
    const page = unwrap(data ?? [], error)
    rows.push(...page)
    if (page.length < batchSize) return rows
  }
}
