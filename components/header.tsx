"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { 
  ShoppingBag, 
  MapPin, 
  Wrench, 
  ChevronDown, 
  LogOut, 
  User, 
  List, 
  Heart, 
  MessageCircle, 
  PlusCircle, 
  Search,
  X,
  Menu,
  Bell
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

// Search Bar Component
function SearchBar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 bg-white/80 backdrop-blur-lg"
        >
          <div className="container mx-auto px-4 pt-20">
            <div className="relative max-w-2xl mx-auto">
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search products, categories, or users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border-2 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// User Dropdown Component
function UserDropdown({ user }: { user?: { name?: string | null; image?: string | null } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 hover:shadow-md"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user?.image ? (
          <img src={user.image} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white font-bold text-lg">
            {initials}
          </span>
        )}
        <span className="font-medium text-gray-700 hidden sm:block">{user?.name || "Account"}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-50 overflow-hidden"
          >
            <div className="p-2">
              <a href="/profile" className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                <User className="w-4 h-4" /> Profile
              </a>
              <a href="/my-announcements" className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                <List className="w-4 h-4" /> My Listings
              </a>
              <a href="/favorites" className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                <Heart className="w-4 h-4" /> Favorites
              </a>
              <a href="/messages" className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" /> Messages
              </a>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-gray-50 text-rose-500 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Notification Dropdown Component
function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<{
    unreadCount: number;
    messages: Array<{
      id: number;
      content: string;
      createdAt: string;
      sender: {
        id: number;
        name: string | null;
        image: string | null;
      };
      product: {
        id: number;
        title: string;
        primaryImage: string | null;
      } | null;
    }>;
  }>({ unreadCount: 0, messages: [] })

  useEffect(() => {
    if (open && session?.user) {
      fetchNotifications()
    }
  }, [open, session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/messages/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (messageIds: number[]) => {
    try {
      const response = await fetch('/api/messages/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      })
      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {notifications.unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">Notifications</h3>
              <div className="space-y-2">
                {notifications.messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No new messages</p>
                  </div>
                ) : (
                  notifications.messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => {
                        markAsRead([message.id])
                        window.location.href = `/messages/${message.sender.id}`
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {message.sender.image ? (
                          <img
                            src={message.sender.image}
                            alt={message.sender.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {message.sender.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">
                            {message.sender.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{message.content}</p>
                          {message.product && (
                            <p className="text-xs text-gray-400 mt-1">
                              Re: {message.product.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link 
                  href="/messages" 
                  className="block text-center text-sm text-rose-500 hover:text-rose-600 font-medium"
                  onClick={() => setOpen(false)}
                >
                  View all messages
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main Header Component
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { data: session } = useSession()
  const user = session?.user

  // Helper for protected routes
  const protectedLink = (href: string, children: React.ReactNode) =>
    user ? (
      <Link href={href}>{children}</Link>
    ) : (
      <Link href={`/login?redirect=${encodeURIComponent(href)}`}>{children}</Link>
    )

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 shadow-sm backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="fasfar" width={100} height={100} className="transition-transform hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {protectedLink(
              "/product/new",
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 flex items-center gap-2 px-4 py-2 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                <PlusCircle className="h-5 w-5" /> Sell a product
              </Button>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="p-2 rounded-full hover:bg-gray-100 flex items-center gap-2 transition-all duration-200">
                <Wrench className="h-6 w-6 text-gray-700" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
            {user && <NotificationDropdown />}
            {user ? (
              <UserDropdown user={{ name: user.name ?? undefined, image: user.image ?? undefined }} />
            ) : (
              <Button
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 hover:shadow-md"
                onClick={() => (window.location.href = "/login")}
                aria-label="Login or Sign up"
              >
                <User className="w-6 h-6 text-gray-400" />
                <span className="font-medium text-gray-700 hidden sm:block">Login / Sign up</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "100vh" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-4 pt-20">
                <div className="flex flex-col items-center space-y-6">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-6 right-6"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  
                  <nav className="flex flex-col items-center w-full space-y-4">
                    {protectedLink(
                      "/product/new",
                      <Button className="w-full flex items-center justify-center gap-3 py-4 text-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-lg">
                        <PlusCircle className="h-6 w-6" /> Sell
                      </Button>
                    )}
                    {protectedLink(
                      "/favorites",
                      <Button variant="ghost" className="w-full flex items-center justify-center gap-3 py-4 text-lg rounded-xl">
                        <Heart className="h-6 w-6 text-gray-700" /> Favorites
                      </Button>
                    )}
                    {protectedLink(
                      "/messages",
                      <Button variant="ghost" className="w-full flex items-center justify-center gap-3 py-4 text-lg rounded-xl">
                        <MessageCircle className="h-6 w-6 text-gray-700" /> Messages
                      </Button>
                    )}
                    {protectedLink(
                      "/marketplace",
                      <Button variant="ghost" className="w-full flex items-center justify-center gap-3 py-4 text-lg rounded-xl">
                        <ShoppingBag className="h-6 w-6 text-gray-700" /> Marketplace
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-3 py-4 text-lg rounded-xl"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setSearchOpen(true)
                      }}
                    >
                      <Search className="h-6 w-6 text-gray-700" /> Search
                    </Button>
                    {user?.role === "ADMIN" && (
                      <Link href="/admin">
                        <Button variant="ghost" className="w-full flex items-center justify-center gap-3 py-4 text-lg rounded-xl">
                          <Wrench className="h-6 w-6 text-gray-700" /> Admin
                        </Button>
                      </Link>
                    )}
                  </nav>

                  <div className="pt-6 border-t w-full mt-6 flex flex-col items-center">
                    {user ? (
                      <UserDropdown user={{ name: user.name ?? undefined, image: user.image ?? undefined }} />
                    ) : (
                      <Button
                        className="w-full flex items-center justify-center gap-3 py-4 text-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl mt-4 transition-all duration-200"
                        onClick={() => (window.location.href = "/login")}
                        aria-label="Login or Sign up"
                      >
                        <User className="h-6 w-6 text-gray-400" /> Login / Sign up
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
