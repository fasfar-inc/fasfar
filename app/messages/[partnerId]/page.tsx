"use client"

import type React from "react"
import { use, useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
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

interface Message {
  id: number
  content: string
  createdAt: string
  senderId: number
  receiverId: number
  status: string
  sender: User
  product: Product | null
}

export default function ConversationPage({
  params,
}: {
  params: { partnerId: string }
}) {
  // Utiliser React.use pour déballer les paramètres
  const unwrappedParams = use(params)
  const partnerId = Number.parseInt(unwrappedParams.partnerId)

  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partner, setPartner] = useState<User | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/messages/${partnerId}${productId ? `?productId=${productId}` : ""}`)
    }

    if (status === "authenticated") {
      fetchMessages()

      // Mettre en place un polling pour les nouveaux messages
      const interval = setInterval(fetchMessages, 10000) // Toutes les 10 secondes

      return () => clearInterval(interval)
    }
  }, [status, partnerId, productId, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!session?.user?.id) return

    try {
      setError(null)
      const url = `/api/messages/${partnerId}${productId ? `?productId=${productId}` : ""}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      setMessages(data)

      // Extraire les informations du partenaire et du produit du premier message
      if (data.length > 0) {
        const firstMessage = data[0]
        const isPartnerSender = firstMessage.senderId !== Number.parseInt(session.user.id)

        setPartner(
          isPartnerSender
            ? firstMessage.sender
            : {
                id: partnerId,
                username: "Vous",
                profileImage: null,
                isVerified: false,
              },
        )

        if (firstMessage.product) {
          setProduct(firstMessage.product)
        } else if (productId) {
          fetchProductDetails(Number.parseInt(productId))
        }
      } else if (productId) {
        // Si pas de messages mais un productId, récupérer les détails du produit
        fetchProductDetails(Number.parseInt(productId))
        fetchPartnerDetails()
      } else {
        fetchPartnerDetails()
      }
    } catch (err) {
      console.error("Erreur lors du chargement des messages", err)
      setError("Erreur lors du chargement des messages")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProductDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const productData = await response.json()
        const primaryImage =
          productData.images?.find((img: any) => img.isPrimary)?.imageUrl || productData.images?.[0]?.imageUrl || null

        setProduct({
          id: productData.id,
          title: productData.title,
          price: productData.price,
          primaryImage: primaryImage,
        })
      }
    } catch (err) {
      console.error("Erreur lors du chargement des détails du produit", err)
    }
  }

  const fetchPartnerDetails = async () => {
    try {
      const response = await fetch(`/api/users/${partnerId}`)
      if (response.ok) {
        const userData = await response.json()
        setPartner({
          id: userData.id,
          username: userData.username,
          profileImage: userData.profileImage,
          isVerified: userData.isVerified,
        })
      }
    } catch (err) {
      console.error("Erreur lors du chargement des détails du partenaire", err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !session?.user?.id) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/messages/${partnerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          productId: productId ? Number.parseInt(productId) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const sentMessage = await response.json()
      setMessages((prev) => [...prev, sentMessage])
      setNewMessage("")
    } catch (err) {
      console.error("Erreur lors de l'envoi du message", err)
      setError("Erreur lors de l'envoi du message")
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (status === "loading") {
    return <div className="p-4">Chargement...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/messages")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center flex-1">
          {partner ? (
            <>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={partner.profileImage || undefined} />
                <AvatarFallback>{partner.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">
                  {partner.username}
                  {partner.isVerified && <span className="ml-1 text-blue-500">✓</span>}
                </h2>
              </div>
            </>
          ) : isLoading ? (
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : (
            <div>Conversation</div>
          )}
        </div>
      </div>

      {product && (
        <Link href={`/product/${product.id}`}>
          <Card className="mb-4 hover:bg-gray-50 transition-colors">
            <CardContent className="p-3 flex items-center space-x-3">
              {product.primaryImage && (
                <div className="h-12 w-12 rounded overflow-hidden bg-white">
                  <Image
                    src={product.primaryImage || "/placeholder.svg"}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.title}</p>
                <p className="text-sm text-gray-600">
                  {product.price.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="bg-gray-50 rounded-lg p-4 h-[calc(100vh-300px)] overflow-y-auto mb-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] ${i % 2 === 0 ? "bg-white" : "bg-blue-100"} rounded-lg p-3`}>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchMessages}>Réessayer</Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun message. Commencez la conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === Number.parseInt(session?.user?.id || "0")

              return (
                <div key={message.id} className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isOwnMessage ? "bg-blue-100 text-blue-900" : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
          className="flex-1"
        />
        <Button type="submit" disabled={isSending || !newMessage.trim()}>
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
      </form>
    </div>
  )
}
