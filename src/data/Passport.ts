import "server-only"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/Supabase"

export type Admin = {
  name: string
  email: string
}

export async function getAdmin(): Promise<Admin> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("admins")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle()

  return {
    name: data?.name || user.email?.split("@")[0] || "Admin",
    email: user.email ?? "",
  }
}
