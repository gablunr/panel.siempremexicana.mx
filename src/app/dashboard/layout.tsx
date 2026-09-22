import { cookies } from "next/headers"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { Dock } from "@/components/layout/Dock"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAdmin } from "@/data/Passport"

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const [admin, cookieStore] = await Promise.all([getAdmin(), cookies()])
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        admin={admin}
        className="data-[side=left]:left-[env(safe-area-inset-left)]"
      />
      <SidebarInset className="overflow-x-clip pb-(--bottom-bar) md:peer-data-[variant=inset]:mr-[max(0.5rem,env(safe-area-inset-right))] md:peer-data-[variant=inset]:ml-[env(safe-area-inset-left)] md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-[max(0.5rem,env(safe-area-inset-left))]">
        <SiteHeader admin={admin} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dock />
    </SidebarProvider>
  )
}
