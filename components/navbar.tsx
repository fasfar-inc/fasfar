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

export function Navbar() {
  return (
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <Link href="/profile">My profile</Link>
      </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link href="/my-announcements">My announcements</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signOut()}>
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
