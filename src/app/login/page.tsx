import type { Metadata } from "next"

import { Crest } from "@/components/layout/Crest"
import { LoginForm } from "@/components/sections/login/login-form"

export const metadata: Metadata = { title: "Iniciar sesión" }

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-start justify-center p-6 pt-[max(3rem,12svh)] sm:items-center sm:pt-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Crest className="h-10 self-center" />
        <LoginForm />
      </div>
    </div>
  )
}
