"use client"

import { ExternalLinkIcon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/Passport"
import { siteUrl } from "@/data/Compass"
import type { Admin } from "@/data/Passport"
import { confirmLeave } from "@/lib/Warden"

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export function Monogram({ user }: { user: Admin }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full md:hidden"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-medium">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">Tu cuenta</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="grid px-2 py-2 leading-tight font-normal">
            <span className="truncate text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="h-11 gap-2 px-2"
          render={<a href={siteUrl} target="_blank" rel="noreferrer" />}
        >
          <ExternalLinkIcon />
          Ver sitio web
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-11 gap-2 px-2"
          onClick={() => {
            if (confirmLeave()) signOut()
          }}
        >
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
