import Image from "next/image"

import logo from "@/assets/Mexicana.png"
import { cn } from "@/lib/utils"

export function Crest({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="Mexicana Arquitectura e Inmobiliaria"
      priority
      className={cn("h-7 w-auto dark:invert dark:hue-rotate-180", className)}
    />
  )
}
