"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MessageCircle } from "lucide-react"

interface Partner {
  id: number
  username: string
  profileImage: string | null
  isVerified: boolean
}

interface Product {
  id: number
  title: string
  price: number
  primaryImage: string | null
}

interface Conversation {
  id: number
  content: string
  createdAt: string
  isReceived: boolean
  status: string
  partner: Partner
  product: Product | null
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/messages")
    }

    if (status === "authenticated") {
      fetchConversations()
    }
  }, [status, router])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredConversations(
        conversations.filter(
          (conv) =>
            conv.partner.username.toLowerCase().includes(term) ||
            conv.product?.title.toLowerCase().includes(term) ||
            conv.content.toLowerCase().includes(term),
        ),
      )
    }
  }, [searchTerm, conversations])

  const fetchConversations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/messages")
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const data = await response.json()
      setConversations(data)
      setFilteredConversations(data)
    } catch (err) {
      console.error("Erreur lors du chargement des conversations", err)
      setError("Erreur lors du chargement des conversations")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="p-4">Chargement...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher dans les conversations..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchConversations}>Réessayer</Button>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune conversation</h2>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Aucune conversation ne correspond à votre recherche."
              : "Vous n'avez pas encore de conversations. Parcourez les produits pour contacter des vendeurs."}
          </p>
          {searchTerm ? (
            <Button onClick={() => setSearchTerm("")}>Effacer la recherche</Button>
          ) : (
            <Button onClick={() => router.push("/marketplace")}>Parcourir les produits</Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <Link
              href={`/messages/${conversation.partner.id}${
                conversation.product ? `?productId=${conversation.product.id}` : ""
              }`}
              key={`${conversation.partner.id}-${conversation.product?.id || "general"}`}
            >
              <Card className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                        {conversation.partner.profileImage ? (
                          <Image
                            src={conversation.partner.profileImage || "/placeholder.svg"}
                            alt={conversation.partner.username}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            {conversation.partner.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">
                          {conversation.partner.username}
                          {conversation.partner.isVerified && <span className="ml-1 text-blue-500">✓</span>}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(conversation.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${conversation.unreadCount > 0 ? "font-medium" : "text-gray-600"}`}
                      >
                        {conversation.isReceived ? "" : "Vous: "}
                        {conversation.content}
                      </p>
                      {conversation.product && (
                        <div className="mt-2 flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                          {conversation.product.primaryImage && (
                            <div className="h-10 w-10 rounded overflow-hidden bg-white">
                              <Image
                                src={conversation.product.primaryImage || "/placeholder.svg"}
                                alt={conversation.product.title}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{conversation.product.title}</p>
                            <p className="text-xs text-gray-600">
                              {conversation.product.price.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
