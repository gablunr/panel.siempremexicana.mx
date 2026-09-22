"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusIcon } from "lucide-react"

import { hidesDock, isCurrent, mainNav, newPostUrl } from "@/data/Compass"
import { cn } from "@/lib/utils"

const tab =
  "flex h-full flex-col items-center justify-center gap-1 text-xs leading-none font-medium text-muted-foreground outline-none transition-colors select-none active:opacity-70 focus-visible:text-foreground focus-visible:[&>span]:ring-3 focus-visible:[&>span]:ring-ring/50 aria-[current=page]:text-foreground"

const pill =
  "flex size-10 items-center justify-center rounded-full transition-colors [&_svg]:size-5"

export function Dock() {
  const pathname = usePathname()
  if (hidesDock(pathname)) return null

  return (
    <nav
      aria-label="Navegación principal"
      data-bottom-bar
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden group-has-[input:focus]/sidebar-wrapper:hidden"
    >
      <ul className="mx-auto grid h-20 max-w-md grid-cols-4">
        {mainNav.map((item) => {
          const current = isCurrent(pathname, item.url)
          return (
            <li key={item.url}>
              <Link
                href={item.url}
                aria-current={current ? "page" : undefined}
                className={tab}
              >
                <span className={cn(pill, current && "bg-accent")}>
                  <item.icon />
                </span>
                {item.title}
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            href={newPostUrl}
            aria-label="Nuevo artículo"
            className={cn(tab, "text-foreground")}
          >
            <span className={cn(pill, "bg-primary text-primary-foreground")}>
              <PlusIcon />
            </span>
            Nuevo
          </Link>
        </li>
      </ul>
    </nav>
  )
}
