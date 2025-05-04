"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AuthStatus } from "@/components/auth-status"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="fasfar" width={100} height={100} />
        </Link>
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-4">
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace" className="text-sm font-medium transition-colors hover:text-rose-500">
              Marketplace
            </Link>
            <Link href="/map" className="text-sm font-medium transition-colors hover:text-rose-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Carte
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-rose-500">
              Catégories
            </Link>
            <Link href="/messages" className="text-sm font-medium transition-colors hover:text-rose-500">
              Messages
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <AuthStatus />
          </div>
        </div>
        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="sr-only">Toggle menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="container p-4">
            <div className="flex justify-between items-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-rose-500" />
                <span className="text-xl font-bold">fasfar</span>
              </Link>
              <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <nav className="flex flex-col space-y-6">
              <Link href="/marketplace" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                Marketplace
              </Link>
              <Link
                href="/map"
                className="text-lg font-medium flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Carte
              </Link>
              <Link href="/categories" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                Catégories
              </Link>
              <div className="pt-4 border-t">
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start bg-rose-500 hover:bg-rose-600">Inscription</Button>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
