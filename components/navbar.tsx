import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

  <DropdownMenuContent align="end">
    <DropdownMenuItem asChild>
      <Link href="/profile">Mon profil</Link>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link href="/my-announcements">Mes annonces</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => signOut()}>
      Déconnexion
    </DropdownMenuItem>
  </DropdownMenuContent> 