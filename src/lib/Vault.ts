function required(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`)
  }
  return value
}

export const supabaseUrl = required("SUPABASE_URL")

export const supabasePublishableKey = required("SUPABASE_PUBLISHABLE_KEY")
