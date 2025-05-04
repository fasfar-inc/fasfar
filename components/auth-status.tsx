"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Package, PlusCircle } from "lucide-react"

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled>
        Chargement...
      </Button>
    )
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Connexion
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
            Inscription
          </Button>
        </Link>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={session?.user?.image || "/placeholder.svg?height=24&width=24"}
              alt={session?.user?.name || "User"}
            />
            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{session?.user?.name || "Mon compte"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/product/new">
          <DropdownMenuItem>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Vendre un article</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/profile?tab=products">
          <DropdownMenuItem>
            <Package className="mr-2 h-4 w-4" />
            <span>Mes annonces</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/profile?tab=settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
