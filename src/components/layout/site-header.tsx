"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeftIcon } from "lucide-react"

import { Eclipse } from "@/components/layout/Eclipse"
import { Monogram } from "@/components/layout/Monogram"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { trailFor } from "@/data/Compass"
import type { Admin } from "@/data/Passport"
import { cn } from "@/lib/utils"

export function SiteHeader({ admin }: { admin: Admin }) {
  const pathname = usePathname()
  const trail = trailFor(pathname)
  const parent = trail.at(-2)
  const last = trail.length - 1

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hidden md:inline-flex pointer-coarse:size-10" />
        <Separator
          orientation="vertical"
          className="mx-2 hidden h-4 data-vertical:self-auto md:block"
        />
        {parent?.url && (
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            className="-ml-2.5 size-10 shrink-0 md:hidden"
            render={<Link href={parent.url} />}
          >
            <ChevronLeftIcon className="size-5" />
            <span className="sr-only">Volver a {parent.title}</span>
          </Button>
        )}
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap text-base">
            {trail.map((crumb, index) => (
              <Fragment key={crumb.title}>
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem
                  className={cn("min-w-0", index < last && "hidden md:inline-flex")}
                >
                  {crumb.url ? (
                    <BreadcrumbLink
                      render={<Link href={crumb.url} />}
                    >
                      {crumb.title}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="truncate font-medium">
                      {crumb.title}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          <Eclipse />
          <Monogram user={admin} />
        </div>
      </div>
    </header>
  )
}
